const axios = require('axios');
const User = require('../models/user');
const Iyzipay = require('iyzipay');
const Order = require('../models/order');
const { v4: uuidv4 } = require('uuid');
const getClientIp = require('../middleware/userIp');

// İyzipay Ayarları
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,
    secretKey: process.env.IYZIPAY_SECRET_KEY,
    uri: process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com'
});
const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
};

exports.getIndex = (req, res, next) => {
    // Kategoriler
    axios.get('http://localhost:3030/categories/json')
        .then(response => {
            const categories = response.data;

            axios.get('http://localhost:3030/products/json')
                .then(productResponse => {
                    const products = productResponse.data
                        .map(product => {
                            return {
                                ...product,
                                isOutOfStock: product.stock <= 0
                            };
                        })
                        .slice(0, 6); // Sadece ilk 6 ürün

                    console.log("Ürün Marka ID'si:", products[0].brands);
                    console.log('Ürünler', products);

                    axios.get('http://localhost:3030/brands/json')
                        .then(brandResponse => {
                            const brands = brandResponse.data.map(brand => {
                                return {
                                    _id: brand._id,
                                    name: brand.name,
                                    imageUrl: brand.imageUrl
                                };
                            });
                            console.log('Markalar', brands);
                            res.render('shop/index', {
                                title: 'Anasayfa',
                                path: '/',
                                categories: categories,
                                products: products,
                                brands: brands 
                            });
                        })
                        .catch(brandError => {
                            console.error('Markaları alma sırasında bir hata oluştu:', brandError);
                            res.render('shop/index', {
                                title: 'Anasayfa',
                                path: '/',
                                errorMessage: 'Markaları alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
                            });
                        });
                })
                .catch(productError => {
                    console.error('Ürünleri alma sırasında bir hata oluştu:', productError);
                    res.render('shop/index', {
                        title: 'Anasayfa',
                        path: '/',
                        errorMessage: 'Ürünleri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
                    });
                });
        })
        .catch(error => {
            console.error('Kategorileri alma sırasında bir hata oluştu:', error);
            res.render('shop/index', {
                title: 'Anasayfa',
                path: '/',
                errorMessage: 'Kategorileri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
            });
        });
};

exports.getProductsBySubcategory = (req, res, next) => {
    const subcategory = req.params.subcategory;

    Promise.all([
        axios.get('http://localhost:3030/categories/json'),
        axios.get('http://localhost:3030/products/json'),
        axios.get('http://localhost:3030/brands/json')
    ])
    .then(([categoryResponse, productResponse, brandResponse]) => {
        const categories = categoryResponse.data;
        const products = productResponse.data
            .filter(product => product.subcategories.includes(subcategory))
            .map(product => {
                return {
                    ...product,
                    isOutOfStock: product.stock <= 0
                };
            });
        const brands = brandResponse.data;

        res.render('shop/ProductOptions/subcategoryProducts', {
            title: subcategory,
            path: `/subcategoryProducts/subcategory/${subcategory}`,
            categories: categories,
            products: products,
            brands: brands
        });
    })
    .catch(error => {
        console.error('Verileri alma sırasında bir hata oluştu:', error);
        res.render('shop/products', {
            title: 'Ürünler',
            path: `/products/subcategory/${subcategory}`,
            errorMessage: 'Verileri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
        });
    });
};


exports.getProductDetails = (req, res, next) => {
    const productId = req.params.productId;
    
    axios.get(`http://localhost:3030/products/${productId}/json`)
        .then(response => {
            const product = response.data;
            console.log('Detaylı Ürün',product)
            const discountedPrice = product.price - (product.price * (product.discount / 100));
            const formattedDiscountedPrice = formatPrice(discountedPrice);
            const formatedPrice = formatPrice(product.price)
            console.log('Ürün Formatlanmış Fiyatı:',formatPrice(product.price))
            console.log('İndirimli Fiyat:', formattedDiscountedPrice);
            res.render('shop/ProductOptions/productDetail', {
                title: 'Ürün Detay Sayfası',
                path: `/productDetail`,
                product: product,
                formatedPrice:formatedPrice,
                formattedDiscountedPrice:formattedDiscountedPrice
            });
        })
        .catch(err => {
            console.log('Ürün detaylarını alma sırasında bir hata oluştu:', err);
            res.render('shop/productDetail', {
                title: 'Ürün Detayı',
                path: '/',
                errorMessage: 'Ürün detaylarını alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
            });
        });
};

