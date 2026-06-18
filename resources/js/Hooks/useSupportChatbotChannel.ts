import { useEffect, useRef, useState } from 'react';

interface SupportChatbotMessage {
  id: string;
  role: 'assistant' | 'user';
  message: string;
  timestamp: string;
  intent?: string;
  suggestions?: string[];
  actions?: unknown[];
  confidence?: number;
  requires_human?: boolean;
}

interface UseSupportChatbotChannelOptions {
  conversationId: string | null;
  onMessage?: (message: SupportChatbotMessage) => void;
  enabled?: boolean;
}

export function useSupportChatbotChannel({
  conversationId,
  onMessage,
  enabled = true,
}: UseSupportChatbotChannelOptions) {
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !conversationId || !window.Echo) {
      return;
    }

    const channel = window.Echo.channel(`support-chatbot.${conversationId}`);

    channel.listen('.support.chatbot.typing', (e: { is_typing?: boolean; actor?: string }) => {
      if (e.actor === 'assistant') {
        setIsAssistantTyping(!!e.is_typing);
      }
    });

    channel.listen('.support.chatbot.message', (e: SupportChatbotMessage) => {
      setIsAssistantTyping(false);
      onMessageRef.current?.(e);
    });

    return () => {
      window.Echo?.leave(`support-chatbot.${conversationId}`);
      setIsAssistantTyping(false);
    };
  }, [conversationId, enabled]);

  return { isAssistantTyping };
}

export type { SupportChatbotMessage };
