import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Clock, Loader2, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';

export interface StaffClockStatus {
  employee_id: number;
  employee_name: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  is_clocked_in: boolean;
  can_clock_in: boolean;
  can_clock_out: boolean;
  require_location: boolean;
  location_enforced: boolean;
  mock_location: { latitude: number; longitude: number };
}

function getCoordinates(status: StaffClockStatus): Promise<{ latitude: number; longitude: number }> {
  if (!status.location_enforced) {
    return Promise.resolve(status.mock_location);
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        reject(new Error('Unable to get your location. Please enable location access and try again.'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export default function StaffClockWidget() {
  const route = useRoute();
  const page = useTypedPage<{ staffClock?: StaffClockStatus | null }>();
  const status = page.props.staffClock;
  const [loading, setLoading] = useState(false);

  if (!status) {
    return null;
  }

  const handleClock = async (action: 'in' | 'out') => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const coords = await getCoordinates(status);
      const routeName = action === 'in' ? 'staff.attendance.clock-in' : 'staff.attendance.clock-out';

      router.post(route(routeName), coords, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(action === 'in' ? 'Clocked in successfully' : 'Clocked out successfully');
        },
        onError: (errors) => {
          const message =
            (typeof errors.clock === 'string' && errors.clock) ||
            (typeof errors.message === 'string' && errors.message) ||
            'Unable to complete clock action.';
          toast.error(message);
        },
        onFinish: () => setLoading(false),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Location error');
      setLoading(false);
    }
  };

  const statusLabel = status.is_clocked_in
    ? 'On duty'
    : status.clock_out
      ? 'Shift complete'
      : 'Not clocked in';

  return (
    <Popover>
      <div className="flex items-center gap-1">
        {status.can_clock_in && (
          <Button
            variant="default"
            size="sm"
            className="h-9 gap-1.5 bg-green-600 hover:bg-green-700"
            disabled={loading}
            onClick={() => handleClock('in')}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Clock In</span>
          </Button>
        )}

        {status.can_clock_out && (
          <Button
            variant="default"
            size="sm"
            className="h-9 gap-1.5 bg-amber-600 hover:bg-amber-700"
            disabled={loading}
            onClick={() => handleClock('out')}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Clock Out</span>
          </Button>
        )}

        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Attendance details">
            <Clock className="h-4 w-4" />
            <span className="sr-only">Attendance details</span>
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{status.employee_name}</p>
            <p className="text-xs text-muted-foreground">{status.date}</p>
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{statusLabel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Clock in</span>
              <span className="font-medium">{status.clock_in ?? '—'}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Clock out</span>
              <span className="font-medium">{status.clock_out ?? '—'}</span>
            </div>
          </div>

          {!status.location_enforced && (
            <p className="text-xs text-muted-foreground">
              Development mode: office location check is bypassed.
            </p>
          )}

          {status.location_enforced && (
            <p className="text-xs text-muted-foreground">
              Clock actions require you to be at the office. Location access is required.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
