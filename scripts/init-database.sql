-- Create database schema for Gifts Boss game

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    username VARCHAR(255),
    ton_balance DECIMAL(18, 9) DEFAULT 0,
    stars_balance INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    is_vip BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(50) UNIQUE,
    referred_by BIGINT,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES users(id)
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    price DECIMAL(18, 9) NOT NULL,
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('TON', 'STARS')),
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case items table
CREATE TABLE IF NOT EXISTS case_items (
    id VARCHAR(50) PRIMARY KEY,
    case_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    value INTEGER NOT NULL,
    probability DECIMAL(5, 4) NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- User inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_image TEXT,
    rarity VARCHAR(20) NOT NULL,
    value INTEGER NOT NULL,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'case_open', 'referral_bonus')),
    amount DECIMAL(18, 9) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    description TEXT,
    transaction_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id BIGINT NOT NULL,
    referred_id BIGINT NOT NULL,
    bonus_amount INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(referrer_id, referred_id)
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game statistics table
CREATE TABLE IF NOT EXISTS game_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    cases_opened INTEGER DEFAULT 0,
    total_revenue DECIMAL(18, 9) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- Insert default cases
INSERT INTO cases (id, name, image_url, price, currency, category) VALUES
('starter', 'Starter Case', '/placeholder.svg?height=200&width=200', 50, 'STARS', 'free'),
('premium', 'Premium Case', '/placeholder.svg?height=200&width=200', 200, 'STARS', 'mix'),
('vip', 'VIP Case', '/placeholder.svg?height=200&width=200', 1, 'TON', 'limited'),
('legendary', 'Legendary Case', '/placeholder.svg?height=200&width=200', 500, 'STARS', 'allin');

-- Insert case items
INSERT INTO case_items (id, case_id, name, image_url, rarity, value, probability) VALUES
-- Starter Case Items
('starter_bronze', 'starter', 'Bronze Gift', '/placeholder.svg?height=100&width=100', 'common', 25, 0.5),
('starter_silver', 'starter', 'Silver Gift', '/placeholder.svg?height=100&width=100', 'rare', 75, 0.3),
('starter_gold', 'starter', 'Gold Gift', '/placeholder.svg?height=100&width=100', 'epic', 150, 0.15),
('starter_diamond', 'starter', 'Diamond Gift', '/placeholder.svg?height=100&width=100', 'legendary', 300, 0.05),

-- Premium Case Items
('premium_ruby', 'premium', 'Ruby Gem', '/placeholder.svg?height=100&width=100', 'common', 100, 0.4),
('premium_sapphire', 'premium', 'Sapphire Ring', '/placeholder.svg?height=100&width=100', 'rare', 250, 0.35),
('premium_emerald', 'premium', 'Emerald Crown', '/placeholder.svg?height=100&width=100', 'epic', 500, 0.2),
('premium_platinum', 'premium', 'Platinum Trophy', '/placeholder.svg?height=100&width=100', 'legendary', 1000, 0.05),

-- VIP Case Items
('vip_crystal', 'vip', 'Crystal Orb', '/placeholder.svg?height=100&width=100', 'rare', 400, 0.4),
('vip_mythril', 'vip', 'Mythril Sword', '/placeholder.svg?height=100&width=100', 'epic', 800, 0.35),
('vip_adamant', 'vip', 'Adamant Shield', '/placeholder.svg?height=100&width=100', 'legendary', 1500, 0.25),

-- Legendary Case Items
('leg_phoenix', 'legendary', 'Phoenix Feather', '/placeholder.svg?height=100&width=100', 'epic', 1000, 0.5),
('leg_dragon', 'legendary', 'Dragon Scale', '/placeholder.svg?height=100&width=100', 'legendary', 2500, 0.3),
('leg_unicorn', 'legendary', 'Unicorn Horn', '/placeholder.svg?height=100&width=100', 'legendary', 5000, 0.2);

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description) VALUES
('ton_to_stars_rate', '200', 'Number of stars per 1 TON'),
('min_deposit', '0.1', 'Minimum TON deposit amount'),
('referral_bonus', '100', 'Stars bonus for successful referral'),
('vip_threshold', '1000', 'Stars needed for VIP status'),
('max_daily_opens', '50', 'Maximum case opens per day per user');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_case_items_case_id ON case_items(case_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
