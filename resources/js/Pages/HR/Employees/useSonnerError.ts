import { toast } from 'sonner';

export function showFormErrors(errors: Record<string, string | string[]>) {
  Object.entries(errors).forEach(([field, message]) => {
    if (Array.isArray(message)) {
      message.forEach((msg) => toast.error(msg));
    } else {
      toast.error(message);
    }
  });
}
