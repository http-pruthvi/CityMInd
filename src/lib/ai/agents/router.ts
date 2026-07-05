import type { DomainId, Citation } from '@/types';
import { classifyIntent } from '../gemini';
import { domainAgents } from './domains';

export interface AgentResponse {
  answer: string;
  domain: DomainId;
  confidence: number;
  citations: Citation[];
  suggestedActions?: string[];
  charts?: any[];
  mapData?: any;
}

export async function routeQuery(query: string, context?: any): Promise<AgentResponse> {
  console.log(`Routing query: "${query}"`);
  
  // 1. Classify intent using Gemini or keywords
  const classification = await classifyIntent(query);
  const domain: DomainId = classification.domain;
  
  console.log(`Routed to domain: ${domain} (confidence: ${classification.confidence}, type: ${classification.type})`);
  
  // 2. Fetch appropriate domain agent
  const agent = domainAgents[domain];
  if (!agent) {
    return {
      answer: `I categorized your query under "${domain}", but the agent is currently unavailable. Please ask something about transit, safety, health, environment, or energy.`,
      domain,
      confidence: classification.confidence,
      citations: [],
    };
  }

  // 3. Let domain agent handle query
  try {
    const response = await agent.handleQuery(query, context);
    return {
      ...response,
      domain,
      confidence: classification.confidence,
    };
  } catch (error) {
    console.error(`Error in domain agent ${domain}:`, error);
    return {
      answer: `Sorry, the ${domain} agent encountered an error processing your query.`,
      domain,
      confidence: classification.confidence,
      citations: [],
    };
  }
}
