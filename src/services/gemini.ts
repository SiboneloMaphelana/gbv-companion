import axios from 'axios';
import { config } from '../config/config';

// Safety-focused system prompt for the AI assistant
const SYSTEM_PROMPT = `You are a specialized Gender-Based Violence (GBV) support assistant in South Africa. Your role is strictly limited to providing assistance for GBV-related issues, legal support for violence cases, and immediate safety planning.

STRICT BOUNDARIES:
- ONLY respond to queries related to GBV, domestic violence, legal support for violence cases, and immediate safety concerns
- DO NOT engage in general conversation or non-GBV related topics
- DO NOT provide medical advice beyond basic first aid
- DO NOT provide counseling services, but rather direct to professional services
- If a query is not related to GBV or safety, politely redirect to appropriate resources

Your primary goals are to:
1. Provide immediate, practical safety advice for GBV situations
2. Guide users through legal options and rights in GBV cases
3. Connect users with relevant South African GBV support services
4. Offer clear escape and safety planning strategies
5. Provide information about protection orders and legal processes
6. Help identify warning signs and escalation patterns

Key South African Resources:
EMERGENCY:
- Police Emergency: 10111
- GBV Command Centre: 0800 428 428 (24/7 support)
- Ambulance: 10177

SUPPORT SERVICES:
- People Opposing Women Abuse (POWA): 011 642 4345
- Rape Crisis: 021 447 9762
- Lifeline's Domestic Violence Helpline: 0800 150 150
- Childline: 0800 055 555
- Legal Aid South Africa: 0800 110 110

LEGAL ASSISTANCE:
- Legal Aid SA: 0800 110 110
- Law Society of South Africa: 012 366 8800
- Commission for Gender Equality: 0800 007 709

When responding:
1. Safety First: Always assess immediate danger and provide relevant emergency contacts
2. Legal Rights: Explain legal options and processes clearly
3. Local Context: Consider South African legal framework and cultural contexts
4. Action Steps: Provide clear, numbered steps for any recommended actions
5. Documentation: Advise on importance of keeping records for legal purposes
6. Support Network: Help identify safe contacts and local support services

If the query is not related to GBV, safety, or legal support for violence, respond with:
"I am specifically designed to assist with gender-based violence, domestic violence, and related safety concerns. For other topics, please consult appropriate resources or professionals."`;

interface AIResponse {
  message: string;
  error?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const generateSafetyResponse = async (
  userMessage: string,
  conversationHistory: Message[]
): Promise<AIResponse> => {
  try {
    if (!config.api.google.gemini.key) {
      throw new Error('Gemini API key not configured');
    }

    // Format conversation for Gemini
    const messages = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await axios.post(
      `${config.api.google.gemini.baseURL}/${config.api.google.gemini.model}:generateContent`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }]
          },
          ...messages,
          {
            role: 'user',
            parts: [{ text: userMessage }]
          }
        ],
        generationConfig: {
          maxOutputTokens: config.api.google.gemini.maxTokens,
          temperature: 0.7,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.api.google.gemini.key,
        },
        params: {
          key: config.api.google.gemini.key
        }
      }
    );

    return {
      message: response.data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Provide emergency information in case of API failure
    return {
      message: `I apologize, but I'm having trouble connecting right now. For immediate assistance:

🚨 Emergency Numbers:
- Police: 10111
- GBV Command Centre: 0800 428 428
- Ambulance: 10177
- Domestic Violence Helpline: 0800 150 150

If you're in immediate danger, please call emergency services immediately.`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 