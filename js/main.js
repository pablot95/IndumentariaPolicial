document.addEventListener('DOMContentLoaded', () => {

  const nav = document.querySelector('nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartBtn = document.querySelector('.nav-cart');
  const cartBadge = document.querySelector('.cart-badge');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalEl = document.querySelector('.cart-total strong');
  const toast = document.querySelector('.toast');
  const toastText = toast ? toast.querySelector('span') : null;

  let cart = JSON.parse(localStorage.getItem('policialCart') || '[]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadge) {
      cartBadge.textContent = total;
      if (total > 0) {
        cartBadge.classList.add('visible');
      } else {
        cartBadge.classList.remove('visible');
      }
    }
  }

  function saveCart() {
    localStorage.setItem('policialCart', JSON.stringify(cart));
    updateCartBadge();
  }

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-AR');
  }

  function renderCart() {
    if (!cartItemsContainer) return;
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-empty">El carrito está vacío</div>';
      if (cartTotalEl) cartTotalEl.textContent = '$0';
      return;
    }

    cartItemsContainer.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <img src="${sanitize(item.img)}" alt="${sanitize(item.name)}" loading="lazy">
        <div class="cart-item-info">
          <h4>${sanitize(item.name)}</h4>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-qty">
            <button data-action="minus" data-index="${i}">−</button>
            <span>${item.qty}</span>
            <button data-action="plus" data-index="${i}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-index="${i}">✕</button>
      </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);

    cartItemsContainer.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.target.dataset.index);
        if (e.target.dataset.action === 'plus') {
          cart[idx].qty++;
        } else {
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        saveCart();
        renderCart();
      });
    });

    cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.target.dataset.index);
        cart.splice(idx, 1);
        saveCart();
        renderCart();
      });
    });
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCart();
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  const cartCloseBtn = document.querySelector('.cart-close');
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);

  function showToast(msg) {
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  window.addToCart = function(name, price, img) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, img, qty: 1 });
    }
    saveCart();
    renderCart();
    showToast('Producto agregado al carrito');
  };

  window.buyNow = function(name) {
    const msg = encodeURIComponent(`Hola, quiero comprar: ${name}. ¿Podrían darme más información?`);
    window.open(`https://wa.me/5491100000000?text=${msg}`, '_blank');
  };

  updateCartBadge();

  const cartCheckoutBtn = document.querySelector('.cart-checkout');
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      const items = cart.map(item => `• ${item.name} x${item.qty}`).join('\n');
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const msg = encodeURIComponent(`Hola, quiero realizar la siguiente compra:\n\n${items}\n\nTotal: ${formatPrice(total)}`);
      window.open(`https://wa.me/5491100000000?text=${msg}`, '_blank');
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let started = false;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          let current = 0;
          const step = target / 60;
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            el.textContent = Math.floor(current) + suffix;
          }, 25);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counterObserver.observe(el);
  });

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 18;
      const rotateY = (centerX - x) / 18;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  const filterForm = document.querySelector('.products-filters');
  if (filterForm) {
    const cards = document.querySelectorAll('.product-card[data-category]');
    const countEl = document.getElementById('filtersCount');
    const resetBtn = document.getElementById('filtersReset');

    function applyFilters() {
      const checkedCats = Array.from(filterForm.querySelectorAll('input[name="category"]:checked')).map(i => i.value);
      const priceRange = filterForm.querySelector('input[name="price"]:checked').value;
      const sortVal = filterForm.querySelector('input[name="sort"]:checked').value;

      const cardsArr = Array.from(cards);

      cardsArr.forEach(card => {
        const cat = card.dataset.category;
        const price = parseInt(card.dataset.price);
        let show = true;

        if (checkedCats.length > 0 && !checkedCats.includes(cat)) show = false;

        if (priceRange !== 'all') {
          const [min, max] = priceRange.split('-').map(Number);
          if (price < min || price > max) show = false;
        }

        card.classList.toggle('filter-hidden', !show);
      });

      const visible = cardsArr.filter(c => !c.classList.contains('filter-hidden'));
      if (countEl) countEl.textContent = visible.length + (visible.length === 1 ? ' producto' : ' productos');

      if (sortVal !== 'default') {
        const grid = document.querySelector('.products-grid');
        const sorted = visible.slice().sort((a, b) => {
          const pa = parseInt(a.dataset.price);
          const pb = parseInt(b.dataset.price);
          return sortVal === 'price-asc' ? pa - pb : pb - pa;
        });
        const hidden = cardsArr.filter(c => c.classList.contains('filter-hidden'));
        sorted.forEach(c => grid.appendChild(c));
        hidden.forEach(c => grid.appendChild(c));
      }
    }

    filterForm.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', applyFilters);
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        filterForm.querySelectorAll('input[name="category"]').forEach(i => i.checked = false);
        filterForm.querySelector('input[name="price"][value="all"]').checked = true;
        filterForm.querySelector('input[name="sort"][value="default"]').checked = true;
        applyFilters();
      });
    }
  }

});
