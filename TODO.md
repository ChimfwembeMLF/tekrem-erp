# Tekrem ERP - Implementation TODO List

## Initial Setup
- [ ] Create new Laravel 12 project with Jetstream (Inertia + React)
- [ ] Set up shadcn/ui for the frontend
- [ ] Install required packages:
  - [ ] spatie/laravel-permission
  - [ ] spatie/laravel-activitylog
  - [ ] mcamara/laravel-localization
- [ ] Configure database connection
- [ ] Set up migrations and seeders

## Frontend Structure
- [ ] Organize frontend by domains:
  - [ ] Website
  - [ ] Admin
  - [ ] Customer
  - [ ] CRM
  - [ ] Finance
  - [ ] HR
  - [ ] Projects
  - [ ] Support
  - [ ] Analytics
- [ ] Set up i18n for English and Bemba
- [ ] Implement theme system with shadcn/ui
- [ ] Create base layouts for different user roles

## Core Functionality
- [ ] Implement RBAC using Spatie
- [ ] Create role-specific dashboards
- [ ] Set up notification system with sonner
- [ ] Configure email notifications with Mailtrap

## Module Implementation

### Admin Module
- [ ] User management
- [ ] Role and permission management
- [ ] UI settings management
- [ ] System logs viewer

### Website Module
- [ ] Landing page
- [ ] About page
- [ ] Services page
- [ ] Portfolio page
- [ ] Contact page

### Customer Module
- [ ] Customer dashboard
- [ ] Service request portal
- [ ] Profile management

### CRM Module
- [ ] Client management
- [ ] Lead management
- [ ] Communication tracking

### Finance Module
- [ ] Billing management
- [ ] Invoice generation
- [ ] Payment tracking

### HR Module
- [ ] Team management
- [ ] Leave management
- [ ] Performance tracking

### Projects Module
- [ ] Project management
- [ ] Task tracking
- [ ] Timeline visualization

### Support Module
- [ ] Ticket management
- [ ] Knowledge base
- [ ] FAQ system
- [ ] Guest chatbot UX polish
  - [x] Enforce sequential conversation flow (no layout-style information dumps)
  - [x] Improve sender differentiation for user, AI, and agent/system messages
  - [x] Keep dual input model: free text + quick-reply actions
  - [x] Add quick-reply shortcuts above input (Track order, Return policy, Talk to human)
  - [x] Ensure Enter sends and Shift+Enter inserts newline
  - [x] Strengthen typing indicator behavior during AI response generation
  - [x] Add named processing states (Searching, Running checks, etc.) instead of generic loading
  - [x] Ensure every message shows timestamp consistently
  - [x] Add conversational error states with clear recovery path (retry, rephrase, escalate)
  - [x] Add always-visible human escalation action for fallback scenarios
  - [x] Add message-level feedback controls (thumbs up/down)
  - [x] Support interrupted response handling (incomplete marker + retry)
  - [x] Align chatbot colors with system theme tokens for light/dark/chat modes

### Analytics Module
- [ ] KPI dashboards
- [ ] Report generation
- [ ] Data visualization

## Testing
- [ ] Unit tests
- [ ] Feature tests
- [ ] Browser tests

## Deployment
- [ ] Production environment setup
- [ ] CI/CD pipeline
- [ ] Backup system
