document.addEventListener('DOMContentLoaded', () => {
    // --- Typography Animation (Hero) ---
    const textElement = document.getElementById('typing-text');
    if (textElement) {
        const plainText = "Hi, I'm Abiram T Bijoy.\nBuilding the future.";
        textElement.innerHTML = '<span class="cursor">|</span>';
        let i = 0;

        function typeWriter() {
            if (i < plainText.length) {
                const char = plainText.charAt(i);
                const currentContent = textElement.innerHTML.replace('<span class="cursor">|</span>', '');

                if (char === '\n') {
                    textElement.innerHTML = currentContent + '<br>' + '<span class="cursor">|</span>';
                } else {
                    textElement.innerHTML = currentContent + char + '<span class="cursor">|</span>';
                }
                i++;
                setTimeout(typeWriter, 50);
            } else {
                const cursor = textElement.querySelector('.cursor');
                if (cursor) {
                    setInterval(() => {
                        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
                    }, 500);
                }
            }
        }
        setTimeout(typeWriter, 500);
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
});
