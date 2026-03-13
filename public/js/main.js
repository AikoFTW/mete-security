document.addEventListener('DOMContentLoaded', () => {
  const revealTargets = document.querySelectorAll(
    '.feature-card, .service-card, .about-panel, .crm-section, .hero-card'
  );

  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealTargets.forEach((el) => observer.observe(el));
});
