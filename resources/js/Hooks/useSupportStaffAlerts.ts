import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import useTypedPage from '@/Hooks/useTypedPage';

interface SupportStaffAlertPayload {
  id: number;
  type: string;
  message: string;
  link?: string | null;
  conversation_id?: string;
  requester_name?: string;
  has_attachments?: boolean;
  event?: 'message' | 'ticket' | 'escalation';
}

function canReceiveSupportAlerts(permissions: string[] = [], roles: string[] = []): boolean {
  const supportPermissions = ['view support'];
  const hasSupportPermission = supportPermissions.some((permission) => permissions.includes(permission));
  const isDeveloper = roles.some((role) => ['super_user', 'admin'].includes(role));

  return hasSupportPermission || isDeveloper;
}

export function useSupportStaffAlerts(): void {
  const page = useTypedPage();
  const user = page.props.auth?.user;

  useEffect(() => {
    if (!user || !window.Echo) {
      return;
    }

    const permissions = user.permissions ?? [];
    const roles = (user.roles ?? []).map((role: string | { name: string }) =>
      typeof role === 'string' ? role : role.name,
    );

    if (!canReceiveSupportAlerts(permissions, roles)) {
      return;
    }

    const channelName = `support-staff.${user.id}`;
    const channel = window.Echo.private(channelName);

    channel.listen('.support.staff.alert', (payload: SupportStaffAlertPayload) => {
      const title =
        payload.event === 'ticket'
          ? 'New support ticket'
          : payload.event === 'escalation'
            ? 'Chat escalated to human'
            : 'Support chat message';

      toast(title, {
        description: payload.message,
        action: payload.link
          ? {
              label: 'View',
              onClick: () => router.visit(payload.link!),
            }
          : undefined,
      });

      router.reload({ only: ['notifications'] });
    });

    return () => {
      window.Echo?.leave(channelName);
    };
  }, [user?.id]);
}
