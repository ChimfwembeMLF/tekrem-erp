import React from 'react';
import { cn } from '@/lib/utils';

export type GuestFlowType =
  | 'inquiry'
  | 'quote'
  | 'ticket'
  | 'project'
  | 'signup'
  | 'status'
  | 'success';

interface Props {
  type: GuestFlowType;
  className?: string;
}

export default function GuestFlowIllustration({ type, className }: Props) {
  return (
    <div
      className={cn(
        'relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-6 shadow-inner',
        className,
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.12),transparent_45%)]" />
      {type === 'inquiry' && <InquiryArt />}
      {type === 'quote' && <QuoteArt />}
      {type === 'ticket' && <TicketArt />}
      {type === 'project' && <ProjectArt />}
      {type === 'signup' && <SignupArt />}
      {type === 'status' && <StatusArt />}
      {type === 'success' && <SuccessArt />}
    </div>
  );
}

function InquiryArt() {
  return (
    <svg viewBox="0 0 320 240" className="relative z-10 h-full w-full max-h-[220px]">
      <rect x="40" y="50" width="240" height="150" rx="16" fill="hsl(var(--card))" stroke="hsl(var(--primary)/0.3)" strokeWidth="2" />
      <rect x="60" y="75" width="120" height="10" rx="5" fill="hsl(var(--primary)/0.35)" />
      <rect x="60" y="95" width="180" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.2)" />
      <rect x="60" y="110" width="160" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.15)" />
      <rect x="60" y="125" width="140" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.15)" />
      <circle cx="250" cy="170" r="28" fill="url(#gradPrimary)" />
      <path d="M238 170l8 8 16-16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <GradientDefs />
    </svg>
  );
}

function QuoteArt() {
  return (
    <svg viewBox="0 0 320 240" className="relative z-10 h-full w-full max-h-[220px]">
      <rect x="70" y="35" width="180" height="170" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--primary)/0.25)" strokeWidth="2" />
      <rect x="90" y="55" width="80" height="10" rx="5" fill="hsl(var(--secondary)/0.5)" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="90" y={80 + i * 22} width={140 - i * 15} height="8" rx="4" fill="hsl(var(--muted-foreground)/0.18)" />
      ))}
      <rect x="90" y="165" width="60" height="22" rx="6" fill="url(#gradPrimary)" />
      <text x="120" y="180" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">ZMW</text>
      <GradientDefs />
    </svg>
  );
}

function TicketArt() {
  return (
    <svg viewBox="0 0 320 240" className="relative z-10 h-full w-full max-h-[220px]">
      <rect x="50" y="60" width="220" height="120" rx="14" fill="hsl(var(--card))" stroke="hsl(var(--primary)/0.3)" strokeWidth="2" />
      <circle cx="90" cy="120" r="22" fill="url(#gradPrimary)" opacity="0.9" />
      <path d="M82 120h16M90 112v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="125" y="95" width="120" height="10" rx="5" fill="hsl(var(--primary)/0.3)" />
      <rect x="125" y="115" width="100" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.2)" />
      <rect x="125" y="132" width="80" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.15)" />
      <rect x="125" y="155" width="50" height="18" rx="9" fill="hsl(var(--secondary)/0.4)" />
      <GradientDefs />
    </svg>
  );
}

function ProjectArt() {
  return (
    <svg viewBox="0 0 320 240" className="relative z-10 h-full w-full max-h-[220px]">
      <rect x="45" y="45" width="230" height="150" rx="14" fill="hsl(var(--card))" stroke="hsl(var(--primary)/0.25)" strokeWidth="2" />
      <rect x="65" y="65" width="70" height="50" rx="8" fill="hsl(var(--primary)/0.15)" />
      <rect x="145" y="65" width="110" height="10" rx="5" fill="hsl(var(--primary)/0.35)" />
      <rect x="145" y="85" width="90" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.18)" />
      <rect x="65" y="130" width="190" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.15)" />
      <rect x="65" y="148" width="160" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.12)" />
      <rect x="65" y="170" width="100" height="12" rx="6" fill="url(#gradPrimary)" />
      <GradientDefs />
    </svg>
  );
}

function SignupArt() {
  return (
    <svg viewBox="0 0 320 240" className="relative z-10 h-full w-full max-h-[220px]">
      <rect x="55" y="40" width="210" height="160" rx="16" fill="hsl(var(--card))" stroke="hsl(var(--primary)/0.3)" strokeWidth="2" />
      <rect x="75" y="60" width="50" height="50" rx="10" fill="url(#gradPrimary)" />
      <rect x="140" y="65" width="100" height="12" rx="6" fill="hsl(var(--primary)/0.35)" />
      <rect x="140" y="85" width="80" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.2)" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="75" y={120 + i * 28} width={170} height="18" rx="8" fill="hsl(var(--muted)/0.5)" stroke="hsl(var(--border))" />
      ))}
      <circle cx="235" cy="185" r="20" fill="hsl(var(--secondary)/0.5)" />
      <path d="M227 185l6 6 12-12" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <GradientDefs />
    </svg>
  );
}

function StatusArt() {
  return (
    <svg viewBox="0 0 320 240" className="relative z-10 h-full w-full max-h-[220px]">
      <circle cx="160" cy="115" r="55" fill="none" stroke="hsl(var(--primary)/0.2)" strokeWidth="8" />
      <circle cx="160" cy="115" r="55" fill="none" stroke="url(#gradPrimary)" strokeWidth="8" strokeDasharray="90 260" strokeLinecap="round" />
      <circle cx="160" cy="115" r="35" fill="hsl(var(--card))" stroke="hsl(var(--primary)/0.25)" />
      <path d="M145 115h30M160 100v30" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
      <rect x="100" y="175" width="120" height="10" rx="5" fill="hsl(var(--muted-foreground)/0.2)" />
      <GradientDefs />
    </svg>
  );
}

function SuccessArt() {
  return (
    <svg viewBox="0 0 320 240" className="relative z-10 h-full w-full max-h-[220px]">
      <circle cx="160" cy="100" r="50" fill="url(#gradPrimary)" />
      <path d="M135 100l18 18 36-36" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <circle
          key={deg}
          cx={160 + Math.cos((deg * Math.PI) / 180) * (70 + (i % 2) * 10)}
          cy={100 + Math.sin((deg * Math.PI) / 180) * (70 + (i % 2) * 10)}
          r={3 + (i % 3)}
          fill={i % 2 ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'}
          opacity="0.7"
        />
      ))}
      <rect x="90" y="165" width="140" height="10" rx="5" fill="hsl(var(--muted-foreground)/0.2)" />
      <rect x="110" y="185" width="100" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.12)" />
      <GradientDefs />
    </svg>
  );
}

function GradientDefs() {
  return (
    <defs>
      <linearGradient id="gradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--secondary))" />
        <stop offset="100%" stopColor="hsl(var(--primary))" />
      </linearGradient>
    </defs>
  );
}
