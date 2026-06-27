const axios = require('axios');
const User = require('../../models/user');

const adminBaseUrl = process.env.ADMIN_API_BASE_URL || 'http://localhost:3030';

exports.getCart = (req, res) => {
    return res.apiSuccess({
        cart: req.user.cart,
        cartId: req.user.cartId
    });
};

exports.addItem = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const response = await axios.get(`${adminBaseUrl}/products/${productId}/json`);
        const product = response.data;
        const user = await User.findById(req.user._id);
        const existingItem = user.cart.find(item => item.productId === productId);
        const discountedPrice = product.discount > 0
            ? product.price - (product.price * (product.discount / 100))
            : product.price;

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            user.cart.push({
                productId,
                quantity: parseInt(quantity),
                name: product.name,
                imageUrl: product.imageUrl,
                price: discountedPrice
            });
        }

        await user.save();
        return res.apiSuccess({ cart: user.cart }, 'Ürün sepete eklendi.');
    } catch (error) {
        console.error('Sepete ekleme API hatası:', error);
        return res.apiError('Ürün sepete eklenemedi.');
    }
};

exports.updateItem = async (req, res) => {
    try {
        const parsedQuantity = parseInt(req.body.quantity);

        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            return res.apiError('Geçersiz miktar.', 400);
        }

        const user = await User.findOneAndUpdate(
            { _id: req.user._id, 'cart.productId': req.params.productId },
            { $set: { 'cart.$.quantity': parsedQuantity } },
            { new: true }
        );

        if (!user) {
            return res.apiError('Sepette ürün bulunamadı.', 404);
        }

        return res.apiSuccess({ cart: user.cart }, 'Sepet güncellendi.');
    } catch (error) {
        console.error('Sepet güncelleme API hatası:', error);
        return res.apiError('Sepet güncellenemedi.');
    }
};

exports.removeItem = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart = user.cart.filter(item => item.productId !== req.params.productId);
        await user.save();

        return res.apiSuccess({ cart: user.cart }, 'Ürün sepetten silindi.');
    } catch (error) {
        console.error('Sepetten silme API hatası:', error);
        return res.apiError('Ürün sepetten silinemedi.');
    }
};
