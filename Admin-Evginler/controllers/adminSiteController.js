const { request } = require('express');
const Category = require('../models/category');
const Product = require('../models/products');
const axios = require('axios');
const Order = require('../models/order');
const Brand = require('../models/brands');

const websiteBaseUrl = process.env.WEBSITE_API_BASE_URL || 'http://localhost:5050';

exports.getIndex = (req, res, next) => {
    axios.get(`${websiteBaseUrl}/ordersJSON`)
        .then(response => {
            // Siparişlerin listesi
            const orders = response.data;

            const incomingOrders = orders.filter(order => !order.isConfirmed && !order.isDelivered && !order.isReturned);
            const deliveredOrders = orders.filter(order => order.isDelivered && order.products.some(product => !product.isReturned));
            const returnedOrders = orders.filter(order => order.isReturned || order.products.some(product => product.isReturned));

            const incomingOrdersCount = incomingOrders.reduce((acc, order) => acc + order.products.length, 0);      
            const deliveredOrdersCount = deliveredOrders.reduce((acc, order) => acc + order.products.length, 0);
            const returnedOrdersCount = returnedOrders.reduce((acc, order) => acc + order.products.length, 0);

            // Toplam alınan siparişlerin fiyatı
            const totalOrdersPrice = orders.reduce((acc, order) => acc + order.totalPrice, 0);

            // İade edilen ürünlerin toplam fiyatı
            const totalReturnedPrice = returnedOrders.reduce((acc, order) => {
                return acc + order.products.reduce((accProduct, product) => {
                    return accProduct + (product.isReturned ? product.price : 0);
                }, 0);
            }, 0);

            // Güncel kazanç
            const netEarnings = totalOrdersPrice - totalReturnedPrice;

             // Progress bar için yüzde değerleri
             const totalOrdersPercent = totalOrdersPrice / totalOrdersPrice * 100;
             const returnedOrdersPercent = totalReturnedPrice / totalOrdersPrice * 100;
             const netEarningsPercent = netEarnings / totalOrdersPrice * 100;
 
            
            Product.find().sort({ createdAt: -1 }).limit(10) 
                .then(products => {
                    console.log('Ürünler:',products)
                    res.render('admin/index', {
                        title: 'Admin Sayfası',
                        path: '/index',
                        orders:orders,
                        incomingOrders: incomingOrders,
                        deliveredOrders: deliveredOrders,
                        returnedOrders: returnedOrders,
                        incomingOrdersCount: incomingOrdersCount,
                        deliveredOrdersCount: deliveredOrdersCount,
                        returnedOrdersCount: returnedOrdersCount,
                        totalOrdersPrice: totalOrdersPrice, // Toplam sipariş fiyatı
                        totalReturnedPrice: totalReturnedPrice, // İade edilen ürünlerin toplam fiyatı
                        netEarnings: netEarnings, // Güncel kazanç
                        totalOrdersPercent: totalOrdersPercent, // Toplam sipariş yüzdesi
                        returnedOrdersPercent: returnedOrdersPercent, // İade edilen ürün yüzdesi
                        netEarningsPercent: netEarningsPercent, // Net kazanç yüzdesi
                        products: products 
                    });
                })
                .catch(error => {
                    console.error('Ürünleri alma sırasında bir hata oluştu:', error);
                    res.status(500).json({ error: "Ürünleri alırken bir hata oluştu." });
                });
        })
        .catch(error => {
            console.error('Siparişleri alma sırasında bir hata oluştu:', error);
            res.status(500).json({ error: "Siparişleri alırken bir hata oluştu." });
        });
};
