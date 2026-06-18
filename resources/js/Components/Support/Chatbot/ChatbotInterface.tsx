import React from 'react'
import { useState, useEffect, useRef } from "react"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Separator } from "@/Components/ui/separator"
import { Send, Bot, AlertTriangle, Ticket, Paperclip, X, FileText } from "lucide-react"

import { chatbotApi } from "@/lib/chatbot-api"
import type { Message, Suggestion, ChatAttachment } from "@/types/chatbot"
import { toast } from "sonner"
import { useSupportChatbotChannel } from "@/Hooks/useSupportChatbotChannel"
import { RatingForm } from './RatingForm'
import { TicketForm } from './TicketForm'
import { EscalationForm } from './EscalationForm'
import { SuggestionButtons } from './SuggestionButtons'
import { ChatMessage } from './ChatMessage'

const STORAGE_KEY = 'support_chatbot_conversation_id'

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  message: 'Hello! I\'m your support assistant. Ask me anything — or say "create a ticket" and I\'ll help you log an issue for our team.',
  timestamp: new Date().toISOString(),
  intent: 'greeting',
}

function createConversationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `chat_${Date.now()}`
}

function mapServerMessage(raw: Record<string, unknown>): Message {
  return {
    id: String(raw.id),
    role: raw.role as Message['role'],
    message: String(raw.message ?? ''),
    timestamp: String(raw.timestamp ?? new Date().toISOString()),
    intent: raw.intent as string | undefined,
    suggestions: raw.suggestions as Message['suggestions'],
    actions: raw.actions as Message['actions'],
    confidence: raw.confidence as number | undefined,
    requiresHuman: Boolean(raw.requires_human),
    rating: raw.rating as Message['rating'],
    feedback: raw.feedback as string | undefined,
    attachments: raw.attachments as Message['attachments'],
  }
}

