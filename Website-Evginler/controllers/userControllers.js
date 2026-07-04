require('dotenv').config();
require('moment/locale/tr'); 
const moment = require('moment');
const User = require('../models/user');
const Order = require('../models/order');
const Product =require('../models/products');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const mailjet = require('node-mailjet').apiConnect(process.env.MAILJET_API_KEY,process.env.MAILJET_API_SECRET );
const UserAdress =require('../models/userAdress');
const { title } = require('process');


//Register
exports.getRegister = (req,res,next)=>{
    res.render('user/auth/register',{
        title:'Kaydol',
        path:'/register'
    });
};
exports.postRegister = (req, res, next) => {
    const { name, surname, email, password, phone } = req.body;
    console.log('Kayıt Verileri:');

    User.findOne({ email: email })
        .then(user => {
            if (user) {
                req.session.errorMessage = "Daha Önce Bir Kayıt Oluşturulmuş";
                return req.session.save(function (err) {
                    console.log(err);
                    return res.redirect('/register');
                });
            }
            return bcrypt.hash(password, 10);
        })
        .then(hashedPassword => {
            const newUser = new User({
                name: name,
                surname: surname,
                email: email,
                password: hashedPassword,
                phone: phone,
                registrationDate: new Date()
            });
            return newUser.save();
        })
        .then(() => {
            // Kullanıcı kaydedildikten sonra mail gönderme işlemi
            const request = mailjet
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                        {
                            From: {
                                Email: process.env.MAIL_FROM_EMAIL || 'dogukan755@icloud.com',
                                Name: 'Evginler'
                            },
                            To: [
                                {
                                    Email: email,
                                    Name: name
                                }
                            ],
                            Subject: 'Welcome to Our Service',
                            TextPart: `Merhaba ${name}, Evginler.com'a hoşgeldiniz.`,
                            HTMLPart: `<h3>Merhaba ${name}, Evginler.com'a hoşgeldiniz!</h3><br/><a href="${process.env.CLIENT_ORIGIN_STORE || 'http://localhost:5050'}">Siteye devam et.</a>`
                        }
                    ]
                });

            return request;
        })
        .then((result) => {
            console.log(result.body);
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

//Login
exports.getLogin = (req,res,next)=>{
    res.render('user/auth/login',{
        title:'Giriş Yap',
        path:'/login'
    });
};

exports.postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email:email})
        .then(user=>{
            if(!user){
                req.session.errorMessage = "Kullanıcı Bulunamadı";
                req.session.save(function(err){
                    console.log(err);
                    return res.redirect('/login')
                })
            }
            bcrypt.compare(password,user.password)
                .then(isSuccess=>{
                    if(isSuccess){
                        req.session.user = user;
                        req.session.isAuthenticated = true;
                        console.log(`Hoşgeldiniz ${req.session.user.name}`);
                        return req.session.save(function(err){
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    res.redirect('/login')
                })
                .catch(err=>{console.log(err)});
        })
        .catch(err=>{console.log(err)})
}

//User Pages
exports.getUser = (req, res, next) => {
    const userId = req.user._id;

    Order.find({ userId: userId })
        .then(orders => {
            // Sipariş tarihlerini Türkçe olarak biçimlendirme
            orders.forEach(order => {
                order.createdAtFormatted = moment(order.createdAt).locale('tr').format('DD MMMM YYYY HH:mm');
            });

            res.render('user/userProfile/user', {
                title: 'Profil',
                path: '/user',
                user: req.session.user,
                orders: orders
            });
        })
        .catch(error => {
            console.error("Siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Siparişleri alırken bir hata oluştu." });
        });
};
exports.userAllOrders = (req, res, next) => {
    const userId = req.user._id;

    Order.find({ userId: userId, isDelivered: false }) 
        .then(orders => {
            orders.forEach(order => {
                order.createdAtFormatted = moment(order.createdAt).locale('tr').format('DD MMMM YYYY HH:mm');
            });
            console.log('Siparişler',orders)
            res.render('user/userProfile/userAllOrders', {
                title: 'Tüm Siparişlerim',
                path: '/userAllOrders',
                user: req.session.user,
                orders: orders
            });
        })
        .catch(error => {
            console.error("Siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Siparişleri alırken bir hata oluştu." });
        });
}
exports.userDeliveredOrders = (req, res, next) => {
    const userId = req.user._id;

    // Teslim edilmiş siparişleri bul
    Order.find({ userId: userId, isDelivered: true , isReturned:false,'products.isReturned': false}) // isDelivered alanı true olanları filtrele
        .then(orders => {
            // Her siparişin oluşturulma tarihini Türkçe olarak biçimlendir
            orders.forEach(order => {
                order.createdAtFormatted = moment(order.createdAt).locale('tr').format('DD MMMM YYYY HH:mm');
                order.products = order.products.filter(product => !product.isReturned);
            });

            // userDeliveredOrders view'ine teslim edilmiş siparişleri gönder
            res.render('user/userProfile/userDeliveredOrders', {
                title: 'Teslim Edilen Siparişlerim',
                path: '/userDeliveredOrders',
                user: req.session.user,
                orders: orders
            });
        })
        .catch(error => {
            console.error("Teslim edilmiş siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Teslim edilmiş siparişleri alırken bir hata oluştu." });
        });
}
exports.getUserInformation=(req,res,next)=>{
    const successMessage = req.session.successMessage;
    const errorMessage = req.session.errorMessage;

    delete req.session.successMessage;
    delete req.session.errorMessage;
    console.log('Kullanıcı Bilgileri:',req.session.user)
    res.render('user/userProfile/userInformations',{
        title:'Kullanıcı Bilgileri',
        path:'/userInformation',
        user:req.session.user,
        successMessage:successMessage,
        errorMessage:errorMessage
    })
}
exports.postUserInformation=(req,res,next)=>{
    const userId = req.user._id
    const {name,surname,email,phone} = req.body;

    User.findById(userId)
        .then(user=>{
            if (!user) {
                return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
            }
            else{
                user.name = name;
                user.surname = surname;
                user.email = email;
                user.phone = phone;

                return user.save();
            }
        })
        .then(result => {
            req.session.user = result;
            req.session.successMessage = 'Bilgileriniz başarılı bir şekilde güncellendi';
            req.session.errorMessage = 'Bilgiler güncellenirken bir hata oluştu';
            req.session.save(err => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: 'Oturum güncellenemedi.' });
                }
                res.redirect('/userInformation');
            });
        })
        .catch(err=>{console.log(err)})
}
exports.getUserAdressInfo = (req, res, next) => {
    const successMessage = req.session.successMessage;
    delete req.session.successMessage;

    const userId = req.user._id;

    // Kullanıcının adreslerini bul
    UserAdress.find({ userId: userId })
        .then(addresses => {
            console.log('Adresler',addresses)
            res.render('user/userProfile/userAdressInfo', {
                title: 'Kullanıcı Adres Bilgileri',
                path: '/userAdressInfo',
                user: req.session.user,
                successMessage: successMessage,
                addresses: addresses  
            });
        })
        .catch(err => {
            console.log(err);
            // Hata durumunda uygun bir işlem yapın
            res.status(500).json({ message: 'Adresler alınamadı.' });
        });
};
exports.postUserAdress = (req, res, next) => {
    const userId = req.user._id;
    const { city, street, district, zipCode, identityNumber, fullAddress, title,country } = req.body;

    const newAddress = new UserAdress({
        userId: userId,
        city: city,
        street: street,
        district: district,
        zipCode: zipCode,
        identityNumber: identityNumber,
        fullAddress: fullAddress,
        title: title,
        country:country
    });

    newAddress.save()
        .then(result => {
            res.redirect('/userAdressInfo');
        })
        .catch(err => {
            console.log(err); 
        });
};
exports.postUserAddressUpdate = (req, res, next) => {
    const addressId = req.params.address_id;  // URL'den gelen adres ID'si
    const { city, zipCode, country, street, district, fullAddress, title, identityNumber } = req.body;

    UserAdress.findById(addressId)  
        .then(address => {
            if (!address) {
                return res.status(404).json({ message: 'Adres bulunamadı' });
            }

           
            address.city = city || address.city;
            address.zipCode = zipCode || address.zipCode;
            address.country = country || address.country;
            address.street = street || address.street;
            address.district = district || address.district;
            address.fullAddress = fullAddress || address.fullAddress;
            address.title = title || address.title;
            address.identityNumber = identityNumber || address.identityNumber;

            return address.save();
        })
        .then(result => {
            req.session.successMessage = 'Adres başarıyla güncellendi';
            req.session.save(err => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: 'Oturum güncellenemedi' });
                } else {
                    res.redirect('/userAdressInfo');
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Sunucu hatası, adres bilgileri kaydedilemedi.' });
        });
};
// userController.js
exports.getSelectAddressForOrder = (req, res, next) => {
    const userId = req.user._id;

    UserAdress.find({ userId: userId })
        .then(addresses => {
            if (!addresses) {
                return res.status(404).json({ message: 'Kullanıcı adresi bulunamadı' });
            }

            res.render('user/userProfile/selectAddress', {
                title: 'Adres Seç',
                path: '/selectAddress',
                addresses: addresses,
                csrfToken: req.csrfToken()
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Adresler yüklenemedi' });
        });
};

exports.postSelectAddressForOrder = (req, res, next) => {
    const selectedAddressId = req.body.selectedAddress;

    User.findById(req.user._id)
        .then(user => {
            user.selectedAddress = selectedAddressId;
            return user.save();
        })
        .then(() => {
            res.redirect('/payment');
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Adres seçimi sırasında bir hata oluştu' });
        });
};





//Shopping Card
exports.getShoppingCard = (req, res, next) => {
    const userId = req.user._id;
    
    User.findById(userId)
        .populate('cart.productId')
        .then(user => {
            if (!user) {
                console.log("Kullanıcı bulunamadı.");
                return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
            }

            console.log("Kullanıcı sepet bilgisi:", user.cart);
            console.log("Kullanıcı CartId Bilgisi:", user.cartId);

            

            res.render('user/userProfile/shoppingCard', {
                title: 'Sepet',
                path: '/shoppingCard',
                cart:user.cart
            });
        })
        .catch(error => {
            console.error('Sepet bilgisini alma sırasında bir hata oluştu:', error);
            res.status(500).json({ error: 'Sepet bilgisini alırken bir hata oluştu.' });
        });
};

//Logout
exports.getLogout=(req,res,next)=>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/');
    })
}



