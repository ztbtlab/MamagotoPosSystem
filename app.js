'use strict';

/* =========================================================
 *  ケーキやさんレジ
 *  - しょうひんを ふやしたい・かえたい ときは PRODUCTS を へんしゅう
 *  - img を いれると えもじ の かわりに イラストが でます
 *    （れい: img: 'images/shortcake.png'）
 *  - tint で えもじの いろを かえられます（れい: マスカット）
 * ========================================================= */
const PRODUCTS = [
  { id: 'shortcake', name: 'ショートケーキ', emoji: '🍰', price: 300, img: '' },
  { id: 'birthday',  name: 'ホールケーキ',   emoji: '🎂', price: 1000, img: '' },
  { id: 'cupcake',   name: 'カップケーキ',   emoji: '🧁', price: 200, img: '' },
  { id: 'choco',     name: 'チョコケーキ',   emoji: '🍫', price: 300, img: '' },
  { id: 'pudding',   name: 'プリン',         emoji: '🍮', price: 200, img: '' },
  { id: 'donut',     name: 'ドーナツ',       emoji: '🍩', price: 100, img: '' },
  { id: 'cookie',    name: 'クッキー',       emoji: '🍪', price: 100, img: '' },
  { id: 'pie',       name: 'アップルパイ',   emoji: '🥧', price: 400, img: '' },
  { id: 'strawberry',name: 'いちご',         emoji: '🍓', price: 100, img: '' },
  { id: 'icecream',  name: 'ソフトクリーム', emoji: '🍦', price: 200, img: '' },
  { id: 'juice',     name: 'ジュース',       emoji: '🧃', price: 100, img: '' },
  { id: 'tea',       name: 'こうちゃ',       emoji: '☕', price: 200, img: '' },
  { id: 'banana',    name: 'ばなな',         emoji: '🍌', price: 100, img: '' },
  { id: 'grape',     name: 'ぶどう',         emoji: '🍇', price: 300, img: '' },
  { id: 'babystar',  name: 'ベビースター',   emoji: '🍜', price: 100, img: '' },
  { id: 'monsterck', name: 'ラブブクッキー', emoji: '🐰', price: 200, img: '' },
  { id: 'chiffon',   name: 'シフォンケーキ', emoji: '🍞', price: 300, img: '' },
  { id: 'yakiniku',  name: 'やきにく',       emoji: '🥩', price: 500, img: '' },
  { id: 'muscat',    name: 'マスカット',     emoji: '🍇', price: 400, img: '', tint: 'hue-rotate(195deg) saturate(1.4) brightness(1.2)' },
  { id: 'icecup',    name: 'アイス',         emoji: '🍨', price: 200, img: '' },
];

const MONEY = [
  { value: 10,    type: 'coin', cls: 'c10' },
  { value: 50,    type: 'coin', cls: 'c50' },
  { value: 100,   type: 'coin', cls: 'c100' },
  { value: 500,   type: 'coin', cls: 'c500' },
  { value: 1000,  type: 'bill', cls: 'b1000' },
  { value: 5000,  type: 'bill', cls: 'b5000' },
  { value: 10000, type: 'bill', cls: 'b10000' },
];

const CONFETTI = ['🎉', '✨', '💖', '🍓', '🌟', '🎀', '🍰'];

/* ---------- ほぞん ---------- */
const store = {
  get(key, def) {
    try { const v = localStorage.getItem('cakepos.' + key); return v === null ? def : JSON.parse(v); }
    catch { return def; }
  },
  set(key, val) {
    try { localStorage.setItem('cakepos.' + key, JSON.stringify(val)); } catch { /* むし */ }
  },
};

const state = {
  cart: new Map(), // id -> qty
  deposit: 0,
  sound: store.get('sound', true),
  voice: store.get('voice', true),
  receiptNo: store.get('receiptNo', 0),
  shopName: store.get('shopName', 'ケーキやさん'),
};

/* =========================================================
 *  こうかおん（Web Audio API で その場で つくる）
 * ========================================================= */
