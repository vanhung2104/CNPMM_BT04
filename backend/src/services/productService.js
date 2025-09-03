const Product = require('../models/product');

const getProductsService = async (page = 1, limit = 10, category = '') => {
    try {
        const skip = (page - 1) * limit;
        
        // Build query
        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        // Get products with pagination
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination info
        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts: total,
                hasMore,
                limit: parseInt(limit)
            }
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return null;
    }
}

const createProductService = async (productData) => {
    try {
        const product = await Product.create(productData);
        return product;
    } catch (error) {
        console.error('Error creating product:', error);
        return null;
    }
}

const getCategoriesService = async () => {
    try {
        const categories = await Product.distinct('category');
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return null;
    }
}

module.exports = {
    getProductsService,
    createProductService,
    getCategoriesService
};