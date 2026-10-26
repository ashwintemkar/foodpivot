"use client";

import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { money } from "@/lib/data";

export function PriceBreakdown({
  subtotal,
  coupon,
  onCoupon,
  checkout = false,
}: {
  subtotal: number;
  coupon: boolean;
  onCoupon?: () => void;
  checkout?: boolean;
}) {
  const fees = 6200;
  const discount = coupon ? 5000 : 0;
  const total = subtotal + fees - discount;

  return (
    <aside className="summary-card">
      <span className="eyebrow">Price breakdown</span>
      <dl>
        <div>
          <dt>Item subtotal</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery + packaging</dt>
          <dd>{money(4200)}</dd>
        </div>
        <div>
          <dt>Platform fee + taxes</dt>
          <dd>{money(2000)}</dd>
        </div>
        {coupon ? (
          <div className="discount">
            <dt>DEMO50</dt>
            <dd>−{money(discount)}</dd>
          </div>
        ) : null}
        <div className="total">
          <dt>Total</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>
      {!checkout ? (
        <>
          {!coupon ? (
            <button className="coupon" type="button" onClick={onCoupon}>
              Apply demo coupon <span>DEMO50</span>
            </button>
          ) : (
            <p className="success">
              <Check size={15} /> Demo coupon applied
            </p>
          )}
          <Link className="button primary full" href="/checkout">
            Continue to approval <ArrowRight size={17} />
          </Link>
        </>
      ) : null}
      <p className="fine">
        <ShieldCheck size={14} /> No real payment will be made.
      </p>
    </aside>
  );
}
