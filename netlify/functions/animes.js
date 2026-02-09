const { query } = require('../../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_changez_moi';

// Vérifier le token JWT
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
    const path = event.path.replace('/.netlify/functions/animes', '');
    const method = event.httpMethod;

    // GET /animes - Liste tous les animes
    if (method === 'GET' && !path) {
      const animes = await query(`
        SELECT a.*, 
               COUNT(DISTINCT e.id) as episodes_count,
               (SELECT video_url FROM movies WHERE anime_id = a.id LIMIT 1) as movie_url
        FROM animes a
        LEFT JOIN episodes e ON e.anime_id = a.id
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ animes })
      };
    }

    // GET /animes/:id - Récupérer un anime
    if (method === 'GET' && path) {
      const animeId = path.replace('/', '');
      const animes = await query(
        'SELECT * FROM animes WHERE id = $1',
        [animeId]
      );

      if (animes.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Anime non trouvé' })
        };
      }

      // Récupérer les épisodes
      const episodes = await query(
        'SELECT * FROM episodes WHERE anime_id = $1 ORDER BY episode_number',
        [animeId]
      );

      // Récupérer le film si c'est un film
      const movies = await query(
        'SELECT * FROM movies WHERE anime_id = $1',
        [animeId]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          anime: animes[0],
          episodes,
          movie: movies[0] || null
        })
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

    // POST /animes - Créer un anime
    if (method === 'POST') {
      const data = JSON.parse(event.body);
      const {
        title,
        title_en,
        title_jp,
        description,
        genre,
        rating,
        status,
        type,
        cover_image_url,
        banner_image_url,
        is_trending,
        total_episodes,
        release_year
      } = data;

      const result = await query(`
        INSERT INTO animes (
          title, title_en, title_jp, description, genre, rating,
          status, type, cover_image_url, banner_image_url, is_trending,
          total_episodes, release_year
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        title, title_en, title_jp, description, genre, rating || 0,
        status || 'En cours', type || 'Série', cover_image_url, banner_image_url,
        is_trending || false, total_episodes || 0, release_year
      ]);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ anime: result[0] })
      };
    }

    // PUT /animes/:id - Mettre à jour un anime
    if (method === 'PUT' && path) {
      const animeId = path.replace('/', '');
      const data = JSON.parse(event.body);

      const {
        title, title_en, title_jp, description, genre, rating,
        status, type, cover_image_url, banner_image_url, is_trending,
        total_episodes, release_year
      } = data;

      const result = await query(`
        UPDATE animes SET
          title = $1, title_en = $2, title_jp = $3, description = $4,
          genre = $5, rating = $6, status = $7, type = $8,
          cover_image_url = $9, banner_image_url = $10, is_trending = $11,
          total_episodes = $12, release_year = $13, updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
        RETURNING *
      `, [
        title, title_en, title_jp, description, genre, rating,
        status, type, cover_image_url, banner_image_url, is_trending,
        total_episodes, release_year, animeId
      ]);

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Anime non trouvé' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ anime: result[0] })
      };
    }

    // DELETE /animes/:id - Supprimer un anime
    if (method === 'DELETE' && path) {
      const animeId = path.replace('/', '');
      await query('DELETE FROM animes WHERE id = $1', [animeId]);

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
    console.error('Animes error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur', details: error.message })
    };
  }
};