export function ChatbotInterface({ embedded = false }: { embedded?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return createConversationId()
    }
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return stored
    const id = createConversationId()
    window.localStorage.setItem(STORAGE_KEY, id)
    return id
  })
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [showEscalationForm, setShowEscalationForm] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [initialRating, setInitialRating] = useState<'helpful' | 'not_helpful' | null>(null)
  const [suggestedTicketTitle, setSuggestedTicketTitle] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const MAX_ATTACHMENTS = 5

  const closeAllForms = () => {
    setShowRatingForm(false)
    setShowTicketForm(false)
    setShowEscalationForm(false)
    setSelectedMessageId(null)
    setInitialRating(null)
  }

  const { isAssistantTyping } = useSupportChatbotChannel({
    conversationId,
    onMessage: (payload) => {
      const assistantMessage: Message = {
        id: payload.id,
        role: "assistant",
        message: payload.message,
        timestamp: payload.timestamp,
        intent: payload.intent,
        suggestions: payload.suggestions,
        actions: payload.actions as Message["actions"],
        confidence: payload.confidence,
        requiresHuman: payload.requires_human,
      }

      setMessages((prev) => {
        if (prev.some((message) => message.id === assistantMessage.id)) {
          return prev
        }
        return [...prev, assistantMessage]
      })

      if (payload.requires_human) {
        setShowRatingForm(false)
        setShowTicketForm(false)
        setShowEscalationForm(true)
      }
    },
  })

  useEffect(() => {
    loadSuggestions()
    loadConversation()
  }, [])

  const loadConversation = async () => {
    if (!conversationId) return

    try {
      const data = await chatbotApi.getConversation(conversationId) as {
        messages?: Record<string, unknown>[]
      }

      if (data.messages && data.messages.length > 0) {
        setMessages([WELCOME_MESSAGE, ...data.messages.map(mapServerMessage)])
        return
      }
    } catch {
      // New conversation — keep welcome message
    }

    setMessages([WELCOME_MESSAGE])
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, showRatingForm, showTicketForm, showEscalationForm])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  const loadSuggestions = async () => {
    try {
      const response = await chatbotApi.getSuggestions()
      setSuggestions(response.suggestions)
    } catch (error) {
      console.error("Failed to load suggestions:", error)
    }
  }

  const sendMessage = async (message: string, files: File[] = []) => {
    if ((!message.trim() && files.length === 0) || isLoading) return

    const attachmentPreviews: ChatAttachment[] = files.map((file) => ({
      id: `${Date.now()}_${file.name}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }))

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      message: message.trim() || (files.length > 0 ? "[Attachment sent]" : ""),
      timestamp: new Date().toISOString(),
      attachments: attachmentPreviews.length > 0 ? attachmentPreviews : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachments([])
    setIsLoading(true)

    try {
      const response = await chatbotApi.sendMessage({
        message: message.trim(),
        conversation_id: conversationId,
        context: {},
        attachments: files,
      })

      if (response.conversation_id) {
        setConversationId(response.conversation_id)
        window.localStorage.setItem(STORAGE_KEY, response.conversation_id)
      }

      if (response.suggested_ticket_title) {
        setSuggestedTicketTitle(response.suggested_ticket_title)
      }

      const assistantMessage: Message = {
        id: (response as { message_id?: string }).message_id ?? `http_${Date.now()}`,
        role: "assistant",
        message: response.response,
        timestamp: new Date().toISOString(),
        intent: response.intent,
        suggestions: response.suggestions,
        actions: response.actions,
        confidence: response.confidence,
        requiresHuman: response.requires_human,
      }

      setMessages((prev) => {
        if (prev.some((message) => message.role === "assistant" && message.message === assistantMessage.message)) {
          return prev
        }
        return [...prev, assistantMessage]
      })

      if (response.requires_human) {
        setShowRatingForm(false)
        setShowTicketForm(false)
        setShowEscalationForm(true)
      }

      if (
        response.intent === 'ticket_inquiry' ||
        response.actions?.some((a) => a.action === 'create_ticket')
      ) {
        setSuggestedTicketTitle(response.suggested_ticket_title ?? suggestedTicketTitle)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      if (error instanceof Error && error.message.includes('attachment')) {
        toast.error('File too large. Max size is 10MB per file.')
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        message:
          "I'm sorry, I'm having trouble processing your request right now. Please try again or contact support directly.",
        timestamp: new Date().toISOString(),
        intent: "error",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    sendMessage(suggestion.text)
  }

  const handleRateMessage = (messageId: string, rating?: 'helpful' | 'not_helpful') => {
    setShowTicketForm(false)
    setShowEscalationForm(false)
    setSelectedMessageId(messageId)
    setInitialRating(rating ?? null)
    setShowRatingForm(true)
  }

  const handleCreateTicket = () => {
    setShowRatingForm(false)
    setShowEscalationForm(false)
    setShowTicketForm(true)
  }

  const handleEscalate = () => {
    setShowRatingForm(false)
    setShowTicketForm(false)
    setShowEscalationForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input, attachments)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const slotsLeft = MAX_ATTACHMENTS - attachments.length
    const selected = Array.from(e.target.files).slice(0, slotsLeft)
    if (selected.length < e.target.files.length) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} files.`)
    }
    setAttachments((prev) => [...prev, ...selected])
    e.target.value = ""
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={embedded ? 'flex h-full min-h-0 flex-col' : 'flex h-[600px] flex-col'}>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-muted/20">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onRate={handleRateMessage}
              onCreateTicket={handleCreateTicket}
              onEscalate={handleEscalate}
            />
          ))}
          {(isLoading || isAssistantTyping) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bot className="w-4 h-4" />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length === 1 && suggestions.length > 0 && (
        <>
          <Separator />
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Quick suggestions:</h3>
            <SuggestionButtons suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
          </div>
        </>
      )}

      {showRatingForm && (
        <RatingForm
          conversationId={conversationId}
          messageId={selectedMessageId}
          initialRating={initialRating}
          onCancel={closeAllForms}
          onSubmitted={(rating) => {
            if (selectedMessageId) {
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === selectedMessageId ? { ...message, rating } : message,
                ),
              )
            }
            closeAllForms()
          }}
        />
      )}

      {showTicketForm && (
        <TicketForm
          conversationId={conversationId}
          suggestedTitle={suggestedTicketTitle}
          onCancel={closeAllForms}
          onCreated={() => {
            closeAllForms()
            setMessages((prev) => [
              ...prev,
              {
                id: `ticket_${Date.now()}`,
                role: 'assistant',
                message: 'Your support ticket has been created. Our team will follow up with you by email.',
                timestamp: new Date().toISOString(),
                intent: 'ticket_created',
              },
            ])
          }}
        />
      )}

      {showEscalationForm && (
        <EscalationForm
          conversationId={conversationId}
          onCancel={closeAllForms}
          onSubmitted={() => {
            closeAllForms()
            setMessages((prev) => [
              ...prev,
              {
                id: `escalation_${Date.now()}`,
                role: 'assistant',
                message: 'Your conversation has been escalated to a human agent. They will be with you shortly.',
                timestamp: new Date().toISOString(),
                intent: 'escalated',
              },
            ])
          }}
        />
      )}

      <Separator />
      <div className="border-t border-border bg-card p-4">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex max-w-[140px] items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-1.5 py-1 text-[11px] text-primary"
                title={file.name}
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-[22px] w-[22px] shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded bg-primary/10">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                )}
                <span className="flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isLoading || attachments.length >= MAX_ATTACHMENTS}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your issue..."
            disabled={isLoading}
            className="flex-1 bg-background"
            maxLength={1000}
          />
          <Button type="submit" disabled={isLoading || (!input.trim() && attachments.length === 0)}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">{input.length}/1000 characters</p>
          <div className="flex gap-2">
            <Button
              variant={showTicketForm ? 'default' : 'outline'}
              size="sm"
              onClick={() => (showTicketForm ? closeAllForms() : handleCreateTicket())}
              disabled={!conversationId}
            >
              <Ticket className="w-3 h-3 mr-1" />
              {showTicketForm ? 'Hide form' : 'Create Ticket'}
            </Button>
            <Button
              variant={showEscalationForm ? 'default' : 'outline'}
              size="sm"
              onClick={() => (showEscalationForm ? closeAllForms() : handleEscalate())}
              disabled={!conversationId}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              {showEscalationForm ? 'Hide form' : 'Human Help'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
