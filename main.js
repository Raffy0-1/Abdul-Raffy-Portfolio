/**
 * ML Engineer Portfolio - Interactions & Animations
 * Built with Vanilla JS, GSAP 3, ScrollTrigger, Lenis, Three.js
 */

// 1. Loader Class (3D Voxel Intro Loader)
class SiteLoader {
    constructor() {
        this.loader = document.getElementById('loader');
        this.dismissed = false;
        this.init();
    }

    init() {
        if (!this.loader) {
            document.dispatchEvent(new Event('site-loaded'));
            return;
        }

        const dismissLoader = () => {
            if (this.dismissed) return;
            this.dismissed = true;
            this.loader.classList.add('loaded');
            setTimeout(() => {
                this.loader.remove();
                document.dispatchEvent(new Event('site-loaded'));
            }, 600);
        };

        // Smooth display duration matching the 3D voxel assembly cycle (~2.2s)
        const timer = setTimeout(dismissLoader, 2200);

        // Allow click anywhere to immediately skip intro loader
        this.loader.addEventListener('click', () => {
            clearTimeout(timer);
            dismissLoader();
        });
    }
}



// 2. Smooth Scroll Manager (Lenis)
class SmoothScrollManager {
    constructor() {
        this.lenis = new Lenis({
            lerp: 0.08,
            duration: 1.4,
            smoothTouch: false
        });

        // Sync with GSAP ticker
        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // Handle Scroll to top
        const stt = document.getElementById('scroll-to-top');
        stt.addEventListener('click', () => {
            this.lenis.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        });

        // Progress bar
        const progressBar = document.getElementById('scroll-progress');
        this.lenis.on('scroll', (e) => {
            const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (e.animatedScroll / scrollMax) * 100;
            progressBar.style.width = `${progress}%`;
        });
    }
}


// 3. Cursor Manager
class CursorManager {
    constructor() {
        this.cursor = document.getElementById('custom-cursor');
        if (!this.cursor) return;
        
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        this.initEvents();
        this.render();
    }

    initEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Click scale feedback
        window.addEventListener('mousedown', () => {
            if (this.cursor) this.cursor.classList.add('clicking');
        });
        window.addEventListener('mouseup', () => {
            if (this.cursor) this.cursor.classList.remove('clicking');
        });
        window.addEventListener('mouseleave', () => {
            if (this.cursor) {
                this.cursor.classList.remove('clicking');
                this.cursor.style.opacity = '0';
            }
        });
        window.addEventListener('mouseenter', () => {
            if (this.cursor) this.cursor.style.opacity = '1';
        });

        // Hover specific interactions mapping via event delegation
        document.addEventListener('mouseover', (e) => {
            const el = e.target;
            if (el.closest('a') || el.closest('button') || el.closest('.filter-btn')) {
                document.body.classList.add('hover-link');
            }
            if (el.closest('[data-cursor="project"]')) {
                document.body.classList.add('hover-project');
            }
            if (el.closest('[data-cursor="invert"]')) {
                document.body.classList.add('hover-invert');
            }
        });

        document.addEventListener('mouseout', (e) => {
            const el = e.target;
            if (el.closest('a') || el.closest('button') || el.closest('.filter-btn')) {
                document.body.classList.remove('hover-link');
            }
            if (el.closest('[data-cursor="project"]')) {
                document.body.classList.remove('hover-project');
            }
            if (el.closest('[data-cursor="invert"]')) {
                document.body.classList.remove('hover-invert');
            }
        });
    }

    render() {
        // High-precision smooth follow (factor 0.45 for silky responsiveness without lag)
        this.pos.x += (this.mouse.x - this.pos.x) * 0.45;
        this.pos.y += (this.mouse.y - this.pos.y) * 0.45;
        
        this.cursor.style.left = `${this.pos.x}px`;
        this.cursor.style.top = `${this.pos.y}px`;
        
        requestAnimationFrame(() => this.render());
    }
}





