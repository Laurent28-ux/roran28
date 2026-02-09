// Admin Dashboard JavaScript - Rōran28

let currentAnimes = [];
let selectedImageBase64 = null;
let editingAnimeId = null;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadAnimes();
    updateStats();
    loadUsers();
    setupImageUpload();
});

function checkAuth() {
    const userStr = localStorage.getItem('roran28_user');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            showToast('Accès non autorisé', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        const adminName = document.getElementById('adminName');
        const adminEmail = document.getElementById('adminEmail');
        if (adminName) adminName.textContent = user.name || 'Admin';
        if (adminEmail) adminEmail.textContent = user.email || 'admin@roran28.com';
        
    } catch (error) {
        console.error('Erreur de vérification auth:', error);
        window.location.href = 'index.html';
    }
}

// ============================================
// NAVIGATION
// ============================================

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    const targetLink = document.querySelector(`[onclick*="'${sectionName}'"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }
    
    if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'stats') {
        updateStats();
        drawChart();
    } else if (sectionName === 'animes') {
        loadAnimes();
    }
}

// ============================================
// UPLOAD D'IMAGES
// ============================================

function setupImageUpload() {
    const imageInput = document.getElementById('animeImage');
    if (!imageInput) return;
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showToast('Veuillez sélectionner une image', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('L\'image ne doit pas dépasser 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            selectedImageBase64 = event.target.result;
            showImagePreview(selectedImageBase64);
        };
        reader.readAsDataURL(file);
    });
}

function showImagePreview(base64) {
    const previewContainer = document.getElementById('imagePreview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = `
        <div class="image-preview-box">
            <img src="${base64}" alt="Preview">
            <button type="button" class="image-preview-remove" onclick="removeImage()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    previewContainer.classList.add('active');
}

function removeImage() {
    selectedImageBase64 = null;
    const previewContainer = document.getElementById('imagePreview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.classList.remove('active');
    }
    const imageInput = document.getElementById('animeImage');
    if (imageInput) {
        imageInput.value = '';
    }
}

// ============================================
// STATISTIQUES + GRAPHIQUE
// ============================================

function updateStats() {
    const animes = JSON.parse(localStorage.getItem('roran28_animes') || '[]');
    const users = JSON.parse(localStorage.getItem('roran28_users') || '[]');
    
    let totalEpisodes = 0;
    animes.forEach(anime => {
        totalEpisodes += anime.episodes || 0;
    });
    
    const totalAnimesEl = document.getElementById('totalAnimes');
    const totalEpisodesEl = document.getElementById('totalEpisodes');
    const totalUsersEl = document.getElementById('totalUsers');
    
    if (totalAnimesEl) totalAnimesEl.textContent = animes.length;
    if (totalEpisodesEl) totalEpisodesEl.textContent = totalEpisodes;
    if (totalUsersEl) totalUsersEl.textContent = users.length;
}

