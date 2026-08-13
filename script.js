// Ripple on button clicks and tilt on cards
(function(){
  // Ripple effect for buttons
  function createRipple(e){
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 0.8;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(()=>{ ripple.remove(); }, 650);
  }

  // Attach to existing and future .button elements
  function setupButtons(){
    document.querySelectorAll('.button').forEach(btn => {
      btn.addEventListener('click', createRipple);
    });
  }

  // Card tilt effect
  function handleTilt(e){
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (e.clientX - cx) / (rect.width/2);
    const dy = (e.clientY - cy) / (rect.height/2);
    const rotX = (-dy * 6).toFixed(2);
    const rotY = (dx * 8).toFixed(2);
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
  }

  function resetTilt(e){
    e.currentTarget.style.transform = '';
  }

  function setupCards(){
    document.querySelectorAll('.card').forEach(card => {
      card.classList.add('tilt');
      card.addEventListener('mousemove', handleTilt);
      card.addEventListener('mouseleave', resetTilt);
    });
  }

  // Parallax hero image on scroll
  function heroParallax(){
    const heroImg = document.querySelector('.hero-image img');
    if(!heroImg) return;
    window.addEventListener('scroll', ()=>{
      const top = window.scrollY;
      const shift = Math.min(40, Math.max(-40, top * -0.06));
      heroImg.style.transform = `translateY(${shift}px) translateZ(0) scale(1.004)`;
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    setupButtons();
    setupCards();
    heroParallax();
  });
})();
