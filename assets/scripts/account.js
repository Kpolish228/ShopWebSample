(function(){
  // Simple client-side account flow with localStorage
  function saveUser(user){ localStorage.setItem('user', JSON.stringify(user)); }
  function getUser(){ try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch{return null} }
  function savePrefs(prefs){ localStorage.setItem('prefs', JSON.stringify(prefs)); }
  function getPrefs(){ try{ return JSON.parse(localStorage.getItem('prefs')||'null') || { theme:'system', newsletter:false }; }catch{return { theme:'system', newsletter:false }} }

  // Cart utils
  function getCart(){ try{ return JSON.parse(localStorage.getItem('cart')||'[]'); }catch{return []} }
  function saveCart(items){
    localStorage.setItem('cart', JSON.stringify(items||[]));
    try{ window.dispatchEvent(new CustomEvent('cart:changed', { detail: { items: items||[] } })); }catch{}
  }
  function addToCart(item){ const items = getCart(); items.push({ ...item, id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()) }); saveCart(items); return items; }
  function removeFromCart(id){ const items = getCart().filter(i=>i.id!==id); saveCart(items); return items; }
  function clearCart(){ saveCart([]); }
  function cartTotal(items){ return (items||getCart()).reduce((s,i)=>s + (Number(i.price)||0) * (Number(i.qty)||1), 0); }

  function onRegisterSubmit(e){
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value.trim();
    if(!name || !email || !password){ alert('Please fill all fields'); return; }
    const user = { name, email, createdAt: Date.now() };
    saveUser(user);
    // go to welcome
    window.location.href = makeUrl('welcome/');
  }
  function onSignInSubmit(e){
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value.trim();
    if(!email || !password){ alert('Please enter email and password'); return; }
    // Demo: if an account exists in localStorage, “authenticate”; otherwise create a lightweight user
    let user = getUser();
    if (!user){
      user = { name: email.split('@')[0], email, createdAt: Date.now() };
      saveUser(user);
    }
    window.location.href = makeUrl('welcome/');
  }

  function onProfileLoad(){
    const user = getUser();
    if(!user){ window.location.href = makeUrl('register/'); return; }
    const $ = (s)=>document.querySelector(s);
    $('#profile-name').textContent = user.name;
    $('#profile-email').textContent = user.email;
    $('#profile-date').textContent = new Date(user.createdAt).toLocaleString();

    // Populate settings form
    const form = document.querySelector('[data-profile-form]');
    if (form){
      const prefs = getPrefs();
      form.name.value = user.name;
      form.email.value = user.email;
      form.theme.value = prefs.theme || 'system';
      form.newsletter.checked = !!prefs.newsletter;
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const updated = { ...user, name: form.name.value.trim(), email: form.email.value.trim() };
        const newPrefs = { theme: form.theme.value, newsletter: form.newsletter.checked };
        if(!updated.name || !updated.email){ alert('Please fill name and email'); return; }
        saveUser(updated);
        savePrefs(newPrefs);
        alert('Saved');
        // Apply theme immediately
        try { localStorage.setItem('theme', newPrefs.theme); } catch {}
        applyTheme(newPrefs.theme);
        $('#profile-name').textContent = updated.name;
        $('#profile-email').textContent = updated.email;
      });

      document.querySelector('[data-delete-account]')?.addEventListener('click', (e)=>{
        e.preventDefault();
        if (!confirm('Delete your account?')) return;
        try{ localStorage.removeItem('user'); localStorage.removeItem('prefs'); }catch{}
        window.location.href = makeUrl('');
      });
    }

  // Render cart in profile
  renderCart();
  }

  function makeUrl(p){
    try {
      const scriptUrl = (document.currentScript && document.currentScript.src) ? new URL(document.currentScript.src) : new URL(window.location.href);
      const root = new URL('../', scriptUrl); // from assets/scripts/account.js -> project root
      const isDir = /\/$/.test(p);
      const url = new URL(p.replace(/^\/+/,'') + (window.location.protocol==='file:' && isDir ? 'index.html' : ''), root);
      return url.href;
    }catch{ return p; }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const regForm = document.querySelector('[data-register-form]');
  if (regForm){ regForm.addEventListener('submit', onRegisterSubmit); return; }
  const signInForm = document.querySelector('[data-signin-form]');
  if (signInForm){ signInForm.addEventListener('submit', onSignInSubmit); return; }
    if (document.body.dataset.page === 'profile'){ onProfileLoad(); }

    // Initialize checkout modal globally
    initCheckoutModal();

    // Wire global buy/add-to-cart actions
    document.addEventListener('click', (e)=>{
      const buyBtn = e.target.closest('[data-buy]');
      const addBtn = e.target.closest('[data-add-to-cart]');
      if(!buyBtn && !addBtn) return;
      e.preventDefault();
      const user = getUser();
      // Gate only the Buy flow; allow adding to cart without auth
      if(buyBtn && !user){
        alert('Вы не зарегистрированы. Чтобы приобрести, пожалуйста зарегистрируйтесь.');
        window.location.href = makeUrl('signin/');
        return;
      }
      const p = getCurrentProduct();
      if (!p){ alert('Товар не найден'); return; }
      addToCart(p);
      if (buyBtn){ openCheckout(); }
      else { notify('Добавлено в корзину'); }
      // Update cart UI if on profile
      if (document.body.dataset.page === 'profile'){ renderCart(); }
    });

    // Handle logout links outside header (e.g., in Profile)
    document.addEventListener('click', (e)=>{
      const logout = e.target.closest('[data-logout]');
      if(!logout) return;
      e.preventDefault();
      try{ localStorage.removeItem('user'); localStorage.removeItem('prefs'); }catch{}
      window.location.href = makeUrl('');
    });
  });

  // Theme helpers
  function applyTheme(theme){
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    if (theme === 'dark') root.setAttribute('data-theme','dark');
    if (theme === 'light') root.setAttribute('data-theme','light');
  }

  // Helpers: product context from PDP
  function getCurrentProduct(){
    const el = document.querySelector('[data-product]');
    if(!el) return null;
    const title = el.getAttribute('data-title') || document.querySelector('.h1, .product-title')?.textContent || 'Product';
    const price = Number(el.getAttribute('data-price')) || Number((document.querySelector('.price')?.textContent||'').replace(/[^0-9.]/g,''));
    const image = el.getAttribute('data-image') || document.querySelector('.carousel__slide.is-active img, .product-card__media img')?.src || '';
    return { title, price, image, qty: 1 };
  }

  // Simple toast
  function notify(msg){
    let n = document.querySelector('#toast');
    if(!n){ n = document.createElement('div'); n.id = 'toast'; n.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 14px;border-radius:999px;z-index:1000;opacity:0;transition:.25s'; document.body.appendChild(n);} 
    n.textContent = msg; n.style.opacity = '1';
    setTimeout(()=>{ n.style.opacity = '0'; }, 1600);
  }

  // Checkout modal
  function initCheckoutModal(){
    if (document.querySelector('.checkout-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
      <div class="checkout-modal__backdrop" data-close></div>
      <div class="checkout-modal__box" role="dialog" aria-modal="true" aria-label="Checkout">
        <form class="form" data-checkout-form>
          <h3 class="h3" style="margin-top:0">Checkout</h3>
          <div class="card" style="padding:12px">
            <strong>Order summary</strong>
            <div id="checkout-summary" class="muted" style="margin-top:6px">—</div>
          </div>
          <label><span>Full name</span><input name="name" placeholder="Name on card" required /></label>
          <label><span>Card number</span><input name="card" inputmode="numeric" placeholder="4242 4242 4242 4242" minlength="12" required /></label>
          <div class="split">
            <label><span>Expiry</span><input name="exp" placeholder="MM/YY" required /></label>
            <label><span>CVC</span><input name="cvc" inputmode="numeric" placeholder="CVC" minlength="3" required /></label>
          </div>
          <label><span>Address</span><input name="addr" placeholder="Street address" required /></label>
          <div class="split">
            <label><span>City</span><input name="city" placeholder="City" required /></label>
            <label><span>Postal code</span><input name="zip" placeholder="ZIP / Postal" required /></label>
          </div>
          <label><span>Country</span><input name="country" placeholder="Country" required /></label>
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            <button class="btn btn--primary" type="submit">Pay now</button>
            <button class="btn" type="button" data-close>Cancel</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e)=>{ if (e.target.closest('[data-close]')) closeCheckout(); });
    modal.querySelector('[data-checkout-form]')?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const items = getCart();
      if(!items.length){ alert('Cart is empty'); return; }
      // Minimal validation
      const fd = new FormData(e.currentTarget);
      for (const k of ['name','card','exp','cvc','addr','city','zip','country']){ if(!(fd.get(k)||'').toString().trim()){ alert('Please fill all fields'); return; } }
      // Simulate success
      alert('Payment successful. Thank you!');
      clearCart();
      closeCheckout();
      window.location.href = makeUrl('profile/');
    });
  }
  function openCheckout(){
    const modal = document.querySelector('.checkout-modal');
    const box = modal?.querySelector('.checkout-modal__box');
    const sum = modal?.querySelector('#checkout-summary');
    const items = getCart();
    if (sum){
      if(!items.length){ sum.textContent = 'Your cart is empty.'; }
      else{
        const lines = items.map(i=>`${i.title} — $${Number(i.price).toFixed(2)}`).join('\n');
        sum.textContent = `${lines}\nTotal: $${cartTotal(items).toFixed(2)}`;
      }
    }
    modal?.classList.add('is-open');
    setTimeout(()=>box?.focus?.(),0);
  }
  function closeCheckout(){ document.querySelector('.checkout-modal')?.classList.remove('is-open'); }

  // Render cart in profile page
  function renderCart(){
    const mount = document.getElementById('cart-list');
    const totalEl = document.getElementById('cart-total');
    const emptyEl = document.getElementById('cart-empty');
    if(!mount) return;
    const items = getCart();
    mount.innerHTML = '';
    if (!items.length){ emptyEl?.removeAttribute('hidden'); totalEl && (totalEl.textContent = '$0.00'); return; }
    emptyEl?.setAttribute('hidden','');
    items.forEach(item=>{
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width:54px;height:54px;object-fit:cover;border-radius:8px;border:1px solid var(--line)"/>` : ''}
          <div>
            <div style="font-weight:600">${item.title}</div>
            <div class="muted">$${Number(item.price).toFixed(2)}</div>
          </div>
        </div>
        <div>
          <a href="#" data-remove-id="${item.id}">Remove</a>
        </div>`;
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.style.padding = '8px 0';
      mount.appendChild(row);
    });
    if (totalEl){ totalEl.textContent = `$${cartTotal(items).toFixed(2)}`; }
    // Remove handlers
    mount.querySelectorAll('[data-remove-id]')?.forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const id = e.currentTarget.getAttribute('data-remove-id');
        removeFromCart(id);
        renderCart();
      });
    });
    // Checkout button
    document.getElementById('cart-checkout')?.addEventListener('click', (e)=>{ 
      e.preventDefault(); 
      const user = getUser();
      if(!user){
        alert('Вы не зарегистрированы. Чтобы оформить покупку, пожалуйста зарегистрируйтесь.');
        window.location.href = makeUrl('signin/');
        return;
      }
      openCheckout(); 
    });
    document.getElementById('cart-clear')?.addEventListener('click', (e)=>{ e.preventDefault(); if(confirm('Clear cart?')){ clearCart(); renderCart(); }});
  }

  // Expose basic APIs for other modules
  try{
    window.CartAPI = { getCart, saveCart, addToCart, removeFromCart, clearCart, cartTotal };
    window.CheckoutAPI = { openCheckout };
  }catch{}

  // Allow other modules to request opening checkout
  window.addEventListener('open-checkout', ()=>{
    const user = getUser();
    if(!user){
      alert('Вы не зарегистрированы. Чтобы оформить покупку, пожалуйста зарегистрируйтесь.');
      window.location.href = makeUrl('signin/');
      return;
    }
    openCheckout();
  });
})();
