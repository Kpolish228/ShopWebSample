(function(){
  function initCarousel(root){
    const track = root.querySelector('.carousel__track');
    const slides = Array.from(root.querySelectorAll('.carousel__slide'));
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const thumbs = root.parentElement?.querySelectorAll?.('.thumb') || [];
    let index = slides.findIndex(s=>s.classList.contains('is-active'));
    if(index<0) index = 0;

    function goTo(i){
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index*100}%)`;
      slides.forEach((s,idx)=>s.classList.toggle('is-active', idx===index));
      thumbs.forEach((t)=>t.classList.toggle('is-active', Number(t.dataset.goto)===index));
    }
    prev?.addEventListener('click', ()=>goTo(index-1));
    next?.addEventListener('click', ()=>goTo(index+1));
    thumbs.forEach((t)=>t.addEventListener('click', ()=>goTo(Number(t.dataset.goto)||0)));

    // Simple auto-advance (can be removed)
    let timer = setInterval(()=>goTo(index+1), 5000);
    root.addEventListener('mouseenter', ()=>clearInterval(timer));
    root.addEventListener('mouseleave', ()=>timer = setInterval(()=>goTo(index+1), 5000));

    // Touch swipe for mobile
    let startX = 0, startY = 0, isTouching = false, moved = false;
    const threshold = 30; // px
    const onTouchStart = (e)=>{
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX; startY = t.clientY; isTouching = true; moved = false;
      clearInterval(timer);
    };
    const onTouchMove = (e)=>{
      if(!isTouching) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - startX; const dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5){
        // prevent vertical scroll only when horizontal intent detected
        e.preventDefault();
        moved = true;
        // optional: could translate track for live feedback
      }
    };
    const onTouchEnd = ()=>{
      if(!isTouching) return;
      isTouching = false;
      // restart timer
      timer = setInterval(()=>goTo(index+1), 5000);
    };
    const onTouchCancel = ()=>{ isTouching = false; timer = setInterval(()=>goTo(index+1), 5000); };
    const onPointerUp = (e)=>{
      const dx = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - startX;
      const dy = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold){
        if (dx < 0) goTo(index+1); else goTo(index-1);
      }
    };
    // Passive start, active move to allow preventDefault when needed
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', (e)=>{ onPointerUp(e); onTouchEnd(); });
    root.addEventListener('touchcancel', onTouchCancel);

    goTo(index);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  });
})();
