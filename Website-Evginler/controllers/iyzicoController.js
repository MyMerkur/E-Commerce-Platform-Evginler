const User = require('../models/user');
const Order = require('../models/order');
require('dotenv').config();
const Iyzipay = require('iyzipay');
const Product = require('../models/products');
const PendingPayment = require('../models/pendingPayment');
const mailjet = require('node-mailjet').apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);
const paymentSuccessUrl = process.env.CLIENT_PAYMENT_SUCCESS_URL || '/paymentSuccess';
const paymentFailedUrl = process.env.CLIENT_PAYMENT_FAILED_URL || '/paymentFailed';

//Iyzico Connection
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,
    secretKey: process.env.IYZIPAY_SECRET_KEY,
    uri: process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com'
});

//Calculate Total Price
const calculateTotalPrice = (cartItems) => {
    let totalPrice = 0;
    cartItems.forEach(item => {
        totalPrice += item.price * item.quantity;
    });
    return totalPrice;
};

//Check Stock
function checkStock(cartItems) {
    const stockCheckPromises = cartItems.map(item => {
        return Product.findById(item.productId)
            .then(product => {
                if (!product || product.stock < item.quantity) {
                    throw new Error(`Ürün ${product ? product.name : item.productId} için yeterli stok yok.`);
                }
            });
    });
    return Promise.all(stockCheckPromises);
}


