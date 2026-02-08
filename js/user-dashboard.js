/* =========================================
   RŌRAN28 - DASHBOARD STYLE NETFLIX
   ========================================= */

let currentUser = null;
let allAnimes = [];
let heroInterval = null;

// =========================================
// INITIALISATION
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadAnimes();
    setupScrollEffect();
    setupSearch();
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('roran28_user') || 'null');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;
    updateUserInfo();
}

function updateUserInfo() {
    if (!currentUser) return;
    
    const initials = currentUser.name ? 
        currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    
    const avatars = ['headerAvatar', 'dropdownAvatar'];
    avatars.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = initials;
    });
    
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) userName.textContent = currentUser.name || 'User';
    if (userEmail) userEmail.textContent = currentUser.email || '';
}

// =========================================
// CHARGEMENT DES ANIMES
// =========================================
function loadAnimes() {
    allAnimes = JSON.parse(localStorage.getItem('roran28_animes') || '[]');
    
    if (allAnimes.length === 0) {
        setupDefaultHero();
        showEmptyState();
        return;
    }
    
    // Hero carousel automatique
    startHeroCarousel();
    
    // Charger les sections
    loadSection('trendingNow', allAnimes);
    loadSection('popularAnimes', allAnimes);
    loadSection('newReleases', allAnimes);
    
    // Continue watching (si données disponibles)
    loadContinueWatching();
    
    // My List (si données disponibles)
    loadMyList();
}

function startHeroCarousel() {
    if (allAnimes.length === 0) return;
    
    let currentIndex = 0;
    updateHero(allAnimes[currentIndex]);
    
    heroInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % allAnimes.length;
        updateHero(allAnimes[currentIndex]);
    }, 8000);
}

function updateHero(anime) {
    const heroBg = document.getElementById('heroBg');
    const heroTitle = document.getElementById('heroTitle');
    const heroYear = document.getElementById('heroYear');
    const heroGenre = document.getElementById('heroGenre');
    const heroRating = document.getElementById('heroRating');
    const heroDescription = document.getElementById('heroDescription');
    
    if (heroBg) {
        heroBg.style.opacity = '0';
        setTimeout(() => {
            heroBg.src = anime.image;
            heroBg.style.opacity = '1';
        }, 300);
    }
    
    if (heroTitle) heroTitle.textContent = anime.title;
    if (heroYear) heroYear.textContent = '2024';
    if (heroGenre) heroGenre.textContent = anime.genre || 'Anime';
    if (heroRating) heroRating.textContent = anime.rating || '9.0';
    if (heroDescription) {
        heroDescription.textContent = anime.description || 
            'Plongez dans cet univers captivant et découvrez une histoire extraordinaire qui vous tiendra en haleine.';
    }
}

function setupDefaultHero() {
    const heroTitle = document.getElementById('heroTitle');
    const heroDescription = document.getElementById('heroDescription');
    
    if (heroTitle) heroTitle.textContent = 'Bienvenue sur Rōran28';
    if (heroDescription) {
        heroDescription.textContent = 'Découvrez les meilleurs animes en streaming. ' +
            'L\'administrateur doit ajouter des animes pour commencer.';
    }
}

function loadSection(containerId, animes) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (animes.length === 0) {
        container.innerHTML = '<div class="empty-message">Aucun anime disponible</div>';
        return;
    }
    
    // Limiter à 10 animes par section
    const displayAnimes = animes.slice(0, 10);
    container.innerHTML = displayAnimes.map(anime => createAnimeCard(anime)).join('');
}

