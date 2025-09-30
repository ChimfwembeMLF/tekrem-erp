import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface RealtimeBoardOptions {
  boardId: number;
  onCardMoved?: (cardId: number, fromColumn: number, toColumn: number) => void;
  onCardUpdated?: (cardId: number, updates: any) => void;
  onCardCreated?: (card: any) => void;
  onCardDeleted?: (cardId: number) => void;
  onMemberJoined?: (userId: number) => void;
  onMemberLeft?: (userId: number) => void;
}

export function useRealtimeBoard(options: RealtimeBoardOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // In a real implementation, you'd get the WebSocket URL from your backend
      const wsUrl = `ws://localhost:6001/board/${options.boardId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to board WebSocket');
        reconnectAttempts.current = 0;
        
        // Send authentication token if needed
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          token: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'card_moved':
              options.onCardMoved?.(data.cardId, data.fromColumn, data.toColumn);
              break;
            case 'card_updated':
              options.onCardUpdated?.(data.cardId, data.updates);
              break;
            case 'card_created':
              options.onCardCreated?.(data.card);
              break;
            case 'card_deleted':
              options.onCardDeleted?.(data.cardId);
              break;
            case 'member_joined':
              options.onMemberJoined?.(data.userId);
              break;
            case 'member_left':
              options.onMemberLeft?.(data.userId);
              break;
            case 'board_updated':
              // Refresh the page to get latest board data
              router.reload({ only: ['board'] });
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  useEffect(() => {
    connect();
    return disconnect;
  }, [options.boardId]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    reconnect: connect,
    disconnect
  };
}

// Example usage in a board component:
/*
const { isConnected, sendMessage } = useRealtimeBoard({
  boardId: board.id,
  onCardMoved: (cardId, fromColumn, toColumn) => {
    // Update local state optimistically
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, column_id: toColumn }
        : card
    ));
  },
  onCardUpdated: (cardId, updates) => {
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, ...updates }
        : card
    ));
  },
  onMemberJoined: (userId) => {
    // Show notification that user joined
    toast.info(`User ${userId} joined the board`);
  }
});

// Send card move event
const handleCardMove = (cardId, newColumnId) => {
  sendMessage({
    type: 'move_card',
    cardId,
    columnId: newColumnId
  });
};
*/
