const mongoose = require('mongoose');
const Brand = require('../../models/brands');
const Category = require('../../models/category');
const Product = require('../../models/products');

const normalizeArray = value => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

const imageUrlsFromBody = body => {
    if (Array.isArray(body.imageUrl)) {
        return body.imageUrl.filter(Boolean);
    }

    return [body.imageUrl1, body.imageUrl2, body.imageUrl3].filter(Boolean);
};

exports.getProducts = async (req, res) => {
    try {
        const { searchQuery } = req.query;
        let products = await Product.find()
            .populate({ path: 'categories', model: 'Category', select: 'name description imageUrl subcategories' })
            .populate({ path: 'brands', model: 'Brand', select: 'name imageUrl' });

        if (searchQuery) {
            products = products.filter(product => {
                const productName = product.name.toLowerCase();
                const categoryNames = product.categories.map(category => category.name.toLowerCase());
                return productName.includes(searchQuery.toLowerCase()) || categoryNames.includes(searchQuery.toLowerCase());
            });
        }

        products = products.map(product => {
            const productObject = product.toObject();
            productObject.discountedPrice = product.getDiscountedPrice();
            return productObject;
        });

        return res.apiSuccess(products);
    } catch (error) {
        console.error('Admin ürün liste API hatası:', error);
        return res.apiError('Ürünler alınamadı.');
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
            .populate({ path: 'categories', model: 'Category', select: 'name description imageUrl subcategories' })
            .populate({ path: 'brands', model: 'Brand', select: 'name imageUrl' });

        if (!product) {
            return res.apiError('Ürün bulunamadı.', 404);
        }

        return res.apiSuccess(product);
    } catch (error) {
        console.error('Admin ürün detay API hatası:', error);
        return res.apiError('Ürün alınamadı.');
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await new Product({
            name: req.body.name,
            price: req.body.price,
            discount: req.body.discount || 0,
            size: req.body.size,
            categories: normalizeArray(req.body.categoryId || req.body.categories),
            subcategories: normalizeArray(req.body.subcategoryId || req.body.subcategories),
            brands: normalizeArray(req.body.brandId || req.body.brands),
            stock: req.body.stock,
            description: req.body.description,
            imageUrl: imageUrlsFromBody(req.body)
        }).save();

        return res.apiSuccess(product, 'Ürün oluşturuldu.', 201);
    } catch (error) {
        console.error('Admin ürün oluşturma API hatası:', error);
        return res.apiError('Ürün oluşturulamadı.', 400, error.errors);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.apiError('Ürün bulunamadı.', 404);
        }

        product.name = req.body.name ?? product.name;
        product.price = req.body.price ?? product.price;
        product.discount = req.body.discount ?? product.discount;
        product.size = req.body.size ?? product.size;
        product.description = req.body.description ?? product.description;
        product.stock = req.body.stock ?? product.stock;

        if (req.body.categoryId || req.body.categories) {
            product.categories = normalizeArray(req.body.categoryId || req.body.categories);
        }

        if (req.body.subcategoryId || req.body.subcategories) {
            product.subcategories = normalizeArray(req.body.subcategoryId || req.body.subcategories);
        }

        if (req.body.brandId || req.body.brands) {
            product.brands = normalizeArray(req.body.brandId || req.body.brands);
        }

        const imageUrl = imageUrlsFromBody(req.body);
        if (imageUrl.length > 0) {
            product.imageUrl = imageUrl;
        }

        await product.save();
        return res.apiSuccess(product, 'Ürün güncellendi.');
    } catch (error) {
        console.error('Admin ürün güncelleme API hatası:', error);
        return res.apiError('Ürün güncellenemedi.', 400, error.errors);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const result = await Product.deleteOne({ _id: req.params.productId });

        if (result.deletedCount === 0) {
            return res.apiError('Ürün bulunamadı.', 404);
        }

        return res.apiSuccess(null, 'Ürün silindi.');
    } catch (error) {
        console.error('Admin ürün silme API hatası:', error);
        return res.apiError('Ürün silinemedi.');
    }
};

