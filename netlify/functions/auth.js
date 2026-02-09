const { query } = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_changez_moi';

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
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
    const { action, email, password, name } = JSON.parse(event.body);

    // LOGIN
    if (action === 'login') {
      const users = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (users.length === 0) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Email ou mot de passe incorrect' })
        };
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Email ou mot de passe incorrect' })
        };
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url
          }
        })
      };
    }

    // REGISTER
    if (action === 'register') {
      // Vérifier si l'email existe déjà
      const existingUsers = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUsers.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Cet email est déjà utilisé' })
        };
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const newUsers = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashedPassword, 'user']
      );

      const newUser = newUsers[0];

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Action invalide' })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur', details: error.message })
    };
  }
};
