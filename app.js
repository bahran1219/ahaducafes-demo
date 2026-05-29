'use strict';
// Ahadu Café — Customer App v7 (All bugs fixed)

const STORAGE_KEY_ORDERS = 'ahadu_orders';
const STORAGE_KEY_RES    = 'ahadu_reservations';
const STORAGE_KEY_AV     = 'ahadu_av';

let cart = [], cur = null, curI = [], curE = [], curQ = 1, oN = 100;
let orderCtx = { type: 'dine', table: null };
let selectedTimeSlot = null;

/* ── HELPERS ── */
function getAv() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_AV) || '{}'); } catch(e) { return {}; } }
function isAvail(id) { return getAv()[id] !== false; }

function openOv(id)  { const el = document.getElementById(id); if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; } }
function closeOv(id) { const el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; } }

/* ── INIT ── */
window.addEventListener('load', () => {
  detectContext();
  setMinDate();
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('out');
    initAOS();
    startHeroRotation();
  }, 1600);
});

/* FIX 2: Properly read table from URL */
function detectContext() {
  const params = new URLSearchParams(window.location.search);
  const table  = params.get('table');
  if (table && table.trim() !== '') {
    orderCtx.type  = 'dine';
    orderCtx.table = table.trim();
    const banner = document.getElementById('tableBanner');
    const txt    = document.getElementById('tableBannerTxt');
    if (banner) banner.style.display = 'flex';
    if (txt)    txt.textContent = '🪑 Table ' + orderCtx.table + ' — Dine In';
    const otBar = document.getElementById('orderTypeBar');
    if (otBar)  otBar.style.display = 'none';
  } else {
    const otBar = document.getElementById('orderTypeBar');
    if (otBar)  otBar.style.display = 'block';
    const banner = document.getElementById('tableBanner');
    if (banner) banner.style.display = 'none';
    orderCtx.type  = 'dine';
    orderCtx.table = null;
    highlightOtBtn('dine');
  }
  updateCartBadge();
}

function setMinDate() {
  const d = document.getElementById('resDate');
  if (d) { const t = new Date().toISOString().split('T')[0]; d.min = t; d.value = t; loadTimeSlots(); }
}

/* ── ORDER TYPE ── */
function setOrderType(type, btn) {
  orderCtx.type  = type;
  orderCtx.table = null;
  document.querySelectorAll('.ot-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  updateCartBadge();
  syncCartTotals();
}

function highlightOtBtn(type) {
  document.querySelectorAll('.ot-btn').forEach(b => b.classList.remove('active'));
  const map = { dine:'otDine', takeaway:'otTake', delivery:'otDeliv' };
  const el = document.getElementById(map[type]);
  if (el) el.classList.add('active');
}

function changeOrderType() {
  const tn = document.getElementById('otModalTableNum');
  if (tn) tn.textContent = orderCtx.table || '—';
  updateOtChecks();
  openOv('otOverlay');
}

function setOrderTypeModal(type) {
  orderCtx.type = type;
  if (type !== 'dine') orderCtx.table = null;
  updateOtChecks();
  updateCartBadge();
  syncCartTotals();
  const txt = document.getElementById('tableBannerTxt');
  if (txt) {
    const label = type === 'dine' ? 'Table ' + (orderCtx.table || '?') : type === 'takeaway' ? 'Takeaway' : 'Delivery';
    txt.textContent = '🪑 ' + label;
  }
}

function updateOtChecks() {
  ['dine','takeaway','delivery'].forEach(t => {
    const el = document.getElementById('otc-' + t);
    if (el) el.textContent = orderCtx.type === t ? '✓' : '';
  });
}

function closeOtModal(e) { if (e.target && e.target.id === 'otOverlay') closeOtModalBtn(); }
function closeOtModalBtn() { closeOv('otOverlay'); }

function updateCartBadge() {
  const badge = document.getElementById('cartOrderTypeBadge');
  if (!badge) return;
  const map = {
    dine:     ['🪑 ' + (orderCtx.table ? 'Table ' + orderCtx.table : 'Dine In'), 'badge-table'],
    takeaway: ['🥡 Takeaway', 'badge-take'],
    delivery: ['🛵 Delivery',  'badge-delivery']
  };
  const [text, cls] = map[orderCtx.type] || ['🍽️ Dine In', 'badge-dine'];
  badge.textContent  = text;
  badge.className    = 'cart-order-type-badge ' + cls;
}

/* ── NAV ── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', scrollY > 50);
});

function scrollSmooth(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ── AOS (desktop only) ── */
function initAOS() {
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('[data-aos]').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const d = +(e.target.dataset.aosDelay || 0);
      e.target.style.animationDelay = d + 'ms';
      e.target.classList.add('aos-fadeUp', 'aos-done');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-aos]').forEach(el => { el.classList.add('aos-init'); obs.observe(el); });
}

