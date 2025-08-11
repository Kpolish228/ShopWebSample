(function(){
  // Detect base for links: root "/" or GitHub Pages "/34-5/"
  const REPO_NAME = '34-5';
  const path = window.location.pathname;
  const base = path.startsWith(`/${REPO_NAME}/`) ? `/${REPO_NAME}/` : '/';
  const href = (p)=> (base + p.replace(/^\/+/,'')).replace(/\/+$/,'/') ;

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
        <a data-href="collections/" aria-label="Search">Search</a>
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

  // Assign computed hrefs based on base
  header.querySelectorAll('a[data-href]').forEach(a=>{
    const target = a.getAttribute('data-href') || '';
    a.setAttribute('href', href(target));
  });
  footer.querySelectorAll('a[data-href]').forEach(a=>{
    const target = a.getAttribute('data-href') || '';
    a.setAttribute('href', href(target));
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