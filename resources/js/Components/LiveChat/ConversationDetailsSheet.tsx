import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/Components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Textarea } from '@/Components/ui/textarea';
import {
  Info,
  Users,
  Paperclip,
  StickyNote,
  Download,
  Plus,
} from 'lucide-react';
import { Conversation, ChatMessage } from '@/types/index';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
  messages: ChatMessage[];
  userRole: string;
  isProjectChat?: boolean;
  teamMembers?: any[];
  project?: any;
  newNote: string;
  onNewNoteChange: (value: string) => void;
  onAddNote: () => void;
}

export default function ConversationDetailsSheet({
  open,
  onOpenChange,
  conversation,
  messages,
  userRole,
  isProjectChat = false,
  teamMembers = [],
  project,
  newNote,
  onNewNoteChange,
  onAddNote,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <SheetTitle>Chat details</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="info" className="flex min-h-0 flex-1 flex-col">
          <TabsList className={`mx-4 mt-3 grid w-auto ${isProjectChat ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="info" className="gap-1 text-xs">
              <Info className="h-3 w-3" />
              Info
            </TabsTrigger>
            {isProjectChat && (
              <TabsTrigger value="team" className="gap-1 text-xs">
                <Users className="h-3 w-3" />
                Team
              </TabsTrigger>
            )}
            <TabsTrigger value="files" className="gap-1 text-xs">
              <Paperclip className="h-3 w-3" />
              Files
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1 text-xs">
              <StickyNote className="h-3 w-3" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto p-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="capitalize">{conversation.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <p className="capitalize">{conversation.priority}</p>
                </div>
                {conversation.assignee && (
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned to</p>
                    <p>{conversation.assignee.name}</p>
                  </div>
                )}
                {conversation.conversable && (
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p>{conversation.conversable.name}</p>
                    <p className="text-xs text-muted-foreground">{conversation.conversable.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p>{new Date(conversation.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isProjectChat && (
            <TabsContent value="team" className="flex-1 overflow-y-auto p-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Project team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No team members assigned</p>
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 rounded-lg border p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profile_photo_url} />
                          <AvatarFallback>
                            {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{member.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        {member.id === project?.manager_id && (
                          <Badge variant="secondary" className="text-xs">Manager</Badge>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="files" className="flex-1 overflow-y-auto p-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Shared files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {messages.filter((msg) => msg.attachments && msg.attachments.length > 0).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No files shared yet</p>
                ) : (
                  messages
                    .filter((msg) => msg.attachments && msg.attachments.length > 0)
                    .flatMap((msg) =>
                      (msg.attachments ?? []).map((attachment, index) => (
                        <div
                          key={`${msg.id}-${index}`}
                          className="flex items-center gap-2 rounded-lg border p-2"
                        >
                          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {msg.user?.name} · {new Date(msg.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {attachment.url && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                              <a href={attachment.url} target="_blank" rel="noreferrer">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      ))
                    )
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-y-auto p-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Internal notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRole !== 'customer' && (
                  <div className="space-y-2">
                    <Textarea
                      value={newNote}
                      onChange={(e) => onNewNoteChange(e.target.value)}
                      placeholder="Add an internal note..."
                      className="min-h-[72px] text-sm"
                    />
                    <Button size="sm" onClick={onAddNote} disabled={!newNote.trim()} className="w-full">
                      <Plus className="mr-1 h-3 w-3" />
                      Add note
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {messages.filter((msg) => msg.is_internal_note).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No internal notes yet</p>
                  ) : (
                    messages
                      .filter((msg) => msg.is_internal_note)
                      .map((note) => (
                        <div
                          key={note.id}
                          className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30"
                        >
                          <div className="flex items-start gap-2">
                            <StickyNote className="mt-0.5 h-4 w-4 text-amber-600" />
                            <div className="flex-1">
                              <p className="text-sm">{note.message}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {note.user?.name} · {new Date(note.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
