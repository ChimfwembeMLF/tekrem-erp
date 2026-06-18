import { useEffect, useRef, useCallback, useState } from 'react';
import { getBroadcastHeaders } from '@/echo';
import { fetchWithSession } from '@/lib/http';

interface UseConversationChannelOptions {
  conversationId: number | null | undefined;
  currentUserId?: number | string | null;
  onMessage?: (message: Record<string, unknown>) => void;
  typingUrl?: string;
  enabled?: boolean;
}

export function useConversationChannel({
  conversationId,
  currentUserId,
  onMessage,
  typingUrl,
  enabled = true,
}: UseConversationChannelOptions) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !conversationId || !window.Echo) {
      return;
    }

    const channel = window.Echo.private(`conversation.${conversationId}`);

    channel.listen('.MessageSent', (e: { message: Record<string, unknown> }) => {
      onMessageRef.current?.(e.message);
    });

    channel.listen('.user.typing', (e: {
      user_id?: number;
      guest_session_id?: number;
      user_name?: string;
      is_typing?: boolean;
    }) => {
      if (!e.user_name) return;

      if (currentUserId != null && e.user_id != null && e.user_id === currentUserId) {
        return;
      }
      if (currentUserId != null && e.guest_session_id != null
        && currentUserId === `guest_${e.guest_session_id}`) {
        return;
      }

      const key = e.user_id
        ? `user_${e.user_id}`
        : e.guest_session_id
          ? `guest_${e.guest_session_id}`
          : e.user_name;

      const existing = typingTimeoutsRef.current.get(key);
      if (existing) clearTimeout(existing);

      if (e.is_typing !== false) {
        setTypingUsers(prev => (prev.includes(e.user_name!) ? prev : [...prev, e.user_name!]));
        typingTimeoutsRef.current.set(key, setTimeout(() => {
          setTypingUsers(prev => prev.filter(name => name !== e.user_name));
          typingTimeoutsRef.current.delete(key);
        }, 3000));
      } else {
        setTypingUsers(prev => prev.filter(name => name !== e.user_name));
        typingTimeoutsRef.current.delete(key);
      }
    });

    return () => {
      window.Echo?.leave(`conversation.${conversationId}`);
      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
      setTypingUsers([]);
    };
  }, [conversationId, enabled, currentUserId]);

  const notifyTyping = useCallback((isTyping: boolean) => {
    if (!typingUrl) return;

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }

    if (isTyping) {
      typingDebounceRef.current = setTimeout(() => {
        fetchWithSession(typingUrl, {
          method: 'POST',
          headers: getBroadcastHeaders(),
          body: JSON.stringify({ is_typing: true }),
        }).catch(() => {});
        isTypingRef.current = true;
      }, 300);
      return;
    }

    if (isTypingRef.current) {
      fetchWithSession(typingUrl, {
        method: 'POST',
        headers: getBroadcastHeaders(),
        body: JSON.stringify({ is_typing: false }),
      }).catch(() => {});
      isTypingRef.current = false;
    }
  }, [typingUrl]);

  return { typingUsers, notifyTyping };
}