function drawChart() {
    const chartContainer = document.querySelector('.chart-placeholder');
    if (!chartContainer) return;
    
    const data = [120, 190, 300, 250, 340, 420, 380];
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const maxValue = Math.max(...data);
    
    chartContainer.innerHTML = `
        <div style="padding: 24px;">
            <h4 style="margin-bottom: 20px; font-size: 16px; color: var(--text-muted);">Vues par jour (7 derniers jours)</h4>
            <div style="display: flex; align-items: flex-end; gap: 12px; height: 200px;">
                ${data.map((value, index) => {
                    const height = (value / maxValue) * 100;
                    return `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                            <div style="font-size: 12px; font-weight: 700; color: var(--primary);">${value}</div>
                            <div style="width: 100%; height: ${height}%; background: linear-gradient(to top, var(--primary), var(--primary-light)); border-radius: 4px 4px 0 0; transition: all 0.3s ease;"></div>
                            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${days[index]}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ============================================
// GESTION DES ANIMES
// ============================================

function loadAnimes() {
    const animes = JSON.parse(localStorage.getItem('roran28_animes') || '[]');
    const tbody = document.getElementById('animesTableBody');
    
    if (!tbody) return;
    
    if (animes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="padding: 40px;">
                    <i class="fas fa-film" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px; display: block;"></i>
                    <h3>Aucun anime</h3>
                    <p style="color: var(--text-muted);">Cliquez sur "Ajouter un Anime" pour commencer</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = animes.map(anime => `
        <tr>
            <td>
                <img src="${anime.image}" alt="${anime.title}" 
                     style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px;"
                     onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop'">
            </td>
            <td>
                <strong>${anime.title}</strong>
                ${anime.isTrending ? '<span style="display: block; margin-top: 4px; color: var(--primary); font-size: 12px;"><i class="fas fa-fire"></i> TRENDING</span>' : ''}
            </td>
            <td>${anime.genre || '-'}</td>
            <td>
                <span style="color: #fbbf24; font-weight: 700;">
                    <i class="fas fa-star"></i> ${anime.rating || '0.0'}
                </span>
            </td>
            <td>${anime.episodes || 0}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm ${anime.isTrending ? 'btn-danger' : 'btn-secondary'}" 
                            onclick="toggleTrending('${anime.id}')" 
                            title="${anime.isTrending ? 'Retirer des tendances' : 'Marquer comme tendance'}">
                        <i class="fas fa-fire"></i>
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="editAnime('${anime.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAnime('${anime.id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function toggleTrending(animeId) {
    const animes = JSON.parse(localStorage.getItem('roran28_animes') || '[]');
    const anime = animes.find(a => a.id === animeId);
    
    if (anime) {
        anime.isTrending = !anime.isTrending;
        localStorage.setItem('roran28_animes', JSON.stringify(animes));
        loadAnimes();
        showToast(anime.isTrending ? '⭐ Marqué comme tendance' : 'Retiré des tendances', 'success');
    }
}

function deleteAnime(animeId) {
    if (!confirm('Voulez-vous vraiment supprimer cet anime ?')) return;
    
    const animes = JSON.parse(localStorage.getItem('roran28_animes') || '[]');
    const filtered = animes.filter(a => a.id !== animeId);
    localStorage.setItem('roran28_animes', JSON.stringify(filtered));
    
    loadAnimes();
    updateStats();
    showToast('Anime supprimé', 'success');
}

// MODIFICATION D'ANIME
function editAnime(animeId) {
    const animes = JSON.parse(localStorage.getItem('roran28_animes') || '[]');
    const anime = animes.find(a => a.id === animeId);
    
    if (!anime) {
        showToast('Anime introuvable', 'error');
        return;
    }
    
    editingAnimeId = animeId;
    
    // Remplir le formulaire
    const form = document.getElementById('addAnimeForm');
    form.querySelector('[name="title"]').value = anime.title;
    form.querySelector('[name="genre"]').value = anime.genre || '';
    form.querySelector('[name="rating"]').value = anime.rating || '';
    form.querySelector('[name="description"]').value = anime.description || '';
    form.querySelector('[name="episodes"]').value = anime.episodes || '';
    
    // Checkbox trending
    const trendingCheckbox = document.getElementById('isTrending');
    if (trendingCheckbox) {
        trendingCheckbox.checked = anime.isTrending || false;
    }
    
    // Afficher l'image actuelle
    selectedImageBase64 = anime.image;
    showImagePreview(anime.image);
    
    // Changer le titre du modal
    document.querySelector('.modal-header h2').textContent = 'Modifier l\'Anime';
    document.getElementById('submitBtnText').textContent = 'Mettre à jour';
    
    openAddModal();
}

// ============================================
// GESTION DES UTILISATEURS
// ============================================

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('roran28_users') || '[]');
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun utilisateur</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <strong>${user.name}</strong>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
            <td>
                <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
                    ${user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                </span>
            </td>
            <td>
                ${user.role !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button>` : '-'}
            </td>
        </tr>
    `).join('');
}

function deleteUser(userId) {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    
    const users = JSON.parse(localStorage.getItem('roran28_users') || '[]');
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem('roran28_users', JSON.stringify(filtered));
    
    loadUsers();
    updateStats();
    showToast('Utilisateur supprimé', 'success');
}

// ============================================
// MODAL
// ============================================

function openAddModal() {
    const modal = document.getElementById('addAnimeModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('addAnimeModal');
    if (modal) {
        modal.classList.remove('active');
    }
    const form = document.getElementById('addAnimeForm');
    if (form) {
        form.reset();
    }
    removeImage();
    editingAnimeId = null;
    
    // Réinitialiser le titre
    document.querySelector('.modal-header h2').textContent = 'Ajouter un Anime';
    document.getElementById('submitBtnText').textContent = 'Enregistrer';
}

// ============================================
// FORMULAIRE ANIME
// ============================================

const form = document.getElementById('addAnimeForm');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!selectedImageBase64) {
            showToast('Veuillez sélectionner une image', 'error');
            return;
        }
        
        const formData = new FormData(this);
        const animeData = {
            title: formData.get('title'),
            genre: formData.get('genre') || 'Anime',
            rating: parseFloat(formData.get('rating')) || 0,
            description: formData.get('description') || '',
            image: selectedImageBase64,
            status: 'En cours',
            episodes: parseInt(formData.get('episodes')) || 12,
            isTrending: document.getElementById('isTrending').checked
        };
        
        const animes = JSON.parse(localStorage.getItem('roran28_animes') || '[]');
        
        if (editingAnimeId) {
            // Mode modification
            const index = animes.findIndex(a => a.id === editingAnimeId);
            if (index !== -1) {
                animes[index] = {
                    ...animes[index],
                    ...animeData,
                    updatedAt: new Date().toISOString()
                };
                showToast('Anime modifié avec succès !', 'success');
            }
        } else {
            // Mode ajout
            animes.push({
                id: Date.now().toString(),
                ...animeData,
                createdAt: new Date().toISOString()
            });
            showToast('Anime ajouté avec succès !', 'success');
        }
        
        localStorage.setItem('roran28_animes', JSON.stringify(animes));
        
        closeModal();
        loadAnimes();
        updateStats();
    });
}

function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        localStorage.removeItem('roran28_user');
        window.location.href = 'index.html';
    }
}

// ============================================
// TOASTS
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('addAnimeModal');
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});
