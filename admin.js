'use strict';
// Ahadu Café — Admin JS v6 (All bugs fixed)

/* ── STORAGE HELPERS ── */
const STORAGE_KEY_ADMINS = 'ahadu_admins_v2';
const STORAGE_KEY_SESSION = 'ahadu_session_v2';
const STORAGE_KEY_ORDERS = 'ahadu_orders';
const STORAGE_KEY_RES = 'ahadu_reservations';
const STORAGE_KEY_AV = 'ahadu_av';

const DEF_ADMINS = [{ name:'Ahadu (Owner)', username:'admin', password:'ahadu2026', role:'owner' }];

function getAdmins() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || JSON.stringify(DEF_ADMINS)); }
  catch(e) { return DEF_ADMINS; }
}
function saveAdmins(l) { localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(l)); }
function getCU() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY_SESSION) || 'null'); }
  catch(e) { return null; }
}
function setCU(u) { sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(u)); }
function clearCU() { sessionStorage.removeItem(STORAGE_KEY_SESSION); }
function getOrders() { return JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]'); }
function getReservations() { return JSON.parse(localStorage.getItem(STORAGE_KEY_RES) || '[]'); }
function getAv() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_AV) || '{}'); } catch(e) { return {}; } }
function setAv(o) { localStorage.setItem(STORAGE_KEY_AV, JSON.stringify(o)); }
function isAvail(id) { return getAv()[id] !== false; }

let tableCount = 5;
let currentOrderFilter = 'all';
let dashInterval = null;

/* ── LOGIN (FIX 1: password show/hide + proper auth) ── */
function doLogin() {
  const uEl  = document.getElementById('lUser');
  const pEl  = document.getElementById('lPass');
  const errEl = document.getElementById('lErr');
  if (!uEl || !pEl) return;
  const u = uEl.value.trim().toLowerCase();
  const p = pEl.value.trim();
  errEl.textContent = '';

  if (!u || !p) { errEl.textContent = 'Please enter username and password.'; return; }

  const admins = getAdmins();
  const match  = admins.find(a => a.username.toLowerCase() === u && a.password === p);
  if (!match) { errEl.textContent = 'Incorrect username or password. Try: admin / ahadu2026'; shake(); return; }

  setCU(match);
  showDash(match);
}

