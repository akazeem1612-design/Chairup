// ============ DATA ============
const IMAGES = {
  barbershop: '/Users/abdulmaleekkazeem/.gemini/antigravity/brain/1199bce7-a386-455d-b6f5-ebf5a6327a6b/barbershop_hero_1772212758522.png',
  salon: '/Users/abdulmaleekkazeem/.gemini/antigravity/brain/1199bce7-a386-455d-b6f5-ebf5a6327a6b/salon_interior_1772212770245.png',
  nail: '/Users/abdulmaleekkazeem/.gemini/antigravity/brain/1199bce7-a386-455d-b6f5-ebf5a6327a6b/nail_studio_1772212789224.png',
  spa: '/Users/abdulmaleekkazeem/.gemini/antigravity/brain/1199bce7-a386-455d-b6f5-ebf5a6327a6b/spa_suite_1772212799694.png',
};

// Map Supabase listing row → shape app.js expects
function normalizeDbListing(row) {
  const typeImg = IMAGES[row.type] || IMAGES.barbershop;
  const img = row.images && row.images.length > 0 ? row.images[0] : typeImg;
  const BADGE_MAP = { barber: '⚡ Instant Book', salon: '⭐ Top Rated', nail: '✨ Premium', spa: '🕯 Full Suite', lash: '🔒 Private Suite' };
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    location: [row.city, row.state].filter(Boolean).join(', '),
    price: Number(row.price_hourly),
    priceDay: row.price_daily ? Number(row.price_daily) : null,
    rating: Number(row.rating) || 0,
    reviews: row.review_count || 0,
    img,
    badge: BADGE_MAP[row.type] || '⚡ Instant Book',
    amenities: row.amenities || [],
    host: row.host?.full_name || 'Host',
    hostJoined: 'Verified Host',
    desc: row.description || '',
    seats: row.seats || 1,
    minBook: row.min_booking || '1 hour',
    policy: row.policy || 'instant',
    slots: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
    taken: [],
  };
}

