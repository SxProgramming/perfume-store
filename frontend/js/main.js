document.addEventListener('DOMContentLoaded', () => {
    console.log("Aura Perfumería PRO: Iniciando experiencia funcional...");

    const API_BASE_URL = 'http://localhost:3006/api'; // Asegúrate que coincida con tu backend

    // --- Pantalla de Carga ---
    const loadingScreen = document.querySelector('.loading-screen');
    const loaderLogo = document.querySelector('.loader-logo');
    let lenis; // Declarar Lenis aquí para que esté disponible en el onComplete de la carga

    if (loadingScreen && loaderLogo) {
        gsap.set(document.body, { className: 'loading' });

        const loadingTl = gsap.timeline();
        loadingTl
            .to(loaderLogo, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' })
            .to(loaderLogo, { opacity: 0, scale: 0.8, duration: 0.8, ease: 'power2.in', delay: 0.5 })
            .to(loadingScreen, {
                opacity: 0, duration: 1, ease: 'power3.inOut',
                onComplete: () => {
                    loadingScreen.classList.add('hidden');
                    gsap.set(document.body, { className: '-=loading' });
                    initializePage(); // Función para inicializar el resto
                }
            });
    } else {
        initializePage(); // Si no hay pantalla de carga, inicializar directamente
    }

    async function initializePage() {
        // --- Lenis (Smooth Scrolling) ---
        if (window.Lenis) {
            lenis = new Lenis({
                duration: 1.7, // Más "pesado"
                easing: (t) => 1 - Math.pow(1 - t, 4), // EaseOutQuart
                smoothTouch: false,
                touchMultiplier: 1.7,
            });
            function raf(time) { if (lenis) lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
            lenis.on('scroll', () => ScrollTrigger.update()); // Corregido
            gsap.ticker.add((time) => { if (lenis) lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        } else { console.warn("Lenis no está definido."); }

        // --- GSAP Plugins ---
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        // --- NO HAY CURSOR PERSONALIZADO ---
        document.body.style.cursor = 'auto';

        // --- Navegación Suave y Activa ---
        setupNavigation();

        // --- Animación del Header ---
        ScrollTrigger.create({ start: 'top -90', end: 99999, toggleClass: { className: 'scrolled', targets: '.main-header' }});

        // --- Animación Logo Header ---
        const logo = document.querySelector('.logo a');
        if (logo) {
            gsap.from(logo, { opacity: 0, y: -25, duration: 1, delay: 0.2, ease: 'expo.out' });
            logo.addEventListener('mouseenter', () => gsap.to(logo, { y: -2, rotation: -2, duration: 0.2, ease: 'power1.out' }));
            logo.addEventListener('mouseleave', () => gsap.to(logo, { y: 0, rotation: 0, duration: 0.2, ease: 'power1.inOut' }));
        }

        // --- Animaciones de Títulos de Sección (Splitting.js) ---
        Splitting(); // Asegurar que se ejecute
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

        // --- Cargar y Animar Contenido Dinámico ---
        await loadAndAnimateDynamicContent();

        // --- Parallax, Filosofía, Contacto (Mantener animaciones, ajustar triggers si es necesario) ---
        setupStaticSectionAnimations();

        // --- Carrito de Compras ---
        setupCart();

        // --- Forzar Refresh de ScrollTrigger al final ---
        setTimeout(() => {
            ScrollTrigger.refresh();
            if (lenis) lenis.resize();
            console.log("Aura Perfumería PRO: ScrollTrigger & Lenis refreshed.");
        }, 300); // Un timeout un poco mayor para asegurar que todo el layout esté asentado
    }

    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link-item');
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (lenis && document.querySelector(targetId)) {
                    lenis.scrollTo(targetId, { offset: -70, duration: 2.2, easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t) });
                } else if (document.querySelector(targetId)) {
                    document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        ScrollTrigger.create({
            onUpdate: (self) => {
                const sections = gsap.utils.toArray('section[id]');
                let currentSectionId = '';
                sections.forEach(section => {
                    if (ScrollTrigger.isInViewport(section, 0.4, true)) { // Si el 40% de la sección está en viewport
                        currentSectionId = section.id;
                    }
                });
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // --- Lógica para Cargar Contenido Dinámico (Categorías y Productos) ---
    async function loadAndAnimateDynamicContent() {
        await populateCategories(); // Carga las tarjetas de categorías
        await populateFeaturedProducts(); // Carga productos destacados

        // Listeners para "Descubrir" en tarjetas de categoría (ya pobladas)
        document.querySelectorAll('.category-cta').forEach(cta => {
            cta.addEventListener('click', async (e) => {
                e.preventDefault();
                const categorySlug = cta.dataset.targetCollection;
                const displaySectionId = `collection-${categorySlug}-display`;
                await toggleProductCollectionDisplay(displaySectionId, categorySlug);
            });
        });

        // Listeners para botones de cerrar colecciones
        document.querySelectorAll('.close-collection-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const displaySectionId = btn.dataset.closeTarget;
                const targetSection = document.getElementById(displaySectionId);
                if (targetSection) {
                    gsap.to(targetSection, {
                        autoAlpha: 0, y: 30, duration: 0.4, ease: 'power2.in',
                        onComplete: () => targetSection.style.display = 'none'
                    });
                }
            });
        });
    }

    async function populateCategories() {
        const categoriesGrid = document.querySelector('#categories .categories-grid');
        if (!categoriesGrid) return;

        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            const categories = await response.json();

            categoriesGrid.innerHTML = categories.map(category => `
                <div class="category-card" data-collection-target="${category.slug}">
                    <div class="category-image-wrapper">
                        <img src="${category.image_url}" alt="${category.name}">
                    </div>
                    <div class="category-info">
                        <h3>${category.name}</h3>
                        <p class="category-description">${category.description || ''}</p>
                        <button class="btn-link category-cta" data-target-collection="${category.slug}">Descubrir <span class="arrow">&rarr;</span></button>
                    </div>
                </div>
            `).join('');

            // Crear secciones de display para cada categoría (inicialmente ocultas)
            const mainElement = document.querySelector('main #smooth-content'); // O donde quieras que se inserten
            categories.forEach(category => {
                if (!document.getElementById(`collection-${category.slug}-display`)) {
                    const displaySection = document.createElement('section');
                    displaySection.className = 'perfume-display-section';
                    displaySection.id = `collection-${category.slug}-display`;
                    displaySection.style.display = 'none'; // Oculto por defecto
                    displaySection.innerHTML = `
                        <div class="container">
                            <h2 class="section-title-small">${category.name} <button class="close-collection-btn" data-close-target="collection-${category.slug}-display">&times;</button></h2>
                            <div class="perfumes-grid">
                                <p class="loading-products-message">Cargando perfumes...</p>
                            </div>
                        </div>`;
                    // Insertar después de la sección de categorías
                    const categoriesSection = document.getElementById('categories');
                    if (categoriesSection && categoriesSection.nextSibling) {
                         categoriesSection.parentNode.insertBefore(displaySection, categoriesSection.nextSibling);
                    } else if (categoriesSection) {
                         categoriesSection.parentNode.appendChild(displaySection);
                    } else {
                         mainElement.appendChild(displaySection);
                    }
                }
            });

            // Animar tarjetas de categoría (similar a como estaba antes)
            const categoryCards = categoriesGrid.querySelectorAll('.category-card');
            gsap.set(categoryCards, {autoAlpha:0, y:80, rotationZ: (i) => i % 2 === 0 ? -4 : 4, scale:0.9});
            ScrollTrigger.batch(categoryCards, {
                interval: 0.15, batchMax: 3, start: "top 90%",
                onEnter: batch => gsap.to(batch, {
                    autoAlpha: 1, y: 0, rotationZ: 0, scale: 1, stagger: 0.1, duration: 1, ease: "expo.out",
                    onComplete: () => ScrollTrigger.refresh() // Refrescar por si el layout cambia
                }),
            });
            setupCategoryCardHovers(categoryCards);

        } catch (error) {
            console.error("Error al cargar categorías:", error);
            if(categoriesGrid) categoriesGrid.innerHTML = "<p class='error-message'>No se pudieron cargar las categorías. Intenta más tarde.</p>";
        }
    }
    function setupCategoryCardHovers(cards) {
        cards.forEach(card => {
            const imageWrapper = card.querySelector('.category-image-wrapper');
            const img = imageWrapper.querySelector('img');
            const description = card.querySelector('.category-description');
            const cta = card.querySelector('.category-cta');
            gsap.set([description, cta], { autoAlpha: 0, y: 15 });

            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -12, scale: 1.02, boxShadow: 'var(--shadow-strong)', duration: 0.35, ease: 'power2.out' });
                gsap.to(img, { scale: 1.1, duration: 0.45, ease: 'power2.out' });
                gsap.to(description, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'circ.out' });
                gsap.to(cta, { autoAlpha: 1, y: 0, duration: 0.3, delay: 0.05, ease: 'circ.out' });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, scale: 1, boxShadow: 'var(--shadow-light)', duration: 0.35, ease: 'power2.inOut' });
                gsap.to(img, { scale: 1, duration: 0.45, ease: 'power2.inOut' });
                gsap.to(description, { autoAlpha: 0, y: 15, duration: 0.3, ease: 'circ.inOut' });
                gsap.to(cta, { autoAlpha: 0, y: 15, duration: 0.3, ease: 'circ.inOut' });
            });
        });
    }


    async function populateFeaturedProducts() {
        const featuredGrid = document.querySelector('#featured .featured-grid');
        if (!featuredGrid) return;
        featuredGrid.innerHTML = "<p class='loading-products-message'>Cargando destacados...</p>";

        try {
            const products = await fetch(`${API_BASE_URL}/products`).then(res => res.json());
            // Lógica para seleccionar "destacados", ej. los primeros o los que tengan un tag específico
            const featured = products.filter(p => p.tags && p.tags.toLowerCase().includes('más vendido')).slice(0, 3);
            if (featured.length === 0 && products.length > 0) { // Fallback si no hay "más vendido"
                featured.push(...products.slice(0, 3 - featured.length));
            }

            featuredGrid.innerHTML = featured.map(createProductCardHTML).join('');
            setupProductCardHovers(featuredGrid.querySelectorAll('.product-card'));
            gsap.set(featuredGrid.querySelectorAll('.product-card'), {autoAlpha:0, y:70, scale:0.92});
            ScrollTrigger.batch(featuredGrid.querySelectorAll('.product-card'), {
                interval: 0.1, batchMax: 3, start: "top 90%",
                onEnter: batch => gsap.to(batch, {
                    autoAlpha: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.9, ease: "power3.out",
                    onComplete: () => ScrollTrigger.refresh()
                }),
            });
        } catch (error) {
            console.error("Error al cargar productos destacados:", error);
            featuredGrid.innerHTML = "<p class='error-message'>No se pudieron cargar los productos destacados.</p>";
        }
    }

    function createProductCardHTML(product) {
        const imageUrl = product.image_url.startsWith('http') ? product.image_url : `${product.image_url}`; // Asumiendo que image_url es ya la ruta correcta relativa a frontend/

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
    function setupProductCardHovers(cards) {
        cards.forEach(card => {
            const image = card.querySelector('.product-image-wrapper img');
            const button = card.querySelector('.btn-add-to-cart');
            gsap.set(button, { autoAlpha: 0, y: 20, scale: 0.85 });

            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -10, boxShadow: 'var(--shadow-medium)', duration: 0.3, ease: 'power2.out' });
                gsap.to(image, { scale: 1.06, duration: 0.3, ease: 'power2.out' });
                gsap.to(button, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.6)' });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, boxShadow: 'var(--shadow-light)', duration: 0.3, ease: 'power2.inOut' });
                gsap.to(image, { scale: 1, duration: 0.3, ease: 'power2.inOut' });
                gsap.to(button, { autoAlpha: 0, y: 20, scale: 0.85, duration: 0.25, ease: 'power1.in' });
            });
        });
    }

    async function toggleProductCollectionDisplay(displaySectionId, categorySlug) {
        const targetSection = document.getElementById(displaySectionId);
        if (!targetSection) return;

        const perfumesGrid = targetSection.querySelector('.perfumes-grid');
        const isOpen = targetSection.style.display === 'block' && targetSection.style.opacity === '1'; // Chequeo más robusto

        // Ocultar todas las otras colecciones abiertas
        document.querySelectorAll('.perfume-display-section').forEach(s => {
            if (s.id !== displaySectionId && s.style.display !== 'none' && s.style.opacity !== '0') {
                gsap.to(s, { autoAlpha: 0, y: 30, duration: 0.4, onComplete: () => s.style.display = 'none' });
            }
        });

        if (isOpen) { // Si ya está abierta, la cerramos (esto no debería pasar con el botón de cerrar, pero por si acaso)
            gsap.to(targetSection, { autoAlpha: 0, y: 30, duration: 0.4, onComplete: () => targetSection.style.display = 'none' });
        } else {
            perfumesGrid.innerHTML = '<p class="loading-products-message">Cargando perfumes...</p>';
            targetSection.style.display = 'block';
            gsap.set(targetSection, {autoAlpha:0, y:30}); // Preparar para animación de entrada

            try {
                const response = await fetch(`${API_BASE_URL}/products/category/${categorySlug}`);
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
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
                        if (lenis) lenis.scrollTo(targetSection, { offset: -80, duration: 1.5 });
                        const productsInCollection = targetSection.querySelectorAll('.product-card');
                        gsap.set(productsInCollection, {autoAlpha:0, y:50, scale:0.9});
                        gsap.to(productsInCollection, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out', delay:0.1, onComplete: ()=> ScrollTrigger.refresh() });
                    }
                });
            } catch (error) {
                console.error(`Error al cargar productos para ${categorySlug}:`, error);
                perfumesGrid.innerHTML = '<p class="error-message">Error al cargar perfumes. Intenta de nuevo.</p>';
                // Animar la sección para mostrar el error
                gsap.to(targetSection, {autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out'});
            }
        }
    }

    // --- Lógica del Carrito de Compras ---
    let cart = JSON.parse(localStorage.getItem('auraCart')) || [];
    const cartIconBtn = document.querySelector('.header-actions .cart-btn');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');
    const cartCountElement = document.querySelector('.cart-count');

    function saveCart() { localStorage.setItem('auraCart', JSON.stringify(cart)); }
    function updateCartCount() {
        if (!cartCountElement) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        if (totalItems > 0) {
            gsap.fromTo(cartCountElement, { scale: 1.4, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out' });
        }
    }

    function renderCartItems() {
        if (!cartItemsContainer || !cartTotalElement) return;
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
            cartTotalElement.textContent = 'Total: $0.00';
            checkoutWhatsappBtn.disabled = true;
            gsap.to(checkoutWhatsappBtn, {opacity:0.5, duration:0.2});
            return;
        }
        checkoutWhatsappBtn.disabled = false;
        gsap.to(checkoutWhatsappBtn, {opacity:1, duration:0.2});

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
                        <button class="quantity-btn decrease-qty" data-item-id="${item.id}">-</button>
                        <input type="number" class="item-quantity-input" data-item-id="${item.id}" value="${item.quantity}" min="1" max="10" readonly>
                        <button class="quantity-btn increase-qty" data-item-id="${item.id}">+</button>
                    </p>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item-btn" data-item-id="${item.id}" title="Quitar del carrito">&times;</button>
                </div>`;
            cartItemsContainer.appendChild(itemElement);
            total += parseFloat(item.price) * item.quantity;
        });
        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
    }

    function handleCartAction(event) {
        const target = event.target;
        const itemId = target.dataset.itemId;
        if (!itemId) return;

        const itemInCart = cart.find(item => item.id === itemId);
        if (!itemInCart) return;

        if (target.classList.contains('increase-qty')) {
            if (itemInCart.quantity < 10) itemInCart.quantity++;
        } else if (target.classList.contains('decrease-qty')) {
            if (itemInCart.quantity > 1) itemInCart.quantity--;
            else cart = cart.filter(item => item.id !== itemId); // Remover si baja a 0
        } else if (target.classList.contains('remove-item-btn')) {
            cart = cart.filter(item => item.id !== itemId);
        }
        saveCart();
        renderCartItems();
        updateCartCount();
    }
    if (cartItemsContainer) cartItemsContainer.addEventListener('click', handleCartAction);


    document.body.addEventListener('click', function(event) { // Delegación de eventos
        if (event.target.classList.contains('btn-add-to-cart')) {
            const button = event.target;
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            const productImage = button.dataset.productImage;

            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                if (existingItem.quantity < 10) existingItem.quantity++;
                else alert("No puedes añadir más de 10 unidades del mismo perfume.");
            } else {
                cart.push({ id: productId, name: productName, price: productPrice, quantity: 1, image: productImage });
            }
            saveCart();
            updateCartCount();
            showCartNotification(productName);
        }
    });

    function showCartNotification(productName) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = `${productName} añadido al carrito!`;
        document.body.appendChild(notification);
        gsap.fromTo(notification,
            { y: 50, autoAlpha: 0, scale: 0.8 },
            { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)',
              onComplete: () => gsap.to(notification, { autoAlpha: 0, y: -20, duration: 0.4, delay: 1.5, onComplete: () => notification.remove() })
            }
        );
    }

    function setupCart() {
        updateCartCount(); // Initial count
        if (cartIconBtn) cartIconBtn.addEventListener('click', openCartModal);
        if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);
        if (cartModal) cartModal.addEventListener('click', (event) => { if (event.target === cartModal) closeCartModal(); });
        if (checkoutWhatsappBtn) checkoutWhatsappBtn.addEventListener('click', handleWhatsAppCheckout);
    }

    function openCartModal() {
        renderCartItems();
        cartModal.style.display = 'flex';
        gsap.to(cartModal, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo(cartModal.querySelector('.cart-modal-content'), {scale:0.85, autoAlpha:0}, { scale: 1, autoAlpha: 1, duration: 0.4, delay:0.05, ease: 'back.out(1.5)' });
        if (lenis) lenis.stop();
    }
    function closeCartModal() {
        gsap.to(cartModal.querySelector('.cart-modal-content'), { scale: 0.85, autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
        gsap.to(cartModal, { autoAlpha: 0, duration: 0.4, delay:0.05, ease: 'power2.in', onComplete: () => {
            cartModal.style.display = 'none';
            if (lenis) lenis.start();
        }});
    }

    function handleWhatsAppCheckout() {
        if (cart.length === 0) { alert("Tu carrito está vacío."); return; }
        let message = "¡Hola Aura Perfumería! ✨ Estoy interesado/a en el siguiente pedido:\n\n";
        let totalAmount = 0;
        cart.forEach(item => {
            message += `* ${item.name}\n`;
            message += `  Cantidad: ${item.quantity}\n`;
            message += `  Precio Unit.: $${item.price.toFixed(2)}\n`;
            message += `  Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
            totalAmount += item.price * item.quantity;
        });
        message += `*TOTAL DEL PEDIDO: $${totalAmount.toFixed(2)}*\n\n`;
        message += "Agradezco me contacten para coordinar el pago y envío. ¡Muchas gracias! 😊";

        const whatsappNumber = "+57 3002520187"; // REEMPLAZA CON TU NÚMERO
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }


    // --- Animaciones de Secciones Estáticas (Filosofía, Parallax, Scroll Horizontal) ---
    function setupStaticSectionAnimations() {
        // Filosofía
        const philosophyTextElements = document.querySelectorAll(".philosophy-text > p");
        const philosophyCta = document.querySelector(".btn-philosophy-cta");
        const philosophyImage = document.querySelector(".philosophy-main-image");
        if (philosophyTextElements.length) gsap.from(philosophyTextElements, { scrollTrigger: { trigger: ".philosophy-text", start: "top 80%" }, autoAlpha: 0, x: -50, filter: 'blur(4px)', duration: 1, stagger: 0.18, ease: "circ.out" });
        if (philosophyCta) gsap.from(philosophyCta, { scrollTrigger: { trigger: philosophyCta, start: "top 90%" }, autoAlpha: 0, scale:0.75, y:25, duration:0.8, ease: "back.out(1.5)" });
        if (philosophyImage) gsap.fromTo(philosophyImage, { autoAlpha: 0, scale: 0.8, rotationY: 50, rotationX:10, transformOrigin: "center 70%", filter: 'brightness(0.4) contrast(1.2)' }, { autoAlpha: 1, scale: 1, rotationY: 0, rotationX:0, filter: 'brightness(1) contrast(1)', duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: ".philosophy-image-wrapper", start: 'top 80%' } });

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
            let scrollWidth = horizontalPanelsContainer.offsetWidth - window.innerWidth;
            let currentPanelColor = gsap.getProperty(horizontalPanels[0] || pinWrapper, "backgroundColor");

            const stHorizontal = gsap.to(horizontalPanelsContainer, {
                x: () => -(horizontalPanelsContainer.scrollWidth - window.innerWidth), // Usar scrollWidth para más precisión
                ease: "power1.inOut",
                scrollTrigger: {
                    id: "horizontalScrollMain",
                    trigger: pinWrapper, pin: true, scrub: 1.1,
                    start: "top top", end: () => `+=${horizontalPanelsContainer.scrollWidth - window.innerWidth}`,
                    invalidateOnRefresh: true,
                    onUpdate: self => {
                        let panelIndex = Math.min(horizontalPanels.length - 1, Math.max(0, Math.floor(self.progress * horizontalPanels.length)));
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
                const panelTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: panel,
                        containerAnimation: stHorizontal, // Referenciar la animación principal del scroll
                        start: 'left 80%', end: 'right 20%', // Ajustar para mejor entrada/salida
                        toggleActions: "play reverse play reverse",
                    }
                });
                panelTl.from(panelImage, { autoAlpha: 0, xPercent: (i % 2 === 0) ? -60 : 60, rotationY: (i % 2 === 0) ? 35 : -35, scale: 0.75, duration: 1, ease: 'expo.out' })
                       .from(panelText, { autoAlpha: 0, xPercent: (i % 2 === 0) ? 35 : -35, yPercent:15, filter: 'blur(2px)', duration: 0.8, ease: 'power3.out' }, "-=0.7");
            });
        }

        // Contacto
        const contactFormTl = gsap.timeline({ scrollTrigger: { trigger: ".contact-section", start: "top 78%" } });
        contactFormTl.from(".contact-subtitle", { autoAlpha: 0, y: 35, duration: 0.8, ease: 'power2.out' })
                     .from(".contact-form", { autoAlpha: 0, scale: 0.85, y: 25, duration: 0.8, ease: 'back.out(1.3)' }, "-=0.45");
    } // Fin de setupStaticSectionAnimations

}); // Fin DOMContentLoaded