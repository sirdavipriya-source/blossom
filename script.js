// ===== Data (sample products) =====
const PRODUCTS = [
  {id:1,title:'Bliss Box',price:1299,cat:'box',img:'./img/bliss.jpeg'},
  {id:2,title:'Green Cheer',price:799,cat:'plants',img:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop'},
  {id:3,title:'Sweet Heart',price:599,cat:'choco',img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop'},
  {id:4,title:'Cozy Notes',price:449,cat:'cards',img:'./img/cozy.jpeg'},
  {id:5,title:'Romance Hamper',price:1799,cat:'box',img:'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop'},
  {id:6,title:'Succulent Set',price:699,cat:'plants',img:'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop'},
  {id:7,title:'Gourmet Treats',price:999,cat:'box',img:'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop'},
  {id:8,title:'Thank You Cards',price:249,cat:'cards',img:'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop'}
];

// ===== Cart (in-memory, persisted to localStorage) =====
let CART = JSON.parse(localStorage.getItem('bg_cart')||'[]');

function saveCart(){ localStorage.setItem('bg_cart', JSON.stringify(CART)); }
function cartCount(){ return CART.reduce((s,i)=>s+i.qty,0); }
function cartTotal(){ return CART.reduce((s,i)=>s+i.qty*i.price,0); }

// ===== Rendering products =====
const grid = document.getElementById('productsGrid');

function renderProducts(items){
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  items.forEach(p=>{
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3';
    col.innerHTML = `
      <div class="card card-product shadow-sm h-100">
        <img src="${p.img}" class="card-img-top" alt="${p.title}">
        <div class="card-body d-flex flex-column">
          <h6 class="mb-1">${p.title}</h6>
          <div class="mb-2 text-pink fw-bold">₹${p.price}</div>
          <small class="text-muted mb-3">${p.cat}</small>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm w-100" data-action="view" data-id="${p.id}"><i class="fa fa-eye me-1"></i>Quick view</button>
            <button class="btn btn-pink btn-sm w-100" data-action="add" data-id="${p.id}"><i class="fa fa-cart-plus me-1"></i>Add</button>
          </div>
        </div>
      </div>
    `;
    frag.appendChild(col);
  });
  grid.appendChild(frag);
}

// initial render
renderProducts(PRODUCTS);

// ===== Filters =====
document.querySelectorAll('.filters button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    if(cat === 'all') renderProducts(PRODUCTS);
    else renderProducts(PRODUCTS.filter(p=>p.cat===cat));
  });
});

// ===== Cart UI =====
const cartCountEl = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');

function updateCartUI(){
  cartCountEl.textContent = cartCount();
  cartTotalEl.textContent = `₹${cartTotal()}`;
  cartItemsEl.innerHTML = '';
  if(CART.length===0){
    cartItemsEl.innerHTML = '<div class="text-muted">Your cart is empty. Add something lovely!</div>';
    return;
  }
  CART.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'd-flex align-items-center gap-2 mb-3';
    div.innerHTML = `
      <img src="${(PRODUCTS.find(p=>p.id===item.id)||{}).img||''}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">
      <div class="flex-grow-1">
        <div class="fw-bold">${item.title}</div>
        <div class="text-muted small">₹${item.price} × ${item.qty}</div>
      </div>
      <div class="d-flex flex-column align-items-end">
        <div>
          <button class="btn btn-sm btn-outline-secondary me-1" data-action="decrease" data-id="${item.id}">-</button>
          <button class="btn btn-sm btn-outline-secondary" data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button class="btn btn-sm btn-link text-danger mt-2" data-action="remove" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });
}

function addToCart(id, qty=1){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const found = CART.find(c=>c.id===id);
  if(found) found.qty += qty; else CART.push({id:p.id,title:p.title,price:p.price,qty});
  saveCart(); updateCartUI();
}

// handle cart controls inside offcanvas
document.getElementById('cartItems').addEventListener('click', e=>{
  const action = e.target.closest('[data-action]')?.dataset.action;
  const id = +e.target.closest('[data-action]')?.dataset.id;
  if(!action || !id) return;
  const item = CART.find(c=>c.id===id);
  if(!item) return;
  if(action==='increase'){ item.qty += 1; }
  if(action==='decrease'){ item.qty = Math.max(1, item.qty - 1); }
  if(action==='remove'){ CART = CART.filter(c=>c.id!==id); }
  saveCart(); updateCartUI();
});

// checkout demo
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  if(CART.length===0) return alert('Your cart is empty — add something lovely!');
  alert('Checkout demo — total: ₹' + cartTotal() + '\n(Checkout flow not implemented in this demo.)');
});

// wire product buttons (delegation)
document.getElementById('productsGrid').addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const action = btn.dataset.action;
  const id = +btn.dataset.id;
  if(action === 'add') addToCart(id);
  if(action === 'view') openModal(id);
});

// update cart UI on load
updateCartUI();

// ===== Product modal =====
const productModalEl = document.getElementById('productModal');
const productModal = new bootstrap.Modal(productModalEl);
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalAddBtn = document.getElementById('modalAdd');
let modalCurrentId = null;

function openModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  modalImg.src = p.img;
  modalTitle.textContent = p.title;
  modalDesc.textContent = `A lovely ${p.title} — perfect for birthdays, anniversaries and special moments.`;
  modalPrice.textContent = `₹${p.price}`;
  modalCurrentId = p.id;
  productModal.show();
}

modalAddBtn.addEventListener('click', ()=>{
  if(modalCurrentId) addToCart(modalCurrentId);
  productModal.hide();
});

// ===== Header buttons =====
document.getElementById('openShopBtn').addEventListener('click', ()=> document.getElementById('shop').scrollIntoView({behavior:'smooth'}));
document.getElementById('playHero').addEventListener('click', ()=> alert('Hero video demo — replace with your promo video.'));

// ===== Contact form (demo) =====
document.getElementById('contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('cname').value.trim();
  const email = document.getElementById('cemail').value.trim();
  // in a real site, you'd POST this to your server
  alert(`Thanks ${name}! Your message was received (demo). We'll contact you at ${email}.`);
  e.target.reset();
});

// show year
document.getElementById('year').textContent = new Date().getFullYear();