exports.updateProductsStatus = async (req, res) => {
    try {
        const productIds = normalizeArray(req.body.productIds).filter(Boolean);
        const { isActive } = req.body;

        if (productIds.length === 0) {
            return res.apiError('En az bir ürün seçmelisiniz.', 400);
        }

        if (typeof isActive !== 'boolean') {
            return res.apiError('isActive true veya false olmalıdır.', 400);
        }

        const invalidIds = productIds.filter(productId => !mongoose.Types.ObjectId.isValid(productId));
        if (invalidIds.length > 0) {
            return res.apiError('Geçersiz ürün id değeri gönderildi.', 400, invalidIds);
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: { isActive } }
        );

        return res.apiSuccess(
            { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount },
            isActive ? 'Seçili ürünler yayına alındı.' : 'Seçili ürünler yayından kaldırıldı.'
        );
    } catch (error) {
        console.error('Admin toplu ürün durum güncelleme API hatası:', error);
        return res.apiError('Ürün durumları güncellenemedi.', 400, error.errors || error.message);
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.apiSuccess(categories);
    } catch (error) {
        console.error('Admin kategori liste API hatası:', error);
        return res.apiError('Kategoriler alınamadı.');
    }
};

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);

        if (!category) {
            return res.apiError('Kategori bulunamadı.', 404);
        }

        return res.apiSuccess(category);
    } catch (error) {
        console.error('Admin kategori detay API hatası:', error);
        return res.apiError('Kategori alınamadı.');
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await new Category({
            name: req.body.name,
            subcategories: normalizeArray(req.body.subcategories)
        }).save();

        return res.apiSuccess(category, 'Kategori oluşturuldu.', 201);
    } catch (error) {
        console.error('Admin kategori oluşturma API hatası:', error);
        return res.apiError('Kategori oluşturulamadı.', 400, error.errors);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);

        if (!category) {
            return res.apiError('Kategori bulunamadı.', 404);
        }

        category.name = req.body.name ?? category.name;
        if (req.body.subcategories !== undefined) {
            category.subcategories = normalizeArray(req.body.subcategories).filter(subcategory => subcategory.trim() !== '');
        }

        await category.save();
        return res.apiSuccess(category, 'Kategori güncellendi.');
    } catch (error) {
        console.error('Admin kategori güncelleme API hatası:', error);
        return res.apiError('Kategori güncellenemedi.', 400, error.errors);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const result = await Category.deleteOne({ _id: req.params.categoryId });

        if (result.deletedCount === 0) {
            return res.apiError('Kategori bulunamadı.', 404);
        }

        return res.apiSuccess(null, 'Kategori silindi.');
    } catch (error) {
        console.error('Admin kategori silme API hatası:', error);
        return res.apiError('Kategori silinemedi.');
    }
};

exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        return res.apiSuccess(brands);
    } catch (error) {
        console.error('Admin marka liste API hatası:', error);
        return res.apiError('Markalar alınamadı.');
    }
};

exports.getBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.brandId);

        if (!brand) {
            return res.apiError('Marka bulunamadı.', 404);
        }

        return res.apiSuccess(brand);
    } catch (error) {
        console.error('Admin marka detay API hatası:', error);
        return res.apiError('Marka alınamadı.');
    }
};

exports.createBrand = async (req, res) => {
    try {
        const brand = await new Brand({
            name: req.body.name,
            imageUrl: req.body.imageUrl
        }).save();

        return res.apiSuccess(brand, 'Marka oluşturuldu.', 201);
    } catch (error) {
        console.error('Admin marka oluşturma API hatası:', error);
        return res.apiError('Marka oluşturulamadı.', 400, error.errors);
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.brandId);

        if (!brand) {
            return res.apiError('Marka bulunamadı.', 404);
        }

        brand.name = req.body.name ?? brand.name;
        brand.imageUrl = req.body.imageUrl ?? brand.imageUrl;
        await brand.save();

        return res.apiSuccess(brand, 'Marka güncellendi.');
    } catch (error) {
        console.error('Admin marka güncelleme API hatası:', error);
        return res.apiError('Marka güncellenemedi.', 400, error.errors);
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const result = await Brand.deleteOne({ _id: req.params.brandId });

        if (result.deletedCount === 0) {
            return res.apiError('Marka bulunamadı.', 404);
        }

        return res.apiSuccess(null, 'Marka silindi.');
    } catch (error) {
        console.error('Admin marka silme API hatası:', error);
        return res.apiError('Marka silinemedi.');
    }
};
