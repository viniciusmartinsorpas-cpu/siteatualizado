const postsGrid = document.querySelector('[data-posts-grid]');
const toast = document.querySelector('[data-toast]');
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImg = document.querySelector('[data-lightbox-img]');
const lightboxTitle = document.querySelector('[data-lightbox-title]');
const closeLightbox = document.querySelector('[data-lightbox-close]');

const showToast = (message = 'Feito ✨') => {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
};

const nl2brText = (text = '') => text;

function renderPosts(filter = 'all') {
  const posts = window.FLOREZTA_POSTS || [];
  const filtered = filter === 'all' ? posts : posts.filter(post => post.type === filter);
  postsGrid.innerHTML = filtered.map((post, index) => {
    const media = post.type === 'carousel'
      ? `<div class="post-media carousel" data-carousel data-post-title="${escapeHtml(post.title)}">
          <div class="carousel-track">
            ${post.images.map((src, imageIndex) => `
              <button class="carousel-slide" type="button" data-open-image="${src}" data-title="${escapeHtml(post.title)} — imagem ${imageIndex + 1}">
                <img src="${src}" alt="${escapeHtml(post.title)} - imagem ${imageIndex + 1}" loading="lazy" />
              </button>
            `).join('')}
          </div>
          <button class="carousel-btn prev" type="button" data-prev aria-label="Imagem anterior">‹</button>
          <button class="carousel-btn next" type="button" data-next aria-label="Próxima imagem">›</button>
          <div class="dots">
            ${post.images.map((_, dotIndex) => `<button class="dot ${dotIndex === 0 ? 'active' : ''}" type="button" data-dot="${dotIndex}" aria-label="Ir para imagem ${dotIndex + 1}"></button>`).join('')}
          </div>
        </div>`
      : `<button class="post-media single-media" type="button" data-open-image="${post.images[0]}" data-title="${escapeHtml(post.title)}">
          <img src="${post.images[0]}" alt="${escapeHtml(post.title)}" loading="lazy" />
        </button>`;

    return `
      <article class="post-card reveal visible" data-type="${post.type}" style="transition-delay:${Math.min(index * 35, 260)}ms">
        ${media}
        <div class="post-body">
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.subtitle || '')}</p>
        </div>
      </article>
    `;
  }).join('');

  initCarousels();
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    const dots = [...carousel.querySelectorAll('[data-dot]')];
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    let current = 0;
    let timer;

    const goTo = index => {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === current));
    };
    const start = () => {
      stop();
      timer = setInterval(() => goTo(current + 1), 4400);
    };
    const stop = () => clearInterval(timer);

    prev.addEventListener('click', event => { event.stopPropagation(); goTo(current - 1); start(); });
    next.addEventListener('click', event => { event.stopPropagation(); goTo(current + 1); start(); });
    dots.forEach(dot => dot.addEventListener('click', event => { event.stopPropagation(); goTo(Number(dot.dataset.dot)); start(); }));
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  });
}

function openImage(src, title) {
  lightboxImg.src = src;
  lightboxImg.alt = title || 'Imagem ampliada';
  lightboxTitle.textContent = title || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}
function closeImage() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
}

renderPosts();

// Filtros dos posts
const filterButtons = [...document.querySelectorAll('[data-filter]')];
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderPosts(button.dataset.filter);
  });
});

// Delegação de eventos para abrir imagem
document.addEventListener('click', async event => {
  const imageTrigger = event.target.closest('[data-open-image]');
  if (imageTrigger) {
    openImage(imageTrigger.dataset.openImage, imageTrigger.dataset.title);
  }
});

closeLightbox.addEventListener('click', closeImage);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeImage(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeImage(); });

// Header e menu mobile
const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 30));
menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  document.body.classList.toggle('menu-open', nav.classList.contains('open'));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
}));

// Animações de entrada
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.13 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

// Formulários redirecionando para o WhatsApp
const forms = document.querySelectorAll('[data-form]');
forms.forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(form);
    const nome = formData.get('nome');
    const email = formData.get('email');
    const formType = form.dataset.form;

    // ⚠️ Substitua pelo número de telefone real (com DDI 55 e DDD)
    const numeroWhatsApp = '551123686194'; 
    let texto = '';

    if (formType === 'contato') {
        const mensagem = formData.get('mensagem');
        texto = `Oi, Florezta! Meu nome é ${nome} (${email}).\n\nMinha necessidade: ${mensagem}`;
    } else if (formType === 'trabalhe') {
        const area = formData.get('area');
        texto = `Oi, Florezta! Meu nome é ${nome} (${email}).\n\nTenho interesse em fazer parte do ecossistema na área de: ${area}`;
    }

    const link = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
    
    // Abre o WhatsApp em uma nova aba
    window.open(link, '_blank');

    form.reset();
    showToast('Redirecionando para o WhatsApp... ✨');
  });
});

// Glow suave seguindo o mouse
window.addEventListener('pointermove', event => {
  document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
});