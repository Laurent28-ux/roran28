const { query } = require('../../config/database');
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const method = event.httpMethod;
    const path = event.path.replace('/.netlify/functions/episodes', '');

    // GET /episodes?anime_id=X - Liste des épisodes
    if (method === 'GET') {
      const params = event.queryStringParameters || {};
      const animeId = params.anime_id;

      if (!animeId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'anime_id requis' })
        };
      }

      const episodes = await query(
        'SELECT * FROM episodes WHERE anime_id = $1 ORDER BY episode_number',
        [animeId]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ episodes })
      };
    }

    // Les routes suivantes nécessitent une authentification admin
    const user = verifyToken(event);
    if (!user || user.role !== 'admin') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Non autorisé' })
      };
    }

    // POST /episodes - Créer un épisode
    if (method === 'POST') {
      const {
        anime_id,
        episode_number,
        title,
        description,
        duration,
        video_url,
        thumbnail_url
      } = JSON.parse(event.body);

      if (!anime_id || !episode_number || !video_url) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Données manquantes' })
        };
      }

      const result = await query(`
        INSERT INTO episodes (
          anime_id, episode_number, title, description,
          duration, video_url, thumbnail_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [anime_id, episode_number, title, description, duration, video_url, thumbnail_url]);

      // Mettre à jour le nombre d'épisodes de l'anime
      await query(`
        UPDATE animes 
        SET total_episodes = (SELECT COUNT(*) FROM episodes WHERE anime_id = $1)
        WHERE id = $1
      `, [anime_id]);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ episode: result[0] })
      };
    }

    // PUT /episodes/:id - Mettre à jour un épisode
    if (method === 'PUT' && path) {
      const episodeId = path.replace('/', '');
      const {
        episode_number, title, description, duration, video_url, thumbnail_url
      } = JSON.parse(event.body);

      const result = await query(`
        UPDATE episodes SET
          episode_number = $1, title = $2, description = $3,
          duration = $4, video_url = $5, thumbnail_url = $6
        WHERE id = $7
        RETURNING *
      `, [episode_number, title, description, duration, video_url, thumbnail_url, episodeId]);

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Épisode non trouvé' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ episode: result[0] })
      };
    }

    // DELETE /episodes/:id - Supprimer un épisode
    if (method === 'DELETE' && path) {
      const episodeId = path.replace('/', '');
      
      // Récupérer l'anime_id avant suppression
      const episodes = await query('SELECT anime_id FROM episodes WHERE id = $1', [episodeId]);
      
      if (episodes.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Épisode non trouvé' })
        };
      }

      const animeId = episodes[0].anime_id;
      
      await query('DELETE FROM episodes WHERE id = $1', [episodeId]);

      // Mettre à jour le nombre d'épisodes
      await query(`
        UPDATE animes 
        SET total_episodes = (SELECT COUNT(*) FROM episodes WHERE anime_id = $1)
        WHERE id = $1
      `, [animeId]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route non trouvée' })
    };

  } catch (error) {
    console.error('Episodes error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur', details: error.message })
    };
  }
};
