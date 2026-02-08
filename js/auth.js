
/* =========================================
   RŌRAN28 - AUTHENTIFICATION
   ========================================= */

// Clés de stockage
const AUTH_KEY = 'roran28_user';
const USERS_KEY = 'roran28_users';
const ANIMES_KEY = 'roran28_animes';
const MYLIST_KEY = 'roran28_mylist';
const PLANNING_KEY = 'roran28_planning';
const HISTORY_KEY = 'roran28_history';

// =========================================
// INITIALISATION DES DONNÉES
// =========================================
function initData() {
    // Initialiser les utilisateurs par défaut
    if (!localStorage.getItem(USERS_KEY)) {
        const defaultUsers = [
            {
                id: '1',
                name: 'Administrateur',
                email: 'admin@roran28.com',
                password: 'admin123',
                role: 'admin',
                avatar: null,
                preferences: {
                    emailNotifications: true,
                    autoplay: true,
                    language: 'fr'
                },
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'John Doe',
                email: 'user@test.com',
                password: '123456',
                role: 'user',
                avatar: null,
                preferences: {
                    emailNotifications: true,
                    autoplay: true,
                    language: 'fr'
                },
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
    
    // Initialiser le planning
    if (!localStorage.getItem(PLANNING_KEY)) {
        const defaultPlanning = [
            { id: '1', day: 'Lundi', time: '20:00', anime: 'Demon Slayer', episode: 'Épisode 45', animeId: '1' },
            { id: '2', day: 'Mardi', time: '19:00', anime: 'Jujutsu Kaisen', episode: 'Épisode 48', animeId: '4' },
            { id: '3', day: 'Mercredi', time: '21:30', anime: 'My Hero Academia', episode: 'Épisode 139', animeId: '3' },
            { id: '4', day: 'Jeudi', time: '20:30', anime: 'Chainsaw Man', episode: 'Épisode 13', animeId: '9' },
            { id: '5', day: 'Vendredi', time: '19:00', anime: 'Spy x Family', episode: 'Épisode 26', animeId: '10' },
            { id: '6', day: 'Samedi', time: '18:00', anime: 'Frieren', episode: 'Épisode 29', animeId: '11' }
        ];
        localStorage.setItem(PLANNING_KEY, JSON.stringify(defaultPlanning));
    }
}

// =========================================
// GESTION DES UTILISATEURS
// =========================================
function getCurrentUser() {
    const user = localStorage.getItem(AUTH_KEY);
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    // Ne pas stocker le mot de passe dans la session
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
}

function updateUser(updates) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        setCurrentUser(users[userIndex]);
        return users[userIndex];
    }
    
    return null;
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    showNotification('Déconnexion réussie !', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// =========================================
// AUTHENTIFICATION
// =========================================
function handleLogin(e) {
    if (e) e.preventDefault();
    
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    
    if (!email || !password) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        setCurrentUser(user);
        showNotification(`Bienvenue ${user.name} ! 🌸`, 'success');
        
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }, 1000);
    } else {
        showNotification('Email ou mot de passe incorrect', 'error');
        
        // Effet de shake sur le formulaire
        const form = document.getElementById('loginForm');
        if (form) {
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    }
}

function handleSignup(e) {
    if (e) e.preventDefault();
    
    const name = document.getElementById('signup-name')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim().toLowerCase();
    const password = document.getElementById('signup-password')?.value;
    const confirm = document.getElementById('signup-confirm')?.value;
    
    // Validations
    if (!name || !email || !password || !confirm) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    if (password !== confirm) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Adresse email invalide', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.email.toLowerCase() === email)) {
        showNotification('Cet email est déjà utilisé', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: 'user',
        avatar: null,
        preferences: {
            emailNotifications: true,
            autoplay: true,
            language: 'fr'
        },
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    setCurrentUser(newUser);
    showNotification(`Bienvenue sur Rōran28, ${name} ! 🎉`, 'success');
    
    setTimeout(() => {
        window.location.href = 'user-dashboard.html';
    }, 1000);
}

// =========================================
// VÉRIFICATION D'AUTHENTIFICATION
// =========================================
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        showNotification('Veuillez vous connecter pour accéder à cette page', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return null;
    }
    return user;
}

function requireAdmin() {
    const user = requireAuth();
    if (user && user.role !== 'admin') {
        showNotification('Accès non autorisé', 'error');
        setTimeout(() => {
            window.location.href = 'user-dashboard.html';
        }, 1500);
        return null;
    }
    return user;
}

// =========================================
// NOTIFICATIONS
// =========================================
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notif.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notif);
    
    // Ajouter les styles si pas déjà présents
    if (!document.getElementById('notif-style')) {
        const style = document.createElement('style');
        style.id = 'notif-style';
        style.textContent = `
            .notification {
                position: fixed;
                top: 24px;
                right: 24px;
                background: var(--surface, #141519);
                border: 2px solid;
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 12px 32px rgba(0,0,0,0.4);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 16px;
                min-width: 320px;
                max-width: 480px;
                animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            
            .notification-success {
                border-color: #22c55e;
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
            }
            
            .notification-error {
                border-color: #ef4444;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            }
            
            .notification-warning {
                border-color: #f59e0b;
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
            }
            
            .notification-info {
                border-color: #3b82f6;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
                color: white;
            }
            
            .notification-content i {
                font-size: 20px;
            }
            
            .notification-success i {
                color: #22c55e;
            }
            
            .notification-error i {
                color: #ef4444;
            }
            
            .notification-warning i {
                color: #f59e0b;
            }
            
            .notification-info i {
                color: #3b82f6;
            }
            
            .notification-close {
                background: transparent;
                border: none;
                color: rgba(255,255,255,0.6);
                cursor: pointer;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.2s;
            }
            
            .notification-close:hover {
                background: rgba(255,255,255,0.1);
                color: white;
            }
            
            .shake {
                animation: shake 0.5s;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                20%, 40%, 60%, 80% { transform: translateX(10px); }
            }
            
            @media (max-width: 768px) {
                .notification {
                    top: auto;
                    bottom: 24px;
                    right: 16px;
                    left: 16px;
                    min-width: auto;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateY(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Animation de sortie et suppression
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
}

// =========================================
// GESTION MA LISTE
// =========================================
function getMyList() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const allLists = JSON.parse(localStorage.getItem(MYLIST_KEY) || '{}');
    return allLists[user.id] || [];
}

function addToMyList(animeId) {
    const user = getCurrentUser();
    if (!user) {
        showNotification('Veuillez vous connecter pour ajouter à votre liste', 'error');
        return false;
    }
    
    const allLists = JSON.parse(localStorage.getItem(MYLIST_KEY) || '{}');
    const userList = allLists[user.id] || [];
    
    if (userList.includes(animeId)) {
        showNotification('Cet anime est déjà dans votre liste', 'info');
        return false;
    }
    
    userList.push(animeId);
    allLists[user.id] = userList;
    localStorage.setItem(MYLIST_KEY, JSON.stringify(allLists));
    
    showNotification('Ajouté à votre liste ! ❤️', 'success');
    return true;
}

function removeFromMyList(animeId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const allLists = JSON.parse(localStorage.getItem(MYLIST_KEY) || '{}');
    const userList = allLists[user.id] || [];
    
    const index = userList.indexOf(animeId);
    if (index > -1) {
        userList.splice(index, 1);
        allLists[user.id] = userList;
        localStorage.setItem(MYLIST_KEY, JSON.stringify(allLists));
        
        showNotification('Retiré de votre liste', 'info');
        return true;
    }
    
    return false;
}

function isInMyList(animeId) {
    const myList = getMyList();
    return myList.includes(animeId);
}

// =========================================
// HISTORIQUE DE VISIONNAGE
// =========================================
function addToHistory(animeId, episodeId) {
    const user = getCurrentUser();
    if (!user) return;
    
    const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    const userHistory = allHistory[user.id] || [];
    
    // Ajouter ou mettre à jour
    const existingIndex = userHistory.findIndex(h => h.animeId === animeId && h.episodeId === episodeId);
    
    const historyItem = {
        animeId,
        episodeId,
        timestamp: new Date().toISOString()
    };
    
    if (existingIndex > -1) {
        userHistory[existingIndex] = historyItem;
    } else {
        userHistory.unshift(historyItem);
    }
    
    // Garder seulement les 50 derniers
    if (userHistory.length > 50) {
        userHistory.pop();
    }
    
    allHistory[user.id] = userHistory;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
}

function getHistory() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return allHistory[user.id] || [];
}

// =========================================
// UTILITAIRES
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
// INITIALISATION AU CHARGEMENT
// =========================================
document.addEventListener('DOMContentLoaded', initData);

// Log
console.log('🔐 Système d\'authentification initialisé');