function createAnimeCard(anime, showProgress = false) {
    const progress = showProgress ? 65 : 0; // Exemple de progression
    
    return `
        <div class="anime-card" onclick="playAnime('${anime.id}')">
            <div class="card-image-wrapper">
                <img class="card-image" 
                     src="${anime.image}" 
                     alt="${anime.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=400&fit=crop'">
                <div class="card-overlay"></div>
                <div class="card-play-btn">
                    <i class="fas fa-play"></i>
                </div>
                ${showProgress ? `
                    <div class="card-progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                ` : ''}
                <div class="card-info">
                    <h3 class="card-title">${anime.title}</h3>
                    <div class="card-meta">
                        <span class="card-rating">
                            <i class="fas fa-star"></i> ${anime.rating || '9.0'}
                        </span>
                        <span>${anime.genre || 'Anime'}</span>
                        <span>${anime.episodes || 12} épisodes</span>
                    </div>
                    <div class="card-actions">
                        <button class="card-btn" onclick="event.stopPropagation(); addToList('${anime.id}')" title="Add to My List">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="card-btn" onclick="event.stopPropagation(); showInfo('${anime.id}')" title="More Info">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadContinueWatching() {
    const continueData = JSON.parse(localStorage.getItem('continue_watching_' + currentUser.email) || '[]');
    
    if (continueData.length === 0) {
        document.getElementById('continueSection').style.display = 'none';
        return;
    }
    
    document.getElementById('continueSection').style.display = 'block';
    const container = document.getElementById('continueWatching');
    
    const animes = continueData.map(item => {
        const anime = allAnimes.find(a => a.id === item.animeId);
        return anime;
    }).filter(Boolean);
    
    container.innerHTML = animes.map(anime => createAnimeCard(anime, true)).join('');
}

function loadMyList() {
    const myListData = JSON.parse(localStorage.getItem('my_list_' + currentUser.email) || '[]');
    
    if (myListData.length === 0) {
        document.getElementById('myListSection').style.display = 'none';
        return;
    }
    
    document.getElementById('myListSection').style.display = 'block';
    const container = document.getElementById('myList');
    
    const animes = myListData.map(id => allAnimes.find(a => a.id === id)).filter(Boolean);
    container.innerHTML = animes.map(anime => createAnimeCard(anime)).join('');
}

function showEmptyState() {
    const containers = ['trendingNow', 'popularAnimes', 'newReleases'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #666;">
                    <i class="fas fa-film" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    <p>Aucun anime disponible pour le moment</p>
                    <p style="font-size: 14px; margin-top: 8px;">L'administrateur doit ajouter des animes</p>
                </div>
            `;
        }
    });
}

// =========================================
// INTERACTIONS
// =========================================
function playAnime(animeId) {
    console.log('Playing anime:', animeId);
    
    // Sauvegarder dans "Continue Watching"
    let continueData = JSON.parse(localStorage.getItem('continue_watching_' + currentUser.email) || '[]');
    
    // Vérifier si déjà présent
    const exists = continueData.find(item => item.animeId === animeId);
    if (!exists) {
        continueData.unshift({
            animeId: animeId,
            progress: 0,
            lastWatched: new Date().toISOString()
        });
        localStorage.setItem('continue_watching_' + currentUser.email, JSON.stringify(continueData));
    }
    
    alert('🎬 Lecteur vidéo en développement !');
}

function playHero() {
    if (allAnimes.length > 0) {
        playAnime(allAnimes[0].id);
    }
}

function addToList(animeId) {
    let myList = JSON.parse(localStorage.getItem('my_list_' + currentUser.email) || '[]');
    
    if (myList.includes(animeId)) {
        showToast('Déjà dans votre liste', 'info');
        return;
    }
    
    myList.push(animeId);
    localStorage.setItem('my_list_' + currentUser.email, JSON.stringify(myList));
    showToast('✓ Ajouté à Ma Liste', 'success');
    
    loadMyList();
}

function showInfo(animeId) {
    const anime = allAnimes.find(a => a.id === animeId);
    if (anime) {
        alert(`📺 ${anime.title}\n\n${anime.description || 'Pas de description disponible'}\n\nGenre: ${anime.genre}\nNote: ${anime.rating}/10\nÉpisodes: ${anime.episodes}`);
    }
}

// =========================================
// RECHERCHE
// =========================================
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }
        
        const results = allAnimes.filter(anime => 
            anime.title.toLowerCase().includes(query) ||
            (anime.genre && anime.genre.toLowerCase().includes(query))
        );
        
        displaySearchResults(results);
    });
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    
    if (results.length === 0) {
        container.innerHTML = '<div style="padding: 20px; color: #666; text-align: center;">Aucun résultat</div>';
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; padding: 20px 0;">
            ${results.map(anime => `
                <div style="cursor: pointer;" onclick="playAnime('${anime.id}'); closeSearch();">
                    <img src="${anime.image}" alt="${anime.title}" 
                         style="width: 100%; height: 280px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;"
                         onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop'">
                    <h4 style="font-size: 14px; font-weight: 700;">${anime.title}</h4>
                    <p style="font-size: 12px; color: #999;">${anime.genre || 'Anime'}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function openSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('searchInput').focus();
    }
}

function closeSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
    }
}

// ESC pour fermer la recherche
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSearch();
        toggleUserMenu(false);
    }
});

// =========================================
// SCROLL EFFECT
// =========================================
function setupScrollEffect() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 70) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// =========================================
// USER MENU
// =========================================
function toggleUserMenu(force) {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) return;
    
    if (force !== undefined) {
        dropdown.classList.toggle('active', force);
    } else {
        dropdown.classList.toggle('active');
    }
}

// Fermer dropdown si clic ailleurs
document.addEventListener('click', function(e) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && userMenu && 
        !userMenu.contains(e.target) && 
        !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

function logout() {
    if (confirm('Se déconnecter de Rōran28 ?')) {
        if (heroInterval) clearInterval(heroInterval);
        localStorage.removeItem('roran28_user');
        window.location.href = 'index.html';
    }
}

// =========================================
// TOAST NOTIFICATIONS
// =========================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        padding: 16px 24px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#22c55e' : '#f47521'};
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
