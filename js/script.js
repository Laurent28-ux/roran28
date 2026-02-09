
/* =========================================
   RŌRAN28 - SCRIPT PRINCIPAL
   ========================================= */

// Constantes
const STORAGE_KEYS = {
    ANIMES: 'roran28_animes',
    PLANNING: 'roran28_planning',
    MYLIST: 'roran28_mylist'
};

// Variables globales
let currentSlide = 0;
let carouselInterval = null;
let carouselAnimes = [];

// =========================================
// INITIALISATION
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    loadAnimes();
    initCarousel();
    initTrendingCarousel();
    initPlanningPreview();
    addScrollEffects();
}

function setupEventListeners() {
    // Gestion des modals au clic en dehors
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });
    
    // Gestion de la touche ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
    
    // Support des gestes tactiles pour le carousel
    setupTouchGestures();
    
    // Scroll header effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// =========================================
// DONNÉES D'ANIMES
// =========================================
function loadAnimes() {
    const animes = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANIMES) || '[]');
    
    // Si pas de données, créer des données par défaut
    if (animes.length === 0) {
        const defaultAnimes = [
            {
                id: '1',
                title: 'Demon Slayer: Kimetsu no Yaiba',
                type: 'Série',
                genre: 'Action, Fantastique, Shōnen',
                episodes: 44,
                status: 'En cours',
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1630710478039-9c680b99f800?w=400&h=600&fit=crop',
                description: 'Tanjiro Kamado, dont la famille a été massacrée par des démons, entreprend de devenir un tueur de démons pour sauver sa sœur Nezuko qui a été transformée en démon.'
            },
            {
                id: '2',
                title: 'Attack on Titan',
                type: 'Série',
                genre: 'Action, Drame, Fantastique',
                episodes: 87,
                status: 'Terminé',
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=600&fit=crop',
                description: 'L\'humanité vit retranchée derrière d\'immenses murailles pour se protéger des Titans, des créatures géantes qui dévorent les humains.'
            },
            {
                id: '3',
                title: 'My Hero Academia',
                type: 'Série',
                genre: 'Action, Shōnen, Super-héros',
                episodes: 138,
                status: 'En cours',
                rating: 4.7,
                image: 'https://images.unsplash.com/photo-1767390771847-b0e047ee30e3?w=400&h=600&fit=crop',
                description: 'Dans un monde où 80% de la population possède un super-pouvoir, Izuku Midoriya rêve de devenir le plus grand des héros malgré son absence de pouvoir.'
            },
            {
                id: '4',
                title: 'Jujutsu Kaisen',
                type: 'Série',
                genre: 'Action, Surnaturel, Shōnen',
                episodes: 47,
                status: 'En cours',
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1689661851489-040530fd6d04?w=400&h=600&fit=crop',
                description: 'Yuji Itadori rejoint une organisation secrète de sorciers pour combattre les fléaux après avoir avalé un doigt maudit pour sauver ses amis.'
            },
            {
                id: '5',
                title: 'Your Name',
                type: 'Film',
                genre: 'Romance, Fantastique, Drame',
                duration: 106,
                episodes: 1,
                status: 'Terminé',
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
                description: 'Deux adolescents, Mitsuha et Taki, échangent mystérieusement leurs corps et tentent de se retrouver à travers le temps et l\'espace.'
            },
            {
                id: '6',
                title: 'One Piece',
                type: 'Série',
                genre: 'Aventure, Comédie, Shōnen',
                episodes: 1085,
                status: 'En cours',
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
                description: 'Monkey D. Luffy et son équipage de pirates parcourent les mers à la recherche du légendaire trésor One Piece pour devenir le Roi des Pirates.'
            },
            {
                id: '7',
                title: 'Death Note',
                type: 'Série',
                genre: 'Thriller, Surnaturel, Psychologique',
                episodes: 37,
                status: 'Terminé',
                rating: 4.7,
                image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop',
                description: 'Light Yagami découvre un cahier surnaturel qui permet de tuer quiconque dont on écrit le nom dedans.'
            },
            {
                id: '8',
                title: 'Spirited Away',
                type: 'Film',
                genre: 'Fantastique, Aventure, Animation',
                duration: 125,
                episodes: 1,
                status: 'Terminé',
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=400&h=600&fit=crop',
                description: 'Chihiro, 10 ans, se retrouve piégée dans un monde magique où elle doit travailler dans un bain public pour esprits pour sauver ses parents.'
            },
            {
                id: '9',
                title: 'Chainsaw Man',
                type: 'Série',
                genre: 'Action, Horreur, Shōnen',
                episodes: 12,
                status: 'En cours',
                rating: 4.6,
                image: 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&h=600&fit=crop',
                description: 'Denji, un jeune chasseur de démons endetté, fusionne avec son démon-chien Pochita pour devenir Chainsaw Man et rejoindre une organisation officielle.'
            },
            {
                id: '10',
                title: 'Spy x Family',
                type: 'Série',
                genre: 'Comédie, Action, Tranche de vie',
                episodes: 25,
                status: 'En cours',
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=600&fit=crop',
                description: 'Un espion, une tueuse et une télépathe forment une fausse famille pour leurs missions secrètes respectives.'
            },
            {
                id: '11',
                title: 'Frieren: Beyond Journey\'s End',
                type: 'Série',
                genre: 'Fantastique, Aventure, Drame',
                episodes: 28,
                status: 'En cours',
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=400&h=600&fit=crop',
                description: 'L\'elfe mage Frieren réfléchit sur la vie et la mortalité après la mort de ses compagnons d\'aventure humains.'
            },
            {
                id: '12',
                title: 'Naruto Shippuden',
                type: 'Série',
                genre: 'Action, Aventure, Shōnen',
                episodes: 500,
                status: 'Terminé',
                rating: 4.7,
                image: 'https://images.unsplash.com/photo-1578269178381-1cfc83985ed0?w=400&h=600&fit=crop',
                description: 'Naruto Uzumaki revient après deux ans d\'entraînement pour sauver son ami Sasuke et protéger son village contre l\'organisation Akatsuki.'
            }
        ];
        
        localStorage.setItem(STORAGE_KEYS.ANIMES, JSON.stringify(defaultAnimes));
        displayAnimes(defaultAnimes);
    } else {
        displayAnimes(animes);
    }
}

