import { NextRequest, NextResponse } from 'next/server';
import { chatStream } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Format messages for gemini api wrapper
    const geminiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    }));

    const responseStream = await chatStream(geminiMessages, systemPrompt);

    if (Array.isArray(responseStream)) {
      // Fallback response as chunks
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of responseStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            await new Promise((r) => setTimeout(r, 100)); // spacing out mock chunks
          }
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const textChunk = chunk.text || '';
            if (textChunk) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: textChunk })}\n\n`)
              );
            }
          }
        } catch (err) {
          console.error('Stream processing error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
