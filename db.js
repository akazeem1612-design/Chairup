// ============================================================
// ChairUp — Database Layer (Supabase)
// All backend calls live here. app.js calls these functions.
// Falls back to mock data if Supabase isn't yet configured.
// ============================================================

let _supabase = null;

function getSupabase() {
    if (!window.USE_SUPABASE) return null;
    if (!_supabase) {
        _supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
    return _supabase;
}

// ── HELPER ────────────────────────────────────────────────
function dbError(context, error) {
    console.error(`[ChairUp DB · ${context}]`, error.message || error);
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════

const Auth = {
    /** Sign up a new user */
    async signUp({ email, password, fullName, role }) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: { message: 'Supabase not configured' } };

        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role } }
        });
        if (error) { dbError('signUp', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Log in */
    async signIn({ email, password }) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: { message: 'Supabase not configured' } };

        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) { dbError('signIn', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Log out */
    async signOut() {
        const sb = getSupabase();
        if (!sb) return;
        await sb.auth.signOut();
    },

    /** Get current session/user */
    async getSession() {
        const sb = getSupabase();
        if (!sb) return null;
        const { data } = await sb.auth.getSession();
        return data?.session ?? null;
    },

    /** Get current profile from profiles table */
    async getProfile(userId) {
        const sb = getSupabase();
        if (!sb) return null;
        const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) { dbError('getProfile', error); return null; }
        return data;
    },

    /** Update profile */
    async updateProfile(userId, updates) {
        const sb = getSupabase();
        if (!sb) return { error: true };
        const { data, error } = await sb
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        if (error) { dbError('updateProfile', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Subscribe to auth state changes */
    onAuthStateChange(callback) {
        const sb = getSupabase();
        if (!sb) return { data: { subscription: { unsubscribe: () => { } } } };
        return sb.auth.onAuthStateChange(callback);
    },

    /** OAuth sign in (Google) */
    async signInWithGoogle() {
        const sb = getSupabase();
        if (!sb) return;
        await sb.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    }
};

// ════════════════════════════════════════════════════════════
// LISTINGS
// ════════════════════════════════════════════════════════════

const Listings = {
    /** Fetch all active listings, optionally filtered */
    async getAll({ type = null, city = null, limit = 20, offset = 0 } = {}) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: null }; // caller falls back to mock

        let query = sb
            .from('listings')
            .select(`
        *,
        host:profiles!listings_host_id_fkey(full_name, avatar_url)
      `)
            .eq('is_active', true)
            .order('rating', { ascending: false })
            .range(offset, offset + limit - 1);

        if (type) query = query.eq('type', type);
        if (city) query = query.ilike('city', `%${city}%`);

        const { data, error } = await query;
        if (error) { dbError('getAll', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Fetch a single listing by id */
    async getById(id) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: null };

        const { data, error } = await sb
            .from('listings')
            .select(`
        *,
        host:profiles!listings_host_id_fkey(id, full_name, avatar_url, bio, created_at),
        availability(*),
        reviews(id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name))
      `)
            .eq('id', id)
            .single();

        if (error) { dbError('getById', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Get listings hosted by a specific user */
    async getByHost(hostId) {
        const sb = getSupabase();
        if (!sb) return { data: [], error: null };

        const { data, error } = await sb
            .from('listings')
            .select('*')
            .eq('host_id', hostId)
            .order('created_at', { ascending: false });

        if (error) { dbError('getByHost', error); return { data: [], error }; }
        return { data, error: null };
    },

    /** Create a new listing */
    async create(listingData) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: { message: 'Supabase not configured' } };

        const { data, error } = await sb
            .from('listings')
            .insert(listingData)
            .select()
            .single();

        if (error) { dbError('create', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Update an existing listing */
    async update(id, updates) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: { message: 'Supabase not configured' } };

        const { data, error } = await sb
            .from('listings')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) { dbError('update', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Soft-delete (deactivate) a listing */
    async deactivate(id) {
        return Listings.update(id, { is_active: false });
    },

    /** Upload listing photos to Supabase Storage */
    async uploadImages(hostId, files) {
        const sb = getSupabase();
        if (!sb) return [];

        const urls = [];
        for (const file of files) {
            const ext = file.name.split('.').pop();
            const path = `${hostId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await sb.storage
                .from('listing-images')
                .upload(path, file, { cacheControl: '3600', upsert: false });

            if (error) { dbError('uploadImages', error); continue; }

            const { data: urlData } = sb.storage.from('listing-images').getPublicUrl(path);
            urls.push(urlData.publicUrl);
        }
        return urls;
    },

    /** Set availability for a listing */
    async setAvailability(listingId, days) {
        // days = [{ day_of_week, open_time, close_time, is_open }, ...]
        const sb = getSupabase();
        if (!sb) return { error: null };

        // Delete existing then insert fresh
        await sb.from('availability').delete().eq('listing_id', listingId);
        const rows = days.map(d => ({ listing_id: listingId, ...d }));
        const { error } = await sb.from('availability').insert(rows);
        if (error) dbError('setAvailability', error);
        return { error };
    },

    /** Get taken slots for a listing on a date */
    async getTakenSlots(listingId, date) {
        const sb = getSupabase();
        if (!sb) return [];

        const { data, error } = await sb
            .from('bookings')
            .select('time_slot')
            .eq('listing_id', listingId)
            .eq('booking_date', date)
            .not('status', 'eq', 'cancelled');

        if (error) { dbError('getTakenSlots', error); return []; }
        return (data || []).map(b => b.time_slot);
    }
};

// ════════════════════════════════════════════════════════════
// BOOKINGS
// ════════════════════════════════════════════════════════════

const Bookings = {
    /** Create a booking */
    async create({ listingId, renterId, date, timeSlot, hours, totalPrice, serviceFee }) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: { message: 'Supabase not configured' } };

        const { data, error } = await sb
            .from('bookings')
            .insert({
                listing_id: listingId,
                renter_id: renterId,
                booking_date: date,
                time_slot: timeSlot,
                hours,
                total_price: totalPrice,
                service_fee: serviceFee,
                status: 'confirmed'
            })
            .select()
            .single();

        if (error) { dbError('create booking', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Get all bookings for current renter */
    async getMyBookings(renterId) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: null };

        const { data, error } = await sb
            .from('bookings')
            .select(`
        *,
        listing:listings(title, city, state, images, type)
      `)
            .eq('renter_id', renterId)
            .order('booking_date', { ascending: false });

        if (error) { dbError('getMyBookings', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Get all bookings for a host (across all their listings) */
    async getHostBookings(hostId) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: null };

        const { data, error } = await sb
            .from('bookings')
            .select(`
        *,
        listing:listings!inner(title, host_id),
        renter:profiles!bookings_renter_id_fkey(full_name, avatar_url)
      `)
            .eq('listings.host_id', hostId)
            .order('booking_date', { ascending: false });

        if (error) { dbError('getHostBookings', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Cancel a booking */
    async cancel(bookingId) {
        const sb = getSupabase();
        if (!sb) return { error: null };

        const { error } = await sb
            .from('bookings')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', bookingId);

        if (error) dbError('cancel booking', error);
        return { error };
    },

    /** Mark booking as completed */
    async complete(bookingId) {
        const sb = getSupabase();
        if (!sb) return { error: null };

        const { error } = await sb
            .from('bookings')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', bookingId);

        if (error) dbError('complete booking', error);
        return { error };
    }
};

// ════════════════════════════════════════════════════════════
// REVIEWS
// ════════════════════════════════════════════════════════════

const Reviews = {
    /** Submit a review */
    async create({ listingId, bookingId, reviewerId, rating, comment }) {
        const sb = getSupabase();
        if (!sb) return { data: null, error: { message: 'Supabase not configured' } };

        const { data, error } = await sb
            .from('reviews')
            .insert({ listing_id: listingId, booking_id: bookingId, reviewer_id: reviewerId, rating, comment })
            .select()
            .single();

        if (error) { dbError('create review', error); return { data: null, error }; }
        return { data, error: null };
    },

    /** Get reviews for a listing */
    async getForListing(listingId) {
        const sb = getSupabase();
        if (!sb) return [];

        const { data, error } = await sb
            .from('reviews')
            .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)')
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false });

        if (error) { dbError('getReviews', error); return []; }
        return data || [];
    }
};

// ════════════════════════════════════════════════════════════
// FAVORITES
// ════════════════════════════════════════════════════════════

const Favorites = {
    async toggle(userId, listingId) {
        const sb = getSupabase();
        if (!sb) return;

        const { data: existing } = await sb
            .from('favorites')
            .select('listing_id')
            .eq('user_id', userId)
            .eq('listing_id', listingId)
            .single();

        if (existing) {
            await sb.from('favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
            return false; // removed
        } else {
            await sb.from('favorites').insert({ user_id: userId, listing_id: listingId });
            return true; // added
        }
    },

    async getForUser(userId) {
        const sb = getSupabase();
        if (!sb) return [];

        const { data } = await sb
            .from('favorites')
            .select('listing_id')
            .eq('user_id', userId);

        return (data || []).map(f => f.listing_id);
    }
};

// ════════════════════════════════════════════════════════════
// HOST EARNINGS SUMMARY
// ════════════════════════════════════════════════════════════

const Analytics = {
    /** Get simple earnings stats for a host */
    async getHostStats(hostId) {
        const sb = getSupabase();
        if (!sb) return { monthly: 4280, totalBookings: 38, avgRating: 4.9 };

        // Get all of this host's listing ids
        const { data: hostListings } = await sb
            .from('listings')
            .select('id, rating, review_count')
            .eq('host_id', hostId);

        if (!hostListings?.length) return { monthly: 0, totalBookings: 0, avgRating: 0 };

        const listingIds = hostListings.map(l => l.id);
        const firstOfMonth = new Date();
        firstOfMonth.setDate(1);
        firstOfMonth.setHours(0, 0, 0, 0);

        const { data: bookings } = await sb
            .from('bookings')
            .select('total_price, service_fee, status, created_at')
            .in('listing_id', listingIds)
            .neq('status', 'cancelled');

        const monthlyBookings = (bookings || []).filter(b => new Date(b.created_at) >= firstOfMonth);
        const monthly = monthlyBookings.reduce((sum, b) => sum + (b.total_price - b.service_fee), 0);
        const avgRating = hostListings.reduce((s, l) => s + l.rating, 0) / hostListings.length;

        return {
            monthly: Math.round(monthly),
            totalBookings: (bookings || []).length,
            avgRating: Math.round(avgRating * 10) / 10,
            activeListings: hostListings.length
        };
    }
};

// Expose DB modules globally
window.DB = { Auth, Listings, Bookings, Reviews, Favorites, Analytics };
