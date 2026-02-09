/* =========================================
   CLOUDINARY UPLOAD WIDGET
   Pour uploader images et vidéos directement
   ========================================= */

// Configuration Cloudinary
const CLOUDINARY_CONFIG = {
  cloudName: 'dbbuyhsvl',  // ← Mettez votre Cloud Name ici
  uploadPreset: 'roran28_uploads'  // ← Nom du preset créé ci-dessus
};
// Initialiser le widget Cloudinary
function initCloudinaryWidget(type = 'image', callback) {
  // Charger le script Cloudinary si pas déjà chargé
  if (!window.cloudinary) {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.onload = () => createWidget(type, callback);
    document.head.appendChild(script);
  } else {
    createWidget(type, callback);
  }
}

function createWidget(type, callback) {
  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      resourceType: type === 'video' ? 'video' : 'image',
      clientAllowedFormats: type === 'video' 
        ? ['mp4', 'mov', 'avi', 'mkv', 'webm']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maxFileSize: type === 'video' ? 500000000 : 10000000, // 500MB pour vidéo, 10MB pour image
      maxImageWidth: type === 'image' ? 2000 : undefined,
      maxImageHeight: type === 'image' ? 3000 : undefined,
      cropping: type === 'image',
      croppingAspectRatio: type === 'image' ? 2/3 : undefined,
      showSkipCropButton: false,
      folder: type === 'video' ? 'roran28/videos' : 'roran28/images',
      tags: ['roran28', type],
      styles: {
        palette: {
          window: '#141414',
          windowBorder: '#f47521',
          tabIcon: '#f47521',
          menuIcons: '#FFFFFF',
          textDark: '#000000',
          textLight: '#FFFFFF',
          link: '#f47521',
          action: '#FF620C',
          inactiveTabIcon: '#8E9FBF',
          error: '#F44235',
          inProgress: '#0078FF',
          complete: '#20B832',
          sourceBg: '#1E1E1E'
        },
        fonts: {
          default: null,
          "'Poppins', sans-serif": {
            url: 'https://fonts.googleapis.com/css?family=Poppins',
            active: true
          }
        }
      }
    },
    (error, result) => {
      if (!error && result && result.event === 'success') {
        const uploadedFile = {
          url: result.info.secure_url,
          publicId: result.info.public_id,
          format: result.info.format,
          duration: result.info.duration || null,
          width: result.info.width || null,
          height: result.info.height || null
        };
        
        if (callback) callback(uploadedFile);
        
        showToast('✓ Fichier uploadé avec succès!', 'success');
      }
      
      if (error) {
        console.error('Upload error:', error);
        showToast('Erreur lors de l\'upload', 'error');
      }
    }
  );

  return widget;
}

// Ouvrir le widget pour une image
function openImageUpload(callback) {
  const widget = initCloudinaryWidget('image', callback);
  if (widget) widget.open();
}

// Ouvrir le widget pour une vidéo
function openVideoUpload(callback) {
  const widget = initCloudinaryWidget('video', callback);
  if (widget) widget.open();
}

// Helper pour afficher l'URL uploadée
function displayUploadedFile(url, type, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (type === 'image') {
    container.innerHTML = `
      <div class="uploaded-preview">
        <img src="${url}" alt="Uploaded" style="max-width: 300px; border-radius: 8px;">
        <button class="btn btn-sm btn-danger" onclick="removeUpload('${containerId}')">
          <i class="fas fa-times"></i> Supprimer
        </button>
      </div>
    `;
  } else if (type === 'video') {
    container.innerHTML = `
      <div class="uploaded-preview">
        <video controls style="max-width: 100%; border-radius: 8px;">
          <source src="${url}" type="video/mp4">
        </video>
        <p style="margin-top: 8px; word-break: break-all;">
          <strong>URL:</strong> ${url}
        </p>
        <button class="btn btn-sm btn-danger" onclick="removeUpload('${containerId}')">
          <i class="fas fa-times"></i> Supprimer
        </button>
      </div>
    `;
  }
}

function removeUpload(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}
