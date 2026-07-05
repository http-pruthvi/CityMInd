import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DomainId } from '@/types';

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set. Gemini services will fall back to simulated/mock responses.');
    return null;
  }
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export async function chat(
  messages: { role: 'user' | 'model' | 'system'; parts: { text: string }[] }[],
  systemPrompt?: string
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    // Simulated mock delay and response
    await new Promise((r) => setTimeout(r, 1000));
    const lastMsg = messages[messages.length - 1]?.parts[0]?.text || '';
    return getSimulatedResponse(lastMsg);
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Translate format from our app (role: user/assistant) to gemini's (role: user/model)
    // Gemini chat API expects history to be alternating user/model
    const history = messages
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: m.parts,
      }));

    const activeChat = model.startChat({ history });
    const lastMsgText = messages[messages.length - 1]?.parts[0]?.text || '';
    const result = await activeChat.sendMessage(lastMsgText);
    return result.response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    return `[Gemini Service Error: Using fallback response] Here is what I can tell you: ${getSimulatedResponse(
      messages[messages.length - 1]?.parts[0]?.text || ''
    )}`;
  }
}

export async function chatStream(
  messages: { role: 'user' | 'model' | 'system'; parts: { text: string }[] }[],
  systemPrompt?: string
): Promise<AsyncIterable<any> | string[]> {
  const client = getGeminiClient();
  if (!client) {
    // Simulated stream
    const words = getSimulatedResponse(messages[messages.length - 1]?.parts[0]?.text || '').split(' ');
    const chunks: string[] = [];
    for (const word of words) {
      chunks.push(word + ' ');
    }
    return chunks;
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const history = messages
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: m.parts,
      }));

    const activeChat = model.startChat({ history });
    const lastMsgText = messages[messages.length - 1]?.parts[0]?.text || '';
    const result = await activeChat.sendMessageStream(lastMsgText);
    return result.stream;
  } catch (error) {
    console.error('Gemini chatStream error:', error);
    return getSimulatedResponse(messages[messages.length - 1]?.parts[0]?.text || '').split(' ');
  }
}

export async function analyzeImage(imageBase64: string, prompt: string): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    await new Promise((r) => setTimeout(r, 1000));
    return `[Simulation mode] I've analyzed your uploaded image containing base64 data (length ${imageBase64.length}). It appears to be an issue report. Based on the query "${prompt}", this looks like a road maintenance request (pothole detected) in the southeast sector of the city. I have auto-classified this as a Mobility/Transportation issue and raised a medium priority work order.`;
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const mimeType = imageBase64.split(';')[0]?.split(':')[1] || 'image/jpeg';
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);
    return result.response.text();
  } catch (error) {
    console.error('Gemini analyzeImage error:', error);
    return `[Image Analysis Error] Failed to process image with Gemini. Simulation analysis: The image shows typical civic damage. Priority: Medium. Classified under Mobility.`;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getGeminiClient();
  if (!client) {
    // Generate a pseudo-random embedding vector of 768 dimensions
    const vector = Array.from({ length: 768 }, (_, i) => {
      let hash = 0;
      for (let j = 0; j < text.length; j++) {
        hash = text.charCodeAt(j) + ((hash << 5) - hash);
      }
      return Math.sin(hash + i) * 0.1;
    });
    return vector;
  }

  try {
    const model = client.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Gemini embedding error:', error);
    return Array.from({ length: 768 }, () => Math.random() * 0.1);
  }
}

export async function classifyIntent(query: string): Promise<{ domain: DomainId; confidence: number; type: string }> {
  const client = getGeminiClient();
  if (!client) {
    return runKeywordClassification(query);
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
      You are the Router Agent for CityMind, a Smart City decision intelligence platform.
      Your task is to classify a user's query into one of the 12 available city domains:
      - 'mobility' (transport, traffic, buses, trains, parking, commuting)
      - 'safety' (crime, policing, emergency response, fire, accidents)
      - 'health' (hospitals, clinics, diseases, public health, medicine, wait times)
      - 'education' (schools, universities, literacy, programs, attendance)
      - 'environment' (air quality, pollution, water, trees, temperature, AQI)
      - 'waste' (garbage collection, bins, recycling, dumping, landfill)
      - 'energy' (electricity, grid, power outages, solar, consumption)
      - 'engagement' (citizen feedback, 311, complaints, surveys, public hearings)
      - 'accessibility' (wheelchair access, ramps, sidewalk damage, inclusion)
      - 'disaster' (flooding, fires, severe storms, evacuation, emergency shelter)
      - 'tourism' (local events, foot traffic, tourist spots, hotels, booking)
      - 'community' (social programs, volunteer networks, food banks, public welfare)

      Return a JSON object with:
      1. "domain": one of the 12 strings above.
      2. "confidence": a number between 0 and 1 representing your classification confidence.
      3. "type": one of: "query", "alert_check", "workflow_trigger", "simulate_policy", "report_issue".

      User query: "${query}"
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    return {
      domain: data.domain as DomainId,
      confidence: data.confidence || 0.9,
      type: data.type || 'query',
    };
  } catch (error) {
    console.error('Gemini classification error, using keywords:', error);
    return runKeywordClassification(query);
  }
}