/* ── HERO ROTATION ── */
function startHeroRotation() {
  const data = [
    { img:'https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=700', name:'Signature Burger',     price:'500 Birr' },
    { img:'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=700',   name:'Beef & Pepperoni Pizza', price:'550 Birr' },
    { img:'https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=700', name:'Spicy Beef Ramen',       price:'380 Birr' },
    { img:'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=700', name:'Garlic Butter Pasta',    price:'320 Birr' },
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % data.length;
    const pl = document.getElementById('heroImg'); if (!pl) return;
    pl.style.opacity = '0';
    setTimeout(() => {
      pl.src = data[i].img; pl.style.opacity = '1';
      const n = document.getElementById('heroFloatName');
      const p = document.getElementById('heroFloatPrice');
      if (n) n.textContent = data[i].name;
      if (p) p.textContent = data[i].price;
    }, 500);
  }, 4000);
}

/* ── TIME SLOTS ── */
const TIME_SLOTS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM'];

function loadTimeSlots() {
  const container = document.getElementById('timeSlots');
  const dateEl    = document.getElementById('resDate');
  if (!container || !dateEl) return;
  const date = dateEl.value;
  if (!date) { container.innerHTML = '<div class="ts-hint">Pick a date first</div>'; return; }
  selectedTimeSlot = null;
  const reservations = JSON.parse(localStorage.getItem(STORAGE_KEY_RES) || '[]');
  const counts = {};
  reservations.filter(r => r.date === date).forEach(r => { counts[r.time] = (counts[r.time] || 0) + 1; });
  const booked = Object.entries(counts).filter(([, v]) => v >= 4).map(([k]) => k);
  container.innerHTML = TIME_SLOTS.map(slot => {
    const isBooked = booked.includes(slot);
    return `<button class="ts-slot ${isBooked ? 'ts-booked' : 'ts-free'}"
      onclick="${isBooked ? '' : `selectSlot('${slot}',this)`}" ${isBooked ? 'disabled' : ''}>
      ${slot}${isBooked ? '<span class="ts-full">Full</span>' : ''}
    </button>`;
  }).join('');
}

function selectSlot(slot, btn) {
  document.querySelectorAll('.ts-slot').forEach(b => b.classList.remove('ts-selected'));
  btn.classList.add('ts-selected');
  selectedTimeSlot = slot;
}