const LISTINGS = [
  {
    id: 1, type: 'barber', title: "The Merchant's — Booth #2",
    location: "Wicker Park, Chicago IL", price: 18, priceDay: 110,
    rating: 4.9, reviews: 84, img: IMAGES.barbershop,
    badge: "⚡ Instant Book",
    amenities: ["WiFi", "Parking", "Shampoo Bowl", "Storage"],
    host: "DeShawn M.", hostJoined: "Host since 2024",
    desc: "Premium barber booth in one of Chicago's most sought-after barbershops. Located in the heart of Wicker Park with heavy foot traffic. Includes a dedicated barber chair, mirror station, and storage. Great lighting for content creation too.",
    seats: 1, minBook: "1 hour", policy: "instant",
    slots: ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"],
    taken: ["10:00 AM", "2:00 PM"],
    coords: { lat: 41.9088, lng: -87.6788 }
  },
  {
    id: 2, type: 'salon', title: "MUSE Hair & Beauty — Chair 4",
    location: "Midtown, Atlanta GA", price: 22, priceDay: 140,
    rating: 5.0, reviews: 61, img: IMAGES.salon,
    badge: "⭐ Top Rated",
    amenities: ["WiFi", "Shampoo Bowl", "Towels", "Retail Display", "Reception"],
    host: "Bianca T.", hostJoined: "Host since 2023",
    desc: "Stunning salon in Midtown Atlanta with floor-to-ceiling windows and a luxurious, editorial feel. Chair 4 is the most popular position — great natural light and walk-in visibility. Perfect for color specialists or stylists building their brand.",
    seats: 1, minBook: "2 hours", policy: "instant",
    slots: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "3:00 PM", "4:00 PM"],
    taken: ["11:00 AM", "12:00 PM"],
    coords: { lat: 33.7866, lng: -84.3858 }
  },
  {
    id: 3, type: 'nail', title: "The Nail Atelier — Station 2",
    location: "Beverly Hills, Los Angeles CA", price: 30, priceDay: 195,
    rating: 4.8, reviews: 47, img: IMAGES.nail,
    badge: "✨ Premium",
    amenities: ["WiFi", "Parking", "Storage", "Music System", "Waiting Area", "A/C"],
    host: "Priya K.", hostJoined: "Host since 2024",
    desc: "An upscale nail studio in Beverly Hills attracting high-end clientele. Station 2 includes a full manicure desk, UV lamp, and plush client chair. Perfect for nail technicians who want to work with premium customers in a refined setting.",
    seats: 1, minBook: "2 hours", policy: "manual",
    slots: ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"],
    taken: ["1:00 PM"],
    coords: { lat: 34.0736, lng: -118.4004 }
  },
  {
    id: 4, type: 'spa', title: "Serenity Suite B — Full Spa Room",
    location: "Brooklyn, New York NY", price: 40, priceDay: 240,
    rating: 4.9, reviews: 33, img: IMAGES.spa,
    badge: "🕯 Full Suite",
    amenities: ["WiFi", "Towels", "A/C", "Waiting Area", "Storage", "Parking"],
    host: "Soleil F.", hostJoined: "Host since 2023",
    desc: "A complete, private spa suite in Brooklyn's wellness district. Includes a professional massage table, ambient lighting controls, Bluetooth speaker, and laundry. Ideal for massage therapists, aestheticians, or reiki practitioners who need a private space.",
    seats: 1, minBook: "Half day (4 hrs)", policy: "manual",
    slots: ["9:00 AM", "1:00 PM", "5:00 PM"],
    taken: ["1:00 PM"],
    coords: { lat: 40.6781, lng: -73.9442 }
  },
  {
    id: 5, type: 'barber', title: "Classic Cuts Studio — Booth 1",
    location: "South End, Charlotte NC", price: 15, priceDay: 88,
    rating: 4.7, reviews: 29, img: IMAGES.barbershop,
    badge: "⚡ Instant Book",
    amenities: ["WiFi", "Parking", "A/C", "Waiting Area"],
    host: "Marcus J.", hostJoined: "Host since 2025",
    desc: "Laid-back but professional barber shop in Charlotte's South End neighborhood. Growing area with tons of new residents. Booth 1 is private and faces the window — great for walk-ins. Includes a Belmont chair and big LED mirror.",
    seats: 1, minBook: "1 hour", policy: "instant",
    slots: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"],
    taken: ["9:00 AM"],
    coords: { lat: 35.2130, lng: -80.8546 }
  },
  {
    id: 6, type: 'lash', title: "Lux Lash Studio — Private Suite",
    location: "Buckhead, Atlanta GA", price: 25, priceDay: 160,
    rating: 4.9, reviews: 52, img: IMAGES.salon,
    badge: "🔒 Private Suite",
    amenities: ["WiFi", "Parking", "Towels", "Storage", "Music System", "Reception"],
    host: "Nadja W.", hostJoined: "Host since 2024",
    desc: "A private, intimate lash studio in Atlanta's Buckhead district. Fully equipped with a lash bed, ring light, and magnifying lamp. Client entrance is separate from the main salon for a boutique, premium experience.",
    seats: 1, minBook: "2 hours", policy: "instant",
    slots: ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
    taken: ["12:00 PM", "4:00 PM"],
    coords: { lat: 33.8448, lng: -84.3627 }
  },
];

const AMENITY_ICONS = {
  WiFi: "📶", Parking: "🅿️", "Shampoo Bowl": "🚿", Towels: "🏊", Storage: "🔒",
  Reception: "💁", "Retail Display": "🛍️", "Music System": "🎵", "A/C": "❄️", "Waiting Area": "🪑"
};

// ============ STATE ============
let currentUser = null;
let currentFilter = 'all';
let selectedListing = null;
let selectedSlot = null;
let favorites = new Set();
let currentFormStep = 1;
let myBookings = [
  { id: 'b1', listingId: 2, title: "MUSE Hair & Beauty — Chair 4", loc: "Midtown, Atlanta GA", date: "Sat, Mar 8 · 10:00 AM", price: 44, status: 'upcoming', img: IMAGES.salon },
  { id: 'b2', listingId: 1, title: "The Merchant's — Booth #2", loc: "Wicker Park, Chicago IL", date: "Mon, Mar 3 · 2:00 PM", price: 36, status: 'upcoming', img: IMAGES.barbershop },
  { id: 'b3', listingId: 3, title: "The Nail Atelier — Station 2", loc: "Beverly Hills, CA", date: "Fri, Feb 21 · 11:00 AM", price: 60, status: 'past', img: IMAGES.nail },
  { id: 'b4', listingId: 4, title: "Serenity Suite B", loc: "Brooklyn, NY", date: "Tue, Feb 11 · 9:00 AM", price: 160, status: 'cancelled', img: IMAGES.spa },
];

// ============ PAGE ROUTING ============
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const map = { explore: 'nav-explore', how: 'nav-how', host: 'nav-host' };
  if (map[name]) document.getElementById(map[name])?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'dashboard') renderDashboard();
  if (name === 'bookings') renderBookings('upcoming');
  if (name === 'host') updateReviewStep();
}