const Sound = (() => {
  let ctx = null;
  let master = null;

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state !== 'running') {
      ctx.resume();
      // iOS 向け: むおんを ならして ロックかいじょ
      const b = ctx.createBuffer(1, 1, 22050);
      const s = ctx.createBufferSource();
      s.buffer = b; s.connect(master); s.start(0);
    }
  }

  function tone({ freq, type = 'sine', start = 0, dur = 0.15, vol = 0.5, slideTo = null, attack = 0.005 }) {
    if (!ctx || !state.sound) return;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function noise({ start = 0, dur = 0.1, vol = 0.3, freq = 3000 }) {
    if (!ctx || !state.sound) return;
    const t0 = ctx.currentTime + start;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.5;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }

  return {
    unlock,
    // ポンッ（ボタン）
    tap() { tone({ freq: 660, slideTo: 990, dur: 0.08, vol: 0.3, type: 'triangle' }); },
    // ピッ（バーコード）
    beep() { tone({ freq: 1760, type: 'square', dur: 0.12, vol: 0.18 }); },
    // ポロン（へらす）
    down() { tone({ freq: 700, slideTo: 350, dur: 0.15, vol: 0.3, type: 'triangle' }); },
    // チャリン（コイン）
    coin() {
      tone({ freq: 1975, dur: 0.25, vol: 0.25 });
      tone({ freq: 2637, start: 0.07, dur: 0.4, vol: 0.25 });
      tone({ freq: 3951, start: 0.07, dur: 0.3, vol: 0.08 });
    },
    // ペラッ（おさつ）
    bill() { noise({ dur: 0.12, vol: 0.5, freq: 2500 }); noise({ start: 0.09, dur: 0.1, vol: 0.35, freq: 4000 }); },
    // ブブー（たりない）
    error() {
      tone({ freq: 160, type: 'sawtooth', dur: 0.18, vol: 0.25 });
      tone({ freq: 160, type: 'sawtooth', start: 0.22, dur: 0.25, vol: 0.25 });
    },
    // ガシャ チーン（レジ）
    register() {
      noise({ dur: 0.08, vol: 0.6, freq: 1200 });
      noise({ start: 0.1, dur: 0.15, vol: 0.5, freq: 800 });
      [0, 0.03].forEach((d, i) => {
        tone({ freq: 2093, start: 0.3 + d, dur: 1.2, vol: i ? 0.12 : 0.3 });
        tone({ freq: 4186, start: 0.3 + d, dur: 0.8, vol: 0.06 });
      });
    },
    // じゃーん（ありがとう）
    fanfare() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => tone({ freq: f, type: 'triangle', start: 1.0 + i * 0.12, dur: 0.25, vol: 0.3 }));
      [523, 659, 784].forEach(f => tone({ freq: f * 2, type: 'triangle', start: 1.5, dur: 0.8, vol: 0.18 }));
    },
    // ジジジ（レシート いんさつ）
    print() {
      for (let i = 0; i < 8; i++) noise({ start: i * 0.08, dur: 0.06, vol: 0.18, freq: 5000 });
    },
  };
})();

/* ---------- よみあげ ---------- */
function say(text) {
  if (!state.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.95;
    u.pitch = 1.3;
    speechSynthesis.speak(u);
  } catch { /* むし */ }
}

/* =========================================================
 *  がめん
 * ========================================================= */
const $ = (id) => document.getElementById(id);
const yen = (n) => n.toLocaleString('ja-JP');
const productById = (id) => PRODUCTS.find(p => p.id === id);

function iconHTML(p, cls = 'emoji') {
  if (p.img) return `<img class="${cls}" src="${p.img}" alt="" draggable="false">`;
  const style = p.tint ? ` style="filter:${p.tint}"` : '';
  return `<span class="${cls}"${style}>${p.emoji}</span>`;
}

function total() {
  let t = 0;
  for (const [id, q] of state.cart) t += productById(id).price * q;
  return t;
}

function itemCount() {
  let n = 0;
  for (const q of state.cart.values()) n += q;
  return n;
}

function pop(el) {
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 120);
}

/* ---------- しょうひん ---------- */
function renderProducts() {
  const wrap = $('products');
  wrap.innerHTML = '';
  for (const p of PRODUCTS) {
    const b = document.createElement('button');
    b.className = 'product';
    b.innerHTML = `${iconHTML(p)}<span class="name">${p.name}</span><span class="price">${yen(p.price)}えん</span>`;
    b.addEventListener('click', () => addItem(p.id, b));
    wrap.appendChild(b);
  }
}