function displayAnimes(animes) {
    const grid = document.getElementById('animesGrid');
    if (!grid) return;
    
    // Prendre seulement 6 animes pour la page d'accueil
    const displayAnimes = animes.slice(0, 6);
    
    grid.innerHTML = displayAnimes.map(anime => createAnimeCard(anime)).join('');
}

function createAnimeCard(anime) {
    const episodesText = anime.type === 'Film' ? 
        `${anime.duration || 90} min` : 
        `${anime.episodes} épisodes`;
    
    return `
        <div class="anime-card" onclick="showLoginModal()" role="button" tabindex="0" aria-label="Voir ${anime.title}">
            <img src="${anime.image}" 
                 alt="${anime.title}" 
                 class="anime-card-image" 
                 loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop'">
            <div class="anime-card-content">
                <h3 class="anime-card-title">${anime.title}</h3>
                <div class="anime-card-info">
                    <span class="anime-card-episodes">
                        <i class="fas fa-film"></i> ${episodesText}
                    </span>
                    <span class="anime-card-status">${anime.status}</span>
                </div>
                <p class="anime-card-genre">
                    <i class="fas fa-tag"></i> ${anime.genre}
                </p>
                <p class="anime-card-description">${anime.description}</p>
            </div>
        </div>
    `;
}

