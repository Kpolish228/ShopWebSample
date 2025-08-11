(function(){
  function fmt(n){ return `$${Number(n||0).toFixed(2)}`; }
  function getLocal(){ try{ return JSON.parse(localStorage.getItem('cart')||'[]'); }catch{return []} }
  function totalLocal(items){ return (items||[]).reduce((s,i)=>s + (Number(i.price)||0) * (Number(i.qty)||1), 0); }
  function get(){ return (window.CartAPI && window.CartAPI.getCart()) || getLocal(); }

  const root = document.createElement('div');
  root.className = 'mini-cart';
  root.innerHTML = `
    <button class="mini-cart__fab" aria-label="Cart" data-toggle>
      <span class="mini-cart__badge" data-count>0</span>
      🛒
    </button>
    <aside class="mini-cart__panel" aria-hidden="true">
      <header class="mini-cart__header">
        <strong>Cart</strong>
        <button class="mini-cart__close" data-toggle aria-label="Close">×</button>
      </header>
      <div class="mini-cart__body" data-list></div>
      <footer class="mini-cart__footer">
        <div class="mini-cart__total">Total: <span data-total>$0.00</span></div>
        <div class="mini-cart__actions">
          <button class="btn" data-clear>Clear</button>
          <button class="btn btn--primary" data-checkout>Checkout</button>
        </div>
      </footer>
    </aside>`;
  document.body.appendChild(root);

  const panel = root.querySelector('.mini-cart__panel');
  const fab = root.querySelector('.mini-cart__fab');
  const badge = root.querySelector('[data-count]');
  const list = root.querySelector('[data-list]');
  const total = root.querySelector('[data-total]');

  function open(){ panel.classList.add('is-open'); panel.setAttribute('aria-hidden','false'); if(fab) fab.style.display='none'; }
  function close(){ panel.classList.remove('is-open'); panel.setAttribute('aria-hidden','true'); if(fab) fab.style.display=''; }
  function toggle(){ panel.classList.contains('is-open') ? close() : open(); }

  root.addEventListener('click', (e)=>{
    if (e.target.closest('[data-toggle]')){ toggle(); }
  if (e.target.closest('[data-clear]')){
      if (confirm('Clear cart?')){ window.CartAPI?.clearCart?.(); if(!window.CartAPI){ localStorage.setItem('cart','[]'); window.dispatchEvent(new CustomEvent('cart:changed')); } }
    }
    if (e.target.closest('[data-checkout]')){
      window.dispatchEvent(new CustomEvent('open-checkout'));
    }
    const rm = e.target.closest('[data-remove]');
    if (rm){ const id = rm.getAttribute('data-remove'); if(window.CartAPI?.removeFromCart){ window.CartAPI.removeFromCart(id); } else { const items = getLocal().filter(i=>i.id!==id); localStorage.setItem('cart', JSON.stringify(items)); window.dispatchEvent(new CustomEvent('cart:changed')); } }
  });

  function render(){
    const items = get();
    badge.textContent = String(items.length);
    list.innerHTML = '';
    if(!items.length){
      list.innerHTML = '<p class="muted">Your cart is empty.</p>';
      total.textContent = fmt(0);
      return;
    }
    items.forEach(i=>{
      const row = document.createElement('div');
      row.className = 'mini-cart__row';
      row.innerHTML = `
        <div class="mini-cart__item">
          ${i.image ? `<img src="${i.image}" alt="${i.title}" />` : ''}
          <div class="mini-cart__meta">
            <div class="mini-cart__title">${i.title}</div>
            <div class="mini-cart__price">${fmt(i.price)}</div>
          </div>
        </div>
        <a href="#" class="mini-cart__remove" data-remove="${i.id}">Remove</a>`;
      list.appendChild(row);
    });
  total.textContent = fmt((window.CartAPI?.cartTotal && window.CartAPI.cartTotal(items)) || totalLocal(items));
  }

  // Initial render and keep in sync
  render();
  window.addEventListener('cart:changed', render);
})();
