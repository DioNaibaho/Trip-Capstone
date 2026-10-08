-- Tabel Hotels
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    osm_id VARCHAR(255),
    osm_type VARCHAR(50),
    name VARCHAR(255),
    tourism VARCHAR(100),
    latitude NUMERIC,
    longitude NUMERIC,
    city VARCHAR(100) DEFAULT 'Yogyakarta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Attractions
CREATE TABLE IF NOT EXISTS attractions (
    id SERIAL PRIMARY KEY,
    osm_id VARCHAR(255),
    osm_type VARCHAR(50),
    name VARCHAR(255),
    tourism VARCHAR(100),
    historic VARCHAR(100),
    leisure VARCHAR(100),
    latitude NUMERIC,
    longitude NUMERIC,
    city VARCHAR(100) DEFAULT 'Bandung',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Culinaries
CREATE TABLE IF NOT EXISTS culinaries (
    id SERIAL PRIMARY KEY,
    osm_id VARCHAR(255),
    osm_type VARCHAR(50),
    name VARCHAR(255),
    amenity VARCHAR(100),
    latitude NUMERIC,
    longitude NUMERIC,
    city VARCHAR(100) DEFAULT 'Bandung',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS users;

