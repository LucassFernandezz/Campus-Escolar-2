document.addEventListener('DOMContentLoaded', () => {

    /* ==========================
       Flip Card (Registro/Login)
    ========================== */
    const flipCard = document.querySelector('.flip-card');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    if (flipCard && showRegisterLink && showLoginLink) {
        showRegisterLink.addEventListener('click', e => {
            e.preventDefault();
            flipCard.classList.add('flipped');
        });

        showLoginLink.addEventListener('click', e => {
            e.preventDefault();
            flipCard.classList.remove('flipped');
        });
    }

    /* ==========================
       Toggle Visibilidad Contraseña
    ========================== */
    const passwordToggleIcons = document.querySelectorAll('.password-toggle-icon');

    passwordToggleIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const targetId = icon.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                targetInput.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    });

    /* ==========================
       Acordeón (Inscripciones / FAQ)
    ========================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.closest('.accordion-item');
            const accordionContent = accordionItem.querySelector('.accordion-content');

            accordionItem.classList.toggle('active');

            if (accordionItem.classList.contains('active')) {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
            } else {
                accordionContent.style.maxHeight = '0';
            }
        });
    });

    /* ==========================
       Navbar Active Link
    ========================== */
    const currentPath = window.location.pathname.split('/').pop();
    const navLinksAll = document.querySelectorAll('.nav-links a');

    navLinksAll.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPath);
    });

    const logoLink = document.querySelector('.logo-link');
    if (logoLink && currentPath !== 'index.html' && logoLink.querySelector('a')) {
        logoLink.querySelector('a').classList.remove('active');
    }

    /* ==========================
       Menú Hamburguesa Responsive
    ========================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });

        // Cerrar menú al hacer click en un link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                }
            });
        });
    }

    // ====================
    // Multilenguaje
    // ====================
    const langBtn = document.querySelector('.lang-btn');
    let currentLang = localStorage.getItem('lang') || 'es'; // recordar idioma

    function loadLanguage(lang) {
        fetch(`lang/${lang}.json`)
            .then(res => res.json())
            .then(data => {
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.dataset.i18n;
                    if (data[key]) el.textContent = data[key];
                });
                currentLang = lang;
                localStorage.setItem('lang', lang);
            });
    }

    // Inicializar idioma al cargar página
    loadLanguage(currentLang);

    // Cambiar idioma al hacer click
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const newLang = currentLang === 'es' ? 'en' : 'es';
            loadLanguage(newLang);
        });
    }


});
