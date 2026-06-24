import React from 'react'
import { cn } from '@/lib/utils'
import type { Suggestion } from '@/types/chatbot'

interface SuggestionButtonsProps {
  suggestions: Suggestion[]
  onSuggestionClick: (suggestion: Suggestion) => void
}

export function SuggestionButtons({ suggestions, onSuggestionClick }: SuggestionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.intent}-${index}`}
          type="button"
          onClick={() => onSuggestionClick(suggestion)}
          className={cn(
            'inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-left',
            'text-[11px] leading-tight text-foreground/90 transition-colors',
            'hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          )}
        >
          <span className="truncate">{suggestion.text}</span>
          <span className="shrink-0 rounded-full bg-background/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            {suggestion.category}
          </span>
        </button>
      ))}
    </div>
  )
}
