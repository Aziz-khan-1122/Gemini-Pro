
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generationConfig = {
  temperature: 0.7,
  topP: 1,
  topK: 1,
};

export const createChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are a helpful and friendly AI assistant. Format your responses using markdown where appropriate, especially for code blocks, lists, and emphasis.',
    },
  });
};

export const sendMessageStreaming = async (
  chat: Chat,
  message: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const stream = await chat.sendMessageStream({ message });
    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("Failed to get response from AI. Please check your API key and network connection.");
  }
};

export const generateTitle = async (messages: Message[]): Promise<string> => {
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `Based on the following conversation, create a short, concise title (4-5 words maximum):\n\n${conversationText}\n\nTitle:`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const title = response.text.trim().replace(/"/g, ''); // Remove quotes
        return title;
    } catch (error) {
        console.error("Error generating title:", error);
        return "New Chat";
    }
}
