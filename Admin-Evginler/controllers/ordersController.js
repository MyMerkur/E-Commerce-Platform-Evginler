const { request } = require('express');
const Category = require('../models/category');
const Product = require('../models/products');
const axios = require('axios')
const Order = require('../models/order');
const Brand = require('../models/brands');


//Orders Operations
exports.getOrders = (req, res, next) => {
    res.render('admin/ordersOperations/orders', {
        title: 'Siparişler',
        path: '/orders',
       
    });
};

exports.getIncomingOrders = (req, res, next) => {
    const searchQuery = req.query.searchQuery;

    axios.get('http://localhost:5050/ordersJSON')
        .then(response => {
            let orders = response.data.filter(order => !order.trackingNumber && !order.isConfirmed);

            if (searchQuery) {
                orders = orders.filter(order => {
                    // Sipariş numarası veya kullanıcı adı ile arama yap
                    return order.orderId.includes(searchQuery) || order.userId.name.toLowerCase().includes(searchQuery.toLowerCase());
                });
            }

            console.log(`Arama Sonucu (${searchQuery}):`, orders);
            res.render('admin/ordersOperations/incomingOrders', {
                title: 'Gelen Siparişler',
                path: '/incomingOrders',
                orders: orders 
            });
        })
        .catch(error => {
            console.error("Siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Siparişleri alırken bir hata oluştu." });
        });
};

exports.getSearchIncomingOrders = (req, res, next) => {
    const searchQuery = req.query.searchQuery;

    axios.get('http://localhost:5050/ordersJSON')
        .then(response => {
            let orders = response.data.filter(order => !order.trackingNumber && !order.isConfirmed);

            if (searchQuery) {
                orders = orders.filter(order => {
                    // Sipariş numarası veya kullanıcı adı ile arama yap
                    return order.orderId.includes(searchQuery) || order.userId.name.toLowerCase().includes(searchQuery.toLowerCase());
                });
            }

            console.log(`Arama Sonucu (${searchQuery}):`, orders);
            res.render('admin/ordersOperations/incomingOrders', {
                title: 'Gelen Siparişler',
                path: '/incomingOrders',
                orders: orders 
            });
        })
        .catch(error => {
            console.error("Siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Siparişleri alırken bir hata oluştu." });
        });
};

exports.postIncomingOrders = (req, res, next) => {
    const { orderId, trackingNumber, courier } = req.body;
    console.log('Order ID:', orderId);
    console.log('Tracking Number:', trackingNumber);
    console.log('Courier:', courier);

    if (!orderId) {
        return res.status(400).send('Sipariş numarası belirtilmedi.');
    }

    Order.findByIdAndUpdate(orderId, { trackingNumber: trackingNumber, courier: courier, isConfirmed: true }, { new: true })
        .then(updatedOrder => {
            if (!updatedOrder) {
                return res.status(404).send('Sipariş bulunamadı.');
            }
            console.log('Sipariş güncellendi:', updatedOrder);
            // Yönlendirme işlemi
            res.redirect('/confirmedOrders');
        })
        .catch(error => {
            console.error('Sipariş güncelleme sırasında bir hata oluştu:', error);
            res.status(500).send('Sipariş güncelleme sırasında bir hata oluştu.');
        });
};

exports.getConfirmedOrders = (req, res, next) => {
    axios.get('http://localhost:5050/ordersJSON')
        .then(response => {
            const orders = response.data.filter(order => order.isConfirmed && order.trackingNumber && !order.isDelivered); 

            console.log('Onaylanan Ürünler:', orders);
            res.render('admin/ordersOperations/confirmedOrders', {
                title: 'Onaylanan Siparişler',
                path: '/confirmedOrders',
                orders: orders
            });
        })
        .catch(error => {
            console.error('Onaylanan siparişleri alma sırasında bir hata oluştu:', error);
            res.status(500).json({ error: "Onaylanan siparişleri alırken bir hata oluştu." });
        });
};
exports.getSearchConfirmedOrders = (req, res, next) => {
    const searchQuery = req.query.searchQuery;

    axios.get('http://localhost:5050/ordersJSON')
        .then(response => {
            let orders = response.data.filter(order => order.isConfirmed && order.trackingNumber && !order.isDelivered);

            if (searchQuery) {
                orders = orders.filter(order => {
                    // Sipariş numarası veya kullanıcı adı ile arama yap
                    return order.orderId.includes(searchQuery) || order.userId.name.toLowerCase().includes(searchQuery.toLowerCase());
                });
            }

            console.log(`Arama Sonucu (${searchQuery}):`, orders);
            res.render('admin/ordersOperations/confirmedOrders', {
                title: 'Onaylanan Siparişler',
                path: '/confirmedOrders',
                orders: orders 
            });
        })
        .catch(error => {
            console.error('Onaylanan siparişleri alma sırasında bir hata oluştu:', error);
            res.status(500).json({ error: "Onaylanan siparişleri alırken bir hata oluştu." });
        });
};


//Cancelled Orders
exports.getCanceledOrders = (req, res, next) => {
    res.render('admin/ordersOperations/canceledOrders', {
        title: 'İptal Edilen Siparişler',
        path: '/canceledOrders',
      
    });
};
exports.postCancelledOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    
    axios.put(`http://localhost:5050/orders/${orderId}/cancel`)
        .then(response => {
            res.redirect('/admin/confirmedOrders');
        })
        .catch(error => {
            console.error('Sipariş iptal edilirken bir hata oluştu:', error);
            res.status(500).json({ error: "Sipariş iptal edilirken bir hata oluştu." });
        });
};


