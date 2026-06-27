const axios = require('axios');

const adminBaseUrl = process.env.ADMIN_API_BASE_URL || 'http://localhost:3030';

const withStockFlag = product => ({
    ...product,
    isOutOfStock: product.stock <= 0
});

const isActiveProduct = product => product && product.isActive === true;

exports.getHome = async (req, res) => {
    try {
        const [categoriesResponse, productsResponse, brandsResponse] = await Promise.all([
            axios.get(`${adminBaseUrl}/categories/json`),
            axios.get(`${adminBaseUrl}/products/json`),
            axios.get(`${adminBaseUrl}/brands/json`)
        ]);

        const products = productsResponse.data
            .filter(isActiveProduct)
            .map(withStockFlag)
            .slice(0, 6);

        return res.apiSuccess({
            categories: categoriesResponse.data,
            products,
            brands: brandsResponse.data
        });
    } catch (error) {
        console.error('Store home API hatası:', error);
        return res.apiError('Mağaza verileri alınamadı.');
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { search, brandId, subcategory } = req.query;
        const productsResponse = await axios.get(`${adminBaseUrl}/products/json`);
        let products = productsResponse.data
            .filter(isActiveProduct)
            .map(withStockFlag);

        if (search) {
            products = products.filter(product =>
                product.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (brandId) {
            products = products.filter(product =>
                product.brands.some(brand => brand.toString() === brandId)
            );
        }

        if (subcategory) {
            products = products.filter(product =>
                product.subcategories && product.subcategories.includes(subcategory)
            );
        }

        return res.apiSuccess(products);
    } catch (error) {
        console.error('Ürün API hatası:', error);
        return res.apiError('Ürünler alınamadı.');
    }
};

exports.getProduct = async (req, res) => {
    try {
        const response = await axios.get(`${adminBaseUrl}/products/${req.params.productId}/json`);
        if (!isActiveProduct(response.data)) {
            return res.apiError('Ürün bulunamadı.', 404);
        }

        return res.apiSuccess(response.data);
    } catch (error) {
        console.error('Ürün detay API hatası:', error);
        return res.apiError('Ürün detayı alınamadı.', 404);
    }
};

exports.getCategories = async (req, res) => {
    try {
        const response = await axios.get(`${adminBaseUrl}/categories/json`);
        return res.apiSuccess(response.data);
    } catch (error) {
        console.error('Kategori API hatası:', error);
        return res.apiError('Kategoriler alınamadı.');
    }
};

exports.getBrands = async (req, res) => {
    try {
        const response = await axios.get(`${adminBaseUrl}/brands/json`);
        return res.apiSuccess(response.data);
    } catch (error) {
        console.error('Marka API hatası:', error);
        return res.apiError('Markalar alınamadı.');
    }
};