// ============ LISTINGS RENDER ============
async function renderListings(filter = 'all') {
  const grid = document.getElementById('listings-grid');

  // Show skeleton while loading
  grid.innerHTML = `<div class="listings-loading">${'<div class="skeleton-card"></div>'.repeat(6)}</div>`;

  let listings = null;

  // Try real DB
  if (window.USE_SUPABASE) {
    const { data } = await DB.Listings.getAll({ type: filter === 'all' ? null : filter });
    if (data && data.length > 0) {
      listings = data.map(normalizeDbListing);
      // Cache for detail page lookups
      window._dbListings = listings;
    }
  }

  // Fallback to mock data
  if (!listings) {
    const filtered = filter === 'all' ? LISTINGS : LISTINGS.filter(l => l.type === filter);
    listings = filtered;
  }

  if (listings.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text3);">No spaces found. <a href="#" onclick="renderListings()" style="color:var(--accent2)">Clear filters</a></div>`;
    return;
  }

  grid.innerHTML = listings.map(l => `
    <div class="listing-card" id="listing-${l.id}" onclick="openListing('${l.id}')">
      <img class="listing-img" src="${l.img}" alt="${l.title}" loading="lazy" onerror="this.src='${IMAGES.barbershop}'" />
      <div class="listing-badge">${l.badge}</div>
      <button class="listing-fav" onclick="toggleFav(event,'${l.id}')" id="fav-${l.id}">
        ${favorites.has(l.id) ? '❤️' : '🤍'}
      </button>
      <div class="listing-info">
        <div class="listing-title">${l.title}</div>
        <div class="listing-location">📍 ${l.location}</div>
        <div class="listing-meta">
          <div class="listing-price">$${l.price}<span>/hr</span></div>
          <div class="listing-rating"><span class="star">★</span> ${l.rating} <span>(${l.reviews})</span></div>
        </div>
        <div class="listing-amenities">
          ${l.amenities.slice(0, 3).map(a => `<span class="amenity-tag">${AMENITY_ICONS[a] || ''} ${a}</span>`).join('')}
          ${l.amenities.length > 3 ? `<span class="amenity-tag">+${l.amenities.length - 3} more</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function filterChip(el, type) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentFilter = type;
  renderListings(type);
}

function filterByType(type) {
  currentFilter = type;
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.onclick?.toString().includes(`'${type}'`));
  });
  renderListings(type);
  showPage('explore');
  document.getElementById('listings-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleFav(e, id) {
  e.stopPropagation();
  if (favorites.has(id)) { favorites.delete(id); } else { favorites.add(id); }
  document.getElementById('fav-' + id).textContent = favorites.has(id) ? '❤️' : '🤍';
}

function runSearch() {
  const loc = document.getElementById('search-location').value;
  const type = document.getElementById('search-type').value;
  showPage('explore');
  if (type) filterByType(type);
  document.getElementById('listings-grid').scrollIntoView({ behavior: 'smooth' });
}

// ============ DETAIL PAGE ============
async function openListing(id) {
  // Try DB first for real listing data
  if (window.USE_SUPABASE) {
    const { data } = await DB.Listings.getById(id);
    if (data) {
      selectedListing = normalizeDbListing(data);
      selectedSlot = null;
      renderDetail();
      showPage('detail');
      return;
    }
  }
  // Fallback: find in cached DB list or mock list
  const cached = (window._dbListings || []).find(l => String(l.id) === String(id));
  selectedListing = cached || LISTINGS.find(l => String(l.id) === String(id));
  selectedSlot = null;
  renderDetail();
  showPage('detail');
}

