document.addEventListener('DOMContentLoaded', () => {
    console.log("Aura Perfumería PRO v2: Iniciando experiencia funcional mejorada...");

    const API_BASE_URL = 'http://localhost:3006/api'; // VERIFICA QUE ESTE PUERTO COINCIDA CON TU BACKEND

    const loadingScreen = document.querySelector('.loading-screen');
    const loaderLogo = document.querySelector('.loader-logo');
    let lenis;

    if (loadingScreen && loaderLogo) {
        gsap.set(document.body, { className: 'loading' });
        const loadingTl = gsap.timeline();
        loadingTl
            .to(loaderLogo, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' })
            .to(loaderLogo, { opacity: 0, scale: 0.8, duration: 0.8, ease: 'power2.in', delay: 0.3 }) // Reducido delay
            .to(loadingScreen, {
                opacity: 0, duration: 0.8, ease: 'power3.inOut', // Más rápido
                onComplete: () => {
                    loadingScreen.style.display = 'none'; // Ocultar completamente
                    gsap.set(document.body, { className: '-=loading' });
                    initializePage();
                }
            });
    } else {
        initializePage();
    }

    async function initializePage() {
        if (window.Lenis) {
            lenis = new Lenis({
                duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), // EaseOutQuart
                smoothTouch: false, touchMultiplier: 1.7,
            });
            function raf(time) { if (lenis) lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
            lenis.on('scroll', () => ScrollTrigger.update());
            gsap.ticker.add((time) => { if (lenis) lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        } else { console.warn("Lenis no está definido."); }

        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        document.body.style.cursor = 'auto';

        setupNavigation(); // Punto 1: Corrección de Navegación
        setupHeaderAnimations();
        Splitting();
        animateSectionTitles();

        await loadAndAnimateDynamicContent();
        setupStaticSectionAnimations();
        setupCart(); // Punto 2: Funcionalidad del Carrito (asegurar que se llame después de que los elementos existan)
        setupSubscriptionForm(); // Punto 3: Formulario de Suscripción

        setTimeout(() => {
            ScrollTrigger.refresh(true); // true para recalcular todo
            if (lenis) lenis.resize();
            console.log("Aura Perfumería PRO v2: ScrollTrigger & Lenis refreshed post-init.");
        }, 500); // Aumentar un poco por si el DOM tarda más con los nuevos productos
    }

    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links .nav-link-item');
        const sections = gsap.utils.toArray('main section[id]'); // Solo secciones dentro de main con ID

        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    if (lenis) {
                        lenis.scrollTo(targetElement, { offset: -80, duration: 1.8, easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t) });
                    } else {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });

        // Corrección para la detección de la sección activa
        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: "top center+=10%", // Se activa cuando el top de la sección pasa un poco más allá del centro
                end: "bottom center-=10%", // Se desactiva cuando el bottom de la sección está un poco antes del centro
                onEnter: () => setActiveNavLink(section.id),
                onEnterBack: () => setActiveNavLink(section.id),
                // onLeave y onLeaveBack podrían ser necesarios si hay solapamiento o secciones muy cortas
                // markers: true, // Descomentar para depurar
            });
        });
        // Caso especial para la primera sección (hero) al cargar
        if (sections.length > 0 && window.scrollY < sections[0].offsetHeight / 2) {
             setActiveNavLink(sections[0].id);
        }
    }

    function setActiveNavLink(sectionId) {
        const navLinks = document.querySelectorAll('.nav-links .nav-link-item');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }


    function setupHeaderAnimations() {
        ScrollTrigger.create({ start: 'top -80', end: 99999, toggleClass: { className: 'scrolled', targets: '.main-header' } });
        const logo = document.querySelector('.logo a');
        if (logo) {
            gsap.from(logo, { autoAlpha: 0, y: -25, duration: 1, delay: 0.2, ease: 'expo.out' });
            logo.addEventListener('mouseenter', () => gsap.to(logo, { y: -2, rotation: -2, duration: 0.2, ease: 'power1.out' }));
            logo.addEventListener('mouseleave', () => gsap.to(logo, { y: 0, rotation: 0, duration: 0.2, ease: 'power1.inOut' }));
        }
    }

    function animateSectionTitles() {
        gsap.utils.toArray('.section-title[data-splitting="chars"]').forEach(title => {
            const chars = title.querySelectorAll('.char');
            if (chars.length > 0) {
                gsap.from(chars, {
                    autoAlpha: 0, yPercent: 110, rotationX: -70, scaleY: 1.5, transformOrigin: "top center",
                    filter: 'blur(3px)', stagger: { each: 0.025, from: "random" },
                    duration: 0.8, ease: 'expo.out',
                    scrollTrigger: { trigger: title, start: 'top 88%' }
                });
            }
        });
         // Hero Title (si tiene data-splitting)
        const heroTitle = document.querySelector('.hero-title[data-splitting="chars"]');
        if (heroTitle) {
            const heroChars = heroTitle.querySelectorAll('.char');
            const heroSubtitle = document.querySelector(".hero-subtitle");
            const heroCta = document.querySelector(".btn-hero-cta");
            const heroTl = gsap.timeline({ delay: (loadingScreen.style.display !== 'none' ? 0.5 : 0.1) }); // Ajustar delay si la loading screen está activa
            if (heroChars.length > 0) {
                heroTl.from(heroChars, {
                    autoAlpha: 0, yPercent: 105, rotationZ: gsap.utils.wrap([-10, 10, -5, 5]), scale: 1.3,
                    stagger: { each: 0.035, from: "start" }, duration: 0.9, ease: "expo.out"
                });
            }
            if(heroSubtitle) heroTl.from(heroSubtitle, { autoAlpha: 0, y: 45, duration: 1.1, ease: "expo.out" }, "-=0.7");
            if(heroCta) heroTl.from(heroCta, { autoAlpha: 0, scale: 0.7, y: 35, duration: 1, ease: "expo.out" }, "-=0.7");
        }
        // Hero Image (siempre se anima después del texto)
        const heroPerfumeImg = document.querySelector(".hero-perfume-img");
        const heroBgText = document.querySelector('.hero-background-text');
        const heroImageTlDelay = (loadingScreen.style.display !== 'none' ? 1.0 : 0.5);

        if(heroPerfumeImg) gsap.from(heroPerfumeImg, {
            autoAlpha: 0, scale: 0.5, rotationZ: -25, rotationY: 40, xPercent: 40,
            transformOrigin: "center 80%", duration: 1.6, ease: "elastic.out(1, 0.45)", delay: heroImageTlDelay
        });
        if (heroBgText) {
             gsap.to(heroBgText, {
                yPercent: -40, scale: 1.1, ease: "none",
                scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1.2 }
            });
        }
    }

    async function loadAndAnimateDynamicContent() {
        await populateCategories();
        await populateFeaturedProducts();

        document.body.addEventListener('click', async function(event) { // Delegación de eventos para CTAs de categoría
            if (event.target.classList.contains('category-cta') || event.target.closest('.category-cta')) {
                event.preventDefault();
                const ctaButton = event.target.closest('.category-cta');
                const categorySlug = ctaButton.dataset.targetCollection;
                const displaySectionId = `collection-${categorySlug}-display`;
                await toggleProductCollectionDisplay(displaySectionId, categorySlug);
            }
            if (event.target.classList.contains('close-collection-btn')) {
                const displaySectionId = event.target.dataset.closeTarget;
                const targetSection = document.getElementById(displaySectionId);
                if (targetSection) {
                    gsap.to(targetSection, {
                        autoAlpha: 0, y: 30, duration: 0.4, ease: 'power2.in',
                        onComplete: () => {
                            targetSection.style.display = 'none';
                            const perfumesGrid = targetSection.querySelector('.perfumes-grid');
                            if (perfumesGrid) perfumesGrid.innerHTML = ''; // Limpiar para recargar la próxima vez
                            ScrollTrigger.refresh();
                        }
                    });
                }
            }
        });
    }

    async function populateCategories() {
        const categoriesGrid = document.querySelector('#categories .categories-grid');
        const loadingMessage = document.getElementById('categories-loading-message');
        if (!categoriesGrid || !loadingMessage) return;

        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) throw new Error(`HTTP error ${response.status} al cargar categorías`);
            const categories = await response.json();
            loadingMessage.style.display = 'none';

            categoriesGrid.innerHTML = categories.map(category => `
                <div class="category-card" data-collection-target="${category.slug}">
                    <div class="category-image-wrapper">
                        <img src="${category.image_url}" alt="${category.name}" loading="lazy">
                    </div>
                    <div class="category-info">
                        <h3>${category.name}</h3>
                        <p class="category-description">${category.description || ''}</p>
                        <button class="btn-link category-cta" data-target-collection="${category.slug}">Descubrir <span class="arrow">&rarr;</span></button>
                    </div>
                </div>
            `).join('');

            const mainElement = document.querySelector('#smooth-content');
            const categoriesSection = document.getElementById('categories');
            let insertAfterElement = categoriesSection;

            categories.forEach(category => {
                if (!document.getElementById(`collection-${category.slug}-display`)) {
                    const displaySection = document.createElement('section');
                    displaySection.className = 'perfume-display-section';
                    displaySection.id = `collection-${category.slug}-display`;
                    displaySection.style.cssText = 'display: none; opacity: 0;'; // Para GSAP
                    displaySection.innerHTML = `
                        <div class="container">
                            <h2 class="section-title-small">${category.name} <button class="close-collection-btn" data-close-target="collection-${category.slug}-display" aria-label="Cerrar colección ${category.name}">&times;</button></h2>
                            <div class="perfumes-grid">
                                <p class="loading-products-message">Cargando perfumes...</p>
                            </div>
                        </div>`;
                    if (insertAfterElement && insertAfterElement.nextSibling) {
                         insertAfterElement.parentNode.insertBefore(displaySection, insertAfterElement.nextSibling);
                    } else if (insertAfterElement) {
                         insertAfterElement.parentNode.appendChild(displaySection);
                    } else {
                         mainElement.appendChild(displaySection);
                    }
                    insertAfterElement = displaySection; // La siguiente se inserta después de esta
                }
            });
            animateCards(categoriesGrid.querySelectorAll('.category-card'), true);
            setupCategoryCardHovers(categoriesGrid.querySelectorAll('.category-card'));
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            loadingMessage.textContent = "Error al cargar colecciones. Intenta más tarde.";
            loadingMessage.classList.add('error-message');
        }
    }

    async function populateFeaturedProducts() {
        const featuredGrid = document.querySelector('#featured .featured-grid');
        const loadingMessage = document.getElementById('featured-loading-message');
        if (!featuredGrid || !loadingMessage) return;

        try {
            const products = await fetch(`${API_BASE_URL}/products`).then(res => {
                if(!res.ok) throw new Error(`HTTP error ${res.status} al cargar productos destacados`);
                return res.json();
            });
            loadingMessage.style.display = 'none';

            const featured = products.filter(p => p.tags && p.tags.toLowerCase().includes('más vendido')).slice(0, 3);
            if (featured.length === 0 && products.length > 0) {
                featured.push(...products.slice(0, Math.min(3, products.length)));
            }

            if (featured.length > 0) {
                featuredGrid.innerHTML = featured.map(createProductCardHTML).join('');
                animateCards(featuredGrid.querySelectorAll('.product-card'));
                setupProductCardHovers(featuredGrid.querySelectorAll('.product-card'));
            } else {
                featuredGrid.innerHTML = "<p class='empty-collection-message'>No hay productos destacados por el momento.</p>";
            }
        } catch (error) {
            console.error("Error al cargar productos destacados:", error);
            loadingMessage.textContent = "Error al cargar productos destacados.";
            loadingMessage.classList.add('error-message');
        }
    }

    function animateCards(cards, areCategoryCards = false) {
        gsap.set(cards, { autoAlpha: 0, y: 70, scale: (areCategoryCards ? 0.9 : 0.92), rotationZ: areCategoryCards ? (i) => i % 2 === 0 ? -3:3 : 0 });
        ScrollTrigger.batch(cards, {
            interval: 0.1,
            batchMax: 3,
            start: "top 90%",
            onEnter: batch => gsap.to(batch, {
                autoAlpha: 1, y: 0, scale: 1, rotationZ:0, stagger: 0.1, duration: 0.9, ease: "power3.out",
                onComplete: () => ScrollTrigger.refresh(true)
            }),
        });
    }

    function setupCategoryCardHovers(cards) { /* ... (código sin cambios de la versión anterior) ... */ }
    function setupProductCardHovers(cards) { /* ... (código sin cambios de la versión anterior, asegurar que use autoAlpha) ... */ }
    function createProductCardHTML(product) { /* ... (código sin cambios, asegurar que las rutas de imagen sean correctas) ... */ }
    
    // Reimplementar setupCategoryCardHovers y setupProductCardHovers usando autoAlpha
    function setupCategoryCardHovers(cards) {
        cards.forEach(card => {
            const imageWrapper = card.querySelector('.category-image-wrapper');
            const img = imageWrapper?.querySelector('img');
            const description = card.querySelector('.category-description');
            const cta = card.querySelector('.category-cta');
            if(img) gsap.set([description, cta], { autoAlpha: 0, y: 15 });

            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -12, scale: 1.02, boxShadow: 'var(--shadow-strong)', duration: 0.35, ease: 'power2.out' });
                if(img) gsap.to(img, { scale: 1.08, duration: 0.45, ease: 'power2.out' });
                if(description) gsap.to(description, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'circ.out' });
                if(cta) gsap.to(cta, { autoAlpha: 1, y: 0, duration: 0.3, delay: 0.05, ease: 'circ.out' });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, scale: 1, boxShadow: 'var(--shadow-light)', duration: 0.35, ease: 'power2.inOut' });
                if(img) gsap.to(img, { scale: 1, duration: 0.45, ease: 'power2.inOut' });
                if(description) gsap.to(description, { autoAlpha: 0, y: 15, duration: 0.3, ease: 'circ.inOut' });
                if(cta) gsap.to(cta, { autoAlpha: 0, y: 15, duration: 0.3, ease: 'circ.inOut' });
            });
        });
    }

    function setupProductCardHovers(cards) {
        cards.forEach(card => {
            const image = card.querySelector('.product-image-wrapper img');
            const button = card.querySelector('.btn-add-to-cart');
            if(image) gsap.set(button, { autoAlpha: 0, y: 20, scale: 0.85 });

            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -10, boxShadow: 'var(--shadow-medium)', duration: 0.3, ease: 'power2.out' });
                if(image) gsap.to(image, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
                if(button) gsap.to(button, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.6)' });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, boxShadow: 'var(--shadow-light)', duration: 0.3, ease: 'power2.inOut' });
                if(image) gsap.to(image, { scale: 1, duration: 0.3, ease: 'power2.inOut' });
                if(button) gsap.to(button, { autoAlpha: 0, y: 20, scale: 0.85, duration: 0.25, ease: 'power1.in' });
            });
        });
    }
    
    function createProductCardHTML(product) {
        const imageUrl = product.image_url.startsWith('http') ? product.image_url : `${product.image_url}`;
        return `
            <div class="product-card" data-product-internal-id="${product.id}">
                <div class="product-image-wrapper">
                    <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                    ${product.tags && product.tags.toLowerCase().includes('nuevo') ? '<span class="product-tag new">Nuevo</span>' : ''}
                    ${product.tags && product.tags.toLowerCase().includes('más vendido') ? '<span class="product-tag bestseller">Más Vendido</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">${product.brand || 'Aura Collection'}</p>
                    <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
                    <button class="btn btn-secondary btn-add-to-cart" data-product-id="${product.sku || product.id}" data-product-name="${product.name}" data-product-price="${product.price}" data-product-image="${imageUrl}">Añadir al Carrito</button>
                </div>
            </div>
        `;
    }


    async function toggleProductCollectionDisplay(displaySectionId, categorySlug) {
        const targetSection = document.getElementById(displaySectionId);
        if (!targetSection) { console.error("Sección de display no encontrada:", displaySectionId); return; }

        const perfumesGrid = targetSection.querySelector('.perfumes-grid');
        const isOpenAndPopulated = targetSection.style.display === 'block' && targetSection.style.opacity === '1' && perfumesGrid.children.length > 1; // Más de 1 para no contar el mensaje de carga

        // Ocultar todas las otras colecciones abiertas
        document.querySelectorAll('.perfume-display-section.is-open').forEach(s => {
            if (s.id !== displaySectionId) {
                s.classList.remove('is-open');
                gsap.to(s, { autoAlpha: 0, y: 30, duration: 0.4, onComplete: () => {
                    s.style.display = 'none';
                    const grid = s.querySelector('.perfumes-grid');
                    if(grid) grid.innerHTML = '<p class="loading-products-message">Cargando perfumes...</p>'; // Resetear
                }});
            }
        });

        if (isOpenAndPopulated) { // Si ya está abierta Y poblada, la cerramos
             gsap.to(targetSection, { autoAlpha: 0, y: 30, duration: 0.4, onComplete: () => {
                targetSection.style.display = 'none';
                targetSection.classList.remove('is-open');
                // No limpiar el grid aquí, para que si se reabre rápido no tenga que recargar
                // perfumesGrid.innerHTML = '<p class="loading-products-message">Cargando perfumes...</p>';
                ScrollTrigger.refresh(true);
            }});
        } else { // Abrir o repoblar
            perfumesGrid.innerHTML = '<p class="loading-products-message">Cargando perfumes...</p>';
            targetSection.style.display = 'block'; // Hacer visible para GSAP
            targetSection.classList.add('is-open');
            gsap.set(targetSection, {autoAlpha:0, y:30});

            try {
                const response = await fetch(`${API_BASE_URL}/products/category/${categorySlug}`);
                if (!response.ok) throw new Error(`HTTP Error ${response.status} al cargar productos para ${categorySlug}`);
                const products = await response.json();

                if (products.length > 0) {
                    perfumesGrid.innerHTML = products.map(createProductCardHTML).join('');
                    setupProductCardHovers(perfumesGrid.querySelectorAll('.product-card'));
                } else {
                    perfumesGrid.innerHTML = '<p class="empty-collection-message">No hay perfumes en esta colección por el momento.</p>';
                }

                gsap.to(targetSection, {
                    autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out',
                    onComplete: () => {
                        if (lenis) lenis.scrollTo(targetSection, { offset: -100, duration: 1.2 }); // Ajustar offset
                        const productsInCollection = perfumesGrid.querySelectorAll('.product-card');
                        if (productsInCollection.length > 0) {
                            gsap.set(productsInCollection, {autoAlpha:0, y:50, scale:0.9});
                            gsap.to(productsInCollection, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.07, duration: 0.5, ease: 'power2.out', delay:0.1, onComplete: ()=> ScrollTrigger.refresh(true) });
                        } else {
                            ScrollTrigger.refresh(true);
                        }
                    }
                });
            } catch (error) {
                console.error(`Error al cargar productos para ${categorySlug}:`, error);
                perfumesGrid.innerHTML = '<p class="error-message">Error al cargar perfumes. Intenta de nuevo.</p>';
                gsap.to(targetSection, {autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh(true)});
            }
        }
    }

    // --- Lógica del Carrito de Compras ---
    // Punto 2: Modal del Carrito completamente funcional
    let cart = JSON.parse(localStorage.getItem('auraCartV2')) || []; // Nueva key para evitar conflictos
    const cartIconBtn = document.querySelector('.header-actions .cart-btn');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');
    const cartCountElement = document.querySelector('.cart-count');

    function saveCart() { localStorage.setItem('auraCartV2', JSON.stringify(cart)); }
    function updateCartCount() { /* ... (código sin cambios de la versión anterior) ... */ }
    function renderCartItems() { /* ... (código sin cambios de la versión anterior) ... */ }
    function handleCartAction(event) { /* ... (código sin cambios de la versión anterior) ... */ }
    function showCartNotification(productName) { /* ... (código sin cambios de la versión anterior, usa autoAlpha) ... */ }
    
    // Reimplementar funciones de carrito sin cambios significativos en lógica, solo asegurar selectores y clases.
    function updateCartCount() {
        if (!cartCountElement) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        if (totalItems > 0 && document.body.contains(cartCountElement)) { // Check if element is in DOM
            gsap.fromTo(cartCountElement, { scale: 1.4, autoAlpha: 0.7 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out' });
        }
    }

    function renderCartItems() {
        if (!cartItemsContainer || !cartTotalElement) return;
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
            cartTotalElement.textContent = 'Total: $0.00';
            if(checkoutWhatsappBtn) {
                checkoutWhatsappBtn.disabled = true;
                gsap.to(checkoutWhatsappBtn, {opacity:0.5, duration:0.2});
            }
            return;
        }
        if(checkoutWhatsappBtn){
             checkoutWhatsappBtn.disabled = false;
             gsap.to(checkoutWhatsappBtn, {opacity:1, duration:0.2});
        }

        let total = 0;
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Precio: $${parseFloat(item.price).toFixed(2)}</p>
                    <p class="quantity-control">Cantidad:
                        <button class="quantity-btn decrease-qty" data-item-id="${item.id}" aria-label="Disminuir cantidad de ${item.name}">-</button>
                        <input type="number" class="item-quantity-input" data-item-id="${item.id}" value="${item.quantity}" min="1" max="10" readonly aria-label="Cantidad de ${item.name}">
                        <button class="quantity-btn increase-qty" data-item-id="${item.id}" aria-label="Aumentar cantidad de ${item.name}">+</button>
                    </p>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item-btn" data-item-id="${item.id}" title="Quitar ${item.name} del carrito" aria-label="Quitar ${item.name} del carrito">&times;</button>
                </div>`;
            cartItemsContainer.appendChild(itemElement);
            total += parseFloat(item.price) * item.quantity;
        });
        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
    }
    
    function handleCartAction(event) {
        const target = event.target;
        const itemId = target.dataset.itemId;

        if (target.classList.contains('quantity-btn') || target.classList.contains('remove-item-btn')) {
            if (!itemId) return;
            const itemInCart = cart.find(item => item.id === itemId);
            if (!itemInCart) return;

            if (target.classList.contains('increase-qty')) {
                if (itemInCart.quantity < 10) itemInCart.quantity++;
            } else if (target.classList.contains('decrease-qty')) {
                if (itemInCart.quantity > 1) itemInCart.quantity--;
                else cart = cart.filter(item => item.id !== itemId);
            } else if (target.classList.contains('remove-item-btn')) {
                cart = cart.filter(item => item.id !== itemId);
            }
            saveCart();
            renderCartItems();
            updateCartCount();
        }
    }
     if (cartItemsContainer) cartItemsContainer.addEventListener('click', handleCartAction);


    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-add-to-cart')) {
            const button = event.target;
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            const productImage = button.dataset.productImage;

            if (!productId || !productName || isNaN(productPrice) || !productImage) {
                console.error("Datos del producto incompletos en el botón:", button.dataset);
                showCartNotification("Error al añadir producto", true);
                return;
            }

            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                if (existingItem.quantity < 10) {
                    existingItem.quantity++;
                    showCartNotification(`${productName} (+1) añadido`);
                } else {
                    alert("No puedes añadir más de 10 unidades del mismo perfume.");
                     showCartNotification(`Límite alcanzado para ${productName}`, true);
                }
            } else {
                cart.push({ id: productId, name: productName, price: productPrice, quantity: 1, image: productImage });
                showCartNotification(`${productName} añadido al carrito`);
            }
            saveCart();
            updateCartCount();
        }
    });

    function showCartNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        if(isError) notification.classList.add('error');
        notification.textContent = message;
        document.body.appendChild(notification);
        gsap.fromTo(notification,
            { y: 50, autoAlpha: 0, scale: 0.8 },
            { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)',
              onComplete: () => gsap.to(notification, { autoAlpha: 0, y: -30, duration: 0.4, delay: isError ? 2.5 : 1.5, onComplete: () => notification.remove() })
            }
        );
    }

    function setupCart() {
        updateCartCount();
        if (cartIconBtn) cartIconBtn.addEventListener('click', openCartModal);
        if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);
        if (cartModal) cartModal.addEventListener('click', (event) => { if (event.target === cartModal) closeCartModal(); });
        if (checkoutWhatsappBtn) checkoutWhatsappBtn.addEventListener('click', handleWhatsAppCheckout);
    }

    function openCartModal() {
        renderCartItems();
        cartModal.classList.add('is-open'); // Controla display y pointer-events via CSS
        gsap.to(cartModal, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo(cartModal.querySelector('.cart-modal-content'),
            { scale: 0.9, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.4, delay: 0.05, ease: 'back.out(1.4)' }
        );
        if (lenis) lenis.stop();
        document.body.classList.add('modal-open');
    }

    function closeCartModal() {
        gsap.to(cartModal.querySelector('.cart-modal-content'), { scale: 0.9, autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
        gsap.to(cartModal, {
            autoAlpha: 0, duration: 0.4, delay: 0.05, ease: 'power2.in',
            onComplete: () => {
                cartModal.classList.remove('is-open');
                if (lenis) lenis.start();
                document.body.classList.remove('modal-open');
            }
        });
    }

    function handleWhatsAppCheckout() { /* ... (código sin cambios de la versión anterior) ... */ }
    function handleWhatsAppCheckout() {
        if (cart.length === 0) { alert("Tu carrito está vacío."); return; }
        let message = "¡Hola Aura Perfumería! ✨ Estoy interesado/a en el siguiente pedido:\n\n";
        let totalAmount = 0;
        cart.forEach(item => {
            message += `* ${item.name}\n`;
            message += `  SKU: ${item.id}\n`;
            message += `  Cantidad: ${item.quantity}\n`;
            message += `  Precio Unit.: $${item.price.toFixed(2)}\n`;
            message += `  Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
            totalAmount += item.price * item.quantity;
        });
        message += `*TOTAL DEL PEDIDO: $${totalAmount.toFixed(2)}*\n\n`;
        message += "Agradezco me contacten para coordinar el pago y envío. ¡Muchas gracias! 😊";

        const whatsappNumber = "573001234567"; // REEMPLAZA ESTO
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }


    // --- Formulario de Suscripción ---
    // Punto 3: Funcionalidad de Suscripción
    function setupSubscriptionForm() {
        const subscribeForm = document.getElementById('subscribeForm');
        const subscribeEmailInput = document.getElementById('subscribeEmail');
        const subscribeButton = document.getElementById('subscribeButton');
        const subscribeMessageEl = document.getElementById('subscribeMessage'); // Renombrado para evitar conflicto

        if (subscribeForm && subscribeEmailInput && subscribeButton && subscribeMessageEl) {
            subscribeForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                const email = subscribeEmailInput.value.trim();
                subscribeButton.disabled = true;
                subscribeButton.textContent = 'Enviando...';
                subscribeMessageEl.textContent = '';
                subscribeMessageEl.className = 'subscribe-message'; // Resetear clases

                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    subscribeMessageEl.textContent = 'Por favor, ingresa un correo válido.';
                    subscribeMessageEl.classList.add('error');
                    subscribeButton.disabled = false;
                    subscribeButton.textContent = 'Suscribirme';
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/subscribe`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email }),
                    });
                    const result = await response.json(); // Siempre intentar parsear JSON

                    if (response.ok && result.success) {
                        subscribeMessageEl.textContent = result.message;
                        subscribeMessageEl.classList.add('success');
                        subscribeEmailInput.value = '';
                    } else {
                        subscribeMessageEl.textContent = result.message || 'Error en la suscripción. Intenta más tarde.';
                        subscribeMessageEl.classList.add('error');
                    }
                } catch (error) {
                    console.error('Error en el fetch de suscripción:', error);
                    subscribeMessageEl.textContent = 'Error de conexión. Intenta más tarde.';
                    subscribeMessageEl.classList.add('error');
                } finally {
                    subscribeButton.disabled = false;
                    subscribeButton.textContent = 'Suscribirme';
                }
            });
        }
    }

    // --- Animaciones de Secciones Estáticas (Filosofía, Parallax, Scroll Horizontal, Contacto) ---
    function setupStaticSectionAnimations() {
        // Filosofía
        const philosophyTextElements = document.querySelectorAll(".philosophy-text > p");
        const philosophyCta = document.querySelector(".btn-philosophy-cta");
        const philosophyImage = document.querySelector(".philosophy-main-image");
        if (philosophyTextElements.length) gsap.from(philosophyTextElements, { scrollTrigger: { trigger: ".philosophy-text", start: "top 85%" }, autoAlpha: 0, x: -50, duration: 1, stagger: 0.15, ease: "circ.out" });
        if (philosophyCta) gsap.from(philosophyCta, { scrollTrigger: { trigger: philosophyCta, start: "top 90%" }, autoAlpha: 0, scale:0.75, y:25, duration:0.8, ease: "back.out(1.5)" });
        if (philosophyImage) gsap.fromTo(philosophyImage, { autoAlpha: 0, scale: 0.8, rotationY: 45, rotationX:5, transformOrigin: "center 70%", filter: 'brightness(0.5) contrast(1.1)' }, { autoAlpha: 1, scale: 1, rotationY: 0, rotationX:0, filter: 'brightness(1) contrast(1)', duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: ".philosophy-image-wrapper", start: 'top 80%' } });

        // Parallax
        const parallaxBg = document.querySelector('.parallax-bg');
        if (parallaxBg && parallaxBg.dataset.bgSrc) {
            parallaxBg.style.backgroundImage = `url(${parallaxBg.dataset.bgSrc})`;
            gsap.to(parallaxBg, { backgroundPosition: "50% 160%", scale: 1.15, ease: "none", scrollTrigger: { trigger: ".parallax-section", start: "top bottom", end: "bottom top", scrub: 0.8 }});
        }
        const parallaxQuoteChars = document.querySelectorAll('.parallax-content h3 .char');
        if (parallaxQuoteChars.length) gsap.from(parallaxQuoteChars, { autoAlpha: 0, yPercent: gsap.utils.wrap([-70, 70, -50, 50]), scale: gsap.utils.wrap([0.7, 1.3, 0.9, 1.1]), filter: 'blur(2.5px)', rotationZ: gsap.utils.random(-25, 25, 4), stagger: { each: 0.025, from: "center" }, duration: 0.7, ease: 'power2.inOut', scrollTrigger: { trigger: ".parallax-content", start: 'top 78%' }});

        // Scroll Horizontal
        const horizontalSection = document.querySelector('.horizontal-scroll-section');
        const pinWrapper = document.querySelector('.pin-wrapper');
        const horizontalPanelsContainer = document.querySelector('.horizontal-panel-container');
        const horizontalPanels = gsap.utils.toArray(".horizontal-panel");

        if (horizontalSection && pinWrapper && horizontalPanelsContainer && horizontalPanels.length > 0) {
            let currentPanelColor = gsap.getProperty(horizontalPanels[0] || pinWrapper, "backgroundColor");
            const stHorizontal = gsap.to(horizontalPanelsContainer, {
                x: () => -(horizontalPanelsContainer.scrollWidth - window.innerWidth + 2), // +2 para asegurar que el último panel llegue bien
                ease: "none", // El scrub se encarga de la suavidad
                scrollTrigger: {
                    id: "horizontalScrollMain", trigger: pinWrapper, pin: true, scrub: 1.2,
                    start: "top top", end: () => `+=${horizontalPanelsContainer.scrollWidth - window.innerWidth}`,
                    invalidateOnRefresh: true,
                    onUpdate: self => {
                        let panelIndex = Math.min(horizontalPanels.length - 1, Math.max(0, Math.floor(self.progress * horizontalPanels.length * 0.999))); // 0.999 para evitar desbordamiento al final
                        let targetPanel = horizontalPanels[panelIndex];
                        if (targetPanel) {
                            let targetColor = gsap.getProperty(targetPanel, "backgroundColor");
                            if (targetColor && targetColor !== currentPanelColor) {
                                gsap.to(pinWrapper, { backgroundColor: targetColor, duration: 0.4, ease: "power1.inOut" });
                                currentPanelColor = targetColor;
                            }
                        }
                    },
                }
            });

            horizontalPanels.forEach((panel, i) => {
                const panelImage = panel.querySelector('img');
                const panelText = panel.querySelector('p');
                gsap.from([panelImage, panelText], {
                    y: 60, autoAlpha: 0, scale: 0.95,
                    stagger: 0.1,
                    ease: 'power2.out',
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: panel,
                        containerAnimation: stHorizontal,
                        start: 'left 80%', // Cuando el panel entra por la izquierda
                        toggleActions: 'play none none reverse', // Para que se revierta si se scrollea hacia atrás
                        // markers: {startColor: "purple", endColor: "fuchsia", indent: 200 + i * 10},
                    }
                });
            });
        }

        // Contacto (Formulario de suscripción ya manejado en setupSubscriptionForm)
        const contactFormAnimationElements = document.querySelectorAll(".contact-subtitle, .contact-form");
         gsap.from(contactFormAnimationElements, {
            scrollTrigger: { trigger: ".contact-section", start: "top 80%" },
            autoAlpha: 0, y: 35, duration: 0.8, ease: 'power2.out', stagger: 0.2
        });
    }

    // Footer (Microinteracciones sin cambios de la versión anterior)
    // Asegurar que el año se actualice
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

}); // Fin DOMContentLoaded