(function(){
  // Compute project root based on this script's URL so it works with file:// and http(s)
  const scriptUrl = (document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src)
    : new URL(window.location.href);
  const projectRoot = new URL('../../../', scriptUrl); // from assets/scripts/components/ up to project root
  function makeHref(p){
    const clean = (p||'').replace(/^\/+/,'');
    const isDir = clean === '' || clean.endsWith('/');
    if (projectRoot.protocol === 'file:'){
      // file:// requires explicit file, navigate to index.html for directory-like paths
      return new URL(isDir ? (clean + 'index.html') : clean, projectRoot).href;
    }
    return new URL(clean, projectRoot).href;
  }

  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="announce">
      Complimentary shipping on demo orders — design prototype only
    </div>
    <div class="container nav" role="navigation" aria-label="Primary">
      <div class="nav__left">
        <button class="nav__toggle" aria-expanded="false" aria-controls="mobile-drawer" aria-label="Open menu">☰</button>
        <a class="logo" data-href="">Northward Collection</a>
      </div>
      <nav class="nav__menu" aria-label="Primary menu">
        <a data-href="collections/">Shop</a>
        <a data-href="collections/">Collections</a>
        <a data-href="about/">About</a>
        <a data-href="contact/">Contact</a>
      </nav>
      <div class="nav__right">
        <a href="#" aria-label="Search" data-search>Search</a>
      </div>
    </div>
    <aside id="mobile-drawer" class="drawer" aria-hidden="true">
      <a data-href="collections/">Shop</a>
      <a data-href="collections/">Collections</a>
      <a data-href="about/">About</a>
      <a data-href="contact/">Contact</a>
    </aside>
    <div class="drawer__backdrop" data-backdrop></div>
  `;

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container footer__grid">
      <div>
        <div class="logo">Northward Collection</div>
        <p class="muted">Design-first, content-placeholder storefront prototype.</p>
      </div>
      <div class="footer__cols">
        <strong>Shop</strong>
        <a data-href="collections/">New Arrivals</a>
        <a data-href="collections/">Best Sellers</a>
        <a data-href="collections/">Essentials</a>
      </div>
      <div class="footer__cols">
        <strong>About</strong>
        <a data-href="about/">Our Story</a>
        <a data-href="contact/">Contact</a>
        <a data-href="404.html">404</a>
      </div>
    </div>
    <div class="container" style="margin-top:16px">
      <small>&copy; <span id="year"></span> Northward Collection. Design prototype.</small>
    </div>
  `;

  const headerMount = document.getElementById('site-header');
  const footerMount = document.getElementById('site-footer');
  if (headerMount) headerMount.replaceWith(header);
  if (footerMount) footerMount.replaceWith(footer);

  // Apply saved theme on every page
  try{
    const prefs = JSON.parse(localStorage.getItem('prefs')||'null');
    const theme = (prefs && prefs.theme) || localStorage.getItem('theme') || 'system';
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    if (theme === 'dark') root.setAttribute('data-theme','dark');
    if (theme === 'light') root.setAttribute('data-theme','light');
  }catch{}

  // Assign computed hrefs based on base
  header.querySelectorAll('a[data-href]').forEach(a=>{
    const target = a.getAttribute('data-href') || '';
    a.setAttribute('href', makeHref(target));
  });
  footer.querySelectorAll('a[data-href]').forEach(a=>{
    const target = a.getAttribute('data-href') || '';
    a.setAttribute('href', makeHref(target));
  });

  // Account-aware nav (Register/Profile/Logout)
  try{
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const right = header.querySelector('.nav__right');
  if (right){
      right.innerHTML = '';
  const search = document.createElement('a');
  search.href = '#';
  search.setAttribute('data-search','');
  search.textContent = 'Search';
  right.appendChild(search);
      if (user){
        const profile = document.createElement('a');
        profile.setAttribute('data-href','profile/');
        profile.textContent = 'Profile';
        right.appendChild(profile);
        const logout = document.createElement('a');
        logout.href = '#';
        logout.setAttribute('data-logout','');
        logout.textContent = 'Logout';
        right.appendChild(logout);
      } else {
        // Compact auth links: "Sign in / Log in"
        const auth = document.createElement('span');
        auth.className = 'auth-links';
        auth.innerHTML = `
          <a data-href="signin/">Sign in</a>
          <span class="slash">/</span>
          <a data-href="signin/">Log in</a>
        `;
        right.appendChild(auth);
      }
  // Update hrefs for newly added links (except the search modal trigger)
      right.querySelectorAll('a[data-href]').forEach(a=>{
        const target = a.getAttribute('data-href') || '';
        a.setAttribute('href', makeHref(target));
      });
    }

    header.addEventListener('click', (e)=>{
      const link = e.target.closest('[data-logout]');
      if(!link) return;
      e.preventDefault();
      try{ localStorage.removeItem('user'); }catch{ }
      window.location.href = makeHref('');
    });
  }catch{ /* ignore */ }

  // Simple search modal
  const modal = document.createElement('div');
  modal.className = 'search-modal';
  modal.innerHTML = `
    <div class="search-modal__backdrop" data-close></div>
    <div class="search-modal__box" role="dialog" aria-modal="true" aria-label="Search">
      <form class="search-modal__form" data-search-form>
        <input type="search" name="q" placeholder="Search products..." aria-label="Search" autofocus />
        <button class="btn btn--primary" type="submit">Search</button>
        <button class="btn" type="button" data-close>Close</button>
      </form>
    </div>`;
  document.body.appendChild(modal);
  function openSearch(){ modal.classList.add('is-open'); const inp = modal.querySelector('input[name="q"]'); setTimeout(()=>inp?.focus(), 0); }
  function closeSearch(){ modal.classList.remove('is-open'); }
  header.addEventListener('click', (e)=>{
    const trigger = e.target.closest('[data-search]');
    if(!trigger) return;
    e.preventDefault();
    openSearch();
  });
  modal.addEventListener('click', (e)=>{ if(e.target.closest('[data-close]')) closeSearch(); });
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeSearch(); });
  modal.querySelector('[data-search-form]')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    const url = new URL(makeHref('collections/'));
    if(q) url.searchParams.set('q', String(q));
    window.location.href = url.href;
  });

  // Footer year
  const y = footer.querySelector('#year');
  if (y) y.textContent = new Date().getFullYear();

  // Drawer behavior
  const toggle = header.querySelector('.nav__toggle');
  const drawer = header.querySelector('.drawer');
  const backdrop = header.querySelector('[data-backdrop]');
  function openDrawer(){
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    toggle.setAttribute('aria-expanded','true');
  }
  function closeDrawer(){
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    toggle.setAttribute('aria-expanded','false');
  }
  toggle?.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeDrawer() : openDrawer();
  });
  backdrop?.addEventListener('click', closeDrawer);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });
})();
