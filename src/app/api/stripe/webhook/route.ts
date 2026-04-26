import { NextResponse } from "next/server";

// Stripe webhook for subscription lifecycle events.
// Events to handle:
//   - checkout.session.completed         -> activate plan
//   - customer.subscription.updated      -> change quotas
//   - customer.subscription.deleted      -> downgrade to free / pause series
//   - invoice.payment_failed             -> notify user
//
// Verify the signature with stripe.webhooks.constructEvent
// using STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  return NextResponse.json({ received: true, sigPresent: !!sig, len: body.length });
}
