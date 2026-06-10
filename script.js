const products = [
  { id: 1, name: 'Heritage Oxford Shirt', category: 'Shirts', price: 48, rating: 4.9, desc: 'Crisp cotton oxford with a premium collar and modern athletic fit.', colors: ['White', 'Sky'], code: 'OX', swatch1: '#e9edf4', swatch2: '#91a8c5' },
  { id: 2, name: 'Signature Bomber Jacket', category: 'Jackets', price: 89, rating: 4.8, desc: 'Lightweight navy bomber with red-gold trim and clean metal zipper.', colors: ['Navy', 'Black'], code: 'BJ', swatch1: '#0b1d3a', swatch2: '#b21f2d' },
  { id: 3, name: 'Straight Dark Denim', category: 'Denim', price: 62, rating: 4.7, desc: 'Dark wash denim with stretch comfort and classic straight silhouette.', colors: ['Indigo'], code: 'DN', swatch1: '#101c2e', swatch2: '#35465f' },
  { id: 4, name: 'Monogram Knit Polo', category: 'Knitwear', price: 54, rating: 4.9, desc: 'Soft knit polo that works for dates, interviews and weekend dinners.', colors: ['Cream', 'Navy'], code: 'KP', swatch1: '#efe2ca', swatch2: '#0b1d3a' },
  { id: 5, name: 'Essential Logo Tee', category: 'Shirts', price: 35, rating: 4.6, desc: 'Heavyweight tee with small chest logo and premium neck ribbing.', colors: ['White', 'Black', 'Red'], code: 'TE', swatch1: '#f8f8f8', swatch2: '#1b1b1b' },
  { id: 6, name: 'Tailored Chino Pant', category: 'Denim', price: 58, rating: 4.8, desc: 'Smart casual chino with tapered leg and comfortable stretch waist.', colors: ['Stone', 'Navy'], code: 'CH', swatch1: '#c8b89d', swatch2: '#0b1d3a' },
  { id: 7, name: 'City Trucker Jacket', category: 'Jackets', price: 96, rating: 4.7, desc: 'Structured jacket inspired by vintage American denim workwear.', colors: ['Blue', 'Black'], code: 'TJ', swatch1: '#365a7c', swatch2: '#111' },
  { id: 8, name: 'Leather Everyday Belt', category: 'Accessories', price: 42, rating: 4.5, desc: 'Minimal leather belt with brushed metal buckle and logo embossing.', colors: ['Brown', 'Black'], code: 'BT', swatch1: '#6b3f22', swatch2: '#161616' },
  { id: 9, name: 'Merino Quarter Zip', category: 'Knitwear', price: 74, rating: 4.9, desc: 'Premium layer for cold offices, flights and polished casual outfits.', colors: ['Gray', 'Navy'], code: 'QZ', swatch1: '#8e9194', swatch2: '#0b1d3a' }
];

