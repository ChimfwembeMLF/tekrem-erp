import React from "react";
import { Button } from "@/Components/ui/button";

type Props = {
  className?: string;
  label?: string;
};

export default function TekremAuthButton({
  className,
  label = "Continue with Tekrem",
}: Props) {
  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center gap-2"
        asChild
      >
        <a href="/auth/tekrem/redirect">
          <img src="/favicon.svg" alt="Tekrem" className="h-4 w-4 object-contain" />
          {label}
        </a>
      </Button>
    </div>
  );
}
