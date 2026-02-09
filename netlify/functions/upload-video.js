const { uploadVideo } = require('../../config/cloudinary');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_changez_moi';

function verifyToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Vérifier l'authentification admin
    const user = verifyToken(event);
    if (!user || user.role !== 'admin') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Non autorisé' })
      };
    }

    // IMPORTANT: Pour les vidéos, utiliser une URL signée
    // Car les vidéos sont trop volumineuses pour passer en base64

    const { videoUrl, folder } = JSON.parse(event.body);

    if (!videoUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'URL de la vidéo requise',
          info: 'Pour uploader une vidéo, utilisez le widget Cloudinary côté client'
        })
      };
    }

    // Si l'URL Cloudinary est fournie directement
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: videoUrl,
        message: 'Vidéo enregistrée'
      })
    };

  } catch (error) {
    console.error('Upload video error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur lors de l\'upload', details: error.message })
    };
  }
};
