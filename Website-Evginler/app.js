const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const port = process.env.PORT || 5050;

app.set('trust proxy', 1);
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); 
const cookieParser = require('cookie-parser'); 
const csurf = require('csurf');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
//Routes
const shopRoutes = require('./routes/shop');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');
const storeApiRoutes = require('./routes/api/storeApi');
const authApiRoutes = require('./routes/api/authApi');
const userApiRoutes = require('./routes/api/userApi');
const cartApiRoutes = require('./routes/api/cartApi');
const checkoutApiRoutes = require('./routes/api/checkoutApi');
const mongoose = require('mongoose');
//Models
const User = require('./models/user');
const apiResponse = require('./middleware/apiResponse');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
        errors: null
    }
});

const allowedOrigins = [
    process.env.CLIENT_ORIGIN_STORE,
    process.env.CLIENT_ORIGIN_ADMIN
].filter(Boolean);

const isAllowedOrigin = origin => {
    if (!origin || allowedOrigins.includes(origin)) {
        return true;
    }

    if (process.env.NODE_ENV === 'production') {
        return false;
    }

    try {
        const parsedOrigin = new URL(origin);
        const hostname = parsedOrigin.hostname;
        const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(hostname);
        const isLocalNetwork =
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

        return ['http:', 'https:'].includes(parsedOrigin.protocol) && (isLocalHost || isLocalNetwork);
    } catch (error) {
        return false;
    }
};

const sendApiError = (res, message, statusCode = 500, errors = null) => {
    if (typeof res.apiError === 'function') {
        return res.apiError(message, statusCode, errors);
    }

    return res.status(statusCode).json({
        success: false,
        data: null,
        message,
        errors
    });
};

var store = new MongoDBStore({
    uri: process.env.MONGODB_URI || process.env.MONGODB_CONNECT,
    collection: process.env.SESSION_COLLECTION || 'storeSessions'
});

//Middleware
app.use(express.static(path.join(__dirname, 'public')));

//App Sets
app.set('view engine', 'pug');
app.set('views', './views');
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // 'unsafe-inline' korunuyor: eski Pug şablonlarında satır içi script/style kullanımı
            // tam olarak taranmadığı için önce kırmadan devreye almak amaçlanıyor.
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://kit.fontawesome.com'],
            // shoppingCard.pug'daki onsubmit/onchange gibi satır içi olay tutamaçları için.
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
            fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://ka-f.fontawesome.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://kit.fontawesome.com', 'https://ka-f.fontawesome.com'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"]
        }
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(apiResponse);
app.use(cors({
    origin: function(origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        console.warn(`CORS origin izinli değil: ${origin}`);
        return callback(null, false);
    },
    credentials: true
}));

app.use(session({
    name: process.env.SESSION_COOKIE_NAME || 'evginler_store.sid',
    secret: process.env.SESSION_SECRET || 'evginler-store-dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 5 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    },
    store: store
}))

app.use('/',paymentRoutes);


app.use(csurf());
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => { console.log(err) })
});

app.get('/api/csrf-token', (req, res) => {
    return res.apiSuccess({ csrfToken: req.csrfToken() });
});

app.use('/api', apiLimiter);
app.use('/api/store', storeApiRoutes);
app.use('/api/auth', authApiRoutes);
app.use('/api/user', userApiRoutes);
app.use('/api/cart', cartApiRoutes);
app.use('/api/checkout', checkoutApiRoutes);

//Route
app.use('/', shopRoutes);
app.use('/', userRoutes);

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        if (req.path.startsWith('/api/')) {
            return sendApiError(res, 'CSRF token geçersiz veya eksik.', 403);
        }

        return res.status(403).send('CSRF token geçersiz veya eksik.');
    }

    if (req.path.startsWith('/api/')) {
        console.error('API hatası:', err);
        const errorDetails = process.env.NODE_ENV === 'production' ? null : err.message;
        return sendApiError(res, 'Beklenmeyen bir hata oluştu.', 500, errorDetails);
    }

    return next(err);
});


mongoose.connect(process.env.MONGODB_CONNECT)
    .then(() => {
        console.log('MongoDB Bağlantısı Başarılı');
        app.listen(port, () => {
            console.log(`Web Sitesi ${port}'unda çalışıyor.`)
        });
    })
    .catch(err => {
        console.log(err)
    })
