/**
 * Antony Escalona — Portafolio
 * Script interactivo: animaciones, modales, contadores y reproductores
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar iconos de Lucide
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }

    // 2. Preloader y estado cargado
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.add('is-loaded');
            if (preloader) {
                setTimeout(() => preloader.remove(), 700);
            }
        }, 300);
    });

    // Fallback por si 'load' ya ocurrió
    if (document.readyState === 'complete') {
        document.body.classList.add('is-loaded');
        if (preloader) setTimeout(() => preloader.remove(), 700);
    }

    // 3. Barra de progreso de scroll y header pegajoso
    const header = document.getElementById('header');
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;

        if (scrollProgress) {
            scrollProgress.style.transform = `scaleX(${progress})`;
        }

        if (header) {
            if (scrollTop > 40) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        }
    }, { passive: true });

    // 4. Cursor glow ambiental
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('mousemove', (e) => {
            cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            if (!cursorGlow.classList.contains('is-active')) {
                cursorGlow.classList.add('is-active');
            }
        });
        document.addEventListener('mouseleave', () => {
            cursorGlow.classList.remove('is-active');
        });
    }

    // 5. Menú móvil (hamburguesa)
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    function toggleMenu() {
        const isOpen = document.body.classList.toggle('menu-open');
        if (burger) {
            burger.setAttribute('aria-expanded', String(isOpen));
        }
    }

    if (burger) {
        burger.addEventListener('click', toggleMenu);
    }

    // Cerrar menú al hacer clic en enlaces de navegación
    if (nav) {
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (document.body.classList.contains('menu-open')) {
                    document.body.classList.remove('menu-open');
                    if (burger) burger.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // 6. Efecto de foco en tarjetas (Mouse Coordinate Spotlight)
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mx', `${x}px`);
            card.style.setProperty('--my', `${y}px`);
        });
    });

    // 7. Filtro de videos verticales (Todos / Educativo / Storytelling)
    const filterBtns = document.querySelectorAll('.filter');
    const verticalCards = document.querySelectorAll('.card--vertical');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('is-active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('is-active');
            btn.setAttribute('aria-selected', 'true');

            const filter = btn.dataset.filter;

            verticalCards.forEach(card => {
                const cat = card.dataset.cat;
                if (filter === 'all' || cat === filter) {
                    card.classList.remove('is-hidden');
                    card.classList.add('is-shown');
                } else {
                    card.classList.add('is-hidden');
                    card.classList.remove('is-shown');
                }
            });
        });
    });

    // 8. Animación de revelado al scroll (Intersection Observer)
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach(el => revealObserver.observe(el));

        // Observer para la línea de pasos del proceso
        const stepsContainer = document.querySelector('.steps');
        if (stepsContainer) {
            const stepsObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            stepsObserver.observe(stepsContainer);
        }

        // 9. Animación de contadores numéricos
        const counterStats = document.querySelectorAll('[data-count]');
        let counted = false;

        const statsSection = document.querySelector('[data-counters]');
        if (statsSection) {
            const counterObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !counted) {
                        counted = true;
                        animateCounters(counterStats);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            counterObserver.observe(statsSection);
        }
    } else {
        // Fallback para navegadores antiguos
        reveals.forEach(el => el.classList.add('is-visible'));
        const stepsContainer = document.querySelector('.steps');
        if (stepsContainer) stepsContainer.classList.add('is-visible');
    }

    function animateCounters(elements) {
        elements.forEach(el => {
            const target = parseFloat(el.dataset.count);
            const prefix = el.dataset.prefix || '';
            const suffix = el.dataset.suffix || '';
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const duration = 1800;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Curva de aceleración/desaceleración
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentVal = target * easeOut;

                el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // 10. Modal de Video (Google Drive, YouTube, MP4)
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalVideo = document.getElementById('modalVideo');
    const modalIframe = document.getElementById('modalIframe');
    const modalExternal = document.getElementById('modalExternal');
    const videoTriggers = document.querySelectorAll('[data-video]');

    function openModal(trigger) {
        const videoUrl = trigger.dataset.video || '';
        const title = trigger.dataset.title || '';
        const category = trigger.dataset.category || '';
        const isVertical = trigger.dataset.format === 'vertical';

        if (modalTitle) modalTitle.textContent = title;
        if (modalCategory) modalCategory.textContent = category;

        // Reset
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.src = '';
            modalVideo.hidden = true;
        }
        if (modalIframe) {
            modalIframe.src = '';
            modalIframe.hidden = true;
        }
        if (modalExternal) {
            modalExternal.hidden = true;
            modalExternal.href = '#';
        }

        // Adaptar formato vertical / horizontal
        if (isVertical) {
            modal.classList.add('is-vertical');
        } else {
            modal.classList.remove('is-vertical');
        }

        // Caso 1: Google Drive
        if (videoUrl.includes('drive.google.com')) {
            let embedUrl = videoUrl;
            if (embedUrl.includes('/view')) {
                embedUrl = embedUrl.replace(/\/view.*$/, '/preview');
            } else if (embedUrl.includes('/edit')) {
                embedUrl = embedUrl.replace(/\/edit.*$/, '/preview');
            } else if (!embedUrl.endsWith('/preview')) {
                const idMatch = embedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (idMatch && idMatch[1]) {
                    embedUrl = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
                }
            }

            if (modalIframe) {
                modalIframe.src = embedUrl;
                modalIframe.hidden = false;
            }
            if (modalExternal) {
                modalExternal.href = videoUrl;
                modalExternal.hidden = false;
            }
        }
        // Caso 2: YouTube
        else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            let embedUrl = videoUrl;
            if (embedUrl.includes('watch?v=')) {
                embedUrl = embedUrl.replace('watch?v=', 'embed/').split('&')[0];
            } else if (embedUrl.includes('youtu.be/')) {
                embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
            }
            embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';

            if (modalIframe) {
                modalIframe.src = embedUrl;
                modalIframe.hidden = false;
            }
        }
        // Caso 3: MP4 nativo
        else {
            if (modalVideo) {
                modalVideo.src = videoUrl;
                modalVideo.hidden = false;
                modalVideo.load();
                modalVideo.play().catch(() => {});
            }
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');

        if (modalVideo) {
            modalVideo.pause();
            modalVideo.src = '';
            modalVideo.hidden = true;
        }
        if (modalIframe) {
            modalIframe.src = '';
            modalIframe.hidden = true;
        }
    }

    videoTriggers.forEach(btn => {
        btn.addEventListener('click', () => openModal(btn));
    });

    // Cerrar modal
    if (modal) {
        modal.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });
    }

    // 11. Copiar email con toast feedback
    const copyEmailBtn = document.getElementById('copyEmail');
    const copyEmailText = document.getElementById('copyEmailText');
    const toast = document.getElementById('toast');
    const emailToCopy = 'tonydisena@gmail.com';

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', async () => {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(emailToCopy);
                } else {
                    const temp = document.createElement('input');
                    temp.value = emailToCopy;
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand('copy');
                    document.body.removeChild(temp);
                }

                if (copyEmailText) copyEmailText.textContent = '¡Copiado!';
                if (toast) {
                    toast.classList.add('is-visible');
                    setTimeout(() => {
                        toast.classList.remove('is-visible');
                        if (copyEmailText) copyEmailText.textContent = 'Copiar email';
                    }, 2600);
                }
            } catch (err) {
                console.warn('Error al copiar:', err);
            }
        });
    }

    // 12. Actualizar año del footer automáticamente
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
});