//İade İşlemleri
exports.getReturnedOrders = (req, res, next) => {
    const userId = req.user._id;

    Order.find({ userId: userId, 'products.isReturned': true }) 
        .then(orders => {
            orders.forEach(order => {
                order.createdAtFormatted = moment(order.createdAt).locale('tr').format('DD MMMM YYYY HH:mm');
                // Sadece iade edilen ürünleri filtreleyin
                order.products = order.products.filter(product => product.isReturned);
            });
            console.log('İptal edilen ürünler:',orders)
            res.render('user/userProfile/returnedOrders', {
                title: 'İade Edilen Ürünlerim',
                path: '/iadeUrunler',
                user: req.session.user,
                orders: orders
            });
        })
        .catch(error => {
            console.error("Siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Siparişleri alırken bir hata oluştu." });
        });
};
exports.postReturnedOrders = (req, res, next) => {
    const orderId = req.params.orderId;
    const productId = req.body.productId;  // İade edilecek ürünün ID'si
    const returnReason = req.body.returnReason;

    // Siparişi bul
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return res.status(404).json({ message: 'Sipariş bulunamadı' });
            }

            // İade edilecek ürünü bul
            const product = order.products.find(p => p.productId === productId);
            if (!product) {
                return res.status(404).json({ message: 'Ürün bulunamadı' });
            }

            // Ürünü iade et
            product.isReturned = true;
            product.returnReason = returnReason;

            // Siparişi kaydet
            return order.save();
        })
        .then(() => {
            res.redirect('/returnedOrders'); 
        })
        .catch(error => {
            if (!res.headersSent) {
                res.status(500).json({ message: 'Bir hata oluştu', error });
            } else {
                console.error('HTTP Headers already sent:', error);
            }
        });
};

//Favori Ürünler
exports.getFavoriteProducts = (req, res, next) => {
    const userId = req.user._id;

    User.findById(userId)
        .populate('favorites')
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }

            const favoriteProductIds = user.favorites;

            return Product.find({ _id: { $in: favoriteProductIds } });
        })
        .then(favoriteProducts => {
            console.log("Favori Ürünler:", favoriteProducts);
            res.render('user/userProfile/favoriteProducts', {
                title: 'Favori Ürünler',
                path: '/favoriteProducts',
                user: req.session.user,
                favorites: favoriteProducts 
            });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
};

exports.postFavoriteProducts = (req, res, next) => {
    const userId = req.user._id;
    const productId = req.body.productId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).send('User not found');
            }

            // Eğer ürün zaten favori ise, favorilerden çıkar
            if (user.favorites.includes(productId)) {
                user.favorites = user.favorites.filter(favProductId => favProductId.toString() !== productId);
            } else {
                // Eğer ürün favori değilse, favorilere ekle
                user.favorites.push(productId);
            }

            return user.save();
        })
        .then(() => {
            res.redirect('/');
        })
        .catch(error => {
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
};