// 5. Navigation Manager
class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.magneticLinks = document.querySelectorAll('[data-magnetic]');
        this.activeLine = document.getElementById('nav-active-line');
        
        this.init();
    }

    init() {
        // Sticky Header Shrink
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        });

        // Magnetic Pull Functionality
        this.magneticLinks.forEach(link => {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const linkCenter = { 
                    x: rect.left + rect.width / 2, 
                    y: rect.top + rect.height / 2 
                };
                
                const deltaX = (e.clientX - linkCenter.x) * 0.25;
                const deltaY = (e.clientY - linkCenter.y) * 0.25;

                // Max limits: ±8px X, ±6px Y
                const clampX = Math.max(-8, Math.min(8, deltaX));
                const clampY = Math.max(-6, Math.min(6, deltaY));

                gsap.to(link, { x: clampX, y: clampY, duration: 0.3, ease: 'power2.out' });
            });

            link.addEventListener('mouseleave', () => {
                gsap.to(link, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
            });

            // Active underline mapping
            link.addEventListener('mouseenter', () => {
                const rect = link.getBoundingClientRect();
                const navRect = this.navbar.querySelector('.nav-links').getBoundingClientRect();
                
                this.activeLine.style.width = `${rect.width}px`;
                this.activeLine.style.left = `${rect.left - navRect.left}px`;
                this.activeLine.style.opacity = 1;
            });
        });

        this.navbar.querySelector('.nav-links').addEventListener('mouseleave', () => {
            this.activeLine.style.opacity = 0;
            setTimeout(() => this.activeLine.style.width = `0px`, 400); // slide out effect
        });

        // Mobile drawer handling
        const hamburger = document.getElementById('hamburger');
        const drawer = document.getElementById('mobile-drawer');
        const drawerLinks = document.querySelectorAll('.drawer-link');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            drawer.classList.toggle('open');

            if(drawer.classList.contains('open')) {
                gsap.to(drawerLinks, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power3.out' });
            } else {
                gsap.to(drawerLinks, { y: 20, opacity: 0, duration: 0.2 });
            }
        });
        
        drawerLinks.forEach(dl => dl.addEventListener('click', () => {
            hamburger.click();
        }));
    }
}


// 6. Interaction Manager
class InteractionManager {
    constructor() {
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        this.initLiquidButtons();
        this.initContactForm();
        this.initTechTooltips();
        this.initProjectFilters();
        this.initInkReveal();
        this.initShowMore();
        this.initCertLightbox();
        
        document.addEventListener('site-loaded', () => {
            this.scrambleHeroHeadline();
            this.initFooterHover();
        });
    }

    scrambleHeroHeadline() {
        const headline = document.querySelector('.hero-headline');
        if(!headline) return;

        const textNodes = [];
        const walk = document.createTreeWalker(headline, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walk.nextNode()) {
            if(node.nodeValue.trim().length > 0) {
                textNodes.push(node);
            }
        }

        let totalSpans = [];

        textNodes.forEach(textNode => {
            const chars = textNode.nodeValue.split('');
            const fragment = document.createDocumentFragment();
            chars.forEach(char => {
                if (char === ' ' || char === '\n') {
                    fragment.appendChild(document.createTextNode(char));
                } else {
                    const span = document.createElement('span');
                    span.innerText = this.chars[Math.floor(Math.random() * this.chars.length)];
                    fragment.appendChild(span);
                    totalSpans.push({ element: span, char: char });
                }
            });
            textNode.parentNode.replaceChild(fragment, textNode);
        });

        totalSpans.forEach((obj, index) => {
            let iterations = 0;
            const maxIterations = 10 + Math.floor(index * 0.5); // staggered reveal
            
            const interval = setInterval(() => {
                if (iterations >= maxIterations) {
                    obj.element.innerText = obj.char;
                    clearInterval(interval);
                    
                    if (index === totalSpans.length - 1) {
                        const blinker = document.createElement('span');
                        blinker.style.borderRight = '10px solid #1A1A1A';
                        blinker.style.animation = 'blink 0.5s step-end 4 forwards';
                        headline.appendChild(blinker);
                        setTimeout(() => blinker.remove(), 2000);
                        
                        gsap.to('.hero-subtext', { opacity: 1, duration: 0.8, delay: 0.4 });
                        gsap.to('.hero-actions', { opacity: 1, y: 0, duration: 0.8, delay: 0.6});
                    }
                } else {
                    obj.element.innerText = this.chars[Math.floor(Math.random() * this.chars.length)];
                }
                iterations++;
            }, 30);
        });
    }