/* ── RESERVATION ── */
function submitReservation() {
  const date   = document.getElementById('resDate')?.value;
  const guests = document.getElementById('resGuests')?.value;
  const name   = document.getElementById('resName')?.value.trim();
  const phone  = document.getElementById('resPhone')?.value.trim();
  const email  = document.getElementById('resEmail')?.value.trim();
  const note   = document.getElementById('resNote')?.value.trim();

  if (!date)             { toast('⚠️ Please select a date'); return; }
  if (!selectedTimeSlot) { toast('⚠️ Please select a time slot'); return; }
  if (!name)             { toast('⚠️ Please enter your name'); return; }
  if (!phone && !email)  { toast('⚠️ Please enter phone or email'); return; }

  const reservation = {
    id: 'RES-' + Date.now().toString().slice(-5),
    date, time: selectedTimeSlot, guests, name, phone, email, note,
    createdAt: new Date().toISOString()
  };
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_RES) || '[]');
  existing.unshift(reservation);
  localStorage.setItem(STORAGE_KEY_RES, JSON.stringify(existing.slice(0, 200)));

  const dateFormatted = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  const descEl    = document.getElementById('resSuccessDesc');
  const refEl     = document.getElementById('resSuccessRef');
  const detailsEl = document.getElementById('resConfirmDetails');
  if (descEl)    descEl.textContent    = `Your table for ${guests} is confirmed!`;
  if (refEl)     refEl.textContent     = `Booking #${reservation.id}`;
  if (detailsEl) detailsEl.innerHTML   = `
    <div class="rcd-row"><span>📅 Date</span><span>${dateFormatted}</span></div>
    <div class="rcd-row"><span>🕐 Time</span><span>${selectedTimeSlot}</span></div>
    <div class="rcd-row"><span>👥 Guests</span><span>${guests} ${guests == 1 ? 'person' : 'people'}</span></div>
    <div class="rcd-row"><span>👤 Name</span><span>${name}</span></div>
    ${email ? `<div class="rcd-row"><span>📧 Email</span><span>${email}</span></div>` : ''}
    ${phone ? `<div class="rcd-row"><span>📞 Phone</span><span>${phone}</span></div>` : ''}
    <div class="rcd-note">A calendar invite will be sent to your email.</div>`;

  openOv('resSuccessOv');
  selectedTimeSlot = null;
  document.querySelectorAll('.ts-slot').forEach(b => b.classList.remove('ts-selected'));
  ['resName','resPhone','resEmail','resNote'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function closeResSuccess() { closeOv('resSuccessOv'); }

/* ── ORDER TRACKING ── */
function openTracking() {
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
  const recentEl = document.getElementById('trackRecent');
  if (recentEl && orders.length) {
    recentEl.innerHTML = '<div class="tr-recent-title">Your recent orders</div>' +
      orders.slice(0, 3).map(o => `
        <div class="tr-recent-item" onclick="document.getElementById('trackInput').value='${o.id}';trackOrder()">
          <div class="tr-ri-left">
            <span class="tr-ri-id">${o.id}</span>
            <span class="tr-ri-name">${o.qty > 1 ? o.qty + '× ' : ''}${o.item}</span>
          </div>
          <div class="tr-ri-right">
            <span class="tr-ri-price">${o.price * (o.qty || 1)} Birr</span>
            <span class="tr-ri-time">${o.time}</span>
          </div>
        </div>`).join('');
  }
  const resultEl = document.getElementById('trackResult');
  if (resultEl) resultEl.innerHTML = '';
  openOv('trackingOv');
}

function closeTracking(e) { if (e.target && e.target.id === 'trackingOv') closeTrackingBtn(); }
function closeTrackingBtn() { closeOv('trackingOv'); }

function trackOrder() {
  const idEl     = document.getElementById('trackInput');
  const resultEl = document.getElementById('trackResult');
  if (!idEl || !resultEl) return;
  const id = idEl.value.trim().toUpperCase();
  if (!id) { resultEl.innerHTML = '<div class="tr-error">Please enter an order ID</div>'; return; }

  const orders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
  const order  = orders.find(o => o.id === id);
  if (!order) {
    resultEl.innerHTML = `<div class="tr-error">❌ Order "${id}" not found. Check the ID and try again.</div>`;
    return;
  }

  const elapsed = Date.now() - (order.createdAtMs || Date.now());
  let statusStep = 0;
  if (elapsed > 3 * 60000)  statusStep = 1;
  if (elapsed > 8 * 60000)  statusStep = 2;
  if (elapsed > 15 * 60000) statusStep = 3;

  const steps = [
    { icon:'👨‍🍳', label:'Preparing' },
    { icon:'📦',   label:'Packing'   },
    { icon:'🛵',   label:'On the way'},
    { icon:'✅',   label:'Delivered' }
  ];

  let detailRows = '';
  if (order.removed?.length) detailRows += `<div class="tr-detail-row removed">❌ Removed: ${order.removed.join(', ')}</div>`;
  if (order.extras?.length) order.extras.forEach(ex => {
    const n = typeof ex === 'object' ? ex.name : ex;
    const p = typeof ex === 'object' ? ex.price : '';
    detailRows += `<div class="tr-detail-row extra">➕ ${n}${p ? ' (+' + p + ' Birr)' : ''}</div>`;
  });
  if (order.note) detailRows += `<div class="tr-detail-row note">📝 ${order.note}</div>`;

  const eta = statusStep >= 3 ? '✅ Order delivered!' : statusStep === 2 ? '🛵 On the way — arriving soon!' : '⏱ Estimated: 15–20 minutes';

  resultEl.innerHTML = `
    <div class="track-card">
      <div class="tc-header">
        <div class="tc-img-wrap">
          ${order.img ? `<img src="${order.img}" class="tc-img" alt="${order.item}" onerror="this.style.display='none'"/>` : '<div class="tc-img-ph">🍽️</div>'}
        </div>
        <div class="tc-info">
          <div class="tc-name">${order.qty > 1 ? order.qty + '× ' : ''}${order.item}</div>
          <div class="tc-meta">
            <span class="tc-id">${order.id}</span>
            <span class="ot-type-badge ${order.orderType}">${order.label || order.orderType}</span>
          </div>
          <div class="tc-price">${order.price * (order.qty || 1)} Birr</div>
          ${detailRows ? `
            <button class="oc-expand-btn" onclick="toggleTD(this)" style="margin-top:6px">
              <span class="oc-expand-icon">▼</span> Customizations
            </button>
            <div class="tc-details" style="display:none">${detailRows}</div>` : ''}
        </div>
      </div>
      <div class="tc-status-track">
        ${steps.map((s, i) => `
          <div class="tcs-step ${i <= statusStep ? 'tcs-done' : ''} ${i === statusStep ? 'tcs-active' : ''}">
            <div class="tcs-circle">${i < statusStep ? '✓' : s.icon}</div>
            <div class="tcs-label">${s.label}</div>
          </div>
          ${i < steps.length - 1 ? `<div class="tcs-line ${i < statusStep ? 'tcs-line-done' : ''}"></div>` : ''}
        `).join('')}
      </div>
      <div class="tc-eta">${eta}</div>
    </div>`;
}

function toggleTD(btn) {
  const det = btn.nextElementSibling; if (!det) return;
  const open = det.style.display !== 'none';
  det.style.display = open ? 'none' : 'block';
  btn.querySelector('.oc-expand-icon').textContent = open ? '▼' : '▲';
  btn.classList.toggle('expanded', !open);
  btn.childNodes[1].textContent = open ? ' Customizations' : ' Hide';
}

/* ── MENU ── */
function renderMenu(cat = 'all') {
  const g = document.getElementById('menuGrid'); if (!g) return;
  g.style.opacity = '0';
  setTimeout(() => {
    g.innerHTML = '';
    const list = cat === 'all' ? MENU : MENU.filter(i => i.cat === cat);
    list.forEach((item, idx) => {
      const avail = isAvail(item.id);
      const c = document.createElement('div');
      c.className = 'mcard' + (item.featured ? ' featured' : '') + (avail ? '' : ' sold-out');
      c.style.animationDelay = (idx * 40) + 'ms';
      c.innerHTML = `
        ${item.featured ? '<div class="mcard-feat">★ Signature</div>' : ''}
        ${!avail ? '<div class="sold-ribbon">Sold Out Today</div>' : ''}
        <div class="mcard-img">
          <img src="${item.img}" alt="${item.name}" loading="lazy"
            onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#F3EFE8;font-size:44px;\\'>🍽️</div>'"/>
          <div class="mcard-overlay"></div>
          <div class="mcard-tag">${item.tag}</div>
        </div>
        <div class="mcard-body">
          <div class="mcard-name">${item.name}</div>
          <div class="mcard-desc">${item.desc}</div>
          <div class="mcard-foot">
            <span class="mcard-price">${item.price} Birr</span>
            ${avail
              ? `<button class="mcard-btn" onclick="openCustom(${item.id},event)">Order →</button>`
              : `<span class="sold-lbl">Sold Out</span>`}
          </div>
        </div>`;
      g.appendChild(c);
    });
    g.style.transition = 'opacity .3s';
    g.style.opacity = '1';
  }, 150);
}

function filterCat(cat, btn) {
  document.querySelectorAll('.cat').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMenu(cat);
}

/* ── CUSTOMIZE ── */
function openCustom(id, e) {
  if (e) e.stopPropagation();
  if (!isAvail(id)) { toast('Sorry, this item is sold out today!'); return; }
  const item = MENU.find(i => i.id === id); if (!item) return;
  cur  = item; curQ = 1;
  curI = item.ings.map(i => ({ ...i, off: false }));
  curE = item.extras ? item.extras.map(i => ({ ...i, on: false })) : [];

  const setT = id => { const el = document.getElementById(id); return el; };
  const mTitle = setT('mTitle'); if (mTitle) mTitle.textContent = item.name;
  const mDesc  = setT('mDesc');  if (mDesc)  mDesc.textContent  = item.desc;
  const mBadge = setT('mBadge'); if (mBadge) mBadge.textContent = item.tag;
  const mPrice = setT('mPrice'); if (mPrice) mPrice.textContent = item.price + ' Birr';
  const qtyNum = setT('qtyNum'); if (qtyNum) qtyNum.textContent = 1;
  const noteTA = setT('noteTA'); if (noteTA) noteTA.value = '';
  const imgWrap = setT('modalImgWrap');
  if (imgWrap) imgWrap.innerHTML = `<img src="${item.img}" alt="${item.name}" onerror="this.parentElement.style.background='#F3EFE8';this.style.display='none'"/>`;

  buildIngs(); buildExtras(); syncAddBtn();
  openOv('customOv');
}

function buildIngs() {
  const w = document.getElementById('ingWrap'); if (!w) return;
  w.innerHTML = '';
  curI.forEach((ing, i) => {
    const el = document.createElement('div');
    el.className = 'ichip' + (ing.off ? ' off' : '');
    el.innerHTML = `<span>${ing.e}</span>${ing.n}`;
    el.onclick = () => { curI[i].off = !curI[i].off; el.classList.toggle('off'); };
    w.appendChild(el);
  });
}

function buildExtras() {
  const w = document.getElementById('extWrap'); if (!w) return;
  w.innerHTML = '';
  if (!curE.length) { w.innerHTML = '<span style="font-size:13px;color:#bbb">No extras for this item</span>'; return; }
  curE.forEach((ex, i) => {
    const el = document.createElement('div');
    el.className = 'echip' + (ex.on ? ' on' : '');
    el.innerHTML = `${ex.n} <span class="eprice">+${ex.p} Birr</span>`;
    el.onclick = () => { curE[i].on = !curE[i].on; el.classList.toggle('on'); syncAddBtn(); };
    w.appendChild(el);
  });
}

function chgQty(d) {
  curQ = Math.max(1, curQ + d);
  const el = document.getElementById('qtyNum'); if (el) el.textContent = curQ;
  syncAddBtn();
}

function syncAddBtn() {
  const ex    = curE.filter(e => e.on).reduce((s, e) => s + e.p, 0);
  const total = (cur.price + ex) * curQ;
  const el    = document.getElementById('addPrice'); if (el) el.textContent = total + ' Birr';
}

function closeCustom(e) { if (e.target && e.target.id === 'customOv') closeCustomBtn(); }
function closeCustomBtn() { closeOv('customOv'); }

/* ── ADD TO CART ── */
function addToCart() {
  const btn = document.getElementById('addBtn'); if (!btn) return;
  btn.textContent = '✓ Added!';
  btn.style.background = '#27800A';
  btn.disabled = true;

  const extras  = curE.filter(e => e.on);
  const ep      = extras.reduce((s, e) => s + e.p, 0);
  const noteEl  = document.getElementById('noteTA');
  const entry   = {
    id:       Date.now(),
    name:     cur.name,
    price:    cur.price + ep,
    qty:      curQ,
    img:      cur.img,
    basePrice: cur.price,
    removed:  curI.filter(i => i.off).map(i => i.n),
    extras:   extras.map(e => ({ name: e.n, price: e.p })),
    note:     noteEl ? noteEl.value.trim() : ''
  };
  cart.push(entry);

  setTimeout(() => {
    closeCustomBtn();
    btn.disabled = false;
    btn.style.background = '';
    btn.innerHTML = 'Add to order — <span id="addPrice"></span>';
  }, 900);
  setTimeout(() => { syncCart(); bumpBadge(); }, 950);
  toast('🎉 ' + cur.name + ' added!');
}

/* FIX 4: Save order to localStorage immediately when added to cart.
   Final save with payment info happens in placeOrder(). */
function saveOrderToStorage(entry, payMethod, phone, screenshotUrl, totalAmount) {
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
  const label  = orderCtx.table && orderCtx.type === 'dine'
    ? 'Table ' + orderCtx.table
    : orderCtx.type === 'takeaway' ? 'Takeaway' : 'Delivery';
  const isBankPay = (payMethod || '').toLowerCase().includes('bank');
  const id = 'AHD-' + String(++oN).padStart(4, '0');
  orders.unshift({
    id,
    item:        entry.name,
    img:         entry.img  || '',
    price:       entry.price,
    qty:         entry.qty,
    removed:     entry.removed || [],
    extras:      entry.extras  || [],
    note:        entry.note    || '',
    orderType:   orderCtx.type,
    table:       orderCtx.table || null,
    label,
    payMethod:   payMethod || 'Cash',
    phone:       phone || '',
    screenshot:  screenshotUrl || null,   // base64 image
    totalAmount: totalAmount || entry.price * entry.qty,
    paidAmount:  null,   // admin fills this in
    payStatus:   isBankPay ? 'pending' : 'confirmed', // bank=pending, cash=confirmed
    adminNote:   '',
    time:        new Date().toLocaleTimeString(),
    date:        new Date().toLocaleDateString(),
    createdAtMs: Date.now(),
    status:      'preparing'
  });
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders.slice(0, 200)));
  return id;
}

