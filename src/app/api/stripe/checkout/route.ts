import { NextResponse } from "next/server";

// Create a Stripe Checkout session for a given plan.
//
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// const session = await stripe.checkout.sessions.create({
//   mode: "subscription",
//   line_items: [{ price: priceIdForPlan(plan), quantity: 1 }],
//   success_url: `${origin}/dashboard?checkout=success`,
//   cancel_url:  `${origin}/pricing?checkout=cancel`,
//   customer_email: user.email,
//   client_reference_id: user.id,
// });
export async function POST(req: Request) {
  const { plan } = await req.json().catch(() => ({}));
  return NextResponse.json({ stub: true, plan, url: "/dashboard?checkout=stub" });
}