//Delivered Orders
exports.getDeliveredOrders = (req, res, next) => {
    axios.get('http://localhost:5050/ordersJSON')
        .then(response => {
            const orders = response.data.filter(order => {
                // Siparişlerin teslim edilmiş olduğu ve hiçbir ürünün iade edilmediği kontrol edilir
                return order.isDelivered && order.products.some(product => !product.isReturned);
            });

            orders.forEach(order => {
                order.products = order.products.filter(product => !product.isReturned);
                
            });
            console.log('Teslim Edilen Ürünler:',orders)
          
            res.render('admin/ordersOperations/deliveredOrders', {
                title: 'Teslim Edilen Siparişler',
                path: '/deliveredOrders',
                orders: orders 
            });
        })
        .catch(error => {
            console.error("Teslim edilen siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Teslim edilen siparişleri alırken bir hata oluştu." });
        });
};
exports.getSearchDeliveredOrders = (req, res, next) => {
    const searchQuery = req.query.searchQuery;

    axios.get('http://localhost:5050/ordersJSON')
        .then(response => {
            let orders = response.data.filter(order => {
                // Siparişlerin teslim edilmiş olduğu ve hiçbir ürünün iade edilmediği kontrol edilir
                return order.isDelivered && order.products.some(product => !product.isReturned);
            });

            if (searchQuery) {
                orders = orders.filter(order => {
                    // Sipariş numarası veya kullanıcı adı ile arama yap
                    return order.orderId.includes(searchQuery) || order.userId.name.toLowerCase().includes(searchQuery.toLowerCase());
                });
            }

            orders.forEach(order => {
                order.products = order.products.filter(product => !product.isReturned);
            });

            console.log(`Arama Sonucu (${searchQuery}):`, orders);

            res.render('admin/ordersOperations/deliveredOrders', {
                title: 'Teslim Edilen Siparişler',
                path: '/deliveredOrders',
                orders: orders 
            });
        })
        .catch(error => {
            console.error("Teslim edilen siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "Teslim edilen siparişleri alırken bir hata oluştu." });
        });
};
exports.postDeliveredOrder = (req, res, next) => {
    const { orderId } = req.body;
    
    Order.findByIdAndUpdate(orderId, { isDelivered: true }, { new: true })
        .then(updatedOrder => {
            if (!updatedOrder) {
                return res.status(404).send('Sipariş bulunamadı.');
            }
            console.log('Sipariş güncellendi:', updatedOrder);
            res.redirect('/deliveredOrders');
        })
        .catch(error => {
            console.error('Sipariş teslim edilirken bir hata oluştu:', error);
            res.status(500).json({ error: "Sipariş teslim edilirken bir hata oluştu." });
        });
};
//Returned Orders
// exports.getReturnedOrders = (req, res, next) => {
//     axios.get('http://localhost:5050/ordersJSON')
//         .then(response => {
//             const orders = response.data.filter(order => order.isReturned );

//             console.log('İade Edilen Siparişler:', orders);
//             res.render('admin/ordersOperations/returnedOrders', {
//                 title: 'İade Edilen Siparişler',
//                 path: '/returnedOrders',
//                 orders: orders 
//             });
//         })
//         .catch(error => {
//             console.error("İade edilen siparişleri alma sırasında bir hata oluştu:", error);
//             res.status(500).json({ error: "İade edilen siparişleri alırken bir hata oluştu." });
//         });
// };

exports.getReturnedOrders = (req, res, next) => {
    console.log('İade Listeleniyor...')
    axios.get('http://localhost:5050/ordersJSON')
        .then(response => {
            const orders = response.data.filter(order => {
                // Siparişlerdeki ve içindeki ürünlerdeki 'isReturned' özelliği kontrol edilir
                return order.isReturned || order.products.some(product => product.isReturned);
            });

            // Siparişlerin içindeki ürünler filtrelenir
            orders.forEach(order => {
                order.products = order.products.filter(product => product.isReturned);
            });

            console.log('İade Edilen Siparişler:', orders);
            res.render('admin/ordersOperations/returnedOrders', {
                title: 'İade Edilen Siparişler',
                path: '/returnedOrders',
                orders: orders 
            });
        })
        .catch(error => {
            console.error("İade edilen siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "İade edilen siparişleri alırken bir hata oluştu." });
        });
};
exports.getSearchReturnedOrders = (req, res, next) => {
    const searchQuery = req.query.searchQuery;

    axios.get('http://localhost:5050/ordersJSON')
        .then(response => {
            let orders = response.data.filter(order => {
                // Siparişlerdeki ve içindeki ürünlerdeki 'isReturned' özelliği kontrol edilir
                return order.isReturned || order.products.some(product => product.isReturned);
            });

            if (searchQuery) {
                orders = orders.filter(order => {
                    // Sipariş numarası veya kullanıcı adı ile arama yap
                    return order.orderId.includes(searchQuery) || order.userId.name.toLowerCase().includes(searchQuery.toLowerCase());
                });
            }

            // Siparişlerin içindeki ürünler filtrelenir
            orders.forEach(order => {
                order.products = order.products.filter(product => product.isReturned);
            });

            console.log(`Arama Sonucu (${searchQuery}):`, orders);

            res.render('admin/ordersOperations/returnedOrders', {
                title: 'İade Edilen Siparişler',
                path: '/returnedOrders',
                orders: orders 
            });
        })
        .catch(error => {
            console.error("İade edilen siparişleri alma sırasında bir hata oluştu:", error);
            res.status(500).json({ error: "İade edilen siparişleri alırken bir hata oluştu." });
        });
};