//CallBack
exports.postCallback = (req, res) => {
    const { status, paymentId, conversationData, conversationId } = req.body;
    let callbackUserId;

    PendingPayment.findOne({ conversationId })
        .then(pendingPayment => {
            const userId = req.session && req.session.user && req.session.user._id
                ? req.session.user._id
                : pendingPayment && pendingPayment.userId;

            if (!userId) {
                console.error('Ödeme callback kullanıcı kimliği bulunamadı:', { conversationId });
                return res.redirect(paymentFailedUrl + '?errorMessage=' + encodeURIComponent('Kullanıcı kimliği belirlenemedi.'));
            }

            callbackUserId = userId;
            return User.findById(userId).populate('selectedAddress');
        })
        .then(user => {
            if (!user) {
                return res.redirect(paymentFailedUrl + '?errorMessage=' + encodeURIComponent('Kullanıcı bulunamadı.'));
            }

            const cartItems = user.cart;
            const selectedAddress = user.selectedAddress;

            if (!selectedAddress) {
                return res.status(400).json({ error: 'Adres bilgisi eksik.' });
            }

            console.log('Cart Items:', cartItems); 

            checkStock(cartItems)
                .then(() => {
                    console.log('Stok kontrolü başarılı');

                    // Ödeme Onaylama
                    iyzipay.threedsPayment.create({
                        status: status,
                        conversationId: conversationId,
                        locale: 'tr',
                        paymentId: paymentId,
                        conversationData: conversationData
                    }, function (err, result) {
                        if (err) {
                            console.error('Ödeme Doğrulama Sırasında bir Hata Oluştu', err);
                            return res.redirect(paymentFailedUrl);
                        } else {
                            console.log('Ödeme Doğrulama Başarılı', result);
                            // Başarılı ödeme durumunu kontrol et
                            if (result.status === 'failure') {
                                console.error('Ödeme başarısız:', result.errorMessage);
                                return res.redirect(paymentFailedUrl + '?errorMessage=' + encodeURIComponent(result.errorMessage));
                            }

                          
                            const totalPrice = calculateTotalPrice(cartItems);
                            const newOrder = new Order({
                                orderId:user.cartId,
                                userId: callbackUserId,
                                address: selectedAddress._id,
                                products: cartItems.map(item => ({
                                    productId: item.productId,
                                    name: item.name,
                                    quantity: item.quantity,
                                    imageUrl: item.imageUrl[0],
                                    price: item.price
                                })),
                                totalPrice: totalPrice,
                                paymentStatus: 'success',
                                isSalesContractAccepted:true
                            });

                            newOrder.save()
                                .then(savedOrder => {
                                    console.log('Sipariş başarıyla oluşturuldu:', savedOrder);

                                    // Stok güncellemesi
                                    const updatePromises = cartItems.map(item => {
                                        return Product.findById(item.productId)
                                            .then(product => {
                                                return product.decreaseStock(item.quantity);
                                            });
                                    });

                                    return Promise.all(updatePromises)
                                        .then(() => {
                                            // Sepeti temizlemeden önce sipariş oluşturuldu
                                            user.cart = [];
                                            return user.save()
                                                .then(() => {
                                                    // Mail gönderme işlemi
                                                    const request = mailjet
                                                        .post('send', { version: 'v3.1' })
                                                        .request({
                                                            Messages: [
                                                                {
                                                                    From: {
                                                                        Email: 'dogukan755@icloud.com',
                                                                        Name: 'Evginler'
                                                                    },
                                                                    To: [
                                                                        {
                                                                            Email: user.email,
                                                                            Name: user.name + " " + user.surname
                                                                        }
                                                                    ],
                                                                    Subject: 'Siparişiniz Onaylandı',
                                                                    TextPart: `Merhaba ${user.name},\n\nSiparişiniz başarıyla oluşturuldu.\n\nÜrünler: ${cartItems.map(item => `${item.name} - ${item.quantity} adet`).join(', ')}\nToplam Fiyat: ${totalPrice} TL\n\nTeşekkürler!`,
                                                                    HTMLPart: `
                                                                    <!DOCTYPE html>
                                                                    <html lang="en">
                                                                    <head>
                                                                        <meta charset="UTF-8">
                                                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                                        <title>Siparişiniz Onaylandı</title>
                                                                        <style>
                                                                            body {
                                                                                font-family: Arial, sans-serif;
                                                                                line-height: 1.6;
                                                                                background-color: #f4f4f4;
                                                                                margin: 0;
                                                                                padding: 0;
                                                                            }
                                                                            .container {
                                                                                max-width: 600px;
                                                                                margin: 20px auto;
                                                                                background-color: #fff;
                                                                                padding: 20px;
                                                                                border-radius: 8px;
                                                                                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                                                                            }
                                                                            h3 {
                                                                                color: #333;
                                                                            }
                                                                            p {
                                                                                color: #666;
                                                                            }
                                                                            strong {
                                                                                font-weight: bold;
                                                                            }
                                                                        </style>
                                                                    </head>
                                                                    <body>
                                                                    <div class="container">
                                                                        <h3>Merhaba ${user.name},</h3>
                                                                        <p>Siparişiniz başarıyla oluşturuldu.</p>
                                                                        <table border="1">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Ürün Adı</th>
                                                                                    <th>Adet</th>
                                                                                    <th>Görsel</th>
                                                                                    <th>Fiyat</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                ${cartItems.map(item => `
                                                                                    <tr>
                                                                                        <td>${item.name}</td>
                                                                                        <td>${item.quantity}</td>
                                                                                        <td><img src="${item.imageUrl}" alt="${item.name}" style="width: 100px;"></td>
                                                                                        <td>${item.price} TL</td>
                                                                                    </tr>
                                                                                `).join('')}
                                                                            </tbody>
                                                                        </table>
                                                                        <p><strong>Toplam Fiyat:</strong> ${totalPrice} TL</p>
                                                                        <p>Teşekkürler!</p>
                                                                    </div>
                                                                </body>
                                                                    </html>
                                                                    `
                                                                }
                                                            ]
                                                        });

                                                    return request.catch(error => {
                                                        console.error('Sipariş maili gönderilemedi:', error);
                                                        return null;
                                                    });
                                                })
                                                .then(() => {
                                                    PendingPayment.deleteOne({ conversationId })
                                                        .catch(error => console.error('Pending payment temizlenemedi:', error));
                                                    res.redirect(paymentSuccessUrl);
                                                })
                                                .catch(error => {
                                                    console.error('Sepeti temizleme sırasında bir hata oluştu:', error);
                                                    return res.status(500).json({ error: 'Sepeti temizleme sırasında bir hata oluştu.' });
                                                });
                                        })
                                        .catch(error => {
                                            console.error('Stok güncelleme sırasında bir hata oluştu:', error);
                                            return res.status(500).json({ error: 'Stok güncelleme sırasında bir hata oluştu.' });
                                        });
                                })
                                .catch(error => {
                                    console.error('Sipariş kaydı sırasında bir hata oluştu:', error);
                                    return res.status(500).json({ error: 'Sipariş kaydı sırasında bir hata oluştu.' });
                                });
                        }
                    });
                })
                .catch(error => {
                    console.error('Stok kontrolü sırasında bir hata oluştu:', error);
                    return res.status(400).json({ error: error.message });
                });
        })
        .catch(error => {
            console.error('Kullanıcı bilgilerini alma sırasında bir hata oluştu:', error);
            return res.status(500).json({ error: 'Kullanıcı bilgilerini alırken bir hata oluştu.' });
        });
};
