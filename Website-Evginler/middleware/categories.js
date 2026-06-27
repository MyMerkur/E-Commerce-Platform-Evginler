const axios = require('axios');

const fetchDataMiddleware = async (req, res, next) => {
  try {
    const categoriesResponse = await axios.get('http://localhost:3030/categories/json');
    const categories = categoriesResponse.data;

    const productsResponse = await axios.get('http://localhost:3030/products/json');
    const products = productsResponse.data.map(product => ({
      ...product,
      isOutOfStock: product.stock <= 0
    })).slice(0, 6); // Sadece ilk 6 ürün

    const brandsResponse = await axios.get('http://localhost:3030/brands/json');
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
