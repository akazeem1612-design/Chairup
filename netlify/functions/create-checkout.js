// ============================================================
// Netlify Function: create-checkout
// Creates a Stripe Checkout session for a booking
// Called by the frontend when user clicks "Confirm & Pay"
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const {
            listingId,
            listingTitle,
            listingType,
            renterId,
            date,
            timeSlot,
            hours,
            priceHourly,
            serviceFee,
        } = JSON.parse(event.body);

        // Validate required fields
        if (!listingId || !renterId || !date || !timeSlot || !priceHourly) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required booking fields' }),
            };
        }

        const subtotal = Math.round(priceHourly * hours * 100); // in cents
        const feeAmount = Math.round(serviceFee * 100);           // in cents
        const totalAmount = subtotal + feeAmount;

        const TYPE_EMOJI = { barber: '✂️', salon: '💆', nail: '💅', spa: '🧘', lash: '👁' };
        const emoji = TYPE_EMOJI[listingType] || '🪑';

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',

            line_items: [
                // Space rental
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${emoji} ${listingTitle}`,
                            description: `${timeSlot} on ${date} · ${hours} hour${hours !== 1 ? 's' : ''}`,
                        },
                        unit_amount: subtotal,
                    },
                    quantity: 1,
                },
                // Service fee
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'ChairUp service fee',
                            description: '12% platform fee — covers payment protection & support',
                        },
                        unit_amount: feeAmount,
                    },
                    quantity: 1,
                },
            ],

            // Redirect URLs after payment
            success_url: `${process.env.URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL}/?cancelled=true`,

            // Store booking data — webhook reads this to save the booking
            metadata: {
                listingId,
                renterId,
                date,
                timeSlot,
                hours: String(hours),
                totalPrice: String((subtotal + feeAmount) / 100),
                serviceFee: String(serviceFee),
            },
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: session.url }),
        };

    } catch (err) {
        console.error('[create-checkout]', err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
