(function(){
  document.addEventListener('click', (e)=>{
    const trigger = e.target.closest('.accordion__trigger');
    if(!trigger) return;
    const id = trigger.getAttribute('aria-controls');
    const panel = document.getElementById(id);
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));
    if(panel){
      panel.hidden = expanded;
    }
  });
})();