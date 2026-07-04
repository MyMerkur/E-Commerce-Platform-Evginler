const axios = require('axios');

const adminBaseUrl = process.env.ADMIN_API_BASE_URL || 'http://localhost:3030';

const fetchDataMiddleware = async (req, res, next) => {
  try {
    const categoriesResponse = await axios.get(`${adminBaseUrl}/categories/json`);
    const categories = categoriesResponse.data;

    const productsResponse = await axios.get(`${adminBaseUrl}/products/json`);
    const products = productsResponse.data.map(product => ({
      ...product,
      isOutOfStock: product.stock <= 0
    })).slice(0, 6); // Sadece ilk 6 ürün

    const brandsResponse = await axios.get(`${adminBaseUrl}/brands/json`);
    const brands = brandsResponse.data.map(brand => ({
      _id: brand._id,
      name: brand.name,
      imageUrl: brand.imageUrl
    }));

    req.categories = categories;
    req.products = products;
    req.brands = brands;

    next();
  } catch (error) {
    console.error('Veri çekme sırasında bir hata oluştu:', error);
    req.errorMessage = 'Veri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
    next();
  }
};

module.exports = fetchDataMiddleware;
