import { Suspense } from "react";
import { AppFrame } from "@/components/layout/app-frame";
import { DishDetailPage } from "@/components/screens/dish-detail-page";
import { dishes } from "@/lib/data";

export function generateStaticParams() {
  return dishes.map((dish) => ({ id: dish.id }));
}

export default function DishPage({ params }: PageProps<"/dish/[id]">) {
  return (
    <AppFrame>
      <Suspense fallback={<p>Loading dish…</p>}>
        <DishFromParams params={params} />
      </Suspense>
    </AppFrame>
  );
}

async function DishFromParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DishDetailPage id={id} />;
}
