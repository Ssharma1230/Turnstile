const db = require('../config/database');

// Get current user's profile
const getMe = async (req, res) => {
  try {
    // req.userId is set by authMiddleware
    const result = await db.query(
      'SELECT id, username, email, profile_photo_url, bio, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update current user's profile
const updateMe = async (req, res) => {
  try {
    const { username, bio, profile_photo_url } = req.body;
    
    // Validation
    if (username && username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Check if username is already taken (by someone else)
    if (username) {
      const existing = await db.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, req.userId]
      );
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount}`);
      values.push(bio);
      paramCount++;
    }
    if (profile_photo_url !== undefined) {
      updates.push(`profile_photo_url = $${paramCount}`);
      values.push(profile_photo_url);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.userId);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, username, email, profile_photo_url, bio, created_at`,
      values
    );

    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get another user's profile (public info only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(id);

    let result;
    if (isUUID) {
      // Search by UUID
      result = await db.query(
        'SELECT id, username, profile_photo_url, bio, created_at FROM users WHERE id = $1',
        [id]
      );
    } else {
      // Search by username
      result = await db.query(
        'SELECT id, username, profile_photo_url, bio, created_at FROM users WHERE username = $1',
        [id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's public entries
const getUserEntries = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(id);

    let result;
    if (isUUID) {
      // Search by UUID
      result = await db.query(
        `SELECT ge.*, u.username, u.profile_photo_url 
         FROM game_entries ge 
         JOIN users u ON ge.user_id = u.id 
         WHERE ge.user_id = $1 
         ORDER BY ge.created_at DESC`,
        [id]
      );
    } else {
      // Search by username
      result = await db.query(
        `SELECT ge.*, u.username, u.profile_photo_url 
         FROM game_entries ge 
         JOIN users u ON ge.user_id = u.id 
         WHERE u.username = $1 
         ORDER BY ge.created_at DESC`,
        [id]
      );
    }

    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Get user entries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMe,
  updateMe,
  getUserById,
  getUserEntries,
};