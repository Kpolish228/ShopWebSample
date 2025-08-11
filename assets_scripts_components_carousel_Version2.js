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

    goTo(index);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  });
})();