function runKeywordClassification(query: string): { domain: DomainId; confidence: number; type: string } {
  const lowercase = query.toLowerCase();
  let domain: DomainId = 'engagement';
  let type = 'query';

  if (lowercase.includes('bus') || lowercase.includes('traffic') || lowercase.includes('commute') || lowercase.includes('metro') || lowercase.includes('transit') || lowercase.includes('parking') || lowercase.includes('road')) {
    domain = 'mobility';
  } else if (lowercase.includes('police') || lowercase.includes('crime') || lowercase.includes('robbery') || lowercase.includes('theft') || lowercase.includes('safety') || lowercase.includes('security') || lowercase.includes('emergency')) {
    domain = 'safety';
  } else if (lowercase.includes('hospital') || lowercase.includes('clinic') || lowercase.includes('doctor') || lowercase.includes('health') || lowercase.includes('disease') || lowercase.includes('covid') || lowercase.includes('medical')) {
    domain = 'health';
  } else if (lowercase.includes('school') || lowercase.includes('education') || lowercase.includes('university') || lowercase.includes('student') || lowercase.includes('teacher') || lowercase.includes('class')) {
    domain = 'education';
  } else if (lowercase.includes('air') || lowercase.includes('aqi') || lowercase.includes('pollution') || lowercase.includes('water') || lowercase.includes('environment') || lowercase.includes('sensor') || lowercase.includes('weather')) {
    domain = 'environment';
  } else if (lowercase.includes('garbage') || lowercase.includes('trash') || lowercase.includes('waste') || lowercase.includes('bin') || lowercase.includes('recycle') || lowercase.includes('dumping')) {
    domain = 'waste';
  } else if (lowercase.includes('power') || lowercase.includes('electricity') || lowercase.includes('energy') || lowercase.includes('grid') || lowercase.includes('solar') || lowercase.includes('outage') || lowercase.includes('load')) {
    domain = 'energy';
  } else if (lowercase.includes('wheelchair') || lowercase.includes('accessibility') || lowercase.includes('ramp') || lowercase.includes('disabled') || lowercase.includes('sidewalk') || lowercase.includes('pavement')) {
    domain = 'accessibility';
  } else if (lowercase.includes('flood') || lowercase.includes('fire') || lowercase.includes('disaster') || lowercase.includes('evacuate') || lowercase.includes('shelter') || lowercase.includes('hurricane') || lowercase.includes('storm')) {
    domain = 'disaster';
  } else if (lowercase.includes('tourist') || lowercase.includes('tourism') || lowercase.includes('event') || lowercase.includes('visitor') || lowercase.includes('hotel') || lowercase.includes('festival')) {
    domain = 'tourism';
  } else if (lowercase.includes('welfare') || lowercase.includes('community') || lowercase.includes('volunteer') || lowercase.includes('food bank') || lowercase.includes('charity') || lowercase.includes('social program')) {
    domain = 'community';
  }

  if (lowercase.includes('report') || lowercase.includes('complaint') || lowercase.includes('file a') || lowercase.includes('pothole') || lowercase.includes('broken')) {
    type = 'report_issue';
  } else if (lowercase.includes('what if') || lowercase.includes('simulate') || lowercase.includes('predict') || lowercase.includes('forecast')) {
    type = 'simulate_policy';
  } else if (lowercase.includes('alert') || lowercase.includes('warning') || lowercase.includes('urgent')) {
    type = 'alert_check';
  }

  return { domain, confidence: 0.85, type };
}

function getSimulatedResponse(query: string): string {
  const lowercase = query.toLowerCase();
  if (lowercase.includes('bus') || lowercase.includes('mobility') || lowercase.includes('transit')) {
    return 'According to recent mobility statistics, Route 14 delays are caused by street construction in Sector 4. The average delay is currently 12 minutes during evening peak hours (5 PM - 7 PM). There is an active signal adjustment proposal to increase green-light intervals on Sector 4 main junctions by 15% which should resolve this congestion. I suggest triggering the Signal Timing Optimization workflow.';
  }
  if (lowercase.includes('air') || lowercase.includes('pollution') || lowercase.includes('aqi') || lowercase.includes('environment')) {
    return 'The average AQI (Air Quality Index) for the city stands at 142 (Moderate/Unhealthy for sensitive groups). Sensor #21 in the Industrial Area shows a localized spike in PM2.5 at 182 due to local traffic. Winds are blowing southeast at 12km/h, meaning this spike is expected to disperse within 4 hours. No official health advisories are active, but sensitive residents should minimize outdoor activity.';
  }
  if (lowercase.includes('safety') || lowercase.includes('police') || lowercase.includes('incident') || lowercase.includes('crime')) {
    return 'Public safety dashboards report 23 active emergency tickets. Average police response time in Sector 1 has dropped by 8% over the past week to 4.2 minutes due to repositioning of smart patrol units. An alert was triggered at 11:24 AM in Sector 3 (Suspicious Crowding detection via CCTV #401), and a patrol unit has already acknowledged the ticket and is on site.';
  }
  if (lowercase.includes('pothole') || lowercase.includes('report') || lowercase.includes('broken')) {
    return 'I can assist you with reporting issues. I will automatically analyze any images you upload for anomalies, detect GPS coordinates, and file a public works ticket in our SQLite database. Based on your description, this will be triaged and sent directly to the local sector operator for human verification.';
  }
  return `Thank you for asking about CityMind. I am the conversational decision intelligence interface. I have cross-domain access to mobility data, environment telemetry, safety incident feeds, and 311 citizen tickets. If you have specific questions about city planning, policy scenario outcomes, or active alerts, please let me know and I will query the database to get grounded statistics.`;
}
