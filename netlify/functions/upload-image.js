const { uploadImage } = require('../../config/cloudinary');
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

    // Récupérer l'image en base64
    const { image, folder } = JSON.parse(event.body);

    if (!image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image requise' })
      };
    }

    // Convertir base64 en buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload vers Cloudinary
    const result = await uploadImage(buffer, folder || 'roran28/images');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: result.secure_url,
        public_id: result.public_id
      })
    };

  } catch (error) {
    console.error('Upload image error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur lors de l\'upload', details: error.message })
    };
  }
};