exports.getAbout = (req, res, next) => {
    res.render('shop/about', {
        title: 'Hakkımızda',
        path: '/about'
    });
};


exports.addToCard = (req, res, next) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    axios.get(`http://localhost:3030/products/${productId}/json`)
        .then(response => {
            const product = response.data;
            User.findById(userId)
                .then(user => {
                    if (!user) {
                        return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
                    }

                    const existingItem = user.cart.find(item => item.productId === productId);
                    const discountedPrice = product.discount > 0 ? product.price - (product.price * (product.discount / 100)) : product.price;

                    if (existingItem) {
                        existingItem.quantity += parseInt(quantity);
                    } else {
                        const newItem = {
                            productId,
                            quantity: parseInt(quantity),
                            name: product.name,
                            imageUrl: product.imageUrl,
                            price: discountedPrice // İndirimli fiyatı kullan
                        };

                        user.cart.push(newItem);
                    }

                    return user.save();
                })
                .then(savedUser => {
                    res.redirect('/shoppingCard');
                })
                .catch(error => {
                    console.error("Ürün ekleme sırasında bir hata oluştu:", error);
                    res.status(500).json({ error: "Ürün eklenirken bir hata oluştu." });
                });
        })
        .catch(error => {
            console.error("Ürün bilgilerini alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Ürün bilgilerini alırken bir hata oluştu." });
        });
};


exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    const userId = req.user._id;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
            }

            const index = user.cart.findIndex(item => item.productId === productId);

            if (index === -1) {
                return res.status(404).json({ error: 'Ürün sepetinizde bulunamadı.' });
            }

            user.cart.splice(index, 1);
            return user.save();
        })
        .then(savedUser => {

            res.redirect('/shoppingCard');
        })
        .catch(error => {
            console.error("Ürün silme sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Ürün silinirken bir hata oluştu." });
        });
};

exports.getSearch = (req, res, next) => {
    const query = req.query.q;

    axios.get(`http://localhost:3030/products/json`)
        .then(response => {
            const allProducts = response.data;
            const filteredProducts = allProducts.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));

            res.render('shop/ProductOptions/searchItem', {
                title: 'Arama Sonuçları',
                path: '/searchItem',
                products: filteredProducts
            });
        })
        .catch(error => {
            console.error('Ürünleri alma sırasında bir hata oluştu:', error);
            res.render('shop/index', {
                title: 'Anasayfa',
                path: '/',
                errorMessage: 'Ürünleri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
            });
        });
}

//Hesaplamalar Ve Yardımcı Fonksiyonlar
const getCartItems = (userId) => {
    return User.findById(userId)
        .then(user => {
            if (!user) {
                throw new Error('Kullanıcı bulunamadı.');
            }
            return user.cart;
        });
};
//Kargo Ücreti Hesapla
const calculateShippingFee = (totalPrice) => {
    // Örnek bir kargo ücreti hesaplama mantığı
    return totalPrice >= 500 ? 0 : 250;
};

User.updateMany({}, { $set: { "cart.$[].quantity": { $toInt: "$cart.$[].quantity" } } }, { multi: true })
    .then(() => {
        console.log("Tüm kullanıcıların sepetindeki ürün miktarları güncellendi.");
    })
    .catch(error => {
        console.error("Hata oluştu:", error);
    });