/* ── CART ── */
function syncCart() {
  const count   = cart.reduce((s, i) => s + i.qty, 0);
  const badgeEl = document.getElementById('cartBadge');
  if (badgeEl) badgeEl.textContent = count;
  updateCartBadge();

  const body    = document.getElementById('cartBody');
  const empty   = document.getElementById('cartEmpty');
  const foot    = document.getElementById('cartFoot');
  if (!body || !foot) return;

  if (!cart.length) {
    body.innerHTML = '';
    body.appendChild(empty);
    if (empty) empty.style.display = 'flex';
    foot.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  foot.style.display = 'block';
  body.innerHTML = '';

  cart.forEach(ci => {
    const hasDetails = ci.removed.length || ci.extras.length || ci.note;
    let detailHTML = '';
    if (ci.removed.length) detailHTML += `<div class="ci-detail-row removed"><span class="ci-detail-label">❌ Removed</span><span>${ci.removed.join(', ')}</span></div>`;
    ci.extras.forEach(ex => {
      const n = typeof ex === 'object' ? ex.name : ex;
      const p = typeof ex === 'object' ? ex.price : '';
      detailHTML += `<div class="ci-detail-row extra"><span class="ci-detail-label">➕ ${n}</span>${p ? `<span class="ci-detail-price">+${p} Birr</span>` : ''}</div>`;
    });
    if (ci.note) detailHTML += `<div class="ci-detail-row note"><span class="ci-detail-label">📝 Note</span><span>${ci.note}</span></div>`;

    const div = document.createElement('div'); div.className = 'ci';
    div.innerHTML = `
      <img class="ci-img" src="${ci.img}" alt="${ci.name}" onerror="this.style.display='none'"/>
      <div class="ci-info">
        <div class="ci-name">${ci.qty > 1 ? ci.qty + '× ' : ''}${ci.name}</div>
        <div class="ci-ft">
          <span class="ci-price">${ci.price * ci.qty} Birr</span>
          <div class="ci-actions">
            ${hasDetails ? `<button class="ci-expand-btn" onclick="toggleCiExpand(this)"><span class="oc-expand-icon">▼</span> Details</button>` : ''}
            <button class="ci-rm" onclick="rmItem(${ci.id})">✕</button>
          </div>
        </div>
        ${hasDetails ? `<div class="ci-details" style="display:none">${detailHTML}</div>` : ''}
      </div>`;
    body.appendChild(div);
  });
  syncCartTotals();
}

function toggleCiExpand(btn) {
  const details = btn.closest('.ci-info').querySelector('.ci-details');
  const icon    = btn.querySelector('.oc-expand-icon');
  if (!details) return;
  const open = details.style.display !== 'none';
  details.style.display  = open ? 'none' : 'block';
  icon.textContent        = open ? '▼' : '▲';
  btn.classList.toggle('expanded', !open);
  btn.childNodes[1].textContent = open ? ' Details' : ' Hide';
}

function syncCartTotals() {
  const sub    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delFee = orderCtx.type === 'delivery' ? 50 : 0;
  const total  = sub + delFee;
  const subEl  = document.getElementById('cSub');
  const totEl  = document.getElementById('cTotal');
  const chkEl  = document.getElementById('checkTotalAmt');
  const rowEl  = document.getElementById('delivFeeRow');
  if (subEl) subEl.textContent = sub  + ' Birr';
  if (totEl) totEl.textContent = total + ' Birr';
  if (chkEl) chkEl.textContent = total + ' Birr';
  if (rowEl) rowEl.style.display = orderCtx.type === 'delivery' ? 'flex' : 'none';
}

function rmItem(id) { cart = cart.filter(i => i.id !== id); syncCart(); toast('Item removed'); }

function bumpBadge() {
  const b = document.getElementById('cartBadge');
  if (!b) return;
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
}

function toggleCart() {
  const p  = document.getElementById('cartPanel');
  const bg = document.getElementById('cartBg');
  if (!p) return;
  const open = p.classList.contains('open');
  p.classList.toggle('open', !open);
  if (bg) bg.classList.toggle('open', !open);
  document.body.style.overflow = open ? '' : 'hidden';
}

/* ── SCREENSHOT UPLOAD ── */
let screenshotDataUrl = null;

function handleScreenshot(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('⚠️ Please upload an image file'); return; }
  if (file.size > 5 * 1024 * 1024) { toast('⚠️ Image too large (max 5MB)'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    screenshotDataUrl = e.target.result;
    const preview = document.getElementById('screenshotPreview');
    const img     = document.getElementById('screenshotImg');
    const area    = document.getElementById('screenshotUploadArea');
    if (img)     img.src = screenshotDataUrl;
    if (preview) preview.style.display = 'block';
    if (area)    area.style.display    = 'none';
    toast('✓ Screenshot uploaded!');
  };
  reader.readAsDataURL(file);
}

function removeScreenshot() {
  screenshotDataUrl = null;
  const preview = document.getElementById('screenshotPreview');
  const area    = document.getElementById('screenshotUploadArea');
  const input   = document.getElementById('screenshotInput');
  if (preview) preview.style.display = 'none';
  if (area)    area.style.display    = '';
  if (input)   input.value = '';
}

/* ── CHECKOUT ── */
function openCheckout() {
  if (!cart.length) { toast('🛒 Cart is empty!'); return; }
  toggleCart();

  const info = document.getElementById('checkoutOrderInfo');
  if (info) {
    const typeMap = {
      dine:     `<div class="co-info dine">🪑 <strong>${orderCtx.table ? 'Table ' + orderCtx.table : 'Dine In'}</strong></div>`,
      takeaway: `<div class="co-info take">🥡 <strong>Takeaway</strong> — Pick up at counter</div>`,
      delivery: `<div class="co-info deliv">🛵 <strong>Delivery</strong> — We bring it to you</div>`
    };
    info.innerHTML = typeMap[orderCtx.type] || '';
  }

  const dg = document.getElementById('delivAddrGroup');
  if (dg) dg.style.display = orderCtx.type === 'delivery' ? 'block' : 'none';

  // Set order reference and amount in bank section
  const newRef = 'AHD-' + String(++oN).padStart(4, '0');
  const refEl  = document.getElementById('bankRef');
  if (refEl) refEl.textContent = newRef;

  // Show correct amount in bank section
  syncCartTotals();
  const sub    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total  = sub + (orderCtx.type === 'delivery' ? 50 : 0);
  const amtEl  = document.getElementById('bankAmount');
  const stepEl = document.getElementById('bankStepAmt');
  if (amtEl)  amtEl.textContent  = total + ' Birr';
  if (stepEl) stepEl.textContent = total + ' Birr';

  // Reset screenshot
  removeScreenshot();
  screenshotDataUrl = null;

  // Default to bank tab
  selPay('bank', document.querySelector('.ptab'));

  openOv('checkOv');
}

function closeCheckout(e) { if (e.target && e.target.id === 'checkOv') closeCheckoutBtn(); }
function closeCheckoutBtn() { closeOv('checkOv'); }

function selPay(t, btn) {
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  ['pBank','pCash'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const showEl = document.getElementById(t === 'bank' ? 'pBank' : 'pCash');
  if (showEl) showEl.style.display = '';
}

/* ── PLACE ORDER (with payment verification flow) ── */
function placeOrder() {
  if (orderCtx.type === 'delivery') {
    const addr = document.getElementById('delivAddr')?.value.trim();
    if (!addr) { toast('⚠️ Enter your delivery address'); return; }
  }

  const activeTab = document.querySelector('.ptab.active');
  const payMethod = activeTab ? activeTab.textContent.trim().replace(/^[^\w]*/,'') : 'Cash';
  const isBankPay = payMethod.toLowerCase().includes('bank');
  const phone     = document.getElementById('customerPhone')?.value.trim() || '';

  // Bank transfer requires screenshot
  if (isBankPay && !screenshotDataUrl) {
    toast('⚠️ Please upload your payment screenshot');
    return;
  }

  const btn = document.getElementById('placeBtn');
  if (btn) { btn.textContent = '⏳ Submitting…'; btn.disabled = true; }

  // Save all cart items as orders
  const sub   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = sub + (orderCtx.type === 'delivery' ? 50 : 0);
  let lastId  = '';

  cart.forEach(ci => {
    lastId = saveOrderToStorage(ci, payMethod, phone, isBankPay ? screenshotDataUrl : null, total);
  });

  setTimeout(() => {
    closeCheckoutBtn();

    if (isBankPay) {
      // Bank: show pending verification screen
      const refEl = document.getElementById('pendingRef');
      if (refEl) refEl.textContent = `Order #${lastId}`;
      openOv('pendingOv');
    } else {
      // Cash: show normal success
      const ref  = lastId || ('AHD-' + String(oN).padStart(4,'0'));
      const descMap = {
        dine:     `Your order will be served to Table ${orderCtx.table || '?'} shortly.`,
        takeaway: 'Ready to pick up at the counter in ~15 min!',
        delivery: 'On its way! Estimated 30–45 min.'
      };
      const lastMap = {
        dine:     ['🪑', 'Table ' + (orderCtx.table||'?')],
        takeaway: ['🥡', 'Pick up'],
        delivery: ['🏠', 'Delivered']
      };
      const descEl = document.getElementById('successDesc');
      const sRefEl = document.getElementById('sRef');
      const lsEl   = document.getElementById('lastStep');
      if (descEl) descEl.textContent = descMap[orderCtx.type] || '';
      if (sRefEl) sRefEl.textContent  = `Order #${ref}`;
      if (lsEl)   { const [icon,lbl] = lastMap[orderCtx.type]||['🍽️','Served']; lsEl.innerHTML=`<span>${icon}</span><small>${lbl}</small>`; }
      openOv('successOv');
      animateSteps();
    }

    cart = []; syncCart();
    screenshotDataUrl = null;
    if (btn) { btn.textContent = 'Submit Order →'; btn.disabled = false; }
  }, 1200);
}

function closePending() { closeOv('pendingOv'); }

function animateSteps() {
  const ss = document.querySelectorAll('.ss');
  ss.forEach(s => s.classList.remove('active'));
  ss.forEach((s, i) => setTimeout(() => s.classList.add('active'), i * 900));
}
function closeSuccess() { closeOv('successOv'); }

function toast(msg) {
  document.querySelectorAll('.toast-msg').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .4s';
    setTimeout(() => el.remove(), 400);
  }, 2600);
}

document.addEventListener('DOMContentLoaded', () => renderMenu());
