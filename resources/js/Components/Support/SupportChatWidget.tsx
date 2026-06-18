import React, { useState } from 'react';
import { Headphones, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ChatbotInterface } from '@/Components/Support/Chatbot/ChatbotInterface';
import { useSessionKeepAlive } from '@/Hooks/useSessionKeepAlive';
import { cn } from '@/lib/utils';

function SupportLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="group fixed bottom-5 left-5 z-[998] sm:bottom-6 sm:left-6">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open support chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Headphones className="h-6 w-6" strokeWidth={2.25} />
      </button>
      <span className="pointer-events-none absolute -top-9 left-0 hidden whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:block">
        Support
      </span>
    </div>
  );
}

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);

  useSessionKeepAlive(isOpen);

  const openWidget = () => {
    setIsOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateOpen(true)));
  };

  const closeWidget = () => {
    setAnimateOpen(false);
    setTimeout(() => setIsOpen(false), 280);
  };

  if (!isOpen) {
    return <SupportLauncher onOpen={openWidget} />;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close support chat"
        className={cn(
          'fixed inset-0 z-[997] bg-background/80 backdrop-blur-sm transition-opacity duration-300 sm:hidden',
          animateOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeWidget}
      />

      <div
        className={cn(
          'fixed z-[998] flex flex-col pointer-events-none',
          'inset-0 sm:inset-auto sm:bottom-6 sm:left-6',
          'sm:h-[min(640px,calc(100dvh-48px))] sm:w-[400px]',
        )}
      >
        <div
          className={cn(
            'pointer-events-auto flex h-full w-full flex-col overflow-hidden border border-border bg-background shadow-2xl',
            'sm:rounded-2xl',
            'transition-all duration-300 ease-out',
            animateOpen ? 'opacity-100' : 'opacity-0 translate-y-4 sm:translate-y-6 sm:scale-[0.98]',
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Headphones className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">Support Assistant</span>
                  <Badge variant="secondary" className="h-5 px-2 text-[10px]">AI</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">Report issues, get help, create tickets</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={closeWidget}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </header>

          <div className="min-h-0 flex-1 bg-background">
            <ChatbotInterface embedded />
          </div>
        </div>
      </div>
    </>
  );
}