function renderDetail() {
  const l = selectedListing;
  document.getElementById('detail-container').innerHTML = `
    <button class="detail-back" onclick="showPage('explore')">← Back to listings</button>
    <div class="detail-imgs">
      <div class="detail-img-main"><img src="${l.img}" alt="${l.title}" /></div>
      <div class="detail-img-side">
        <img src="${l.img}" alt="" />
        <img src="${l.img}" alt="" />
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-info">
        <h1>${l.title}</h1>
        <div class="detail-meta-row">
          <span>⭐ ${l.rating} · <strong>${l.reviews} reviews</strong></span>
          <span class="dot">·</span>
          <span>📍 ${l.location}</span>
          <span class="dot">·</span>
          <span>${l.badge}</span>
        </div>
        <p class="detail-desc">${l.desc}</p>
        <div class="detail-amenities">
          <h3>What's included</h3>
          <div class="detail-amenities-grid">
            ${l.amenities.map(a => `
              <div class="detail-amenity-item">
                <span>${AMENITY_ICONS[a] || '✓'}</span>
                <span>${a}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="detail-host">
          <div class="host-avatar" style="background: linear-gradient(135deg, var(--accent), var(--gold));">
            ${l.host.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4>Hosted by ${l.host}</h4>
            <p>${l.hostJoined} · ${l.policy === 'instant' ? '⚡ Instant book' : '📋 Manual approval'} · Min: ${l.minBook}</p>
          </div>
        </div>
      </div>
      <div>
        <div class="booking-widget">
          <div class="widget-price">$${l.price}<span>/hr</span> ${l.priceDay ? `<span style="font-size:0.85rem;margin-left:0.5rem">or $${l.priceDay}/day</span>` : ''}</div>
          <div class="widget-field">
            <label>Date</label>
            <input type="date" id="widget-date" style="margin-bottom:0.75rem" />
          </div>
          <div class="widget-field">
            <label>Select a time slot</label>
            <div class="widget-slots" id="widget-slots">
              ${l.slots.map(s => `
                <button class="slot-btn ${l.taken.includes(s) ? 'taken' : ''}" 
                  onclick="${l.taken.includes(s) ? '' : `selectSlot('${s}', this)`}"
                  ${l.taken.includes(s) ? 'disabled' : ''}>
                  ${s}${l.taken.includes(s) ? '<br><span style="font-size:0.65rem">Booked</span>' : ''}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="widget-total" id="widget-total" style="display:none;">
            <div class="widget-total-row"><span>$${l.price} × 2 hrs</span><span>$${l.price * 2}</span></div>
            <div class="widget-total-row"><span>ChairUp service fee (12%)</span><span>$${Math.round(l.price * 2 * 0.12)}</span></div>
            <div class="widget-total-row total"><span>Total</span><span>$${Math.round(l.price * 2 * 1.12)}</span></div>
          </div>
          <button class="btn-book" id="btn-book" onclick="openBookingModal()">Reserve →</button>
          <p style="text-align:center; color:var(--text3); font-size:0.8rem; margin-top:0.75rem;">You won't be charged yet</p>
        </div>
      </div>
    </div>
  `;
}

function selectSlot(slot, btn) {
  selectedSlot = slot;
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('widget-total').style.display = 'block';
}

// ============ BOOKING MODAL ============
function openBookingModal() {
  if (!currentUser) { showAuthModal('login'); return; }
  if (!selectedSlot) { showToast('⚠️ Please select a time slot first'); return; }
  const l = selectedListing;
  const date = document.getElementById('widget-date')?.value || 'today';
  const total = Math.round(l.price * 2 * 1.12);
  document.getElementById('booking-modal-content').innerHTML = `
    <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:0.5rem;">Confirm your booking</h2>
    <p style="color:var(--text2);font-size:0.9rem;margin-bottom:1.75rem;">Review your details below before confirming.</p>
    <div style="background:var(--bg3);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;display:flex;gap:1rem;align-items:center;">
      <img src="${l.img}" style="width:80px;height:64px;border-radius:8px;object-fit:cover;" />
      <div>
        <strong style="display:block;margin-bottom:0.2rem;">${l.title}</strong>
        <span style="color:var(--text2);font-size:0.85rem;">📍 ${l.location}</span>
      </div>
    </div>
    <div style="margin-bottom:1.5rem;">
      <div style="display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border);font-size:0.9rem;color:var(--text2);">
        <span>Date</span><strong style="color:var(--text)">${date || 'Not specified'}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border);font-size:0.9rem;color:var(--text2);">
        <span>Time slot</span><strong style="color:var(--text)">${selectedSlot}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border);font-size:0.9rem;color:var(--text2);">
        <span>Duration</span><strong style="color:var(--text)">2 hours</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:0.75rem 0;font-size:1rem;font-weight:800;">
        <span>Total charged</span><strong style="color:var(--green)">$${total}</strong>
      </div>
    </div>
    <div style="background:var(--bg3);border-radius:10px;padding:1rem;margin-bottom:1.5rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.25rem;">💳</span>
        <div>
          <strong style="display:block;font-size:0.9rem;">Visa •••• 4242</strong>
          <span style="color:var(--text3);font-size:0.8rem;">Change payment method</span>
        </div>
      </div>
    </div>
    <button class="btn-book" onclick="confirmBooking()">Confirm & Pay $${total}</button>
  `;
  document.getElementById('booking-modal-overlay').classList.remove('hidden');
}

async function confirmBooking() {
  const l = selectedListing;
  const hours = 2;
  const subtotal = l.price * hours;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;
  const bookingDate = document.getElementById('widget-date')?.value || new Date().toISOString().split('T')[0];

  if (!currentUser?.id) { showAuthModal('login'); return; }

  // ─── Stripe path (production) ───────────────────────────────
  // When STRIPE_PUBLISHABLE_KEY is set in config.js, go through Stripe Checkout
  if (window.STRIPE_PUBLISHABLE_KEY) {
    const btn = document.querySelector('#booking-modal-content .btn-book');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Redirecting to payment…'; }

    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: l.id,
          listingTitle: l.title,
          listingType: l.type,
          renterId: currentUser.id,
          date: bookingDate,
          timeSlot: selectedSlot,
          hours,
          priceHourly: l.price,
          serviceFee,
        }),
      });

      const { url, error } = await res.json();
      if (error || !url) throw new Error(error || 'No checkout URL returned');

      // Redirect to Stripe hosted checkout
      window.location.href = url;
    } catch (err) {
      console.error('[Stripe]', err);
      showToast('⚠️ Payment setup failed. Please try again.');
      const btn = document.querySelector('#booking-modal-content .btn-book');
      if (btn) { btn.disabled = false; btn.textContent = `Confirm & Pay $${total}`; }
    }
    return;
  }

  // ─── Fallback: direct Supabase insert (local dev only) ────────
  if (window.USE_SUPABASE && currentUser?.id) {
    const { error } = await DB.Bookings.create({
      listingId: l.id,
      renterId: currentUser.id,
      date: bookingDate,
      timeSlot: selectedSlot,
      hours,
      totalPrice: total,
      serviceFee
    });
    if (error) {
      if (error.code === '23505') { showToast('⚠️ That time slot was just booked. Pick another.'); return; }
      showToast('⚠️ Booking failed. Try again.');
      return;
    }
  }

  // Add to local list for UI
  myBookings.unshift({
    id: 'b' + Date.now(), listingId: l.id, title: l.title, loc: l.location,
    date: `${selectedSlot} · ${bookingDate}`, price: total, status: 'upcoming', img: l.img
  });
  closeBookingModal();
  showToast('🎉 Booking confirmed!');
  setTimeout(() => showPage('bookings'), 1200);
}


