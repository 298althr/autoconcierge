const { query } = require('../config/database');

class BlogService {
    async createPost(authorId, data) {
        const slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const result = await query(
            `INSERT INTO blog_posts (title, slug, content, excerpt, author_id, category, tags, featured_image, status, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                data.title,
                slug,
                data.content,
                data.excerpt,
                authorId,
                data.category,
                data.tags,
                data.featured_image,
                data.status || 'draft',
                data.status === 'published' ? new Date() : null
            ]
        );
        return result.rows[0];
    }

    async getPosts(filters = {}) {
        let sql = 'SELECT bp.*, u.display_name as author_name FROM blog_posts bp JOIN users u ON bp.author_id = u.id WHERE 1=1';
        const params = [];

        if (filters.status) {
            params.push(filters.status);
            sql += ` AND bp.status = $${params.length}`;
        }

        if (filters.category) {
            params.push(filters.category);
            sql += ` AND bp.category = $${params.length}`;
        }

        sql += ' ORDER BY bp.published_at DESC, bp.created_at DESC';

        const result = await query(sql, params);
        return result.rows;
    }

    async getPostBySlug(slug) {
        const result = await query(
            'SELECT bp.*, u.display_name as author_name FROM blog_posts bp JOIN users u ON bp.author_id = u.id WHERE bp.slug = $1',
            [slug]
        );
        return result.rows[0];
    }

    async updatePost(id, data) {
        const fields = [];
        const params = [];

        Object.entries(data).forEach(([key, value]) => {
            if (['title', 'content', 'excerpt', 'category', 'tags', 'featured_image', 'status'].includes(key)) {
                params.push(value);
                fields.push(`${key} = $${params.length}`);
            }
        });

        if (data.status === 'published') {
            params.push(new Date());
            fields.push(`published_at = $${params.length}`);
        }

        params.push(id);
        const sql = `UPDATE blog_posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`;

        const result = await query(sql, params);
        return result.rows[0];
    }

    async deletePost(id) {
        await query('DELETE FROM blog_posts WHERE id = $1', [id]);
        return true;
    }
}

module.exports = new BlogService();
