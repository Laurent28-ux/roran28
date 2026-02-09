const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload d'image
async function uploadImage(fileBuffer, folder = 'roran28/images') {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 1200, crop: 'fill', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// Upload de vidéo
async function uploadVideo(fileBuffer, folder = 'roran28/videos') {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'video',
          chunk_size: 6000000, // 6MB chunks
          eager: [
            { streaming_profile: 'hd', format: 'm3u8' }
          ],
          eager_async: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}

// Supprimer un fichier
async function deleteFile(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Delete file error:', error);
    throw error;
  }
}

module.exports = {
  uploadImage,
  uploadVideo,
  deleteFile,
  cloudinary
};