function closeBookingModal(e) {
  if (e && e.target !== document.getElementById('booking-modal-overlay')) return;
  document.getElementById('booking-modal-overlay').classList.add('hidden');
}

// ============ AUTH MODAL ============
function showAuthModal(mode) {
  renderAuthModal(mode);
  document.getElementById('auth-modal-overlay').classList.remove('hidden');
}

function renderAuthModal(mode) {
  const isLogin = mode === 'login';
  document.getElementById('auth-modal-content').innerHTML = `
    <div class="auth-modal-title">${isLogin ? 'Welcome back' : 'Create your account'}</div>
    <div class="auth-modal-sub">${isLogin ? 'Log in to book seats and manage your spaces.' : 'Join thousands of beauty professionals on ChairUp.'}</div>
    ${!isLogin ? `
      <div class="auth-role-toggle">
        <div class="role-btn active" id="role-renter" onclick="selectRole('renter')">🪑 Book Seats</div>
        <div class="role-btn" id="role-host" onclick="selectRole('host')">🏠 List My Space</div>
      </div>
    ` : ''}
    <div class="auth-form">
      ${!isLogin ? `<input type="text" id="auth-name" placeholder="Full name" />` : ''}
      <input type="email" id="auth-email" placeholder="Email address" />
      <input type="password" id="auth-pass" placeholder="Password" />
      <button class="btn-auth" onclick="${isLogin ? 'doLogin()' : 'doSignup()'}">
        ${isLogin ? 'Log in' : 'Create account'} →
      </button>
    </div>
    <div class="auth-divider" style="margin:1.25rem 0;">or</div>
    <div class="auth-switch">
      ${isLogin ? `Don't have an account? <a onclick="renderAuthModal('signup')">Sign up</a>` : `Already have an account? <a onclick="renderAuthModal('login')">Log in</a>`}
    </div>
  `;
}

function selectRole(role) {
  document.getElementById('role-renter').classList.toggle('active', role === 'renter');
  document.getElementById('role-host').classList.toggle('active', role === 'host');
}

async function doLogin() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) { showToast('⚠️ Enter email & password'); return; }

  if (window.USE_SUPABASE) {
    const { data, error } = await DB.Auth.signIn({ email, password: pass });
    if (error) { showToast('⚠️ ' + (error.message || 'Login failed')); return; }
    const profile = await DB.Auth.getProfile(data.user.id);
    currentUser = {
      id: data.user.id,
      name: profile?.full_name || email.split('@')[0],
      email,
      role: profile?.role || 'renter',
      initials: (profile?.full_name || email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };
  } else {
    // Mock login
    currentUser = { name: 'Alex K.', email, initials: 'AK', role: 'renter' };
  }
  closeAuthModal();
  applyLoggedIn();
  showToast('👋 Welcome back, ' + currentUser.name.split(' ')[0] + '!');
}

async function doSignup() {
  const name = document.getElementById('auth-name')?.value;
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  const role = document.querySelector('.role-btn.active')?.id === 'role-host' ? 'host' : 'renter';
  if (!name || !email || !pass) { showToast('⚠️ Fill in all fields'); return; }

  if (window.USE_SUPABASE) {
    const { data, error } = await DB.Auth.signUp({ email, password: pass, fullName: name, role });
    if (error) { showToast('⚠️ ' + (error.message || 'Sign up failed')); return; }
    if (!data.session) {
      // Email confirmation required
      closeAuthModal();
      showToast('📧 Check your email to confirm your account!');
      return;
    }
    currentUser = { id: data.user.id, name, email, role, initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() };
  } else {
    currentUser = { name, email, role, initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() };
  }
  closeAuthModal();
  applyLoggedIn();
  showToast('🎉 Welcome to ChairUp, ' + name.split(' ')[0] + '!');
}

function applyLoggedIn() {
  document.getElementById('btn-login').classList.add('hidden');
  document.getElementById('btn-signup').classList.add('hidden');
  document.getElementById('user-avatar-menu').classList.remove('hidden');
  document.getElementById('user-avatar').textContent = currentUser.initials;
}

async function logout() {
  if (window.USE_SUPABASE) await DB.Auth.signOut();
  currentUser = null;
  document.getElementById('btn-login').classList.remove('hidden');
  document.getElementById('btn-signup').classList.remove('hidden');
  document.getElementById('user-avatar-menu').classList.add('hidden');
  document.getElementById('profile-dropdown').classList.add('hidden');
  showToast('👋 Logged out');
  showPage('explore');
}

function toggleProfileMenu() {
  document.getElementById('profile-dropdown').classList.toggle('hidden');
}

function closeAuthModal(e) {
  if (e && e.target !== document.getElementById('auth-modal-overlay')) return;
  document.getElementById('auth-modal-overlay').classList.add('hidden');
}

// ============ DASHBOARD ============
async function renderDashboard() {
  // Update header greeting
  const nameEl = document.querySelector('.dashboard-header h1');
  if (nameEl && currentUser) nameEl.textContent = `Welcome back, ${currentUser.name.split(' ')[0]} 👋`;

  // Real stats
  if (window.USE_SUPABASE && currentUser?.id) {
    const stats = await DB.Analytics.getHostStats(currentUser.id);
    const statEls = document.querySelectorAll('.d-stat strong');
    if (statEls[0]) statEls[0].textContent = '$' + stats.monthly.toLocaleString();
    if (statEls[1]) statEls[1].textContent = stats.totalBookings;
    if (statEls[2]) statEls[2].textContent = stats.avgRating || '—';
    if (statEls[3]) statEls[3].textContent = stats.activeListings || 0;

    // Bookings from DB
    const { data: dbBookings } = await DB.Bookings.getMyBookings(currentUser.id);
    if (dbBookings?.length) {
      myBookings = dbBookings.map(b => ({
        id: b.id, listingId: b.listing_id,
        title: b.listing?.title || 'Booking',
        loc: [b.listing?.city, b.listing?.state].filter(Boolean).join(', '),
        date: `${b.time_slot} · ${b.booking_date}`,
        price: b.total_price, status: b.status,
        img: IMAGES[b.listing?.type] || IMAGES.barbershop
      }));
    }

    // Host listings
    const { data: dbListings } = await DB.Listings.getByHost(currentUser.id);
    document.getElementById('my-listings').innerHTML = (dbListings?.length ? dbListings : LISTINGS.slice(0, 2)).map(l => `
      <div class="mini-listing">
        <div class="mini-listing-img" style="background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🪑</div>
        <div class="mini-listing-info">
          <strong>${l.title}</strong>
          <span>$${l.price_hourly || l.price}/hr · ⭐ ${l.rating || 0}</span>
        </div>
        <span class="mini-listing-status">Active</span>
      </div>
    `).join('');
  } else {
    // Mock listings
    document.getElementById('my-listings').innerHTML = LISTINGS.slice(0, 2).map(l => `
      <div class="mini-listing">
        <img class="mini-listing-img" src="${l.img}" alt="" />
        <div class="mini-listing-info">
          <strong>${l.title}</strong>
          <span>$${l.price}/hr · ⭐ ${l.rating}</span>
        </div>
        <span class="mini-listing-status">Active</span>
      </div>
    `).join('');
  }

  const upcoming = myBookings.filter(b => b.status === 'upcoming');
  document.getElementById('upcoming-bookings').innerHTML = upcoming.length
    ? upcoming.map(b => `
      <div class="booking-item">
        <div class="booking-item-dot"></div>
        <div class="booking-item-info">
          <strong>${b.title}</strong>
          <span>📍 ${b.loc} · ${b.date}</span>
        </div>
        <span class="booking-item-price">$${b.price}</span>
      </div>
    `).join('')
    : '<p style="color:var(--text3);font-size:0.9rem;">No upcoming bookings. <a href="#" onclick="showPage(\'explore\')" style="color:var(--accent2)">Find a space →</a></p>';
}

// ============ BOOKINGS ============
function renderBookings(tab) {
  const filtered = myBookings.filter(b => b.status === tab || (tab === 'past' && b.status === 'past') || (tab === 'cancelled' && b.status === 'cancelled'));
  const statusLabel = { upcoming: 'status-up', past: 'status-past', cancelled: 'status-cancel' };
  const statusText = { upcoming: '✓ Upcoming', past: 'Completed', cancelled: 'Cancelled' };
  document.getElementById('booking-list-container').innerHTML = filtered.length
    ? filtered.map(b => `
      <div class="booking-full-card">
        <div class="booking-full-img"><img src="${b.img}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" /></div>
        <div class="booking-full-info">
          <h3>${b.title}</h3>
          <p>📍 ${b.loc}</p>
          <p style="margin-top:0.25rem;">📅 ${b.date}</p>
        </div>
        <div>
          <div style="font-weight:800;font-size:1.05rem;margin-bottom:0.5rem;">$${b.price}</div>
          <span class="booking-full-status ${statusLabel[b.status]}">${statusText[b.status]}</span>
        </div>
      </div>
    `).join('')
    : `<div style="text-align:center;padding:4rem;color:var(--text3);">No ${tab} bookings.</div>`;
}

function switchBookingTab(el, tab) {
  document.querySelectorAll('.booking-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderBookings(tab);
}

// ============ HOST FORM ============
function nextFormStep(step) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById('form-step-' + i).classList.toggle('hidden', i !== step);
    const ps = document.getElementById('pstep-' + i);
    if (i < step) { ps.classList.add('done'); ps.classList.remove('active'); ps.textContent = '✓ ' + ps.textContent.replace('✓ ', ''); }
    else if (i === step) { ps.classList.add('active'); ps.classList.remove('done'); }
    else { ps.classList.remove('active', 'done'); }
  }
  currentFormStep = step;
  if (step === 4) updateReviewStep();
}

function updateReviewStep() {
  const name = document.getElementById('host-name')?.value || 'Your Space Name';
  const type = document.getElementById('host-type')?.value || 'Space type';
  const price = document.getElementById('host-price-hour')?.value || '0';
  const addr = document.getElementById('host-address')?.value || 'Location';
  document.getElementById('review-name').textContent = name;
  document.getElementById('review-type').textContent = type + ' · ' + addr;
  document.getElementById('review-price').textContent = '$' + price;
}

function handleFileUpload(e) {
  const previews = document.getElementById('uploaded-previews');
  previews.innerHTML = '';
  Array.from(e.target.files).slice(0, 8).forEach(file => {
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url; img.className = 'preview-thumb'; img.alt = '';
    previews.appendChild(img);
  });
}

function toggleDay(cb, day) {
  const timeEl = document.getElementById('time-' + day);
  if (timeEl) {
    timeEl.classList.toggle('disabled', !cb.checked);
    timeEl.querySelectorAll('input').forEach(i => i.disabled = !cb.checked);
  }
}

async function publishListing() {
  if (!document.getElementById('terms-agree')?.checked) { showToast('⚠️ Please agree to the terms'); return; }
  if (!currentUser) { showAuthModal('login'); return; }

  const name = document.getElementById('host-name')?.value;
  const type = document.getElementById('host-type')?.value;
  const address = document.getElementById('host-address')?.value || '';
  const desc = document.getElementById('host-desc')?.value || '';
  const priceHour = parseFloat(document.getElementById('host-price-hour')?.value) || 0;
  const priceDay = parseFloat(document.getElementById('host-price-day')?.value) || null;
  const seats = parseInt(document.getElementById('host-seats')?.value) || 1;
  const minBook = document.getElementById('host-min')?.value || '1 hour';
  const policy = document.getElementById('host-policy')?.value || 'instant';

  const amenityCbs = document.querySelectorAll('#amenities-grid input[type="checkbox"]:checked');
  const amenities = Array.from(amenityCbs).map(cb => cb.closest('label').textContent.trim());

  if (!name || !type || priceHour <= 0) { showToast('⚠️ Fill in name, type, and hourly rate'); return; }

  // Parse city/state from address
  const parts = address.split(',');
  const city = parts[parts.length - 2]?.trim() || '';
  const state = parts[parts.length - 1]?.trim().split(' ')[0] || '';

  if (window.USE_SUPABASE && currentUser.id) {
    // Upload images first if any
    const fileInput = document.getElementById('file-input');
    let imageUrls = [];
    if (fileInput?.files?.length) {
      showToast('⏳ Uploading photos...');
      imageUrls = await DB.Listings.uploadImages(currentUser.id, Array.from(fileInput.files));
    }

    const { data, error } = await DB.Listings.create({
      host_id: currentUser.id,
      title: name, type, description: desc,
      address, city, state,
      price_hourly: priceHour,
      price_daily: priceDay,
      seats, min_booking: minBook, policy,
      amenities, images: imageUrls,
      is_active: true
    });

    if (error) { showToast('⚠️ Failed to publish. Check all fields.'); return; }

    // Save availability
    const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const availRows = DAYS.map(day => {
      const inputs = document.querySelectorAll(`#time-${day} input[type="time"]`);
      const isOpen = document.querySelector(`#day-${day} input[type="checkbox"]`)?.checked ?? true;
      return { day_of_week: day, open_time: inputs[0]?.value || '09:00', close_time: inputs[1]?.value || '18:00', is_open: isOpen };
    });
    await DB.Listings.setAvailability(data.id, availRows);
  }

  showToast('🚀 Listing published!');
  setTimeout(() => showPage('dashboard'), 1500);
}

