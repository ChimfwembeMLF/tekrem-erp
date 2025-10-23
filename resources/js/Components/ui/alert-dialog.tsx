import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertDialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AlertDialog({ open, onOpenChange, children, ...props }: AlertDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onOpenChange?.(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onOpenChange]);

  return (
    <dialog ref={dialogRef} className={cn("rounded-lg shadow-lg p-0 border w-full max-w-md", props.className)} {...props}>
      {children}
    </dialog>
  );
}

export function AlertDialogTrigger({ asChild, children, ...props }: { asChild?: boolean; children: React.ReactNode }) {
  // Only clone if children is a valid React element
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        if (typeof children.props.onClick === 'function') {
          children.props.onClick(e);
        }
        const dialog = (e.target as HTMLElement).closest("dialog");
        if (dialog) (dialog as HTMLDialogElement).showModal();
      },
    });
  }
  // If not a valid element, just render as is
  return <>{children}</>;
}

export function AlertDialogContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="p-6" {...props}>{children}</div>;
}

export function AlertDialogHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mb-4" {...props}>{children}</div>;
}

export function AlertDialogTitle({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className="text-lg font-semibold mb-2" {...props}>{children}</h2>;
}

export function AlertDialogDescription({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="text-gray-600 mb-4" {...props}>{children}</div>;
}

export function AlertDialogFooter({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="flex justify-end gap-2 mt-4" {...props}>{children}</div>;
}

export function AlertDialogCancel({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200" {...props}>{children}</button>;
}

export function AlertDialogAction({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" {...props}>{children}</button>;
}