    initFooterHover() {
        const links = document.querySelectorAll('.footer-link');
        links.forEach(link => {
            let originalText = link.innerText;
            link.addEventListener('mouseenter', () => {
                let iterations = 0;
                const interval = setInterval(() => {
                    link.innerText = originalText.split('').map(c => {
                        return this.chars[Math.floor(Math.random() * 20)];
                    }).join('');
                    
                    iterations++;
                    if(iterations > 8) {
                        clearInterval(interval);
                        link.innerText = originalText;
                    }
                }, 30);
            });
        });
    }

    initLiquidButtons() {
        const btns = document.querySelectorAll('[data-liquid]');
        btns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                btn.style.setProperty('--mx', `${x}px`);
                btn.style.setProperty('--my', `${y}px`);
            });
        });
    }

    initContactForm() {
        // Floating Label logic
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            // Setup events to toggle class if value exists (fallback to :valid / :placeholder-shown trick in CSS mostly handling this)
            input.addEventListener('input', () => {
                if (input.value.length > 0) input.classList.add('has-val');
                else input.classList.remove('has-val');
            });
        });

        // Submit animation
        const form = document.getElementById('contact-form');
        const btn = document.getElementById('submit-btn');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            btn.innerText = "SENDING...";
            btn.style.pointerEvents = "none";
            
            const formData = new FormData(form);
            // Replace this with your actual Web3Forms access key
            formData.append("access_key", "YOUR_ACCESS_KEY_HERE");
            
            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    btn.innerHTML = `SENT <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;vertical-align:middle;margin-left:5px;"><path d="M20 6L9 17l-5-5" stroke-dasharray="24" stroke-dashoffset="24"><animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.4s" fill="freeze"/></path></svg>`;
                    setTimeout(() => { 
                        btn.innerText = "SEND MESSAGE"; 
                        btn.style.pointerEvents = "auto"; 
                        form.reset();
                    }, 3000);
                } else {
                    btn.innerText = "ERROR! TRY AGAIN";
                    setTimeout(() => {
                        btn.innerText = "SEND MESSAGE";
                        btn.style.pointerEvents = "auto";
                    }, 3000);
                }
            } catch (error) {
                btn.innerText = "ERROR! TRY AGAIN";
                setTimeout(() => {
                    btn.innerText = "SEND MESSAGE";
                    btn.style.pointerEvents = "auto";
                }, 3000);
            }
        });
    }

    initTechTooltips() {
        // Tech tooltips are handled with pure CSS hover floating animations per modern design reference
    }

    initProjectFilters() {
        const btns = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.project-card');
        const masonry = document.getElementById('projects-masonry');

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                if (masonry) {
                    if (filter !== 'all') {
                        masonry.classList.add('is-filtered');
                    } else {
                        masonry.classList.remove('is-filtered');
                    }
                }

                cards.forEach(card => {
                    card.classList.remove('blurred', 'pulsed');
                    
                    if (filter === 'all') {
                        const isExpanded = masonry && masonry.classList.contains('is-expanded');
                        if (card.classList.contains('project-card-hidden') && !isExpanded) {
                            card.classList.remove('is-revealed');
                        }
                        card.style.order = "0";
                    } else if (card.getAttribute('data-category') === filter) {
                        card.style.order = "-1";
                        if (card.classList.contains('project-card-hidden')) {
                            card.classList.add('is-revealed');
                        }
                        card.classList.add('pulsed');
                        setTimeout(() => card.classList.remove('pulsed'), 300);
                    } else {
                        card.style.order = "0";
                        card.classList.add('blurred');
                    }
                });

                // Refresh ScrollTrigger as items have physically moved
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 400); // Wait for CSS transitions to finish
            });
        });
    }

    initShowMore() {
        const moreBtn = document.getElementById('projects-more-btn');
        const masonry = document.getElementById('projects-masonry');
        const hiddenCards = document.querySelectorAll('.project-card.project-card-hidden');
        if (!moreBtn || !masonry) return;

        let isExpanded = false;

        moreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            moreBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            moreBtn.classList.toggle('is-active', isExpanded);

            const btnText = moreBtn.querySelector('.btn-text');

            if (isExpanded) {
                masonry.classList.add('is-expanded');
                hiddenCards.forEach((card, idx) => {
                    setTimeout(() => {
                        card.classList.add('is-revealed');
                    }, idx * 60);
                });
                if (btnText) btnText.textContent = 'SHOW LESS (5)';
            } else {
                masonry.classList.remove('is-expanded');
                hiddenCards.forEach(card => {
                    card.classList.remove('is-revealed');
                });
                if (btnText) btnText.textContent = 'VIEW ALL PROJECTS (10)';

                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    const rect = projectsSection.getBoundingClientRect();
                    if (rect.top < -50) {
                        projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }

            // Refresh ScrollTrigger as page height changed
            setTimeout(() => {
                if (window.ScrollTrigger) ScrollTrigger.refresh();
            }, 350);
        });
    }

    initInkReveal() {
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach(card => {
            const topSection = card.querySelector('.top-section');
            if (topSection && !card.querySelector('.ink-reveal')) {
                const title = card.querySelector('.bottom-section .title')?.textContent?.trim() || '';
                const desc = card.querySelector('.bottom-section .description')?.textContent?.trim() || '';
                const category = card.getAttribute('data-category')?.toUpperCase() || 'RESEARCH';

                // Extract authentic links from the card
                const links = Array.from(card.querySelectorAll('.social-media a, .card-link-item'));
                const githubA = links.find(a => a.href && a.href.includes('github.com'));
                const demoA = links.find(a => a.href && !a.href.includes('github.com') && a.href !== '#' && !a.href.startsWith('javascript'));

                let actionsHtml = '';
                if (githubA && githubA.href) {
                    actionsHtml += `<a href="${githubA.href}" target="_blank" rel="noopener noreferrer" aria-label="View source code on GitHub for ${title}">
                        <svg class="svg" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        Source
                    </a>`;
                }
                if (demoA && demoA.href) {
                    actionsHtml += `<a href="${demoA.href}" target="_blank" rel="noopener noreferrer" aria-label="Open live project link for ${title}">
                        <svg class="svg" viewBox="0 0 24 24"><path d="M14 3h7v7h-2v-3.586l-9.293 9.293-1.414-1.414 9.293-9.293h-3.586v-2zm-10 2h6v2h-6v14h14v-6h2v6c0 1.105-.895 2-2 2h-14c-1.105 0-2-.895-2-2v-14c0-1.105.895-2 2-2z"/></svg>
                        Demo
                    </a>`;
                } else if (githubA && githubA.href) {
                    actionsHtml += `<a href="${githubA.href}" target="_blank" rel="noopener noreferrer" aria-label="Open project repository for ${title}">
                        <svg class="svg" viewBox="0 0 24 24"><path d="M14 3h7v7h-2v-3.586l-9.293 9.293-1.414-1.414 9.293-9.293h-3.586v-2zm-10 2h6v2h-6v14h14v-6h2v6c0 1.105-.895 2-2 2h-14c-1.105 0-2-.895-2-2v-14c0-1.105.895-2 2-2z"/></svg>
                        Explore
                    </a>`;
                }

                const reveal = document.createElement('div');
                reveal.className = 'ink-reveal';
                reveal.innerHTML = `
                    <span class="ink-category">// ${category}</span>
                    <h4 class="ink-title">${title}</h4>
                    <p class="ink-desc">${desc}</p>
                    <div class="ink-actions">${actionsHtml}</div>
                `;
                topSection.appendChild(reveal);
            }

            // Decorative board-pin
            if (!card.querySelector('.board-pin')) {
                const pin = document.createElement('div');
                pin.className = 'board-pin';
                pin.setAttribute('aria-hidden', 'true');
                card.appendChild(pin);
            }

            // Accessible keyboard focus support
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }

            // Touch device tap-to-reveal toggle
            card.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('button')) return;
                const wasRevealed = card.classList.contains('revealed');
                cards.forEach(c => c.classList.remove('revealed'));
                if (!wasRevealed) {
                    card.classList.add('revealed');
                }
            });
        });

        // Close revealed cards when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.project-card')) {
                cards.forEach(c => c.classList.remove('revealed'));
            }
        });
    }

    initCertLightbox() {
        const lightbox    = document.getElementById('cert-lightbox');
        const overlay     = lightbox.querySelector('.cert-lightbox-overlay');
        const img         = document.getElementById('cert-lightbox-img');
        const closeBtn    = document.getElementById('cert-lightbox-close');
        const certCards   = document.querySelectorAll('.cert-card');

        const openLightbox = (src) => {
            img.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            // Clear src after transition to avoid flicker
            setTimeout(() => { img.src = ''; }, 400);
        };

        certCards.forEach(card => {
            card.addEventListener('click', () => {
                const certSrc = card.getAttribute('data-cert');
                if (certSrc) openLightbox(certSrc);
            });
        });

        overlay.addEventListener('click', closeLightbox);
        closeBtn.addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
}


