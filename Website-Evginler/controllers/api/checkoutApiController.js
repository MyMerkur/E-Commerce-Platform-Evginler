const Iyzipay = require('iyzipay');
const { v4: uuidv4 } = require('uuid');
const User = require('../../models/user');
const PendingPayment = require('../../models/pendingPayment');

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,
    secretKey: process.env.IYZIPAY_SECRET_KEY,
    uri: process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com'
});

const calculateShippingFee = totalPrice => totalPrice >= 500 ? 0 : 250;

const calculateTotalPrice = cartItems => {
    let totalPriceWithoutShipping = 0;
    cartItems.forEach(item => {
        totalPriceWithoutShipping += item.price * item.quantity;
    });

    const shippingFee = calculateShippingFee(totalPriceWithoutShipping);

    return {
        totalPriceWithoutShipping,
        shippingFee,
        totalPrice: totalPriceWithoutShipping + shippingFee
    };
};

exports.getCheckout = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('selectedAddress');
        const totals = calculateTotalPrice(user.cart);

        return res.apiSuccess({
            user: {
                name: user.name,
                surname: user.surname,
                phone: user.phone,
                email: user.email
            },
            selectedAddress: user.selectedAddress,
            cartItems: user.cart,
            totals
        });
    } catch (error) {
        console.error('Checkout API hatası:', error);
        return res.apiError('Ödeme bilgileri alınamadı.');
    }
};

exports.processPayment = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('selectedAddress');

        if (!user.selectedAddress) {
            return res.apiError('Ödeme için adres seçmelisiniz.', 400);
        }

        const currentDate = new Date();
        const lastLoginDate = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const registrationDate = user.registrationDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const { cardNumber, expireMonth, expireYear, cvc, cardHolderName, installment } = req.body;
        const totals = calculateTotalPrice(user.cart);
        const selectedAddress = user.selectedAddress;
        const conversationId = uuidv4();

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId,
            price: totals.totalPriceWithoutShipping.toString(),
            paidPrice: totals.totalPrice.toString(),
            currency: Iyzipay.CURRENCY.TRY,
            installment,
            basketId: user.cartId,
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: process.env.IYZIPAY_CALLBACK_URL || 'http://localhost:5050/callback',
            paymentCard: {
                cardHolderName,
                cardNumber,
                expireMonth,
                expireYear,
                cvc,
                registerCard: '0'
            },
            buyer: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                gsmNumber: `+90${user.phone}`,
                email: user.email,
                identityNumber: selectedAddress.identityNumber,
                registrationAddress: selectedAddress.fullAddress,
                lastLoginDate,
                registrationDate,
                ip: req.ip,
                city: selectedAddress.city,
                country: selectedAddress.country,
                zipCode: selectedAddress.zipCode
            },
            shippingAddress: {
                contactName: `${user.name} ${user.surname}`,
                city: selectedAddress.city,
                country: selectedAddress.country,
                address: selectedAddress.fullAddress,
                zipCode: selectedAddress.zipCode
            },
            billingAddress: {
                contactName: `${user.name} ${user.surname}`,
                city: selectedAddress.city,
                country: selectedAddress.country,
                address: selectedAddress.fullAddress,
                zipCode: selectedAddress.zipCode
            },
            basketItems: user.cart.map(item => ({
                id: item.productId,
                name: item.name,
                category1: 'Product',
                category2: 'General',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: (item.price * item.quantity).toString()
            }))
        };

        iyzipay.threedsInitialize.create(request, async (err, result) => {
            if (err) {
                console.error('Ödeme başlatma API hatası:', err);
                return res.apiError('Ödeme işlemi başlatılamadı.');
            }

            if (result && result.threeDSHtmlContent) {
                await PendingPayment.findOneAndUpdate(
                    { conversationId },
                    { conversationId, userId: user._id },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                const threeDSHtmlContent = Buffer.from(result.threeDSHtmlContent, 'base64').toString('utf-8');
                return res.apiSuccess({ threeDSHtmlContent }, '3D Secure başlatıldı.');
            }

            return res.apiError(result && result.errorMessage ? result.errorMessage : 'Ödeme işlemi başlatılamadı.', 400, result);
        });
    } catch (error) {
        console.error('Ödeme API hatası:', error);
        return res.apiError('Ödeme sırasında hata oluştu.');
    }
};
