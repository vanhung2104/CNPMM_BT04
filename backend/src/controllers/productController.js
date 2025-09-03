const { getProductsService, createProductService, getCategoriesService } = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category = '' } = req.query;
        
        const data = await getProductsService(page, limit, category);
        
        if (!data) {
            return res.status(500).json({
                EC: 1,
                EM: 'Không thể lấy danh sách sản phẩm'
            });
        }
        
        return res.status(200).json({
            EC: 0,
            EM: 'Lấy danh sách sản phẩm thành công',
            data
        });
    } catch (error) {
        console.error('Get products error:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server'
        });
    }
}

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image } = req.body;
        
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                EC: 1,
                EM: 'Tất cả các trường đều bắt buộc'
            });
        }

        const productData = { name, description, price, category, image };
        const data = await createProductService(productData);
        
        if (!data) {
            return res.status(500).json({
                EC: 2,
                EM: 'Không thể tạo sản phẩm'
            });
        }
        
        return res.status(201).json({
            EC: 0,
            EM: 'Tạo sản phẩm thành công',
            data
        });
    } catch (error) {
        console.error('Create product error:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server'
        });
    }
}

const getCategories = async (req, res) => {
    try {
        const data = await getCategoriesService();
        
        if (!data) {
            return res.status(500).json({
                EC: 1,
                EM: 'Không thể lấy danh sách danh mục'
            });
        }
        
        return res.status(200).json({
            EC: 0,
            EM: 'Lấy danh sách danh mục thành công',
            data
        });
    } catch (error) {
        console.error('Get categories error:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Lỗi server'
        });
    }
}

module.exports = {
    getProducts,
    createProduct,
    getCategories
};