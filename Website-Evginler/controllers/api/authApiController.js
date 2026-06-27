const bcrypt = require('bcrypt');
const mailjet = require('node-mailjet').apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);
const User = require('../../models/user');

const publicUser = user => ({
    _id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    phone: user.phone,
    registrationDate: user.registrationDate
});

exports.me = (req, res) => {
    if (!req.user) {
        return res.apiSuccess({ user: null, isAuthenticated: false });
    }

    return res.apiSuccess({ user: publicUser(req.user), isAuthenticated: true });
};

exports.register = async (req, res, next) => {
    try {
        const { name, surname, email, password, phone } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.apiError('Daha önce bir kayıt oluşturulmuş.', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({
            name,
            surname,
            email,
            password: hashedPassword,
            phone,
            registrationDate: new Date()
        }).save();

        if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
            await mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [{
                    From: {
                        Email: process.env.MAIL_FROM_EMAIL || 'dogukan755@icloud.com',
                        Name: 'Evginler'
                    },
                    To: [{ Email: email, Name: name }],
                    Subject: 'Welcome to Our Service',
                    TextPart: `Merhaba ${name}, Evginler.com'a hoşgeldiniz.`,
                    HTMLPart: `<h3>Merhaba ${name}, Evginler.com'a hoşgeldiniz!</h3><br/><a href="http://localhost:5050">Siteye devam et.</a>`
                }]
            });
        }

        return res.apiSuccess(publicUser(newUser), 'Kayıt başarılı.', 201);
    } catch (error) {
        console.error('Kayıt API hatası:', error);
        return next(error);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.apiError('Kullanıcı bulunamadı.', 401);
        }

        const isSuccess = await bcrypt.compare(password, user.password);

        if (!isSuccess) {
            return res.apiError('E-posta veya şifre hatalı.', 401);
        }

        req.session.user = user;
        req.session.isAuthenticated = true;

        req.session.save(err => {
            if (err) {
                console.error('Session kayıt hatası:', err);
                return res.apiError('Oturum başlatılamadı.');
            }

            return res.apiSuccess(publicUser(user), 'Giriş başarılı.');
        });
    } catch (error) {
        console.error('Login API hatası:', error);
        return res.apiError('Giriş yapılırken hata oluştu.');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout API hatası:', err);
            return res.apiError('Çıkış yapılamadı.');
        }

        res.clearCookie(process.env.SESSION_COOKIE_NAME || 'evginler_store.sid');
        return res.apiSuccess(null, 'Çıkış yapıldı.');
    });
};
