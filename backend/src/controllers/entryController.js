const db = require('../config/database');

// Get all entries for the current user
const getMyEntries = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM game_entries 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.userId]
    );
    
    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single entry by ID
const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM game_entries WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const entry = result.rows[0];
    
    // Check if entry belongs to the current user
    if (entry.user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view this entry' });
    }
    
    res.json({ entry });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new entry
const createEntry = async (req, res) => {
  try {
    const {
      sport_type,
      home_team,
      away_team,
      venue_name,
      game_date,
      home_score,
      away_score,
      rating,
      description,
      photo_url,
      seat_section,
    } = req.body;

    // Validation
    if (!sport_type || !home_team || !away_team || !venue_name || !game_date || !rating) {
      return res.status(400).json({ 
        error: 'Required fields: sport_type, home_team, away_team, venue_name, game_date, rating' 
      });
    }

    // Validate rating (1.0 to 5.0, increments of 0.5)
    if (rating < 1.0 || rating > 5.0) {
      return res.status(400).json({ error: 'Rating must be between 1.0 and 5.0' });
    }
    
    if (rating % 0.5 !== 0) {
      return res.status(400).json({ error: 'Rating must be in increments of 0.5' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(game_date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    const result = await db.query(
      `INSERT INTO game_entries 
       (user_id, sport_type, home_team, away_team, venue_name, game_date, 
        home_score, away_score, rating, description, photo_url, seat_section)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.userId,
        sport_type,
        home_team,
        away_team,
        venue_name,
        game_date,
        home_score || null,
        away_score || null,
        rating,
        description || null,
        photo_url || null,
        seat_section || null,
      ]
    );

    res.status(201).json({
      message: 'Entry created successfully',
      entry: result.rows[0],
    });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update entry
const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sport_type,
      home_team,
      away_team,
      venue_name,
      game_date,
      home_score,
      away_score,
      rating,
      description,
      photo_url,
      seat_section,
    } = req.body;

    // Check if entry exists and belongs to user
    const checkResult = await db.query(
      'SELECT * FROM game_entries WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (checkResult.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this entry' });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (rating < 1.0 || rating > 5.0) {
        return res.status(400).json({ error: 'Rating must be between 1.0 and 5.0' });
      }
      if (rating % 0.5 !== 0) {
        return res.status(400).json({ error: 'Rating must be in increments of 0.5' });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (sport_type !== undefined) {
      updates.push(`sport_type = $${paramCount}`);
      values.push(sport_type);
      paramCount++;
    }
    if (home_team !== undefined) {
      updates.push(`home_team = $${paramCount}`);
      values.push(home_team);
      paramCount++;
    }
    if (away_team !== undefined) {
      updates.push(`away_team = $${paramCount}`);
      values.push(away_team);
      paramCount++;
    }
    if (venue_name !== undefined) {
      updates.push(`venue_name = $${paramCount}`);
      values.push(venue_name);
      paramCount++;
    }
    if (game_date !== undefined) {
      updates.push(`game_date = $${paramCount}`);
      values.push(game_date);
      paramCount++;
    }
    if (home_score !== undefined) {
      updates.push(`home_score = $${paramCount}`);
      values.push(home_score);
      paramCount++;
    }
    if (away_score !== undefined) {
      updates.push(`away_score = $${paramCount}`);
      values.push(away_score);
      paramCount++;
    }
    if (rating !== undefined) {
      updates.push(`rating = $${paramCount}`);
      values.push(rating);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (photo_url !== undefined) {
      updates.push(`photo_url = $${paramCount}`);
      values.push(photo_url);
      paramCount++;
    }
    if (seat_section !== undefined) {
      updates.push(`seat_section = $${paramCount}`);
      values.push(seat_section);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await db.query(
      `UPDATE game_entries 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({
      message: 'Entry updated successfully',
      entry: result.rows[0],
    });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete entry
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entry exists and belongs to user
    const checkResult = await db.query(
      'SELECT * FROM game_entries WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (checkResult.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this entry' });
    }

    await db.query('DELETE FROM game_entries WHERE id = $1', [id]);

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMyEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
};