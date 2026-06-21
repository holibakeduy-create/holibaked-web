/* ============================================
   HOLI BAKED — script.js
   ✏️  Para editar el menú o los precios, tocá
   el bloque PRODUCTS de acá abajo. Nada más
   en este archivo necesita tocarse para eso.
   ============================================ */

const WHATSAPP_NUMBER = '59893769240'; // 093 769 240 en formato internacional

const PRODUCTS = {
  sueltas: [
    { id: 'cc',  name: 'Chocolate Chunk Clásica',      price: 120, emoji: '🍪' },
    { id: 'cca', name: 'Chocolate Chunk y Avellanas',  price: 120, emoji: '🍪' },
    { id: 'tc',  name: 'Triple Choco',                 price: 120, emoji: '🍫' },
    { id: 'rv',  name: 'Red Velvet',                   price: 150, emoji: '❤️' },
    { id: 'lc',  name: 'Lemon Curd',                   price: 150, emoji: '🍋' },
    { id: 'pb',  name: 'Pistacho Bombón',               price: 150, emoji: '🥜' },
  ],
  otros: [
    { id: 'focaccia', name: 'Focaccia', price: 140, emoji: '🫒' },
    { id: 'brioche',  name: 'Brioche',  price: 100, emoji: '🥐' },
  ],
};

const BOX_DISCOUNT = 0.10;
const BOX_SIZES = [4, 6];

/* ---------- estado ---------- */
const sueltaQty = {};          // { productId: qty }
PRODUCTS.sueltas.forEach(p => sueltaQty[p.id] = 0);
PRODUCTS.otros.forEach(p => sueltaQty[p.id] = 0);

let boxState = { size: null, counts: {} }; // counts: { productId: qty }

let cart = []; // { key, label, detail, qty, unitPrice, units, type }

/* ============================================
   RENDER: productos sueltos
   ============================================ */
function money(n){
  return '$' + Math.round(n).toLocaleString('es-UY');
}

function renderProductGrid(containerId, products){
  const grid = document.getElementById(containerId);
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-card__photo">${p.emoji}</div>
      <div class="product-card__name">${p.name}</div>
      <div class="product-card__row">
        <span class="product-card__price">${money(p.price)}</span>
        <div class="stepper" data-product="${p.id}">
          <button type="button" data-action="dec" aria-label="Restar">−</button>
          <span class="stepper__val" id="qty-${p.id}">0</span>
          <button type="button" data-action="inc" aria-label="Sumar">+</button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.stepper').forEach(stepper => {
    const id = stepper.dataset.product;
    stepper.querySelector('[data-action="inc"]').addEventListener('click', () => changeSuelta(id, products, 1));
    stepper.querySelector('[data-action="dec"]').addEventListener('click', () => changeSuelta(id, products, -1));
  });
}

function changeSuelta(id, products, delta){
  const product = products.find(p => p.id === id);
  sueltaQty[id] = Math.max(0, sueltaQty[id] + delta);
  document.getElementById('qty-' + id).textContent = sueltaQty[id];

  const key = 'suelta-' + id;
  cart = cart.filter(l => l.key !== key);
  if (sueltaQty[id] > 0){
    cart.push({
      key,
      label: product.name,
      detail: '',
      qty: sueltaQty[id],
      unitPrice: product.price,
      units: sueltaQty[id],
      type: 'suel
