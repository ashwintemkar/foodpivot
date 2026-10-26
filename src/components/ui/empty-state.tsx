import { ShoppingBag } from "lucide-react";

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="empty-state">
      <span>
        <ShoppingBag />
      </span>
      <h2>{title}</h2>
      <p>{copy}</p>
      {action}
    </section>
  );
}