const calculateTotalPrice = (cartItems) => {
    let totalPrice = 0;
    cartItems.forEach(item => {
        totalPrice += item.price * item.quantity; // Sepetteki fiyat indirimli ya da normal fiyat olarak ayarlanmış durumda
    });
    let shippingFee = calculateShippingFee(totalPrice); // Kargo bedelini hesapla
    let totalPriceWithoutShipping = totalPrice;
    totalPrice += shippingFee;
    return { totalPrice, shippingFee, totalPriceWithoutShipping };
};

exports.getPayment = (req, res, next) => {
    const userId = req.user._id;
    
    User.findById(userId)
        .populate('selectedAddress')
        .then(user => {
            if (!user) {
                console.error('Kullanıcı bulunamadı.');
                return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
            }

            const { name, surname, phone } = user;
            const selectedAddress = user.selectedAddress;

            getCartItems(userId)
                .then(cartItems => {
                    const { totalPrice, shippingFee, totalPriceWithoutShipping } = calculateTotalPrice(cartItems);

                    res.render('user/payment/payment', {
                        title: 'Ödeme Sayfası',
                        path: '/payment',
                        user: { name, surname, phone },
                        selectedAddress: selectedAddress, 
                        cartItems: cartItems,
                        totalPrice: totalPrice,
                        shippingFee: shippingFee
                    });
                })
                .catch(error => {
                    console.error("Sepet bilgilerini alma sırasında bir hata oluştu:", error);
                    res.status(500).json({ error: "Sepet bilgilerini alırken bir hata oluştu." });
                });
        })
        .catch(error => {
            console.error("Kullanıcı bilgilerini alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Kullanıcı bilgilerini alırken bir hata oluştu." });
        });
};

exports.postProcessPayment = (req, res, next) => {
    const userId = req.user._id;
    const userIp = req.ip
    User.findById(userId)
        .populate('selectedAddress')
        .then(user => {
            if (!user) {
                console.error('Kullanıcı bulunamadı.');
                return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
            }
            const { name, surname, selectedAddress } = user;

            const currentDate = new Date();
            const lastLoginDate = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
            const registrationDate = user.registrationDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
            const { cardNumber, expireMonth, expireYear, cvc, cardHolderName,installment } = req.body;

            const cartItems = user.cart;
            const { totalPrice, shippingFee, totalPriceWithoutShipping } = calculateTotalPrice(cartItems);

            const request = {
                locale: Iyzipay.LOCALE.TR,
                conversationId: uuidv4(),
                price: totalPriceWithoutShipping.toString(),
                paidPrice: totalPrice.toString(),
                currency: Iyzipay.CURRENCY.TRY,
                installment: installment,
                basketId: user.cartId,
                paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
                paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
                callbackUrl: process.env.IYZIPAY_CALLBACK_URL || 'http://localhost:5050/callback',
                paymentCard: {
                    cardHolderName: cardHolderName,
                    cardNumber: cardNumber,
                    expireMonth: expireMonth,
                    expireYear: expireYear,
                    cvc: cvc,
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
                    lastLoginDate: lastLoginDate,
                    registrationDate: registrationDate,
                    ip: userIp,
                    city: selectedAddress.city,
                    country: selectedAddress.country,
                    zipCode: selectedAddress.zipCode
                },
                shippingAddress: {
                    contactName: name + ' ' + surname,
                    city: selectedAddress.city,
                    country: selectedAddress.country,
                    address: selectedAddress.fullAddress,
                    zipCode: selectedAddress.zipCode
                },
                billingAddress: {
                    contactName: name + ' ' + surname,
                    city: selectedAddress.city,
                    country: selectedAddress.country,
                    address: selectedAddress.fullAddress,
                    zipCode: selectedAddress.zipCode
                },
                basketItems: cartItems.map(item => ({
                    id: item.productId,
                    name: item.name,
                    category1: 'Product',
                    category2: 'General',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                    price: (item.price * item.quantity).toString() // İndirimli ya da normal fiyatı kullan
                })),
            };

            iyzipay.threedsInitialize.create(request, function (err, result) {
                if (err) {
                    console.error("Ödeme işleminde bir hata oluştu:", err);
                    return res.status(500).json({ error: "Ödeme işlemi sırasında bir hata oluştu." });
                } else {
                    if (result && result.threeDSHtmlContent) {
                        const threeDSHtmlContent = Buffer.from(result.threeDSHtmlContent, 'base64').toString('utf-8');
                        res.send(threeDSHtmlContent);
                    }
                }
            });

        })
        .catch(error => {
            console.error("Kullanıcı bilgilerini alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Kullanıcı bilgilerini alırken bir hata oluştu." });
        });
};

