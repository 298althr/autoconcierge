const blogService = require('../services/blogService');

class BlogController {
    async createPost(req, res, next) {
        try {
            const post = await blogService.createPost(req.user.id, req.body);
            res.status(201).json({ success: true, data: post });
        } catch (err) {
            next(err);
        }
    }

    async getPosts(req, res, next) {
        try {
            const { category, status } = req.query;
            // Public can only see published posts
            const filters = req.user && req.user.role === 'admin' ? { category, status } : { category, status: 'published' };
            const posts = await blogService.getPosts(filters);
            res.status(200).json({ success: true, data: posts });
        } catch (err) {
            next(err);
        }
    }

    async getPostBySlug(req, res, next) {
        try {
            const post = await blogService.getPostBySlug(req.params.slug);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }
            res.status(200).json({ success: true, data: post });
        } catch (err) {
            next(err);
        }
    }

    async updatePost(req, res, next) {
        try {
            const post = await blogService.updatePost(req.params.id, req.body);
            res.status(200).json({ success: true, data: post });
        } catch (err) {
            next(err);
        }
    }

    async deletePost(req, res, next) {
        try {
            await blogService.deletePost(req.params.id);
            res.status(200).json({ success: true, message: 'Post deleted' });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new BlogController();