function addItem(id, fromEl) {
  state.cart.set(id, (state.cart.get(id) || 0) + 1);
  Sound.beep();
  if (fromEl) { pop(fromEl); flyToCart(productById(id), fromEl); }
  renderCart();
}

function changeQty(id, delta) {
  const q = (state.cart.get(id) || 0) + delta;
  if (q <= 0) state.cart.delete(id); else state.cart.set(id, q);
  delta > 0 ? Sound.beep() : Sound.down();
  renderCart();
}

function flyToCart(p, fromEl) {
  const target = $('cartList').getBoundingClientRect();
  const from = fromEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'fly';
  el.innerHTML = p.img ? `<img src="${p.img}" style="width:60px;height:60px;object-fit:contain">` : iconHTML(p, '');
  el.style.left = (from.left + from.width / 2 - 30) + 'px';
  el.style.top = (from.top + from.height / 2 - 40) + 'px';
  document.body.appendChild(el);
  const dx = target.left + target.width / 2 - (from.left + from.width / 2);
  const dy = target.top + 40 - (from.top + from.height / 2);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.transform = `translate(${dx}px, ${dy}px) scale(0.5)`;
    el.style.opacity = '0.2';
  }));
  setTimeout(() => el.remove(), 550);
}

/* ---------- カート ---------- */
function renderCart() {
  const list = $('cartList');
  list.innerHTML = '';
  for (const [id, q] of state.cart) {
    const p = productById(id);
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      ${iconHTML(p)}
      <div class="info">
        <div class="name">${p.name}</div>
        <div class="sub">${yen(p.price)}えん × ${q}</div>
      </div>
      <button class="qty-btn minus" aria-label="へらす">−</button>
      <span class="qty">${q}</span>
      <button class="qty-btn plus" aria-label="ふやす">＋</button>`;
    li.querySelector('.minus').addEventListener('click', () => changeQty(id, -1));
    li.querySelector('.plus').addEventListener('click', () => changeQty(id, +1));
    list.appendChild(li);
  }
  const empty = state.cart.size === 0;
  $('cartEmpty').classList.toggle('hidden', !empty);
  list.classList.toggle('hidden', empty);
  $('totalYen').textContent = yen(total());
  $('payBtn').disabled = empty;
  $('clearBtn').disabled = empty;
  list.scrollTop = list.scrollHeight;
}

/* ---------- おかいけい ---------- */
function renderMoney() {
  const wrap = $('money');
  wrap.innerHTML = '';
  for (const m of MONEY) {
    const b = document.createElement('button');
    b.className = `${m.type} ${m.cls}`;
    b.innerHTML = `${yen(m.value)}<small>えん</small>`;
    b.addEventListener('click', () => {
      state.deposit += m.value;
      m.type === 'coin' ? Sound.coin() : Sound.bill();
      pop(b);
      renderPay();
    });
    wrap.appendChild(b);
  }
}

function openPay() {
  if (state.cart.size === 0) return;
  state.deposit = 0;
  Sound.tap();
  $('payScreen').classList.remove('hidden');
  renderPay();
  say(`ごうけい、${total()}えん です`);
}

function renderPay() {
  const t = total();
  const d = state.deposit;
  $('payTotal').textContent = yen(t);
  $('payDeposit').textContent = yen(d);
  const row = $('changeRow');
  if (d >= t) {
    $('changeLabel').textContent = 'おつり';
    $('payChange').textContent = yen(d - t);
    row.classList.add('ok');
  } else {
    $('changeLabel').textContent = 'あと';
    $('payChange').textContent = yen(t - d);
    row.classList.remove('ok');
  }
}

function confirmPay() {
  const t = total();
  if (state.deposit < t) {
    Sound.error();
    const card = document.querySelector('.pay-card');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    say(`あと、${t - state.deposit}えん たりないよ`);
    return;
  }
  const change = state.deposit - t;
  state.receiptNo += 1;
  store.set('receiptNo', state.receiptNo);
  Sound.register();
  Sound.print();
  Sound.fanfare();
  $('payScreen').classList.add('hidden');
  showReceipt(t, state.deposit, change);
  setTimeout(() => say(change > 0 ? `${change}えんの おかえしです。ありがとうございました` : 'ちょうど いただきます。ありがとうございました'), 900);
  setTimeout(confetti, 1000);
}

/* ---------- レシート ---------- */
function showReceipt(t, deposit, change) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}ねん ${now.getMonth() + 1}がつ ${now.getDate()}にち  ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  let lines = '';
  for (const [id, q] of state.cart) {
    const p = productById(id);
    lines += `<div class="r-line"><span>${iconHTML({ ...p, img: '' }, '')} ${p.name}${q > 1 ? ` ×${q}` : ''}</span><span>${yen(p.price * q)}えん</span></div>`;
  }
  $('receipt').innerHTML = `
    <div class="r-head">
      <div class="r-shop">🎂 ${escapeHTML(state.shopName)}</div>
      <div class="r-date">${date}</div>
    </div>
    <hr>
    ${lines}
    <hr>
    <div class="r-line"><span>こすう</span><span>${itemCount()}こ</span></div>
    <div class="r-line big"><span>ごうけい</span><span>${yen(t)}えん</span></div>
    <div class="r-line"><span>おあずかり</span><span>${yen(deposit)}えん</span></div>
    <div class="r-line big"><span>おつり</span><span>${yen(change)}えん</span></div>
    <hr>
    <div class="r-thanks">ありがとうございました 💖<br>また きてね！</div>
    <div class="r-no">レシート No.${String(state.receiptNo).padStart(4, '0')}</div>`;
  const r = $('receipt');
  r.style.animation = 'none'; void r.offsetWidth; r.style.animation = '';
  $('receiptScreen').classList.remove('hidden');
}

function nextCustomer() {
  Sound.tap();
  state.cart.clear();
  state.deposit = 0;
  $('receiptScreen').classList.add('hidden');
  renderCart();
  say('いらっしゃいませ');
}

function confetti() {
  const box = $('confetti');
  for (let i = 0; i < 30; i++) {
    const s = document.createElement('span');
    s.textContent = CONFETTI[i % CONFETTI.length];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = (2 + Math.random() * 2) + 's';
    s.style.animationDelay = (Math.random() * 0.8) + 's';
    box.appendChild(s);
    setTimeout(() => s.remove(), 5000);
  }
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- せってい ---------- */
function renderToggles() {
  $('soundBtn').classList.toggle('off', !state.sound);
  $('soundBtn').textContent = state.sound ? '🔊' : '🔇';
  $('voiceBtn').classList.toggle('off', !state.voice);
  $('shopNameText').textContent = state.shopName;
}

/* ---------- はじめる ---------- */
function init() {
  renderProducts();
  renderMoney();
  renderCart();
  renderToggles();

  $('startBtn').addEventListener('click', () => {
    Sound.unlock();
    Sound.fanfare();
    $('start').classList.add('hidden');
    say('いらっしゃいませ');
  });

  // iOS: あとから もどってきた ときも おとを ふっかつ
  document.addEventListener('touchend', Sound.unlock, { passive: true });
  document.addEventListener('click', Sound.unlock);

  $('payBtn').addEventListener('click', openPay);
  $('clearBtn').addEventListener('click', () => { state.cart.clear(); Sound.down(); renderCart(); });
  $('payBackBtn').addEventListener('click', () => { Sound.tap(); $('payScreen').classList.add('hidden'); });
  $('payResetBtn').addEventListener('click', () => { state.deposit = 0; Sound.down(); renderPay(); });
  $('payJustBtn').addEventListener('click', () => { state.deposit = total(); Sound.coin(); renderPay(); });
  $('payOkBtn').addEventListener('click', confirmPay);
  $('nextBtn').addEventListener('click', nextCustomer);

  $('soundBtn').addEventListener('click', () => {
    state.sound = !state.sound; store.set('sound', state.sound); renderToggles(); Sound.tap();
  });
  $('voiceBtn').addEventListener('click', () => {
    state.voice = !state.voice; store.set('voice', state.voice); renderToggles(); Sound.tap();
    if (state.voice) say('こえ オン');
  });

  // おみせの なまえ: ながおし（1びょう）で かえられる（おとなよう）
  let pressTimer = null;
  const shop = $('shopName');
  const cancel = () => clearTimeout(pressTimer);
  shop.addEventListener('pointerdown', () => {
    pressTimer = setTimeout(() => {
      const name = prompt('おみせの なまえ', state.shopName);
      if (name && name.trim()) {
        state.shopName = name.trim().slice(0, 16);
        store.set('shopName', state.shopName);
        renderToggles();
      }
    }, 1000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => shop.addEventListener(e, cancel));
}

init();