// 7. Scroll Animations (GSAP)
class ScrollAnimations {
    constructor() {
        gsap.registerPlugin(ScrollTrigger);
        this.mm = gsap.matchMedia();
        this.init();
    }

    init() {
        this.mm.add("(min-width: 320px)", () => {
            
            // 1. Split words heading reveal
            const splitHeadings = document.querySelectorAll('h2.split-words');
            splitHeadings.forEach(h2 => {
                const words = h2.querySelectorAll('.word');
                if (words.length) {
                    gsap.from(words, {
                        scrollTrigger: {
                            trigger: h2,
                            start: "top 85%",
                            toggleActions: "play reverse play reverse"
                        },
                        y: "100%",
                        duration: 0.7,
                        stagger: 0.1,
                        ease: "power3.out"
                    });
                }
            });

            // 2. Stats increment on scroll
            const statsObj = { v: 0 };
            ScrollTrigger.create({
                trigger: '#stats',
                start: "top 90%",
                toggleActions: "play none none none",
                onEnter: () => {
                    const numberEls = document.querySelectorAll('.stat-number');
                    numberEls.forEach(el => {
                        const target = parseInt(el.getAttribute('data-target'));
                        gsap.to({val: 0}, {
                            val: target,
                            duration: 2,
                            ease: "power2.out",
                            onUpdate: function() {
                                el.innerText = Math.floor(this.targets()[0].val) + "+";
                            }
                        });
                    });
                }
            });

            // 3. About Section slide in columns
            gsap.from('#about-left', {
                scrollTrigger: { trigger: '.about', start: "top 75%", toggleActions: "play reverse play reverse" },
                x: -50, opacity: 0, duration: 1, ease: 'power3.out'
            });
            gsap.from('#about-right', {
                scrollTrigger: { trigger: '.about', start: "top 75%", toggleActions: "play reverse play reverse" },
                x: 50, opacity: 0, duration: 1, ease: 'power3.out'
            });

            // 4. Liquid skill bars fill
            const tracks = document.querySelectorAll('.skill-track');
            tracks.forEach((track, i) => {
                const fill = track.querySelector('.skill-fill');
                const pct = track.parentElement.querySelector('.skill-pct');
                const targetW = track.getAttribute('data-target');
                
                ScrollTrigger.create({
                    trigger: track,
                    start: "top 90%",
                    toggleActions: "play none none none",
                    onEnter: () => {
                        setTimeout(() => {
                            gsap.to(fill, { width: targetW + '%', duration: 1.5, ease: 'power2.out' });
                            gsap.to({v: 0}, {
                                v: parseInt(targetW), duration: 1.5, ease: 'power2.out',
                                onUpdate: function() { pct.innerText = Math.floor(this.targets()[0].v) + "%"; }
                            });
                        }, i * 120);
                    }
                });
            });

            // 5. Services Cards Stagger & rotate
            gsap.fromTo('.service-card', 
                { y: 50, rotation: 3, opacity: 0 },
                { scrollTrigger: { trigger: '#services', start: "top 60%", toggleActions: "play reverse play reverse" },
                  y: 0, rotation: 0, opacity: 1, 
                  duration: 0.8, stagger: 0.06, ease: "back.out(1.2)"
                }
            );

            // 6. Projects Cards Reveal (Smooth, 60fps one-time reveal, clears transforms for native CSS hover)
            gsap.fromTo('.project-card:not(.project-card-hidden)', 
                { y: 35, opacity: 0 },
                { scrollTrigger: { trigger: '#projects-masonry', start: "top 80%", once: true },
                  y: 0, opacity: 1,
                  duration: 0.6, stagger: 0.08, ease: "power2.out",
                  clearProps: "transform"
                }
            );

            // 7. Education Timeline draw line + sequence fade
            const timelineLine = document.getElementById('timeline-line-fill');
            gsap.to(timelineLine, {
                scrollTrigger: {
                    trigger: '.timeline-wrapper',
                    start: "top 60%",
                    end: "bottom 80%",
                    scrub: 1
                },
                height: '100%',
                ease: 'none'
            });

            const timelineItems = gsap.utils.toArray('.timeline-item');
            timelineItems.forEach(item => {
                const dot = item.querySelector('.timeline-dot');
                const isLeft = item.closest('.timeline-left');
                const moveVal = isLeft ? -30 : 30;

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: item,
                        start: "top 80%",
                        toggleActions: "play reverse play reverse"
                    }
                });
                
                tl.fromTo(dot, { scale: 1 }, { scale: 1.4, duration: 0.2 })
                  .to(dot, { scale: 1, duration: 0.2 })
                  .from(item.querySelectorAll('.timeline-year, .timeline-role, .timeline-org, .timeline-desc'), 
                     { x: moveVal, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, "-=0.2");
            });

            // 8. Tech Stack Scatter
            gsap.fromTo('.tech-cell', 
                { x: () => (Math.random() - 0.5) * 200, y: () => (Math.random() - 0.5) * 200, opacity: 0, scale: 0.5, rotation: () => (Math.random() - 0.5) * 45 },
                { scrollTrigger: { trigger: '#tech', start: "top 70%", toggleActions: "play reverse play reverse" },
                  x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
                  duration: 1, stagger: 0.02, ease: "back.out(1.2)"
                }
            );

            // 9. Contact form reveal typewriter border effect (done via CSS layout mostly, triggering parent fade in cleanly)
            gsap.from('.contact-form .input-group, .btn-submit', {
                scrollTrigger: { trigger: '.contact-form', start: "top 80%", toggleActions: "play reverse play reverse" },
                y: 20, opacity: 0, stagger: 0.2, duration: 0.6, ease: "power2.out"
            });

            // 11. Certifications appearing animation
            const certCards = document.querySelectorAll('.cert-card');
            certCards.forEach((card, i) => {
                ScrollTrigger.create({
                    trigger: card,
                    start: "top 92%",
                    toggleActions: "play reverse play reverse",
                    onEnter: () => card.classList.add('cert-visible'),
                    onLeaveBack: () => card.classList.remove('cert-visible')
                });
            });
            
            // 10. Scroll to top reveal clip-path
            gsap.to('.scroll-to-top', {
                scrollTrigger: { trigger: 'body', start: "500px top", toggleActions: "restart none none reverse"},
                clipPath: "inset(0 0 0 0)", duration: 0.3
            });

        }); // matchMedia
    }
}


// Initialization Order: Lenis -> GSAP -> Cursor -> Particles -> Animations -> Loader
document.addEventListener("DOMContentLoaded", () => {
    new SmoothScrollManager();
    new CursorManager();

    new NavigationManager();
    new InteractionManager();
    new ScrollAnimations();
    new SiteLoader();
});
