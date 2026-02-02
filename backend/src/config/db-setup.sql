-- Create the database
CREATE DATABASE turnstile;

-- Connect to turnstile database (\c turnstile in psql), then run:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_photo_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game entries table
CREATE TABLE game_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Game details
    sport_type VARCHAR(50) NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    venue_name VARCHAR(200),
    game_date DATE NOT NULL,
    
    -- Score (optional)
    home_score INTEGER,
    away_score INTEGER,
    
    -- User's experience
    rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
    description TEXT,
    photo_url VARCHAR(500),
    seat_section VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_game_entries_user_id ON game_entries(user_id);
CREATE INDEX idx_game_entries_created_at ON game_entries(created_at DESC);
CREATE INDEX idx_game_entries_sport_type ON game_entries(sport_type);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_entries_updated_at 
    BEFORE UPDATE ON game_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();