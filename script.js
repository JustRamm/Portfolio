document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Screen ---
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        document.body.classList.add('loading');

        // Wait for animation to finish (approx 3s)
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            splashScreen.style.visibility = 'hidden';
            document.body.classList.remove('loading');

            // Allow time for fade out transition before removing from DOM
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 1500);
        }, 3000);
    }

    // --- Typography Animation (Hero Tagline) ---
    const textElement = document.getElementById('typing-text');
    if (textElement) {
        const taglineText = "Building the future.";
        textElement.innerHTML = '<span class="cursor">|</span>';
        let i = 0;

        function typeWriter() {
            if (i < taglineText.length) {
                const char = taglineText.charAt(i);
                // Insert character before the cursor
                const cursor = textElement.querySelector('.cursor');
                const textNode = document.createTextNode(char);
                textElement.insertBefore(textNode, cursor);
                i++;
                setTimeout(typeWriter, 80); // Slightly slower for better readability
            }
        }
        // Small delay after splash screen to start typing
        setTimeout(typeWriter, 3500);
    }

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    animatedElements.forEach(el => observer.observe(el));

    // --- Image Modal ---
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');

    if (modal && modalImg) {
        document.querySelectorAll('.bento-item, .image-block').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling if nested

                const dataImg = item.getAttribute('data-image');
                const img = item.querySelector('img');

                let imgSrc = dataImg;
                if (!imgSrc && img) imgSrc = img.src;

                // If we found an image to show
                if (imgSrc) {
                    e.preventDefault();
                    modal.style.display = "flex";
                    // Brief timeout to allow display:flex to apply before adding class for transition
                    requestAnimationFrame(() => {
                        modal.classList.add('show');
                    });
                    modalImg.src = imgSrc;
                }
            });
        });

        if (closeModal) {
            closeModal.onclick = () => {
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = "none", 300);
            };
        }

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = "none", 300);
            }
        };
    }

    // --- Animated Dock ---
    const dockContainer = document.querySelector('.dock');
    const dockItems = document.querySelectorAll('.dock-item');

    if (dockContainer && dockItems.length > 0) {
        const baseWidth = 40;
        const maxExtraWidth = 40;
        const range = 150;

        dockContainer.addEventListener('mousemove', (e) => {
            const mouseX = e.pageX;

            dockItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2 + window.scrollX;
                const distance = Math.abs(mouseX - itemCenterX);

                let width = baseWidth;

                if (distance < range) {
                    const val = (1 - distance / range);
                    width = baseWidth + (maxExtraWidth * val * val);
                }

                item.style.width = `${width}px`;
                item.style.height = `${width}px`;

                const icon = item.querySelector('svg');
                if (icon) {
                    const scaleFactor = 1 + (width - baseWidth) / baseWidth * 0.5;
                    icon.style.transform = `scale(${scaleFactor})`;
                }
            });
        });

        dockContainer.addEventListener('mouseleave', () => {
            dockItems.forEach(item => {
                item.style.width = `${baseWidth}px`;
                item.style.height = `${baseWidth}px`;
                const icon = item.querySelector('svg');
                if (icon) {
                    icon.style.transform = `scale(1)`;
                }
            });
        });
    }

    // --- Icon Cloud (TagCanvas) ---
    const slugs = [
        "typescript", "javascript", "dart", "openjdk", "react", "flutter", "android",
        "html5", "nodedotjs", "express", "nextdotjs", "prisma",
        "postgresql", "firebase", "nginx", "vercel", "testinglibrary", "jest",
        "cypress", "docker", "git", "jira", "github", "gitlab",
        "androidstudio", "figma"
    ];

    const tagsContainer = document.getElementById('tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = ''; // Clear existing
        slugs.forEach(slug => {
            const link = document.createElement('a');
            link.href = '#';
            link.onclick = (e) => e.preventDefault();

            const img = document.createElement('img');
            img.src = `https://cdn.simpleicons.org/${slug}/ffffff`;
            img.alt = slug;
            img.style.border = 'none';

            link.appendChild(img);
            tagsContainer.appendChild(link);
        });

        try {
            if (typeof TagCanvas !== 'undefined') {
                TagCanvas.Start('myCanvas', 'tags', {
                    textColour: '#ffffff',
                    outlineColour: '#0000',
                    reverse: true,
                    depth: 0.8,
                    maxSpeed: 0.03, // Slower for elegance
                    minSpeed: 0.01,
                    wheelZoom: false,
                    imageScale: 0.15, // Significantly reduced to prevent overlap
                    fadeIn: 1000,
                    initial: [0.1, -0.1],
                    clickToFront: 600,
                    tooltip: 'native',
                    imageMode: 'image',
                    imagePosition: 'center',
                    shape: 'sphere',
                    noSelect: true,
                    lock: 'xy'
                });
            }
        } catch (e) {
            console.error("Canvas failed to load", e);
            document.getElementById('icon-cloud').style.display = 'none';
        }
    }

    // --- Skills Filter ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCategories = document.querySelectorAll('.skill-category');

    if (filterButtons.length > 0 && skillCategories.length > 0) {
        // Function to filter and display skills
        function filterSkills(filterType) {
            skillCategories.forEach(category => {
                const categoryType = category.getAttribute('data-category');
                const categoryTitle = category.querySelector('.category-title');

                // Add fade out effect
                category.style.opacity = '0';
                category.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    if (filterType === 'all') {
                        category.style.display = 'block';
                        // Show category titles when showing all
                        if (categoryTitle) categoryTitle.style.display = 'block';
                    } else {
                        category.style.display = categoryType === filterType ? 'block' : 'none';
                        // Hide category titles when filtering (button already shows category name)
                        if (categoryTitle) categoryTitle.style.display = 'none';
                    }

                    // Fade in effect
                    setTimeout(() => {
                        category.style.opacity = '1';
                        category.style.transform = 'translateY(0)';
                    }, 50);
                }, 150);
            });
        }

        // Initialize: show all skills with titles
        filterSkills('all');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');

                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter skills
                filterSkills(filter);
            });
        });
    }

    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        // Show/hide button based on scroll position
        function toggleBackToTop() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }

        // Scroll to top when button is clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Listen to scroll events
        window.addEventListener('scroll', toggleBackToTop);

        // Initial check
        toggleBackToTop();
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');

    if (mobileMenuToggle && navLinks) {
        function toggleMenu() {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';

            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileMenuToggle.classList.toggle('active'); // Trigger CSS animation
            navLinks.classList.toggle('active');

            if (navOverlay) {
                navOverlay.classList.toggle('active');
            }

            // Prevent body scroll when menu is open
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        }

        mobileMenuToggle.addEventListener('click', toggleMenu);

        // Close menu when clicking overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', toggleMenu);
        }

        // Close menu when clicking nav links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMenu();
                }
            });
        });

        // Close menu on window resize if it becomes desktop view
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                if (navOverlay) {
                    navOverlay.classList.remove('active');
                }
                mobileMenuToggle.classList.remove('active'); // Reset icon
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }


    // --- Advanced God Mode (Matrix, CRT, Gravity) ---
    const konamiCode = [
        "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
        "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
        "b", "a"
    ];

    // Mobile uses swipes for arrows, ignoring B/A for easier activation
    const mobileKonami = [
        "Up", "Up", "Down", "Down",
        "Left", "Right", "Left", "Right"
    ];

    let keyHistory = [];
    let swipeHistory = [];
    let touchStartX = 0;
    let touchStartY = 0;
    let physicsEngine = null; // Store reference to destroy later
    let physicsRunner = null;
    let matrixInterval = null;
    let animationFrameId = null;

    // Mobile Activation (5 Taps on Logo)
    const navLogoText = document.getElementById('nav-logo-text');
    let logoTapCount = 0;
    let logoTapTimer = null;

    if (navLogoText) {
        navLogoText.addEventListener('click', (e) => {
            // Prevent default navigation if wrapped in a link
            e.preventDefault();

            logoTapCount++;

            // Reset count if too much time passes between taps (500ms)
            clearTimeout(logoTapTimer);
            logoTapTimer = setTimeout(() => {
                logoTapCount = 0;
            }, 500);

            if (logoTapCount >= 5) {
                toggleGodMode(true);
                logoTapCount = 0; // Reset after activation
            }
        });
    }

    // Create UI Elements
    const toast = document.createElement('div');
    toast.id = "god-mode-toast";
    toast.innerHTML = '<img src="images/icons/trophy.svg" alt="Trophy" class="toast-emoji"> GOD MODE ACTIVATED<br>SYSTEM COMPROMISED';
    document.body.appendChild(toast);

    const exitBtn = document.createElement('button');
    exitBtn.id = "god-mode-exit";
    exitBtn.innerText = "EXIT SIMULATION";
    document.body.appendChild(exitBtn);

    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    document.body.prepend(canvas);

    // Toggle Function
    function toggleGodMode(active) {
        if (active) {
            document.body.classList.add('god-mode');
            // Force reflow to ensure God Mode styles (like font sizes) are applied before physics starts
            void document.body.offsetHeight;

            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 4000);

            // 1. Start Matrix Rain
            startMatrixRain();

            // 2. Hide clutter and background effects
            const tagline = document.getElementById('typing-text');
            if (tagline) tagline.style.opacity = '0';
            const waves = document.getElementById('waves-container');
            if (waves) waves.style.display = 'none';

            // 3. Force all animated elements to be visible so they have rects
            document.querySelectorAll('.fade-in, .slide-up, .section-title').forEach(el => {
                el.classList.add('visible');
                el.style.opacity = '1';
                el.style.visibility = 'visible';
            });

            // 4. Start Gravity Physics (Matter.js)
            if (!window.Matter) {
                const script = document.createElement('script');
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
                script.onload = () => enablePhysics();
                document.head.appendChild(script);
            } else {
                enablePhysics();
            }

            // Play Sound
            playSound(true);

        } else {
            // Deactivate
            document.body.classList.remove('god-mode');

            // Allow page reload to fully reset physics mess
            if (confirm("Disabling God Mode requires a system reboot to restore order. Reload now?")) {
                location.reload();
            } else {
                stopGodModeEffects();
            }
        }
    }

    function stopGodModeEffects() {
        document.body.style.height = '';
        const waves = document.getElementById('waves-container');
        if (waves) waves.style.display = '';
        if (physicsEngine) {
            Matter.World.clear(physicsEngine.world);
            Matter.Engine.clear(physicsEngine);
            if (physicsRunner) Matter.Runner.stop(physicsRunner);
            physicsEngine = null;
            physicsRunner = null;
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        stopMatrixRain();

        // Reset DOM elements styles
        const elements = document.querySelectorAll('.bento-card, .service-card, .contact-option, h1, h2, .chip, .bento-tag, .skill-tag');
        elements.forEach(el => {
            el.style.position = '';
            el.style.top = '';
            el.style.left = '';
            el.style.transform = '';
            el.style.zIndex = '';
            el.style.margin = '';
            // Don't reset width here abruptly or layout shifts might be ugly, but removing style is correct
            el.style.width = '';
            el.style.height = '';
        });
    }

    exitBtn.addEventListener('click', () => toggleGodMode(false));

    function playSound(isStart) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = isStart ? 'sawtooth' : 'sine';

                // Professional Glitch Sound
                if (isStart) {
                    osc.frequency.setValueAtTime(100, ctx.currentTime);
                    osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.1);
                    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
                }

                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            }
        } catch (e) { }
    }

    // --- Matrix Rain Logic ---
    function startMatrixRain() {
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        const fontSize = 14;
        const columns = Math.ceil(canvas.width / fontSize);
        const drops = Array(columns).fill(1).map(() => Math.random() * -100);

        function draw() {
            // Fade effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#39FF14"; // Matrix Green
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                ctx.fillText(text, x, y);

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        matrixInterval = setInterval(draw, 33);
    }

    function stopMatrixRain() {
        if (matrixInterval) clearInterval(matrixInterval);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // --- Gravity/Physics Logic (Matter.js) ---
    function enablePhysics() {
        const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Runner } = Matter;

        // 1. Setup Engine using chaos-ready settings
        const engine = Engine.create();
        engine.gravity.y = 0.4; // Slower gravity for a more cinematic "collapse"
        physicsEngine = engine;

        // 2. Setup Invisible Renderer for Mouse Interaction
        const render = Render.create({
            element: document.body,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false, // We don't want to see debug lines
                background: 'transparent' // Important!
            }
        });

        // Ensure the canvas sits above everything else but below the Exit button
        render.canvas.style.position = 'fixed';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.pointerEvents = 'none'; // Allow scrolling through the debug canvas
        render.canvas.style.zIndex = '9999';

        // 3. Create Bodies from DOM Elements
        // We select key UI cards to fall. Text falls are messy, so we stick to containers.
        // Select all significant content blocks, including all headings, buttons, images, and containers
        const selector = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            '.section-title', '.btn', '.badge', '.logo', '.nav-links a',
            'p', 'img', 'svg', '.card', '.bento-card', '.service-card',
            '.education-card', '.workflow-card', '.behind-the-code-card',
            '.about-text', '.edu-item', '.btc-extra-item', '.github-calendar-wrapper',
            '.github-stats-img', '.bento-item', '.skill-tag', '.footer-dock',
            '.copyright', '.contact-item', '.timeline-item', '.service-icon-img',
            '.project-card', '.gallery-item', '.timeline-date', '.timeline-content',
            '.company', '.edu-year', '.edu-place', '.btc-badge', '.workflow-step',
            '.workflow-icon', '.skill-category', '.chip', '.bento-tag',
            '.skill-category h3', '.container > h2', '.section-full-width h2'
        ].join(', ');

        const allElements = Array.from(document.querySelectorAll(selector)).filter(el => {
            return !el.closest('#god-mode-exit') && !el.closest('#god-mode-toast') && !el.closest('#matrix-canvas');
        });

        // Calculate all positions FIRST to avoid layout shift conflicts
        const elementData = allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { el, rect };
        }).filter(data => data.rect.width > 0 && data.rect.height > 0);

        const bodies = [];

        elementData.forEach(data => {
            const { el, rect } = data;

            // Create physics body matching element dimensions & position
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2 + window.scrollY;

            const body = Bodies.rectangle(centerX, centerY, rect.width, rect.height, {
                restitution: 0.4,
                friction: 0.5,
                frictionAir: 0.06,
                density: 0.01,
                angle: (Math.random() - 0.5) * 0.2
            });

            body.domElement = el;

            // Apply a small random kick
            Matter.Body.applyForce(body, body.position, {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.01
            });

            // "Freeze" the visual element dimensions
            el.style.width = `${rect.width}px`;
            el.style.height = `${rect.height}px`;

            bodies.push(body);
        });

        // 4. Create Boundaries (Floor, Walls)
        // Responsive boundaries relative to current scroll + viewport
        // We make a "container" that encloses the current scroll height + viewport
        const docHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight);
        document.body.style.height = `${docHeight}px`; // Prevent height collapse
        const groundY = docHeight + 100;

        const ground = Bodies.rectangle(window.innerWidth / 2, groundY, window.innerWidth * 2, 200, { isStatic: true });
        const leftWall = Bodies.rectangle(-100, docHeight / 2, 200, docHeight * 5, { isStatic: true });
        const rightWall = Bodies.rectangle(window.innerWidth + 100, docHeight / 2, 200, docHeight * 5, { isStatic: true });

        // Add a "Ceiling" far up to prevent flying off into space too easily
        const ceiling = Bodies.rectangle(window.innerWidth / 2, -2000, window.innerWidth * 2, 200, { isStatic: true });

        World.add(engine.world, [ground, leftWall, rightWall, ceiling, ...bodies]);

        // 5. Add Mouse Control
        // This is tricky because the canvas is fixed/screenspace but bodies are worldspace.
        // We need a mouse that tracks screen coordinates but interacts with the world.
        const mouse = Mouse.create(document.body); // Listen for events on the body to allow scrolling
        // Fix mouse offset for scrolling

        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        // Disable mouse wheel capture to allow scrolling
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

        World.add(engine.world, mouseConstraint);

        // 6. Run the Engine
        const runner = Runner.create();
        physicsRunner = runner;
        Runner.run(runner, engine);

        // 7. Sync Loop: Update DOM positions based on Physics World
        function update() {
            if (!physicsEngine) return;

            // Update Mouse offset for current scroll
            // Only strictly needed if we want to drag things while scrolling, 
            // but scrolling is weird in gravity mode anyway.
            Mouse.setOffset(mouse, { x: 0, y: window.scrollY });

            bodies.forEach(body => {
                const el = body.domElement;
                if (el) {
                    if (el.style.position !== 'absolute') {
                        el.style.position = 'absolute';
                        el.style.margin = '0';
                        el.style.zIndex = '1000';
                    }

                    // Translate physics coordinates (center) to DOM coordinates (top-left)
                    // Since we set position: absolute, coordinates are relative to the document (<html>)
                    // Matter.js bodies are also generally working in "world space".

                    const x = body.position.x - el.offsetWidth / 2;
                    const y = body.position.y - el.offsetHeight / 2;

                    el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;

                    // Important: Reset top/left to 0 because transform handles everything
                    el.style.top = '0';
                    el.style.left = '0';
                }
            });

            animationFrameId = requestAnimationFrame(update);
        }
        update();
    }

    // Keyboard Listener
    document.addEventListener('keydown', (e) => {
        keyHistory.push(e.key);
        // Keep only as many keys as needed
        if (keyHistory.length > konamiCode.length) {
            keyHistory.shift();
        }
        if (JSON.stringify(keyHistory) === JSON.stringify(konamiCode)) {
            toggleGodMode(true);
            keyHistory = []; // Reset
        }
    });

    // Touch/Swipe Listener
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;

        handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    }, { passive: true });

    function handleSwipe(startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
        const threshold = 50; // Min distance for swipe

        if (Math.max(absX, absY) < threshold) return; // Tap, not swipe

        let direction = "";
        if (absX > absY) {
            direction = diffX > 0 ? "Right" : "Left";
        } else {
            direction = diffY > 0 ? "Down" : "Up";
        }

        swipeHistory.push(direction);
        if (swipeHistory.length > mobileKonami.length) {
            swipeHistory.shift();
        }

        if (JSON.stringify(swipeHistory) === JSON.stringify(mobileKonami)) {
            toggleGodMode(true);
            swipeHistory = [];
        }
    }
});
