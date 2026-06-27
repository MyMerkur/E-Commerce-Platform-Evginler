const moment = require('moment');
require('moment/locale/tr');
const Order = require('../../models/order');
const Product = require('../../models/products');
const User = require('../../models/user');
const UserAddress = require('../../models/userAdress');

const publicUser = user => ({
    _id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    phone: user.phone,
    registrationDate: user.registrationDate,
    selectedAddress: user.selectedAddress
});

const formatOrders = orders => orders.map(order => {
    const orderObject = order.toObject ? order.toObject() : order;
    orderObject.createdAtFormatted = moment(orderObject.createdAt).locale('tr').format('DD MMMM YYYY HH:mm');
    return orderObject;
});

exports.getProfile = (req, res) => {
    return res.apiSuccess(publicUser(req.user));
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, surname, email, phone } = req.body;
        const user = await User.findById(req.user._id);

        user.name = name;
        user.surname = surname;
        user.email = email;
        user.phone = phone;

        await user.save();
        req.session.user = user;

        return res.apiSuccess(publicUser(user), 'Bilgiler güncellendi.');
    } catch (error) {
        console.error('Profil güncelleme API hatası:', error);
        return res.apiError('Bilgiler güncellenemedi.');
    }
};

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await UserAddress.find({ userId: req.user._id });
        return res.apiSuccess(addresses);
    } catch (error) {
        console.error('Adres liste API hatası:', error);
        return res.apiError('Adresler alınamadı.');
    }
};

exports.createAddress = async (req, res) => {
    try {
        const address = await new UserAddress({
            userId: req.user._id,
            identityNumber: req.body.identityNumber,
            city: req.body.city,
            zipCode: req.body.zipCode,
            country: req.body.country,
            street: req.body.street,
            district: req.body.district,
            fullAddress: req.body.fullAddress,
            title: req.body.title
        }).save();

        return res.apiSuccess(address, 'Adres eklendi.', 201);
    } catch (error) {
        console.error('Adres ekleme API hatası:', error);
        return res.apiError('Adres eklenemedi.');
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const address = await UserAddress.findOne({ _id: req.params.addressId, userId: req.user._id });

        if (!address) {
            return res.apiError('Adres bulunamadı.', 404);
        }

        const fields = ['identityNumber', 'city', 'zipCode', 'country', 'street', 'district', 'fullAddress', 'title'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                address[field] = req.body[field];
            }
        });

        await address.save();
        return res.apiSuccess(address, 'Adres güncellendi.');
    } catch (error) {
        console.error('Adres güncelleme API hatası:', error);
        return res.apiError('Adres güncellenemedi.');
    }
};

exports.selectAddress = async (req, res) => {
    try {
        const address = await UserAddress.findOne({ _id: req.body.selectedAddress, userId: req.user._id });

        if (!address) {
            return res.apiError('Adres bulunamadı.', 404);
        }

        const user = await User.findById(req.user._id);
        user.selectedAddress = address._id;
        await user.save();

        return res.apiSuccess({ selectedAddress: address }, 'Adres seçildi.');
    } catch (error) {
        console.error('Adres seçme API hatası:', error);
        return res.apiError('Adres seçilemedi.');
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { userId: req.user._id };

        if (status === 'active') {
            query.isDelivered = false;
        }

        if (status === 'delivered') {
            query.isDelivered = true;
            query.isReturned = false;
            query['products.isReturned'] = false;
        }

        const orders = await Order.find(query);

        if (status === 'returned') {
            const returnedOrders = orders
                .filter(order => order.products.some(product => product.isReturned))
                .map(order => {
                    const orderObject = order.toObject();
                    orderObject.products = orderObject.products.filter(product => product.isReturned);
                    return orderObject;
                });

            return res.apiSuccess(formatOrders(returnedOrders));
        }

        return res.apiSuccess(formatOrders(orders));
    } catch (error) {
        console.error('Sipariş liste API hatası:', error);
        return res.apiError('Siparişler alınamadı.');
    }
};

exports.returnProduct = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.user._id });

        if (!order) {
            return res.apiError('Sipariş bulunamadı.', 404);
        }

        const product = order.products.find(item => item.productId === req.body.productId);

        if (!product) {
            return res.apiError('Ürün bulunamadı.', 404);
        }

        product.isReturned = true;
        product.returnReason = req.body.returnReason;
        await order.save();

        return res.apiSuccess(order, 'İade talebi alındı.');
    } catch (error) {
        console.error('İade API hatası:', error);
        return res.apiError('İade işlemi yapılamadı.');
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites');
        const favoriteProducts = await Product.find({ _id: { $in: user.favorites } });
        return res.apiSuccess(favoriteProducts);
    } catch (error) {
        console.error('Favori liste API hatası:', error);
        return res.apiError('Favoriler alınamadı.');
    }
};

exports.addFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.productId;
        const exists = user.favorites.some(favorite => favorite.toString() === productId);

        if (!exists) {
            user.favorites.push(productId);
            await user.save();
        }

        return res.apiSuccess({ favorites: user.favorites, isFavorite: true }, 'Ürün favorilere eklendi.');
    } catch (error) {
        console.error('Favori ekleme API hatası:', error);
        return res.apiError('Favori eklenemedi.');
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.productId;

        user.favorites = user.favorites.filter(favorite => favorite.toString() !== productId);
        await user.save();

        return res.apiSuccess({ favorites: user.favorites, isFavorite: false }, 'Ürün favorilerden çıkarıldı.');
    } catch (error) {
        console.error('Favori silme API hatası:', error);
        return res.apiError('Favori silinemedi.');
    }
};