exports.getOrdersJSON = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('userId')
            .populate('address');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//Başarılı Mesajı
exports.getPaymentSuccess=(req,res,next)=>{
    res.render('user/payment/paymentSuccess',{
        title:'Ödeme Başarılı',
        path:'/paymentSuccess',
        user:req.session.user
    });
}

exports.getPaymentFailed=(req,res,next)=>{
    const errorMessage = req.query.errorMessage || null;
    res.render('user/payment/paymentFailed',{
        title:'Ödeme Başarısız',
        path:'/paymentFailed',
        user:req.session.user,
        errorMessage: errorMessage
    });
}



//CHECKOUT FORM
// exports.postProcessPayment = (req, res, next) => {
//     const userId = req.user._id;

//     User.findById(userId)
//         .then(user => {
//             if (!user) {
//                 console.error('Kullanıcı bulunamadı.');
//                 return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
//             }
//             console.log('Kullanıcı bilgileri alındı:', user);
//             const { name, cart, surname } = user;
//             const { cardNumber, expireMonth, expireYear, cvc, cardHolderName } = req.body;
//             user.cart = [];
//             user.save();
//             const totalPrice = calculateTotalPrice(cart);

//             const request = {
//                 locale: Iyzipay.LOCALE.TR,
//                 conversationId: '123456789', 
//                 price: '100', 
//                 paidPrice: '100', 
//                 currency: Iyzipay.CURRENCY.TRY,
//                 enabledInstallments: [2, 3, 6, 9],
//                 basketId: 'B67832',
//                 paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
//                 paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
//                 callbackUrl: 'http://localhost:5050/callback',
//                 buyer: {
//                     id: user.id,
//                     name: user.name,
//                     surname: user.surname,
//                     gsmNumber: `+90${user.phone}`,
//                     email: user.email,
//                     identityNumber: '74300864791',
//                     registrationAddress: user.adress,
//                     address: user.adress,
//                     lastLoginDate: '2015-10-05 12:43:35',
//                     registrationDate: '2013-04-21 15:12:09',
//                     city: 'Ardahan',
//                     country: 'Turkey',
//                     zipCode: '75000',
//                     ip: '85.34.78.112',
//                 },
//                 shippingAddress: {
//                     contactName: name + ' ' + surname,
//                     city: 'Ardahan',
//                     country: 'Turkey',
//                     address: user.adress,
//                     zipCode: '75000'
//                 },
//                 billingAddress: {
//                     contactName: name + ' ' + surname,
//                     city: 'Ardahan',
//                     country: 'Turkey',
//                     address: user.adress,
//                     zipCode: '75000'
//                 },
//                 basketItems: cart.map(item => ({
//                     id: item.productId,
//                     name: item.name,
//                     category1: 'Product',
//                     category2: 'General',
//                     itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
//                     price: '100'
//                 })),
//             };

//             console.log('Request Bilgileri Alındı:', request);

//             iyzipay.checkoutFormInitialize.create(request, function (err, result) {
//                 console.log('Ödeme kısmı başlatıldı...');
//                 if (err) {
//                     console.error("Ödeme işleminde bir hata oluştu:", err);
//                     return res.status(500).json({ error: "Ödeme işlemi sırasında bir hata oluştu." });
//                 } else if (result && result.status === 'failure') {
//                     console.error("Ödeme işlemi başarısız oldu:", result.errorMessage);
//                     return res.status(500).json({ error: result.errorMessage });
//                 } else {
//                     console.log("Ödeme işlemi başarıyla tamamlandı:", result);
//                     const token = result.token;
//                     const checkoutFormContent = result.checkoutFormContent;
//                     return res.send(`${checkoutFormContent},${token}`);
//                 }
//             });
//         })
//         .catch(error => {
//             console.error("Kullanıcı bilgilerini alma sırasında bir hata oluştu:", error);
//             res.status(500).json({ error: "Kullanıcı bilgilerini alırken bir hata oluştu." });
//         });
       
