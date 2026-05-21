-- Migration: Add category and brand columns to restaurants table
-- Run this once to add the new columns and seed sample data

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Fast Food',
  ADD COLUMN IF NOT EXISTS brand     VARCHAR(100) DEFAULT NULL;

-- Seed categories and brands for existing restaurants based on their id
-- These updates cycle through categories/brands so every restaurant gets one
UPDATE restaurants SET
  category = ELT(1 + (id % 7), 'Fast Food', 'Pizza', 'Chinese', 'Pakistani', 'Desserts', 'Drinks', 'Healthy'),
  brand     = ELT(1 + (id % 6), 'KFC-Style', 'McD-Style', 'PizzaHut-Style', 'Subway-Style', 'Domino-Style', 'Starbz-Style')
WHERE category = 'Fast Food' OR category IS NULL;
