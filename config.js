// ============================================================
// ChairUp — Configuration
// ============================================================

// ── Supabase (database + auth) ──────────────────────────────
const SUPABASE_URL = 'https://xdusajaoncvudjeovehh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdXNhamFvbmN2dWRqZW92ZWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjMyNjgsImV4cCI6MjA4ODEzOTI2OH0.IxqTTVHQpxHo3X081eK8XJuAECE19IAeL_U3XuIovnI';

window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.USE_SUPABASE = true;

// ── Stripe (payments) ───────────────────────────────────────
// Get your publishable key from: https://dashboard.stripe.com/apikeys
// It starts with pk_live_... (production) or pk_test_... (testing)
// Leave empty ('') to skip Stripe and use direct DB inserts (local dev only)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RlfFAHcdBc6HjtdnIeE0eSNYdEUyfPFqFLcuIc1ejq4rlBTzF3YEno8Pq3rtPawVIhoR60qoxLo9qUZC3xllrkc00UuhQWkAN';

window.STRIPE_PUBLISHABLE_KEY = STRIPE_PUBLISHABLE_KEY || null;