// };

//Shopping Card Quantity Update


exports.updateQuantity = (req, res, next) => {
    const { productId, quantity } = req.body;

    
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity)) {
        return res.status(400).json({ error: 'Geçersiz miktar.' });
    }

    User.findOneAndUpdate(
        { _id: req.user._id, 'cart.productId': productId }, 
        { $set: { 'cart.$.quantity': parsedQuantity } }, 
        { new: true } 
    )
    .then(updatedUser => {
        if (!updatedUser) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }
        res.redirect('/shoppingCard');
    })
    .catch(error => {
        console.error("Ürün miktarı güncellenirken bir hata oluştu:", error);
        res.status(500).json({ error: "Ürün miktarı güncellenirken bir hata oluştu." });
    });
};


exports.filterByBrand = (req, res, next) => {
    const brandId = req.params.brandId;
    console.log('Marka id:',brandId)

    // Markaları al
    axios.get('http://localhost:3030/brands/json')
        .then(brandResponse => {
            const brands = brandResponse.data.map(brand => {
                return {
                    _id: brand._id,
                    name: brand.name,
                    imageUrl: brand.imageUrl
                };
            });

            // Ürünleri filtrele
            axios.get(`http://localhost:3030/products/json`)
                .then(response => {
                    const allProducts = response.data;
                    console.log('Tüm ürünler:', allProducts); 
                    const filteredProducts = allProducts.filter(product => product.brands.includes(brandId));
                    console.log('Filtrelenen ürünler:', filteredProducts); 
                    res.render('shop/ProductOptions/filteredBrand', { 
                        title: 'Marka Ürünleri',
                        path: '/products',
                        products: filteredProducts,
                        brands: brands 
                    });
                })
                .catch(error => {
                    console.error('Ürünleri alma sırasında bir hata oluştu:', error);
                    res.render('error', {
                        title: 'Hata',
                        errorMessage: 'Ürünleri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
                    });
                });
        })
        .catch(brandError => {
            console.error('Markaları alma sırasında bir hata oluştu:', brandError);
            res.render('error', {
                title: 'Hata',
                errorMessage: 'Markaları alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
            });
        });
};


//Gizlilik ve Güvenlik
exports.getDistanceSellingContract=(req,res,next)=>{
    res.render('shop/Privacy_Security/mesafeliSatisSozlesmesi',{
        title:'Mesafeli Satış Sözleşmesi',
        path:'/distanceSellingContract',
        user:req.session.user
    });
}
exports.getDataSecure=(req,res,next)=>{
    res.render('shop/Privacy_Security/gizlilikGuvenlik',{
        title:'GİZLİLİK VE GÜVENLİK POLİTİKASI',
        path:'/dataSecure',
        user:req.session.user
    });
}
exports.getPreliminaryInfo=(req,res,next)=>{
    res.render('shop/Privacy_Security/onBilgilendirmeFormu',{
        title:'Ön Bilgilendirme Formu',
        path:'/preliminaryInfo',
        user:req.session.user
    });
}
exports.getPersonalDataProcessing=(req,res,next)=>{
    res.render('shop/Privacy_Security/kisiselVerilerinIslenmesi',{
        title:'Kişisel Verilerin İşlenmesi',
        path:'/personalDataProcessing',
        user:req.session.user
    });
}

exports.getDeliveryAndReturn=(req,res,next)=>{
    res.render('shop/Privacy_Security/teslimatVeIade',{
        title:'Teslimat Ve İade',
        path:'/deliveryAndReturn',
        user:req.session.user
    });
}
