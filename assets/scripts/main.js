// Utility JS for site-wide small behaviors
(function(){
  // Toggle chips pressed state (non-functional filters)
  document.addEventListener('click', (e)=>{
    const chip = e.target.closest('.chip');
    if(!chip) return;
    const pressed = chip.getAttribute('aria-pressed') === 'true';
    chip.setAttribute('aria-pressed', String(!pressed));
  });

  // Ensure links to folders work when opening via file:// by routing to index.html
  if (window.location.protocol === 'file:'){
    document.addEventListener('click', (e)=>{
      const a = e.target.closest('a[href]');
      if(!a) return;
      // Only transform simple navigations (no download, no target, no modifier keys)
      if (a.target && a.target !== '' && a.target !== '_self') return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try{
        const url = new URL(a.getAttribute('href'), window.location.href);
        if (url.protocol === 'file:' && /\/$/.test(url.pathname)){
          e.preventDefault();
          url.pathname += 'index.html';
          window.location.href = url.href;
        }
      }catch{ /* noop */ }
    });
  }

  // Simple search filtering on collections page using ?q= query
  document.addEventListener('DOMContentLoaded', ()=>{
    const onCollections = /\/collections\//.test(window.location.pathname);
    const grid = document.querySelector('[data-grid]') || document.querySelector('.product-grid');
    const summary = document.getElementById('results-summary');
    const input = document.getElementById('collection-q');
    const sort = document.querySelector('select[data-sort]');

    function getCards(){ return Array.from(grid?.querySelectorAll('.product-card') || []); }
    function normalize(s){ return (s||'').toString().trim().toLowerCase(); }

    function applyFilter(q){
      const query = normalize(q);
      let count = 0;
      getCards().forEach(card=>{
        const titleEl = card.querySelector('.product-card__title');
        const title = normalize(titleEl?.textContent);
        const match = !query || title.includes(query);
        card.style.display = match ? '' : 'none';
        if (titleEl){
          // reset highlight
          const orig = titleEl.getAttribute('data-orig') || titleEl.textContent;
          if (!titleEl.getAttribute('data-orig')) titleEl.setAttribute('data-orig', orig);
          if (query && match){
            const re = new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'ig');
            titleEl.innerHTML = orig.replace(re, '<mark>$1</mark>');
          } else {
            titleEl.innerHTML = orig;
          }
        }
        if (match) count++;
      });
      if (summary){ summary.textContent = query ? `Found ${count} item(s) for “${q}”` : ''; }
      return count;
    }

    function applySort(mode){
      const cards = getCards().map(card=>({
        el: card,
        price: Number(card.getAttribute('data-price')) || parseFloat((card.querySelector('.product-card__price')?.textContent||'').replace(/[^0-9.]/g,'')) || 0,
        title: (card.getAttribute('data-title') || card.querySelector('.product-card__title')?.textContent || '').toString()
      }));
      let sorted = cards;
      if (mode === 'price-asc') sorted = cards.sort((a,b)=>a.price-b.price);
      else if (mode === 'price-desc') sorted = cards.sort((a,b)=>b.price-a.price);
      else if (mode === 'featured') sorted = cards; // keep DOM order
      // Re-append in new order (stable reflow)
      const frag = document.createDocumentFragment();
      sorted.forEach(c=>frag.appendChild(c.el));
      grid?.appendChild(frag);
    }

    // Wire inputs if on collections page
    if (onCollections && grid){
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q')||'';
      if (input){ input.value = q; input.addEventListener('input', (e)=>{ applyFilter(e.currentTarget.value); }); }
      if (q) applyFilter(q);
      sort?.addEventListener('change', ()=>applySort(sort.value));
    }
  });

  // Auto-rotate product card images with crossfade
  document.addEventListener('DOMContentLoaded', ()=>{
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card=>{
      const img = card.querySelector('.product-card__media img');
      if(!img) return;
      const seeds = ['a','b','c','d','e','f'];
      let idx = 0;
      // Prepare overlay image for crossfade
      const overlay = img.cloneNode();
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.objectFit = 'cover';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .6s ease';
      card.querySelector('.product-card__media')?.appendChild(overlay);

      function swap(){
        idx = (idx+1) % seeds.length;
        const url = new URL(img.src);
        // swap the seed to get a new placeholder image deterministically
        const m = url.pathname.match(/\/seed\/([^/]+)/);
        const baseSeed = m ? m[1] : 'p';
        url.pathname = url.pathname.replace(/(\/seed\/)([^/]+)/, `$1${baseSeed}${seeds[idx]}`);
        overlay.src = url.href;
        overlay.onload = ()=>{
          overlay.style.opacity = '1';
          setTimeout(()=>{
            img.src = overlay.src;
            overlay.style.opacity = '0';
          }, 650);
        };
      }
      const timer = setInterval(swap, 2500);
      card.addEventListener('mouseenter', ()=>clearInterval(timer), { once: true });
    });
  });
})();
