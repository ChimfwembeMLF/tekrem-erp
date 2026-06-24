import { fetchWithSession } from '@/lib/http';
import { getBroadcastHeaders } from '@/echo';
import type { ConversationDetail, ConversationSummary } from '@/types/chatbot';

export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
  context?: Record<string, unknown>;
  attachments?: File[];
}

export interface ChatResponse {
  conversation_id: string;
  response: string;
  intent: string;
  suggestions: string[];
  actions: Array<{
    type: 'link' | 'action';
    label: string;
    url?: string;
    action?: string;
  }>;
  confidence: number;
  requires_human: boolean;
  suggested_ticket_title?: string | null;
  message_id?: string;
}

export interface RateRequest {
  conversation_id: string;
  message_id: string;
  rating: 'helpful' | 'not_helpful';
  feedback?: string;
}

export interface TicketRequest {
  conversation_id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category_id?: number;
}

export interface EscalationRequest {
  conversation_id: string;
  reason?: string;
}

export interface Suggestion {
  text: string;
  intent: string;
  category: string;
}

class ChatbotAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetchWithSession(`/support/chatbot${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    const hasFiles = data.attachments && data.attachments.length > 0;

    if (hasFiles) {
      const formData = new FormData();
      formData.append('message', data.message);
      if (data.conversation_id) {
        formData.append('conversation_id', data.conversation_id);
      }
      if (data.context) {
        formData.append('context', JSON.stringify(data.context));
      }
      data.attachments!.forEach((file) => formData.append('attachments[]', file));

      return this.request<ChatResponse>('/chat', {
        method: 'POST',
        headers: getBroadcastHeaders(null),
        body: formData,
      });
    }

    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(conversationId: string): Promise<ConversationDetail> {
    return this.request<ConversationDetail>(`/conversation?conversation_id=${conversationId}`);
  }

  async listConversations(): Promise<{ conversations: ConversationSummary[] }> {
    return this.request('/conversations');
  }

  async getSuggestions(): Promise<{ suggestions: Suggestion[] }> {
    return this.request<{ suggestions: Suggestion[] }>('/suggestions');
  }

  async suggestTicketTitle(conversationId: string): Promise<{ title: string }> {
    return this.request<{ title: string }>(`/suggest-ticket-title?conversation_id=${encodeURIComponent(conversationId)}`);
  }

  async rateResponse(data: RateRequest): Promise<{ success: boolean; message: string; conversation_id?: string }> {
    return this.request<{ success: boolean; message: string; conversation_id?: string }>('/rate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createTicket(data: TicketRequest): Promise<{ success: boolean; ticket: unknown; message: string }> {
    return this.request<{ success: boolean; ticket: unknown; message: string }>('/create-ticket', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async escalateToHuman(
    data: EscalationRequest,
  ): Promise<{ success: boolean; message: string; escalation_id: string }> {
    return this.request<{ success: boolean; message: string; escalation_id: string }>('/escalate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const chatbotApi = new ChatbotAPI();
