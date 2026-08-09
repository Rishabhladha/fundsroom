-- Add avatar_url column to users table for AWS S3 Profile Image integration
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
