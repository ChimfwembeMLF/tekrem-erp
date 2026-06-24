import React from 'react'
import { useState, useEffect, useRef } from "react"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Separator } from "@/Components/ui/separator"
import { Send, Bot, AlertTriangle, Ticket, Paperclip, X, FileText, History, Plus } from "lucide-react"

import { chatbotApi } from "@/lib/chatbot-api"
import type { Message, Suggestion, ChatAttachment, ConversationSummary } from "@/types/chatbot"
import { toast } from "sonner"
import { useSupportChatbotChannel } from "@/Hooks/useSupportChatbotChannel"
import useTypedPage from "@/Hooks/useTypedPage"
import useRoute from "@/Hooks/useRoute"
import { Link } from "@inertiajs/react"
import { RatingForm } from './RatingForm'
import { TicketForm } from './TicketForm'
import { EscalationForm } from './EscalationForm'
import { SuggestionButtons } from './SuggestionButtons'
import { ChatMessage } from './ChatMessage'

const STORAGE_KEY = 'support_chatbot_conversation_id'
const SUGGESTIONS_DISMISSED_KEY = 'support_chatbot_suggestions_dismissed'

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
  const page = useTypedPage()
  const route = useRoute()
  const userRoles = ((page.props as { auth?: { user?: { user_roles?: string[] } } }).auth?.user?.user_roles) ?? []
  const isCustomer = userRoles.includes('customer')

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
  const [suggestionsVisible, setSuggestionsVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    return sessionStorage.getItem(SUGGESTIONS_DISMISSED_KEY) !== '1'
  })
  const [conversationHistory, setConversationHistory] = useState<ConversationSummary[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [conversationMeta, setConversationMeta] = useState<{
    status?: string
    ticket_id?: number | null
    ticket_number?: string | null
  }>({})
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
    void bootstrapConversation()
  }, [])

  const bootstrapConversation = async () => {
    const history = await loadConversationList()
    const storedId = window.localStorage.getItem(STORAGE_KEY) ?? conversationId

    if (storedId) {
      const loaded = await loadConversation(storedId)
      if (loaded) return
    }

    if (history.length > 0) {
      await loadConversation(history[0].id)
    } else {
      setMessages([WELCOME_MESSAGE])
    }
  }

  const loadConversationList = async (): Promise<ConversationSummary[]> => {
    try {
      const data = await chatbotApi.listConversations()
      setConversationHistory(data.conversations ?? [])
      return data.conversations ?? []
    } catch (error) {
      console.error("Failed to load conversation history:", error)
      return []
    }
  }

  const loadConversation = async (id: string): Promise<boolean> => {
    try {
      const data = await chatbotApi.getConversation(id)

      setConversationId(data.conversation_id)
      window.localStorage.setItem(STORAGE_KEY, data.conversation_id)
      setConversationMeta({
        status: data.status,
        ticket_id: data.ticket_id,
        ticket_number: data.ticket_number,
      })

      if (data.messages && data.messages.length > 0) {
        setMessages([WELCOME_MESSAGE, ...data.messages.map((message) => mapServerMessage(message as unknown as Record<string, unknown>))])
      } else {
        setMessages([WELCOME_MESSAGE])
      }

      return true
    } catch {
      return false
    }
  }

  const startNewConversation = () => {
    const id = createConversationId()
    setConversationId(id)
    window.localStorage.setItem(STORAGE_KEY, id)
    setConversationMeta({})
    setMessages([WELCOME_MESSAGE])
    setSuggestionsVisible(true)
    sessionStorage.removeItem(SUGGESTIONS_DISMISSED_KEY)
    setShowHistory(false)
    closeAllForms()
  }

  const dismissSuggestions = () => {
    setSuggestionsVisible(false)
    sessionStorage.setItem(SUGGESTIONS_DISMISSED_KEY, '1')
  }

  const switchConversation = async (id: string) => {
    setShowHistory(false)
    closeAllForms()
    setIsLoading(true)
    try {
      await loadConversation(id)
    } finally {
      setIsLoading(false)
    }
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

      void loadConversationList()

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
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card/80 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={showHistory ? 'default' : 'outline'}
            size="sm"
            className="h-8"
            onClick={() => setShowHistory((open) => !open)}
          >
            <History className="mr-1.5 h-3.5 w-3.5" />
            History
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8" onClick={startNewConversation}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New chat
          </Button>
        </div>
        {conversationMeta.ticket_number && conversationMeta.ticket_id && (
          <Link
            href={route(isCustomer ? 'customer.support.tickets.show' : 'support.tickets.show', conversationMeta.ticket_id)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Ticket #{conversationMeta.ticket_number}
          </Link>
        )}
      </div>

      {showHistory && (
        <div className="max-h-44 overflow-y-auto border-b border-border bg-muted/30 px-3 py-2">
          {conversationHistory.length > 0 ? (
            <div className="space-y-1.5">
              {conversationHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void switchConversation(item.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    item.id === conversationId
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-background hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-foreground">
                      {item.preview || 'Support conversation'}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {item.message_count} msgs
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="capitalize">{item.status?.replace('_', ' ')}</span>
                    {item.ticket_number && <span>· Ticket #{item.ticket_number}</span>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-muted-foreground">
              No saved conversations yet. Start chatting and your history will appear here.
            </p>
          )}
        </div>
      )}

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

      {messages.length === 1 && suggestions.length > 0 && suggestionsVisible && (
        <>
          <Separator />
          <div className="px-3 py-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Quick suggestions
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={dismissSuggestions}
                aria-label="Hide quick suggestions"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
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
          onSubmitted={(rating, syncedConversationId) => {
            if (syncedConversationId && syncedConversationId !== conversationId) {
              setConversationId(syncedConversationId)
              window.localStorage.setItem(STORAGE_KEY, syncedConversationId)
            }
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
          onCreated={async (ticketNumber) => {
            closeAllForms()
            if (conversationId) {
              await loadConversation(conversationId)
            }
            void loadConversationList()
            setMessages((prev) => [
              ...prev,
              {
                id: `ticket_${Date.now()}`,
                role: 'assistant',
                message: ticketNumber
                  ? `Your support ticket #${ticketNumber} has been created. Our team will follow up with you by email.`
                  : 'Your support ticket has been created. Our team will follow up with you by email.',
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
