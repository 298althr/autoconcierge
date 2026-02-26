-- Concierge Requests Table
CREATE TABLE IF NOT EXISTS concierge_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_type VARCHAR(100) NOT NULL, -- 'sourcing', 'clearing', 'shipping', 'inspection', 'other'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    details JSONB NOT NULL,
    ai_analysis JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES users(id),
    category VARCHAR(100),
    tags TEXT[],
    featured_image TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published'
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for slug search
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
