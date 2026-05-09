document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    const backToTop = document.getElementById('backToTop');

    // Header scroll effect + back-to-top visibility
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (backToTop) {
            if (window.scrollY > 600) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Mobile sticky CTA — show after scrolling past hero
        const stickyCta = document.getElementById('stickyCta');
        if (stickyCta) {
            const contactSection = document.getElementById('contact');
            const contactTop = contactSection ? contactSection.getBoundingClientRect().top + window.scrollY : Infinity;
            if (window.scrollY > 400 && window.scrollY + window.innerHeight < contactTop) {
                stickyCta.classList.add('visible');
            } else {
                stickyCta.classList.remove('visible');
            }
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active') ? 'true' : 'false');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==============================
    // Scroll-triggered Animations
    // ==============================
    const animatedElements = document.querySelectorAll('.fade-in-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // ==============================
    // Counter Animation
    // ==============================
    const counterElements = document.querySelectorAll('[data-count]');

    // easeOutExpo: 最初は速く、終わりにゆっくり止まる
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-count'), 10);

                if (target === 0) {
                    el.textContent = '0';
                    counterObserver.unobserve(el);
                    return;
                }

                const duration = 1800;
                const startTime = performance.now();

                function tick(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = easeOutExpo(progress);
                    el.textContent = Math.round(easedProgress * target);

                    if (progress < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        el.textContent = target;
                    }
                }

                requestAnimationFrame(tick);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.4 });

    counterElements.forEach(el => counterObserver.observe(el));

    // ==============================
    // Case Card Toggle
    // ==============================
    const caseGrid = document.querySelector('.case-study-grid');

    function addToggleButton(card) {
        const btn = document.createElement('button');
        btn.className = 'case-toggle-btn';
        btn.innerHTML = '詳細を見る <span class="case-toggle-arrow">▼</span>';
        card.appendChild(btn);

        btn.addEventListener('click', () => {
            const isOpen = card.classList.contains('is-open');
            card.classList.toggle('is-open');
            const arrow = btn.querySelector('.case-toggle-arrow');
            if (isOpen) {
                btn.innerHTML = '詳細を見る <span class="case-toggle-arrow">▼</span>';
            } else {
                btn.innerHTML = '閉じる <span class="case-toggle-arrow">▼</span>';
            }
        });
    }

    document.querySelectorAll('.case-study-card').forEach(card => addToggleButton(card));

    // ==============================
    // Case Section Height Equalizer
    // ==============================
    function equalizeCaseHeights() {
        const cards = [...document.querySelectorAll('.case-study-card')];
        if (cards.length < 2) return;

        const bodies = cards.map(c => c.querySelector('.case-body'));

        // Temporarily override max-height for measurement without transition
        bodies.forEach(b => {
            b.style.transition = 'none';
            b.style.maxHeight = '9999px';
            b.style.overflow = 'visible';
        });

        // Force reflow
        document.body.offsetHeight;

        // Equalize case-header heights
        const headers = cards.map(c => c.querySelector('.case-header'));
        headers.forEach(h => { h.style.minHeight = ''; });
        const maxHeaderH = Math.max(...headers.map(h => h.offsetHeight));
        headers.forEach(h => { h.style.minHeight = maxHeaderH + 'px'; });

        // Equalize each case-section by position index
        const maxSections = Math.max(...cards.map(c => c.querySelectorAll('.case-section').length));
        for (let i = 0; i < maxSections; i++) {
            const sections = cards.map(c => c.querySelectorAll('.case-section')[i]).filter(Boolean);
            sections.forEach(s => { s.style.minHeight = ''; });
            const maxH = Math.max(...sections.map(s => s.offsetHeight));
            sections.forEach(s => { s.style.minHeight = maxH + 'px'; });
        }

        // Equalize case-testimonial heights
        const testimonials = cards.map(c => c.querySelector('.case-testimonial')).filter(Boolean);
        if (testimonials.length > 1) {
            testimonials.forEach(t => { t.style.minHeight = ''; });
            const maxT = Math.max(...testimonials.map(t => t.offsetHeight));
            testimonials.forEach(t => { t.style.minHeight = maxT + 'px'; });
        }

        // Restore: clear inline styles so CSS class (.is-open) takes over
        bodies.forEach(b => {
            b.style.maxHeight = '';
            b.style.overflow = '';
            requestAnimationFrame(() => { b.style.transition = ''; });
        });
    }

    window.addEventListener('load', equalizeCaseHeights);

    // ==============================
    // FAQ Accordion
    // ==============================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    other.querySelector('.faq-answer').style.maxHeight = null;
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
                question.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
});