// ============ EARNINGS CALC ============
function calcEarnings() {
  const rate = +document.getElementById('calc-rate').value;
  const hours = +document.getElementById('calc-hours').value;
  document.getElementById('calc-rate-val').textContent = '$' + rate + '/hr';
  document.getElementById('calc-hours-val').textContent = hours + ' hrs';
  const monthly = Math.round(rate * hours * 4.3 * 0.92);
  document.getElementById('calc-amount').textContent = '$' + monthly.toLocaleString();
}

// ============ STATS COUNTER ============
function animateStats() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = +el.dataset.target;
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + (target === 97 ? '%' : target >= 1000 ? '+' : '');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// ============ TOAST ============
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date().toISOString().split('T')[0];
  const sd = document.getElementById('search-date');
  if (sd) sd.value = today;

  calcEarnings();

  // Show a subtle banner if Supabase isn't configured yet
  if (!window.USE_SUPABASE) {
    const banner = document.createElement('div');
    banner.className = 'db-banner';
    banner.innerHTML = `
      ⚠️ Running with demo data.
      <a href="config.js">Add your Supabase keys in config.js</a> to connect the real database.
      <span class="db-banner-close" onclick="this.parentElement.remove()">✕</span>
    `;
    document.querySelector('.listings-section')?.prepend(banner);
  }

  // Restore session from Supabase on page load
  if (window.USE_SUPABASE) {
    DB.Auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await DB.Auth.getProfile(session.user.id);
        currentUser = {
          id: session.user.id,
          name: profile?.full_name || session.user.email.split('@')[0],
          email: session.user.email,
          role: profile?.role || 'renter',
          initials: (profile?.full_name || session.user.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        };
        applyLoggedIn();
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        document.getElementById('btn-login').classList.remove('hidden');
        document.getElementById('btn-signup').classList.remove('hidden');
        document.getElementById('user-avatar-menu').classList.add('hidden');
      }
    });
  }

  // Fetch listings (real or mock)
  await renderListings();

  // Intersection Observer for stats counter
  const statsEl = document.querySelector('.stats-strip');
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateStats(); observer.disconnect(); }
  }, { threshold: 0.3 });
  if (statsEl) observer.observe(statsEl);

  // Close profile dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.avatar-menu')) {
      document.getElementById('profile-dropdown')?.classList.add('hidden');
    }
  });
});
