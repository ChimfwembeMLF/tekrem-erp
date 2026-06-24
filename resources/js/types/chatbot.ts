export interface ChatAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploaded_at?: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  message: string
  timestamp: string
  intent?: string
  suggestions?: string[]
  actions?: Array<{
    type: "link" | "action"
    label: string
    url?: string
    action?: string
  }>
  confidence?: number
  requiresHuman?: boolean
  rating?: "helpful" | "not_helpful"
  feedback?: string
  attachments?: ChatAttachment[]
}

export interface Suggestion {
  text: string
  intent: string
  category: string
}

export interface ConversationSummary {
  id: string
  status: string
  ticket_id?: number | null
  ticket_number?: string | null
  ticket_title?: string | null
  message_count: number
  preview?: string | null
  last_message_at?: string
  created_at?: string
}

export interface ConversationDetail {
  conversation_id: string
  messages: Message[]
  status?: string
  ticket_id?: number | null
  ticket_number?: string | null
}

export interface ChatResponse {
  conversation_id: string
  response: string
  intent: string
  suggestions: string[]
  actions: Array<{
    type: "link" | "action"
    label: string
    url?: string
    action?: string
  }>
  confidence: number
  requires_human: boolean
  suggested_ticket_title?: string | null
}
