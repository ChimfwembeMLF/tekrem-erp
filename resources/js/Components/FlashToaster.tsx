import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

export interface FlashMessages {
  success?: string | null;
  error?: string | null;
  message?: string | null;
}

export default function FlashToaster() {
  const { flash } = usePage().props as { flash?: FlashMessages };
  const lastShown = useRef<string>('');

  useEffect(() => {
    if (!flash) {
      return;
    }

    const { success, error, message } = flash;

    if (!success && !error && !message) {
      return;
    }

    const fingerprint = JSON.stringify({ success, error, message });
    if (lastShown.current === fingerprint) {
      return;
    }
    lastShown.current = fingerprint;

    if (success) {
      toast.success(success);
    }

    if (error) {
      toast.error(error);
    }

    if (message && !success && !error) {
      toast.message(message);
    }
  }, [flash]);

  return null;
}
