import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

export interface ManagerTeamQueueData {
  pending_team_leaves: number;
  team_on_leave_today: number;
  team_size: number;
}

export default function ManagerTeamQueue({ queue }: { queue: ManagerTeamQueueData }) {
  const route = useRoute();

  if (!queue || (queue.pending_team_leaves <= 0 && queue.team_on_leave_today <= 0)) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          My team ({queue.team_size})
        </CardTitle>
        <CardDescription>Leave approvals and availability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {queue.pending_team_leaves > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
            <span>{queue.pending_team_leaves} leave request(s) pending</span>
            <Button variant="ghost" size="sm" asChild>
              <Link href={route('staff.team.index')}>
                Review
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
        {queue.team_on_leave_today > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {queue.team_on_leave_today} team member(s) on leave today
          </div>
        )}
      </CardContent>
    </Card>
  );
}
