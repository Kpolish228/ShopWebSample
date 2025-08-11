// Utility JS for site-wide small behaviors
(function(){
  // Toggle chips pressed state (non-functional filters)
  document.addEventListener('click', (e)=>{
    const chip = e.target.closest('.chip');
    if(!chip) return;
    const pressed = chip.getAttribute('aria-pressed') === 'true';
    chip.setAttribute('aria-pressed', String(!pressed));
  });
})();