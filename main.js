/**
 * ML Engineer Portfolio - Interactions & Animations
 * Built with Vanilla JS, GSAP 3, ScrollTrigger, Lenis, Three.js
 */

// 1. Loader Class
class SiteLoader {
    constructor() {
        this.loader = document.getElementById('loader');
        this.counterEl = document.getElementById('loader-count');
        this.lineEl = document.querySelector('.loader-line');
        this.topEl = document.querySelector('.loader-top');
        this.bottomEl = document.querySelector('.loader-bottom');
        this.progress = 0;
        this.startLoader();
    }

    startLoader() {
        const updateCounter = () => {
            // random increment for non-linear feel
            this.progress += Math.random() * 15;
            if (this.progress > 100) this.progress = 100;
            
            this.counterEl.innerText = Math.floor(this.progress);
            
            if (this.progress < 100) {
                setTimeout(updateCounter, 50 + Math.random() * 150);
            } else {
                this.revealSite();
            }
        };
        setTimeout(updateCounter, 100);
    }

    revealSite() {
        // Animation timeline for loader exit
        const tl = gsap.timeline({
            onComplete: () => {
                this.loader.remove();
                document.dispatchEvent(new Event('site-loaded'));
            }
        });

        tl.to(this.counterEl, { opacity: 0, duration: 0.3 })
          .to(this.lineEl, { width: '100%', duration: 0.8, ease: "power3.inOut" })
          .to(this.lineEl, { opacity: 0, duration: 0.2 })
          .to(this.topEl, { y: '-100%', duration: 0.8, ease: "power3.inOut" }, "-=0.2")
          .to(this.bottomEl, { y: '100%', duration: 0.8, ease: "power3.inOut" }, "<");
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
        this.dot = document.getElementById('cursor-dot');
        this.ring = document.getElementById('cursor-ring');
        
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        this.initEvents();
        this.render();
    }

    initEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Centered move dot
            this.dot.style.left = `${this.mouse.x}px`;
            this.dot.style.top = `${this.mouse.y}px`;
        });

        // Click effect
        window.addEventListener('mousedown', () => {
            gsap.to(this.ring, { scaleX: 1.6, scaleY: 0.6, duration: 0.1 });
        });
        window.addEventListener('mouseup', () => {
            gsap.to(this.ring, { scaleX: 1, scaleY: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        });

        // Hover specific interactions mapping via event delegation
        document.addEventListener('mouseover', (e) => {
            const el = e.target;
            if (el.closest('a') || el.closest('button')) {
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
            if (el.closest('a') || el.closest('button')) {
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
        // Lerp for ring (smooth lag) - approx 80ms lerp delay math -> factor ~0.2 based on 60fps
        this.ringPos.x += (this.mouse.x - this.ringPos.x) * 0.2;
        this.ringPos.y += (this.mouse.y - this.ringPos.y) * 0.2;
        
        // Centered ring move
        this.ring.style.left = `${this.ringPos.x}px`;
        this.ring.style.top = `${this.ringPos.y}px`;
        
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
        const techSection = document.getElementById('tech');
        if (!techSection) return;
        
        const tooltip = document.getElementById('tech-tooltip');
        const tooltext = document.getElementById('tooltip-text');

        // Only enable floating tooltips on devices with hover capabilities (mice)
        if (window.matchMedia('(hover: hover)').matches) {
            techSection.addEventListener('mousemove', (e) => {
                const cell = e.target.closest('.tech-cell');
                
                if (cell) {
                    const text = cell.getAttribute('data-tooltip') || 'View Tool';
                    if (tooltext.innerText !== text) {
                        tooltext.innerText = text;
                    }
                    
                    tooltip.classList.add('visible');
                    tooltip.style.left = `${e.clientX}px`;
                    tooltip.style.top = `${e.clientY}px`;
                } else {
                    tooltip.classList.remove('visible');
                }
            });

            techSection.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });
        }
    }

    initProjectFilters() {
        const btns = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.project-card');

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                cards.forEach(card => {
                    card.classList.remove('blurred', 'pulsed');
                    
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.order = "-1";
                        if (filter !== 'all') {
                            card.classList.add('pulsed');
                            setTimeout(()=>card.classList.remove('pulsed'), 300);
                        }
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

            // 6. Projects Cards Drop (elastic ease)
            gsap.fromTo('.project-card', 
                { y: 100, opacity: 0 },
                { scrollTrigger: { trigger: '#projects-masonry', start: "top 70%", toggleActions: "play reverse play reverse" },
                  y: 0, opacity: 1,
                  duration: 1.2, stagger: 0.1, ease: "back.out(1.4)"
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
