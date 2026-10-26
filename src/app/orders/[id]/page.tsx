import { Suspense } from "react";
import { AppFrame } from "@/components/layout/app-frame";
import { OrderDetailPage } from "@/components/screens/order-detail-page";
import { seedOrders } from "@/lib/memory";

export function generateStaticParams() {
  return seedOrders.map((order) => ({ id: order.id }));
}

export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <AppFrame>
      <Suspense fallback={<p>Loading order…</p>}>
        <OrderFromParams params={params} />
      </Suspense>
    </AppFrame>
  );
}

async function OrderFromParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailPage id={id} />;
}
