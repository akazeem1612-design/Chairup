// ============================================================
// Netlify Function: stripe-webhook
// Listens for Stripe events and saves confirmed bookings to DB
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Use service role key to bypass RLS (this runs server-side, not as a user)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
    const sig = event.headers['stripe-signature'];

    let stripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('[webhook] Signature verification failed:', err.message);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    // ── Handle successful payment ───────────────────────────
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;

        const {
            listingId,
            renterId,
            date,
            timeSlot,
            hours,
            totalPrice,
            serviceFee,
        } = session.metadata;

        const { error } = await supabase.from('bookings').insert({
            listing_id: listingId,
            renter_id: renterId,
            booking_date: date,
            time_slot: timeSlot,
            hours: parseInt(hours, 10),
            total_price: parseFloat(totalPrice),
            service_fee: parseFloat(serviceFee),
            status: 'confirmed',
            stripe_session_id: session.id,
        });

        if (error) {
            console.error('[webhook] Supabase insert failed:', error.message);
            return { statusCode: 500, body: error.message };
        }

        console.log('[webhook] Booking saved for session:', session.id);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ received: true }),
    };
};