// =========================================
// CAROUSEL PRINCIPAL
// =========================================
function initCarousel() {
    const animes = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANIMES) || '[]');
    
    // Prioriser les animes trending pour le carousel hero
    let trendingAnimes = animes.filter(anime => anime.isTrending);
    
    if (trendingAnimes.length >= 5) {
        carouselAnimes = trendingAnimes.slice(0, 5);
    } else {
        // Compléter avec d'autres animes si pas assez de trending
        const remaining = animes.filter(anime => !anime.isTrending);
        carouselAnimes = [...trendingAnimes, ...remaining].slice(0, 5);
    }
    
    const slidesContainer = document.getElementById('carousel-slides');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    if (!slidesContainer || !indicatorsContainer) return;
    
    // Créer les slides
    slidesContainer.innerHTML = carouselAnimes.map((anime, index) => {
        const episodesText = anime.type === 'Film' ? 
            `${anime.duration || 90} min` : 
            `${anime.episodes} épisodes`;
        
        return `
            <div class="carousel-slide" role="tabpanel" aria-label="Slide ${index + 1}">
                <div class="carousel-slide-bg" style="background-image: url('${anime.image}')"></div>
                <div class="carousel-slide-content">
                    <div class="carousel-slide-category">
                        <i class="fas fa-fire"></i>
                        ${anime.status}
                    </div>
                    <h2 class="carousel-slide-title">${anime.title}</h2>
                    <div class="carousel-slide-meta">
                        <span><i class="fas fa-star"></i> ${anime.rating || 4.5}/5</span>
                        <span><i class="fas fa-film"></i> ${episodesText}</span>
                        <span><i class="fas fa-tag"></i> ${anime.genre.split(',')[0]}</span>
                    </div>
                    <p class="carousel-slide-description">${anime.description}</p>
                    <div class="carousel-slide-actions">
                        <button class="btn btn-primary btn-large" onclick="showLoginModal()">
                            <i class="fas fa-play"></i>
                            Regarder maintenant
                        </button>
                        <button class="btn btn-secondary btn-large" onclick="showLoginModal()">
                            <i class="fas fa-plus"></i>
                            Ma liste
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Créer les indicateurs
    indicatorsContainer.innerHTML = carouselAnimes.map((_, index) => `
        <button class="carousel-indicator ${index === 0 ? 'active' : ''}" 
                onclick="goToSlide(${index})"
                role="tab"
                aria-label="Aller au slide ${index + 1}"
                aria-selected="${index === 0}"></button>
    `).join('');
    
    // Démarrer l'auto-play
    startCarouselAutoplay();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    resetCarouselAutoplay();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselAnimes.length;
    updateCarousel();
    resetCarouselAutoplay();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + carouselAnimes.length) % carouselAnimes.length;
    updateCarousel();
    resetCarouselAutoplay();
}

function updateCarousel() {
    const slidesContainer = document.getElementById('carousel-slides');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
        const isActive = index === currentSlide;
        indicator.classList.toggle('active', isActive);
        indicator.setAttribute('aria-selected', isActive);
    });
}

function startCarouselAutoplay() {
    carouselInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function resetCarouselAutoplay() {
    clearInterval(carouselInterval);
    startCarouselAutoplay();
}

// =========================================
// CAROUSEL DE TENDANCES
// =========================================
function initTrendingCarousel() {
    const animes = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANIMES) || '[]');
    const carousel = document.getElementById('trending-carousel');
    
    if (!carousel) return;
    
    // Filtrer d'abord les animes marqués comme trending
    let trending = animes.filter(anime => anime.isTrending);
    
    // Si aucun anime n'est marqué comme trending, prendre les mieux notés
    if (trending.length === 0) {
        trending = [...animes]
            .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
            .slice(0, 8);
    } else {
        // Limiter à 8 animes trending
        trending = trending.slice(0, 8);
    }
    
    carousel.innerHTML = trending.map(anime => createAnimeCard(anime)).join('');
}

function scrollCarousel(id, direction) {
    const carousel = document.getElementById(`${id}-carousel`);
    if (!carousel) return;
    
    const scrollAmount = 260; // Largeur d'une carte + gap
    carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// =========================================
// PLANNING PREVIEW
// =========================================
function initPlanningPreview() {
    const planning = [
        { day: 'Lundi', time: '20:00', anime: 'Demon Slayer', episode: 'Épisode 45' },
        { day: 'Mardi', time: '19:00', anime: 'Jujutsu Kaisen', episode: 'Épisode 48' },
        { day: 'Mercredi', time: '21:30', anime: 'My Hero Academia', episode: 'Épisode 139' },
        { day: 'Jeudi', time: '20:30', anime: 'Chainsaw Man', episode: 'Épisode 13' },
        { day: 'Vendredi', time: '19:00', anime: 'Spy x Family', episode: 'Épisode 26' },
        { day: 'Samedi', time: '18:00', anime: 'Frieren', episode: 'Épisode 29' }
    ];
    
    const grid = document.getElementById('planningPreview');
    if (!grid) return;
    
    grid.innerHTML = planning.map(item => `
        <div class="planning-item" onclick="showLoginModal()">
            <div class="planning-day">${item.day}</div>
            <div class="planning-time"><i class="fas fa-clock"></i> ${item.time}</div>
            <div class="planning-anime">${item.anime}</div>
            <div class="planning-episode">${item.episode}</div>
        </div>
    `).join('');
}

// =========================================
// RECHERCHE
// =========================================
function toggleSearch() {
    const searchBar = document.getElementById('searchBarMobile');
    const input = document.getElementById('mobileSearchInput');
    
    if (!searchBar || !input) return;
    
    searchBar.classList.toggle('active');
    
    if (searchBar.classList.contains('active')) {
        input.focus();
    }
}

// =========================================
// MODALS
// =========================================
function showLoginModal() {
    openModal('loginModal');
}

function showSignupModal() {
    openModal('signupModal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus sur le premier input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Réinitialiser les formulaires
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }
}

function switchToSignup() {
    closeModal('loginModal');
    showSignupModal();
}

function switchToLogin() {
    closeModal('signupModal');
    showLoginModal();
}

// =========================================
// TOGGLE PASSWORD
// =========================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const button = input.parentElement.querySelector('.toggle-password');
    const icon = button?.querySelector('i');
    
    if (!button || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        button.setAttribute('aria-label', 'Cacher le mot de passe');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        button.setAttribute('aria-label', 'Afficher le mot de passe');
    }
}

// =========================================
// TOUCH GESTURES
// =========================================
function setupTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const carousel = document.querySelector('.hero-carousel');
    
    if (carousel) {
        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
}

// =========================================
// SCROLL EFFECTS
// =========================================
function addScrollEffects() {
    // Intersection Observer pour les animations au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observer tous les éléments avec animation
    document.querySelectorAll('.anime-card, .feature-card, .planning-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// =========================================
// KEYBOARD NAVIGATION
// =========================================
document.addEventListener('keydown', (e) => {
    // Navigation du carousel avec les flèches
    if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
    }
    
    // Fermer les modals avec Escape
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// =========================================
// CLEANUP
// =========================================
window.addEventListener('beforeunload', () => {
    clearInterval(carouselInterval);
});

// =========================================
// LOG
// =========================================
console.log('🌸 Rōran28 - Application initialisée avec succès!');
console.log('📱 Version: 2.0.0');
console.log('🎨 Design inspiré de Crunchyroll');
