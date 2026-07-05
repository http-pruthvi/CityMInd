import { NextRequest, NextResponse } from 'next/server';
import { routeQuery } from '@/lib/ai/agents/router';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { query, context, userId } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // 1. Process query with AI Agent Router
    const agentResponse = await routeQuery(query, context);

    // 2. Log activity / chat message if userId is provided
    if (userId) {
      // Find or create default chat session
      let session = await prisma.chatSession.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      if (!session) {
        session = await prisma.chatSession.create({
          data: {
            title: query.slice(0, 30) + '...',
            userId,
          },
        });
      }

      // Create message entries
      await prisma.chatMessage.create({
        data: {
          role: 'user',
          content: query,
          sessionId: session.id,
        },
      });

      await prisma.chatMessage.create({
        data: {
          role: 'assistant',
          content: agentResponse.answer,
          domain: agentResponse.domain,
          citations: JSON.stringify(agentResponse.citations),
          charts: JSON.stringify(agentResponse.charts || []),
          mapData: JSON.stringify(agentResponse.mapData || []),
          actions: JSON.stringify(agentResponse.suggestedActions || []),
          sources: JSON.stringify(agentResponse.sources || []),
          sessionId: session.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: agentResponse,
    });
  } catch (error: any) {
    console.error('API /api/ask error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
