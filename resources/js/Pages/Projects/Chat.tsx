import React from 'react';
import ProjectShowLayout from '@/Components/Projects/ProjectShowLayout';
import ConversationView from '@/Pages/CRM/LiveChat/Conversation';
import { Conversation, ChatMessage } from '@/types/index';

interface ProjectChatProps {
  project: {
    id: number;
    name: string;
    status?: string;
    priority?: string;
    category?: string;
    enable_boards?: boolean;
    enable_milestones?: boolean;
  };
  boardId?: number;
  conversation: Conversation;
  pinnedMessages?: ChatMessage[];
  clients: any[];
  leads: any[];
  staff: any[];
  userRole: string;
  teamMembers?: any[];
}

export default function ProjectChat({
  project,
  boardId,
  conversation,
  pinnedMessages = [],
  clients,
  leads,
  staff,
  userRole,
  teamMembers = [],
}: ProjectChatProps) {
  return (
    <ProjectShowLayout project={project} boardId={boardId} activeTab="chat" title="Chat">
      <div className="h-[calc(100vh-16rem)] min-h-[480px] overflow-hidden rounded-lg border border-border bg-card">
        <ConversationView
          conversation={conversation}
          pinnedMessages={pinnedMessages}
          clients={clients}
          leads={leads}
          staff={staff}
          userRole={userRole}
          project={project}
          teamMembers={teamMembers}
          isProjectChat
          embedded
        />
      </div>
    </ProjectShowLayout>
  );
}