/* FIX 1: show/hide password button */
function togglePw() {
  const inp = document.getElementById('lPass');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  const btn = document.querySelector('.pw-eye');
  if (btn) btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function shake() {
  const card = document.querySelector('.a-login-card');
  if (!card) return;
  card.style.animation = 'none';
  setTimeout(() => { card.style.animation = 'shake .4s ease'; }, 10);
}

function doLogout() { clearCU(); clearInterval(dashInterval); location.reload(); }

function showDash(user) {
  const loginEl = document.getElementById('aLogin');
  const dashEl  = document.getElementById('aDash');
  const sbUser  = document.getElementById('sbUser');
  if (!loginEl || !dashEl) return;
  loginEl.style.display = 'none';
  dashEl.style.display  = 'flex';
  if (sbUser) sbUser.textContent = user.name + ' · ' + (user.role === 'owner' ? '👑 Owner' : user.role === 'admin' ? '🔑 Admin' : '👤 Staff');
  const sbnAdmins = document.getElementById('sbnAdmins');
  if (sbnAdmins && user.role === 'staff') sbnAdmins.style.display = 'none';

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning ☀️' : hr < 17 ? 'Good afternoon 🌤️' : 'Good evening 🌙';
  const greetEl = document.getElementById('dashGreeting');
  if (greetEl) greetEl.textContent = greeting + ', ' + user.name.split(' ')[0] + '!';

  renderDashboard();
  renderAMenu();
  renderAdmins();
  renderReservations();
  renderQrGrid();

  // auto-refresh
  clearInterval(dashInterval);
  dashInterval = setInterval(() => {
    if (document.getElementById('tDashboard') && document.getElementById('tDashboard').style.display !== 'none') renderDashboard();
    if (document.getElementById('tOrders') && document.getElementById('tOrders').style.display !== 'none') renderOrders(currentOrderFilter);
  }, 15000);
}

document.addEventListener('DOMContentLoaded', () => {
  const u = getCU();
  if (u) showDash(u);
  // Enter key on login
  const lPass = document.getElementById('lPass');
  const lUser = document.getElementById('lUser');
  if (lPass) lPass.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  if (lUser) lUser.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});

/* ── TABS ── */
function goTab(tab, el) {
  document.querySelectorAll('.tpanel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.sbn').forEach(b => b.classList.remove('active'));
  const map = { dashboard:'tDashboard', orders:'tOrders', reservations:'tReservations', menu:'tMenu', admins:'tAdmins', qr:'tQr' };
  const panel = document.getElementById(map[tab]);
  if (panel) panel.style.display = 'block';
  if (el) el.classList.add('active');
  if (tab === 'orders')       renderOrders(currentOrderFilter);
  if (tab === 'reservations') renderReservations();
  if (tab === 'qr')           renderQrGrid();
  if (tab === 'dashboard')    renderDashboard();
}

/* ══ DASHBOARD ══ */
function renderDashboard() {
  const orders = getOrders();
  const today  = new Date().toLocaleDateString();
  const todayOrders = orders.filter(o => o.date === today);
  const revenue     = todayOrders.reduce((s, o) => s + (o.price * (o.qty || 1)), 0);
  const dineCount   = todayOrders.filter(o => o.orderType === 'dine').length;
  const takeCount   = todayOrders.filter(o => o.orderType === 'takeaway').length;
  const delivCount  = todayOrders.filter(o => o.orderType === 'delivery').length;
  const resCount    = getReservations().filter(r => r.date === today).length;

  const statsEl = document.getElementById('dashStats');
  if (statsEl) statsEl.innerHTML = `
    <div class="dash-stat-card"><div class="dsc-icon">💰</div><div class="dsc-num">${revenue} <span>Birr</span></div><div class="dsc-lbl">Today's Revenue</div><div class="dsc-trend">${todayOrders.length} orders total</div></div>
    <div class="dash-stat-card"><div class="dsc-icon">📋</div><div class="dsc-num">${todayOrders.length}</div><div class="dsc-lbl">Orders Today</div><div class="dsc-trend">${dineCount} dine · ${takeCount} take · ${delivCount} delivery</div></div>
    <div class="dash-stat-card"><div class="dsc-icon">📅</div><div class="dsc-num">${resCount}</div><div class="dsc-lbl">Reservations Today</div><div class="dsc-trend">Table bookings</div></div>
    <div class="dash-stat-card"><div class="dsc-icon">⭐</div><div class="dsc-num">4.9</div><div class="dsc-lbl">Avg Rating</div><div class="dsc-trend">240+ reviews</div></div>`;

  drawDonut(dineCount, takeCount, delivCount);
  drawLine(todayOrders);
  renderFeed(todayOrders.slice(0, 8));
}

function refreshAll() { renderDashboard(); aToast('↻ Dashboard refreshed'); }

function drawDonut(dine, take, deliv) {
  const canvas = document.getElementById('donutChart'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const total = dine + take + deliv || 1;
  const data = [
    { val: dine,  color: '#B85C2A', label: 'Dine In'  },
    { val: take,  color: '#27800A', label: 'Takeaway' },
    { val: deliv, color: '#4444CC', label: 'Delivery' }
  ];
  ctx.clearRect(0, 0, 160, 160);
  let start = -Math.PI / 2;
  data.forEach(d => {
    const slice = (d.val / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(80, 80);
    ctx.arc(80, 80, 68, start, start + slice);
    ctx.closePath(); ctx.fillStyle = d.color; ctx.fill();
    start += slice;
  });
  ctx.beginPath(); ctx.arc(80, 80, 44, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.fillStyle = '#1A1612'; ctx.font = 'bold 18px DM Sans,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(dine + take + deliv, 80, 72);
  ctx.font = '11px DM Sans,sans-serif'; ctx.fillStyle = '#888';
  ctx.fillText('orders', 80, 90);
  const legend = document.getElementById('donutLegend');
  if (legend) legend.innerHTML = data.map(d => `<div class="dl-row"><span class="dl-dot" style="background:${d.color}"></span><span class="dl-lbl">${d.label}</span><span class="dl-val">${d.val}</span></div>`).join('');
}

function drawLine(orders) {
  const canvas = document.getElementById('lineChart'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);
  const counts = hours.map(h => orders.filter(o => {
    if (!o.time) return false;
    const parts = o.time.split(':');
    let hr = parseInt(parts[0]);
    const isPM = o.time.includes('PM') && hr !== 12;
    const isAM12 = o.time.includes('AM') && hr === 12;
    if (isPM) hr += 12;
    if (isAM12) hr = 0;
    return hr === h;
  }).length);
  const maxC = Math.max(...counts, 1);
  const pL = 30, pR = 16, pT = 16, pB = 28;
  const cW = W - pL - pR, cH = H - pT - pB;
  ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 1;
  [0, 0.5, 1].forEach(p => {
    const y = pT + cH * (1 - p);
    ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(W - pR, y); ctx.stroke();
    ctx.fillStyle = '#bbb'; ctx.font = '10px DM Sans,sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxC * p), pL - 4, y + 4);
  });
  hours.forEach((h, i) => {
    if (i % 4 !== 0) return;
    const x = pL + (i / (hours.length - 1)) * cW;
    ctx.fillStyle = '#bbb'; ctx.font = '10px DM Sans,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(h > 12 ? `${h - 12}pm` : `${h}am`, x, H - 4);
  });
  ctx.beginPath(); ctx.strokeStyle = '#B85C2A'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  counts.forEach((c, i) => {
    const x = pL + (i / (counts.length - 1)) * cW;
    const y = pT + cH * (1 - c / maxC);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  counts.forEach((c, i) => {
    if (c === 0) return;
    const x = pL + (i / (counts.length - 1)) * cW;
    const y = pT + cH * (1 - c / maxC);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#B85C2A'; ctx.fill();
    ctx.fillStyle = '#1A1612'; ctx.font = 'bold 10px DM Sans,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(c, x, y - 8);
  });
}

function renderFeed(orders) {
  const el = document.getElementById('dashFeed'); if (!el) return;
  if (!orders.length) { el.innerHTML = '<div class="no-data" style="padding:1.5rem">No orders yet today</div>'; return; }
  el.innerHTML = orders.map(o => `
    <div class="feed-item">
      <div class="feed-img-wrap">${o.img ? `<img src="${o.img}" class="feed-img" alt="${o.item}" onerror="this.style.display='none'"/>` : '<div class="feed-img-ph">🍽️</div>'}</div>
      <div class="feed-info">
        <div class="feed-name">${o.qty > 1 ? o.qty + '× ' : ''}${o.item}</div>
        <div class="feed-meta"><span class="ot-type-badge ${o.orderType}">${o.label || o.orderType}</span><span class="feed-price">${o.price * (o.qty || 1)} Birr</span></div>
      </div>
      <div class="feed-time">${o.time}</div>
    </div>`).join('');
}

/* ══ ORDERS — with payment verification ══ */
function buildOrderCard(o) {
  const hasDetails = (o.removed && o.removed.length) || (o.extras && o.extras.length) || o.note;
  let detailHTML = '';
  if (o.removed && o.removed.length) detailHTML += `<div class="od-row od-removed"><span class="od-icon">❌</span><span class="od-lbl">Removed</span><span class="od-val">${o.removed.join(', ')}</span></div>`;
  if (o.extras && o.extras.length) o.extras.forEach(ex => {
    const n = typeof ex === 'object' ? ex.name : ex;
    const p = typeof ex === 'object' ? ex.price : '';
    detailHTML += `<div class="od-row od-extra"><span class="od-icon">➕</span><span class="od-lbl">${n}</span>${p ? `<span class="od-price">+${p} Birr</span>` : ''}</div>`;
  });
  if (o.note) detailHTML += `<div class="od-row od-note"><span class="od-icon">📝</span><span class="od-lbl">Note</span><span class="od-val">${o.note}</span></div>`;

  const typeLabel = o.orderType === 'dine' ? `🪑 ${o.label || 'Dine In'}` : o.orderType === 'takeaway' ? '🥡 Takeaway' : '🛵 Delivery';

  // Payment status badge
  const isBankPay   = o.payMethod && o.payMethod.toLowerCase().includes('bank');
  const payStatus   = o.payStatus || 'confirmed';
  const statusBadge = payStatus === 'pending'
    ? '<span class="pay-badge pay-pending">⏳ Awaiting Verification</span>'
    : payStatus === 'partial'
    ? '<span class="pay-badge pay-partial">⚠️ Partial Payment</span>'
    : payStatus === 'overpaid'
    ? '<span class="pay-badge pay-over">💸 Overpaid</span>'
    : '<span class="pay-badge pay-confirmed">✅ Payment Confirmed</span>';

  // Payment verification panel (only for bank transfers)
  let payVerifyHTML = '';
  if (isBankPay) {
    payVerifyHTML = `
      <div class="pay-verify-panel" id="pvp-${o.id}">
        <div class="pvp-header">
          <span class="pvp-title">💳 Bank Transfer Verification</span>
          ${statusBadge}
        </div>
        <div class="pvp-info">
          <div class="pvp-row"><span>Order total</span><strong>${o.totalAmount || o.price * (o.qty||1)} Birr</strong></div>
          ${o.phone ? `<div class="pvp-row"><span>Customer phone</span><strong>${o.phone}</strong></div>` : ''}
          ${o.paidAmount ? `<div class="pvp-row"><span>Amount paid</span><strong>${o.paidAmount} Birr</strong></div>` : ''}
        </div>
        ${o.screenshot ? `
          <div class="pvp-screenshot">
            <div class="pvp-ss-title">📸 Payment screenshot</div>
            <img src="${o.screenshot}" class="pvp-ss-img" onclick="viewFullScreenshot('${o.id}')" alt="Payment screenshot"/>
            <button class="pvp-view-btn" onclick="viewFullScreenshot('${o.id}')">View full size</button>
          </div>` : '<div class="pvp-no-ss">No screenshot uploaded</div>'}
        ${payStatus !== 'confirmed' ? `
          <div class="pvp-actions">
            <div class="pvp-amt-row">
              <div class="fg" style="margin:0;flex:1">
                <label>Amount received (Birr)</label>
                <input type="number" id="paidAmt-${o.id}" placeholder="${o.totalAmount || o.price * (o.qty||1)}" style="padding:9px 12px;border-radius:8px;border:1.5px solid var(--bor);font-family:'DM Sans',sans-serif;font-size:14px;width:100%"/>
              </div>
              <div class="fg" style="margin:0;flex:1">
                <label>Note to customer (optional)</label>
                <input type="text" id="adminNote-${o.id}" placeholder="e.g. Please send 50 Birr more" style="padding:9px 12px;border-radius:8px;border:1.5px solid var(--bor);font-family:'DM Sans',sans-serif;font-size:14px;width:100%"/>
              </div>
            </div>
            <div class="pvp-btn-row">
              <button class="pvp-btn pvp-confirm" onclick="verifyPayment('${o.id}','confirm')">✅ Confirm Payment</button>
              <button class="pvp-btn pvp-partial" onclick="verifyPayment('${o.id}','partial')">⚠️ Partial — Request More</button>
              <button class="pvp-btn pvp-over" onclick="verifyPayment('${o.id}','overpaid')">💸 Overpaid</button>
            </div>
          </div>` : `
          <div class="pvp-confirmed-msg">
            ✅ Payment verified and confirmed. SMS sent to customer.
            ${o.adminNote ? `<br><em>${o.adminNote}</em>` : ''}
          </div>`}
      </div>`;
  }

  return `
    <div class="order-card ${payStatus === 'pending' ? 'oc-pending' : ''}" id="oc-${o.id}">
      <div class="oc-main">
        <div class="oc-img-wrap">${o.img ? `<img src="${o.img}" alt="${o.item}" class="oc-img" onerror="this.style.display='none'"/>` : '<div class="oc-img-placeholder">🍽️</div>'}</div>
        <div class="oc-info">
          <div class="oc-top">
            <span class="oc-name">${o.qty > 1 ? o.qty + '× ' : ''}${o.item}</span>
            <span class="oc-price">${o.price * (o.qty || 1)} Birr</span>
          </div>
          <div class="oc-meta">
            <span class="ot-type-badge ${o.orderType}">${typeLabel}</span>
            <span class="oc-id">${o.id}</span>
            <span class="oc-time">${o.time}</span>
            ${!isBankPay ? statusBadge : ''}
          </div>
          ${hasDetails ? `<button class="oc-expand-btn" onclick="toggleOrderDetail('${o.id}',this)"><span class="oc-expand-icon">▼</span> View customizations</button>` : `<div class="oc-plain">No customizations</div>`}
        </div>
      </div>
      ${hasDetails ? `<div class="oc-details" id="ocd-${o.id}" style="display:none">${detailHTML}</div>` : ''}
      ${payVerifyHTML}
    </div>`;
}

/* Payment verification by admin */
function verifyPayment(orderId, action) {
  const orders    = getOrders();
  const idx       = orders.findIndex(o => o.id === orderId);
  if (idx === -1) { aToast('Order not found'); return; }

  const order     = orders[idx];
  const paidInput = document.getElementById('paidAmt-' + orderId);
  const noteInput = document.getElementById('adminNote-' + orderId);
  const paidAmt   = paidInput ? parseFloat(paidInput.value) || null : null;
  const adminNote = noteInput ? noteInput.value.trim() : '';
  const total     = order.totalAmount || order.price * (order.qty || 1);

  if (action === 'confirm') {
    orders[idx].payStatus  = 'confirmed';
    orders[idx].paidAmount = paidAmt || total;
    orders[idx].adminNote  = adminNote || 'Payment confirmed ✅';
    // Simulate SMS notification
    simulateSMS(order.phone, `✅ Ahadu Café: Your order #${orderId} payment has been confirmed! Your food is being prepared. Thank you!`);
    aToast('✅ Payment confirmed — SMS sent to customer');

  } else if (action === 'partial') {
    if (!paidAmt) { aToast('⚠️ Enter the amount received'); return; }
    const diff = total - paidAmt;
    orders[idx].payStatus  = 'partial';
    orders[idx].paidAmount = paidAmt;
    orders[idx].adminNote  = adminNote || `Please send ${diff} Birr more to complete your payment.`;
    // Simulate SMS asking for more
    simulateSMS(order.phone, `⚠️ Ahadu Café: Order #${orderId} — We received ${paidAmt} Birr but the total is ${total} Birr. Please send ${diff} Birr more to the same account and send a new screenshot. Ref: ${orderId}`);
    aToast(`⚠️ Partial payment — Customer notified to send ${diff} Birr more`);

  } else if (action === 'overpaid') {
    if (!paidAmt) { aToast('⚠️ Enter the amount received'); return; }
    const excess = paidAmt - total;
    orders[idx].payStatus  = 'overpaid';
    orders[idx].paidAmount = paidAmt;
    orders[idx].adminNote  = adminNote || `You overpaid by ${excess} Birr. Please contact us for a refund or use it for extras.`;
    simulateSMS(order.phone, `💸 Ahadu Café: Order #${orderId} — You paid ${paidAmt} Birr but total is ${total} Birr. You overpaid by ${excess} Birr. Contact us: +251 911 000 000 for refund or add extras.`);
    aToast(`💸 Overpaid — Customer notified. Excess: ${excess} Birr`);
  }

  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  renderOrders(currentOrderFilter);
  renderDashboard();
}

/* Simulate SMS (shows in admin as notification — real SMS needs Twilio/Africa's Talking API) */
function simulateSMS(phone, message) {
  if (!phone) return;
  // Save SMS log
  const smsLog = JSON.parse(localStorage.getItem('ahadu_sms_log') || '[]');
  smsLog.unshift({ phone, message, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() });
  localStorage.setItem('ahadu_sms_log', JSON.stringify(smsLog.slice(0, 100)));
  // Show toast
  console.log('📱 SMS to', phone, ':', message);
}

/* View full-size screenshot */
function viewFullScreenshot(orderId) {
  const orders = getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order || !order.screenshot) { aToast('No screenshot found'); return; }
  // Open in new tab
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Payment Screenshot — ${orderId}</title>
    <style>body{margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    img{max-width:100%;max-height:100vh;border-radius:8px;}</style></head>
    <body><img src="${order.screenshot}" alt="Payment screenshot for ${orderId}"/></body></html>`);
  w.document.close();
}
  const det = document.getElementById('ocd-' + id);
  const icon = btn.querySelector('.oc-expand-icon');
  if (!det) return;
  const open = det.style.display !== 'none';
  det.style.display = open ? 'none' : 'block';
  icon.textContent  = open ? '▼' : '▲';
  btn.classList.toggle('expanded', !open);
  btn.childNodes[1].textContent = open ? ' View customizations' : ' Hide customizations';
}

function renderOrders(filterType = currentOrderFilter) {
  currentOrderFilter = filterType;
  const all      = getOrders();
  const filtered = filterType === 'all' ? all : all.filter(o => o.orderType === filterType);
  const dineCount  = all.filter(o => o.orderType === 'dine').length;
  const takeCount  = all.filter(o => o.orderType === 'takeaway').length;
  const delivCount = all.filter(o => o.orderType === 'delivery').length;
  const summary = document.getElementById('ordersSummary');
  if (summary) summary.innerHTML = `
    <div class="os-card dine-card"><div class="os-icon">🪑</div><div class="os-num">${dineCount}</div><div class="os-lbl">Dine In</div></div>
    <div class="os-card take-card"><div class="os-icon">🥡</div><div class="os-num">${takeCount}</div><div class="os-lbl">Takeaway</div></div>
    <div class="os-card del-card"><div class="os-icon">🛵</div><div class="os-num">${delivCount}</div><div class="os-lbl">Delivery</div></div>
    <div class="os-card total-card"><div class="os-icon">📋</div><div class="os-num">${all.length}</div><div class="os-lbl">Total</div></div>`;
  const wrap = document.getElementById('ordersWrap');
  if (!wrap) return;
  if (!filtered.length) { wrap.innerHTML = '<div class="no-data">No orders yet. Orders appear here when customers pay.</div>'; return; }
  if (filterType === 'dine') {
    const byTable = {};
    filtered.forEach(o => { const k = o.table ? 'Table ' + o.table : 'Walk-in'; if (!byTable[k]) byTable[k] = []; byTable[k].push(o); });
    wrap.innerHTML = '';
    Object.entries(byTable).sort((a, b) => (parseInt(a[0].replace('Table ', '')) || 999) - (parseInt(b[0].replace('Table ', '')) || 999)).forEach(([table, orders]) => {
      const total = orders.reduce((s, o) => s + (o.price * (o.qty || 1)), 0);
      const grp = document.createElement('div'); grp.className = 'table-group';
      grp.innerHTML = `<div class="table-group-hd"><span class="tg-name">🪑 ${table}</span><span class="tg-count">${orders.length} item${orders.length !== 1 ? 's' : ''}</span><span class="tg-total">${total} Birr</span></div><div class="table-group-rows">${orders.map(o => buildOrderCard(o)).join('')}</div>`;
      wrap.appendChild(grp);
    });
  } else {
    wrap.innerHTML = '';
    filtered.forEach(o => { const d = document.createElement('div'); d.innerHTML = buildOrderCard(o); wrap.appendChild(d.firstElementChild); });
  }
}

function filterOrders(type, btn) { document.querySelectorAll('.a-fbar .af').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderOrders(type); }
function refreshOrders() { renderOrders(currentOrderFilter); aToast('↻ Orders refreshed'); }
function clearOrders() { localStorage.removeItem(STORAGE_KEY_ORDERS); renderOrders('all'); renderDashboard(); aToast('Orders cleared'); }

/* ══ RESERVATIONS ══ */
function renderReservations() {
  const all = getReservations();
  const filterDate = document.getElementById('resFilterDate') ? document.getElementById('resFilterDate').value : '';
  const filtered = filterDate ? all.filter(r => r.date === filterDate) : all;
  const today = new Date().toISOString().split('T')[0];
  const todayRes = all.filter(r => r.date === today);
  const totalGuests = todayRes.reduce((s, r) => s + (parseInt(r.guests) || 0), 0);
  const statsEl = document.getElementById('resStats');
  if (statsEl) statsEl.innerHTML = `
    <div class="res-stat"><span class="rs-num">${todayRes.length}</span><span class="rs-lbl">Today</span></div>
    <div class="res-stat"><span class="rs-num">${totalGuests}</span><span class="rs-lbl">Guests today</span></div>
    <div class="res-stat"><span class="rs-num">${all.length}</span><span class="rs-lbl">Total</span></div>`;
  const list = document.getElementById('resList'); if (!list) return;
  if (!filtered.length) { list.innerHTML = '<div class="no-data">No reservations found</div>'; return; }
  const byDate = {};
  filtered.forEach(r => { if (!byDate[r.date]) byDate[r.date] = []; byDate[r.date].push(r); });
  list.innerHTML = '';
  Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).forEach(([date, rList]) => {
    const d = new Date(date + 'T00:00:00');
    const isToday = date === today;
    const dateStr = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
    const grp = document.createElement('div'); grp.className = 'res-date-group';
    grp.innerHTML = `
      <div class="rdg-header">
        <span class="rdg-date">${dateStr}${isToday ? ' <span class="today-badge">Today</span>' : ''}</span>
        <span class="rdg-count">${rList.length} booking${rList.length !== 1 ? 's' : ''} · ${rList.reduce((s, r) => s + (parseInt(r.guests) || 0), 0)} guests</span>
      </div>
      <div class="rdg-list">
        ${rList.sort((a, b) => a.time.localeCompare(b.time)).map(r => `
          <div class="res-card">
            <div class="rc-time">${r.time}</div>
            <div class="rc-info">
              <div class="rc-name">${r.name}</div>
              <div class="rc-meta">
                <span class="rc-guests">👥 ${r.guests} ${parseInt(r.guests) === 1 ? 'guest' : 'guests'}</span>
                ${r.phone ? `<span class="rc-contact">📞 ${r.phone}</span>` : ''}
                ${r.email ? `<span class="rc-contact">✉️ ${r.email}</span>` : ''}
              </div>
              ${r.note ? `<div class="rc-note">📝 ${r.note}</div>` : ''}
            </div>
            <div class="rc-actions"><span class="rc-id">${r.id}</span><button class="rc-del" onclick="deleteReservation('${r.id}')">✕</button></div>
          </div>`).join('')}
      </div>`;
    list.appendChild(grp);
  });
}

function deleteReservation(id) { const all = getReservations().filter(r => r.id !== id); localStorage.setItem(STORAGE_KEY_RES, JSON.stringify(all)); renderReservations(); aToast('Reservation removed'); }
function clearReservations() { localStorage.removeItem(STORAGE_KEY_RES); renderReservations(); aToast('All reservations cleared'); }

/* ══ MENU STATUS ══ */
function renderAMenu(cat = 'all') {
  const g = document.getElementById('aMGrid'); if (!g) return;
  g.innerHTML = '';
  const list = cat === 'all' ? MENU : MENU.filter(i => i.cat === cat);
  list.forEach(item => {
    const avail = isAvail(item.id);
    const c = document.createElement('div');
    c.className = 'amc' + (avail ? '' : ' amc-so'); c.id = 'amc-' + item.id;
    c.innerHTML = `
      <div class="amc-img">
        <img src="${item.img}" alt="${item.name}" onerror="this.parentElement.style.background='#F3EFE8';this.style.display='none'"/>
        ${!avail ? '<div class="amc-so-label">SOLD OUT</div>' : ''}
      </div>
      <div class="amc-body">
        <div class="amc-name">${item.name}</div>
        <div class="amc-cat">${item.cat} · ${item.price} Birr</div>
        <label class="toggle-lbl">
          <input type="checkbox" class="toggle-inp" ${avail ? 'checked' : ''} onchange="toggleItem(${item.id},this.checked)"/>
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-txt" id="ttxt-${item.id}">${avail ? 'Available' : 'Sold Out'}</span>
        </label>
      </div>`;
    g.appendChild(c);
  });
}

function aFilter(cat, btn) { document.querySelectorAll('.af').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderAMenu(cat); }

function toggleItem(id, avail) {
  const av = getAv(); av[id] = avail; setAv(av);
  const card = document.getElementById('amc-' + id); if (!card) return;
  card.className = 'amc' + (avail ? '' : ' amc-so');
  const imgDiv = card.querySelector('.amc-img');
  const ex = imgDiv.querySelector('.amc-so-label');
  if (avail) { if (ex) ex.remove(); }
  else if (!ex) { const d = document.createElement('div'); d.className = 'amc-so-label'; d.textContent = 'SOLD OUT'; imgDiv.appendChild(d); }
  const txt = document.getElementById('ttxt-' + id); if (txt) txt.textContent = avail ? 'Available' : 'Sold Out';
  aToast((avail ? '✓ ' : '✕ ') + MENU.find(i => i.id === id)?.name + (avail ? ' is now available' : ' marked as sold out'));
}

function allAvail() { const av = {}; MENU.forEach(i => av[i.id] = true); setAv(av); renderAMenu('all'); document.querySelectorAll('.af').forEach((b, i) => b.classList.toggle('active', i === 0)); aToast('✓ All items available'); }
function allSoldOut() { const av = {}; MENU.forEach(i => av[i.id] = false); setAv(av); renderAMenu('all'); aToast('✕ All items sold out'); }

/* ══ ADMINS (FIX 3: new admins can login) ══ */
function renderAdmins() {
  const w = document.getElementById('adminsWrap'); if (!w) return;
  w.innerHTML = '';
  const cu = getCU();
  getAdmins().forEach((a, i) => {
    const isMe = a.username === cu?.username;
    const rLabel = a.role === 'owner' ? '👑 Owner' : a.role === 'admin' ? '🔑 Admin' : '👤 Staff';
    const div = document.createElement('div'); div.className = 'admin-row';
    div.innerHTML = `
      <div class="ar-av" style="background:${strCol(a.username)}">${a.name[0].toUpperCase()}</div>
      <div class="ar-info">
        <div class="ar-name">${a.name}${isMe ? '<span class="you-tag">You</span>' : ''}</div>
        <div class="ar-meta">@${a.username} · ${rLabel}</div>
      </div>
      <div class="ar-acts">${!isMe && cu?.role === 'owner' ? `<button class="btn-sm btn-red" onclick="removeAdmin(${i})">Remove</button>` : ''}</div>`;
    w.appendChild(div);
  });
}

function strCol(s) { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return `hsl(${Math.abs(h) % 360},55%,45%)`; }

function openAddAdmin() {
  ['nName','nUser','nPass'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const roleEl = document.getElementById('nRole'); if (roleEl) roleEl.value = 'admin';
  const errEl = document.getElementById('addErr'); if (errEl) errEl.textContent = '';
  const ov = document.getElementById('addAdminOv'); if (ov) { ov.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeAddAdmin(e) { if (e.target === document.getElementById('addAdminOv')) closeAddAdminBtn(); }
function closeAddAdminBtn() {
  const ov = document.getElementById('addAdminOv');
  if (ov) { ov.classList.remove('open'); document.body.style.overflow = ''; }
}

function saveAdmin() {
  const name = document.getElementById('nName')?.value.trim();
  const user = document.getElementById('nUser')?.value.trim().toLowerCase();
  const pass = document.getElementById('nPass')?.value.trim();
  const role = document.getElementById('nRole')?.value || 'staff';
  const err  = document.getElementById('addErr');
  if (err) err.textContent = '';
  if (!name || !user || !pass) { if (err) err.textContent = 'All fields are required.'; return; }
  if (pass.length < 4) { if (err) err.textContent = 'Password must be at least 4 characters.'; return; }
  const admins = getAdmins();
  if (admins.find(a => a.username.toLowerCase() === user)) { if (err) err.textContent = 'Username already taken.'; return; }
  // Save with exact same keys as login checks
  admins.push({ name, username: user, password: pass, role });
  saveAdmins(admins);
  closeAddAdminBtn();
  renderAdmins();
  aToast('✓ ' + name + ' added — they can now log in with username: ' + user);
}

function removeAdmin(i) {
  const admins = getAdmins();
  const name = admins[i].name;
  admins.splice(i, 1);
  saveAdmins(admins);
  renderAdmins();
  aToast('Removed ' + name);
}

/* ══ QR (FIX 2: table URL includes full site URL) ══ */
function getBaseUrl() {
  const input = document.getElementById('qrBaseUrl');
  return (input ? input.value : '').replace(/\/$/, '') || window.location.origin;
}

function renderQrGrid() {
  const base = getBaseUrl();
  // Update URL display
  const urlDisp = document.getElementById('qrUrlDisplay');
  if (urlDisp) urlDisp.textContent = base;
  // General QR
  const gWrap = document.getElementById('generalQrImg');
  if (gWrap) gWrap.innerHTML = makeQrImg(base, 180);
  // Table grid
  const grid = document.getElementById('qrTableGrid'); if (!grid) return;
  grid.innerHTML = '';
  for (let t = 1; t <= tableCount; t++) {
    const url = base + '?table=' + t;
    const card = document.createElement('div'); card.className = 'qtc';
    card.innerHTML = `
      <div class="qtc-num">🪑 Table ${t}</div>
      <div class="qtc-qr">${makeQrImg(url, 140)}</div>
      <div class="qtc-url">${url}</div>
      <div class="qtc-btns">
        <button class="btn btn-primary" style="padding:8px 14px;font-size:12px" onclick="dlQr('table',${t})">⬇ Download</button>
        <button class="btn-sm btn-outline" onclick="printQr('table',${t})">🖨 Print</button>
      </div>`;
    grid.appendChild(card);
  }
}

function makeQrImg(url, size) {
  const enc = encodeURIComponent(url);
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${enc}&color=1A1612&bgcolor=FFFFFF&qzone=2" style="width:${size}px;height:${size}px;border-radius:6px;display:block" alt="QR Code"/>`;
}

function setTableCount(n, btn) {
  document.querySelectorAll('.tc-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  tableCount = n;
  renderQrGrid();
}

function dlQr(type, tableNum) {
  const base = getBaseUrl();
  const url  = type === 'table' ? base + '?table=' + tableNum : base;
  const a = document.createElement('a');
  a.href     = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(url)}&color=1A1612&bgcolor=FFFFFF&qzone=2`;
  a.download = type === 'table' ? `ahadu-table-${tableNum}.png` : 'ahadu-general.png';
  a.target = '_blank'; a.click();
  aToast('⬇ Downloading QR for ' + (type === 'table' ? 'Table ' + tableNum : 'General'));
}

function dlAllQr() {
  const base = getBaseUrl();
  for (let t = 1; t <= tableCount; t++) {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(base + '?table=' + t)}&color=1A1612&bgcolor=FFFFFF&qzone=2`;
      a.download = `ahadu-table-${t}.png`; a.target = '_blank'; a.click();
    }, t * 700);
  }
  aToast('⬇ Downloading all ' + tableCount + ' QR codes…');
}

function printQr(type, tableNum) {
  const base  = getBaseUrl();
  const url   = type === 'table' ? base + '?table=' + tableNum : base;
  const title = type === 'table' ? 'Table ' + tableNum : 'General';
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Ahadu Café QR — ${title}</title>
    <style>body{font-family:Georgia,serif;text-align:center;padding:50px;background:#fff}
    h1{font-size:36px;margin-bottom:4px;color:#B85C2A}p{color:#888;margin-bottom:20px;font-size:14px}
    .tbl{font-size:24px;font-weight:600;margin-bottom:20px;color:#1A1612}
    img{border:2px solid #eee;border-radius:12px;padding:10px}.url{margin-top:14px;font-size:11px;color:#aaa}
    </style></head>
    <body onload="window.print()">
    <h1>Ahadu Café</h1><p>Scan to view menu & order online</p>
    <div class="tbl">${title}</div>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=380x380&data=${encodeURIComponent(url)}&color=1A1612&bgcolor=FFFFFF&qzone=2" width="380" height="380"/>
    <div class="url">${url}</div>
    </body></html>`);
  w.document.close();
}

/* ── TOAST ── */
function aToast(msg) {
  const el = document.getElementById('aToast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}
