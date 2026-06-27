const axios = require('axios');
const Order = require('../../models/order');
const Product = require('../../models/products');

const websiteBaseUrl = process.env.WEBSITE_API_BASE_URL || 'http://localhost:5050';

const fetchOrders = async () => {
    const response = await axios.get(`${websiteBaseUrl}/ordersJSON`);
    return response.data;
};

const filterOrders = (orders, status, searchQuery) => {
    let filteredOrders = orders;

    if (status === 'incoming') {
        filteredOrders = orders.filter(order => !order.trackingNumber && !order.isConfirmed);
    }

    if (status === 'confirmed') {
        filteredOrders = orders.filter(order => order.isConfirmed && order.trackingNumber && !order.isDelivered);
    }

    if (status === 'delivered') {
        filteredOrders = orders
            .filter(order => order.isDelivered && order.products.some(product => !product.isReturned))
            .map(order => ({
                ...order,
                products: order.products.filter(product => !product.isReturned)
            }));
    }

    if (status === 'returned') {
        filteredOrders = orders
            .filter(order => order.isReturned || order.products.some(product => product.isReturned))
            .map(order => ({
                ...order,
                products: order.products.filter(product => product.isReturned)
            }));
    }

    if (status === 'canceled') {
        filteredOrders = orders.filter(order => order.isCancelled);
    }

    if (searchQuery) {
        filteredOrders = filteredOrders.filter(order => {
            const orderIdMatch = order.orderId && order.orderId.includes(searchQuery);
            const userNameMatch = order.userId && order.userId.name &&
                order.userId.name.toLowerCase().includes(searchQuery.toLowerCase());

            return orderIdMatch || userNameMatch;
        });
    }

    return filteredOrders;
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await fetchOrders();
        return res.apiSuccess(filterOrders(orders, req.query.status, req.query.searchQuery));
    } catch (error) {
        console.error('Admin sipariş liste API hatası:', error);
        return res.apiError('Siparişler alınamadı.');
    }
};

exports.confirmOrder = async (req, res) => {
    try {
        const { trackingNumber, courier } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { trackingNumber, courier, isConfirmed: true },
            { new: true }
        );

        if (!order) {
            return res.apiError('Sipariş bulunamadı.', 404);
        }

        return res.apiSuccess(order, 'Sipariş onaylandı.');
    } catch (error) {
        console.error('Admin sipariş onay API hatası:', error);
        return res.apiError('Sipariş onaylanamadı.');
    }
};

exports.deliverOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { isDelivered: true },
            { new: true }
        );

        if (!order) {
            return res.apiError('Sipariş bulunamadı.', 404);
        }

        return res.apiSuccess(order, 'Sipariş teslim edildi olarak işaretlendi.');
    } catch (error) {
        console.error('Admin teslim API hatası:', error);
        return res.apiError('Sipariş güncellenemedi.');
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const orders = await fetchOrders();
        const incomingOrders = orders.filter(order => !order.isConfirmed && !order.isDelivered && !order.isReturned);
        const deliveredOrders = orders.filter(order => order.isDelivered && order.products.some(product => !product.isReturned));
        const returnedOrders = orders.filter(order => order.isReturned || order.products.some(product => product.isReturned));
        const totalOrdersPrice = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        const totalReturnedPrice = returnedOrders.reduce((acc, order) => {
            return acc + order.products.reduce((accProduct, product) => {
                return accProduct + (product.isReturned ? product.price : 0);
            }, 0);
        }, 0);
        const netEarnings = totalOrdersPrice - totalReturnedPrice;
        const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(10);

        return res.apiSuccess({
            counts: {
                incomingOrders: incomingOrders.reduce((acc, order) => acc + order.products.length, 0),
                deliveredOrders: deliveredOrders.reduce((acc, order) => acc + order.products.length, 0),
                returnedOrders: returnedOrders.reduce((acc, order) => acc + order.products.length, 0)
            },
            totals: {
                totalOrdersPrice,
                totalReturnedPrice,
                netEarnings,
                totalOrdersPercent: totalOrdersPrice ? 100 : 0,
                returnedOrdersPercent: totalOrdersPrice ? (totalReturnedPrice / totalOrdersPrice) * 100 : 0,
                netEarningsPercent: totalOrdersPrice ? (netEarnings / totalOrdersPrice) * 100 : 0
            },
            orders: {
                incomingOrders,
                deliveredOrders,
                returnedOrders
            },
            latestProducts
        });
    } catch (error) {
        console.error('Admin dashboard API hatası:', error);
        return res.apiError('Dashboard verileri alınamadı.');
    }
};
