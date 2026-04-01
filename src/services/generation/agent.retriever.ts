// src/services/generation/agent.retriever.ts

export type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export class ContextRetriever {
  private history: Map<string, ChatMessage[]> = new Map();

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    return this.history.get(sessionId) || [];
  }

  async saveHistory(sessionId: string, messages: ChatMessage[]): Promise<void> {
    this.history.set(sessionId, messages);
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const current = await this.getHistory(sessionId);
    this.history.set(sessionId, [...current, message]);
  }

  // Sliding window for token optimization
  async getOptimizedContext(sessionId: string, maxTurn: number = 10): Promise<ChatMessage[]> {
    const history = await this.getHistory(sessionId);
    return history.slice(-maxTurn);
  }
}

export const retriever = new ContextRetriever();
