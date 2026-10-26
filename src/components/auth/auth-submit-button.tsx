"use client";

import { useFormStatus } from "react-dom";

export function AuthSubmitButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Redirecting…" : children}
    </button>
  );
}