const state = { cart: JSON.parse(localStorage.getItem('novaroCart')) || [], wishlist: JSON.parse(localStorage.getItem('novaroWishlist')) || [] };
const $ = selector => document.querySelector(selector);
const grid = $('#productGrid');
const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function save() {
  localStorage.setItem('novaroCart', JSON.stringify(state.cart));
  localStorage.setItem('novaroWishlist', JSON.stringify(state.wishlist));
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function getFilteredProducts() {
  const query = $('#searchInput').value.toLowerCase();
  const category = $('#categoryFilter').value;
  const sort = $('#sortFilter').value;
  const max = Number($('#priceRange').value);

  let list = products.filter(p =>
    (category === 'all' || p.category === category) &&
    p.price <= max &&
    (p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query))
  );

  if (sort === 'low') list.sort((a, b) => a.price - b.price);
  if (sort === 'high') list.sort((a, b) => b.price - a.price);
  if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  $('#resultCount').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
  grid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image" data-code="${product.code}" style="--swatch1:${product.swatch1};--swatch2:${product.swatch2}">
        <button class="wish ${state.wishlist.includes(product.id) ? 'active' : ''}" onclick="toggleWishlist(${product.id})" aria-label="Add to wishlist">♥</button>
      </div>
      <div class="product-info">
        <div class="product-top">
          <div>
            <h3>${product.name}</h3>
            <span class="chip">${product.category}</span>
          </div>
          <div class="price">${formatter.format(product.price)}</div>
        </div>
        <p>${product.desc}</p>
        <div class="chips">
          <span class="chip">★ ${product.rating}</span>
          ${product.colors.map(color => `<span class="chip">${color}</span>`).join('')}
        </div>
        <div class="product-actions">
          <button class="btn primary" onclick="addToCart(${product.id})">Add to Cart</button>
          <select class="size-select" id="size-${product.id}">
            <option>S</option><option>M</option><option>L</option><option>XL</option>
          </select>
        </div>
      </div>
    </article>
  `).join('');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const size = $(`#size-${productId}`)?.value || 'M';
  const key = `${productId}-${size}`;
  const existing = state.cart.find(item => item.key === key);
  if (existing) existing.qty += 1;
  else state.cart.push({ key, productId, size, qty: 1 });
  save();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function toggleWishlist(productId) {
  state.wishlist = state.wishlist.includes(productId)
    ? state.wishlist.filter(id => id !== productId)
    : [...state.wishlist, productId];
  save();
  renderProducts();
}

function changeQty(key, amount) {
  const item = state.cart.find(i => i.key === key);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.key !== key);
  save();
  renderCart();
}

function cartHasBundle() {
  const categories = state.cart.map(item => products.find(p => p.id === item.productId).category);
  return categories.includes('Shirts') && categories.includes('Denim') && categories.includes('Jackets');
}

function renderCart() {
  const cartItems = $('#cartItems');
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  $('#cartCount').textContent = count;

  if (!state.cart.length) {
    cartItems.innerHTML = '<p class="muted">Your cart is empty. Add a few essentials.</p>';
  } else {
    cartItems.innerHTML = state.cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return `
        <div class="cart-line">
          <div>
            <strong>${product.name}</strong>
            <small>Size ${item.size} • ${formatter.format(product.price)}</small>
          </div>
          <div class="qty">
            <button onclick="changeQty('${item.key}', -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty('${item.key}', 1)">+</button>
          </div>
        </div>
      `;
    }).join('');
  }

  const subtotal = state.cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + product.price * item.qty;
  }, 0);
  const discount = cartHasBundle() ? subtotal * 0.10 : 0;
  const shipping = subtotal === 0 || subtotal > 75 ? 0 : 7.95;
  const total = subtotal - discount + shipping;
  $('#subtotal').textContent = formatter.format(subtotal);
  $('#discount').textContent = `-${formatter.format(discount)}`;
  $('#shipping').textContent = formatter.format(shipping);
  $('#total').textContent = formatter.format(total);
}

function openCart() { $('#cartDrawer').classList.add('open'); $('#overlay').classList.add('show'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#overlay').classList.remove('show'); }

['searchInput', 'categoryFilter', 'sortFilter', 'priceRange'].forEach(id => {
  $(`#${id}`).addEventListener('input', () => {
    $('#priceOutput').textContent = `$${$('#priceRange').value}`;
    renderProducts();
  });
});

$('#resetFilters').addEventListener('click', () => {
  $('#searchInput').value = '';
  $('#categoryFilter').value = 'all';
  $('#sortFilter').value = 'featured';
  $('#priceRange').value = 150;
  $('#priceOutput').textContent = '$150';
  renderProducts();
});
$('#clearWishlist').addEventListener('click', () => { state.wishlist = []; save(); renderProducts(); showToast('Wishlist cleared'); });
$('#openCart').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', closeCart);
$('#checkoutBtn').addEventListener('click', () => showToast('Checkout demo complete — no payment processed'));
$('#newsletterForm').addEventListener('submit', event => { event.preventDefault(); showToast('Subscribed! 15% discount unlocked'); event.target.reset(); });
$('#themeBtn').addEventListener('click', () => document.body.classList.toggle('dark'));
$('#menuBtn').addEventListener('click', () => $('#navLinks').classList.toggle('open'));

renderProducts();
renderCart();
