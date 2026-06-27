const bcrypt = require('bcrypt');
const Admin = require('../../models/superUser');

const publicAdmin = admin => ({
    _id: admin._id,
    name: admin.name,
    email: admin.email
});

exports.me = (req, res) => {
    if (!req.admin) {
        return res.apiSuccess({ admin: null, isAuthenticated: false });
    }

    return res.apiSuccess({ admin: publicAdmin(req.admin), isAuthenticated: true });
};

exports.register = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.apiError('Production ortamında admin kaydı kapalıdır.', 403);
        }

        const { name, email, password } = req.body;
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.apiError('Daha önce bir kayıt oluşturulmuş.', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await new Admin({ name, email, password: hashedPassword }).save();

        return res.apiSuccess(publicAdmin(admin), 'Admin oluşturuldu.', 201);
    } catch (error) {
        console.error('Admin kayıt API hatası:', error);
        return res.apiError('Admin oluşturulamadı.');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.apiError('Kullanıcı bulunamadı.', 401);
        }

        const isSuccess = await bcrypt.compare(password, admin.password);

        if (!isSuccess) {
            return res.apiError('E-posta veya şifre hatalı.', 401);
        }

        req.session.admin = admin;
        req.session.isAuthenticated = true;

        req.session.save(err => {
            if (err) {
                console.error('Admin session kayıt hatası:', err);
                return res.apiError('Oturum başlatılamadı.');
            }

            return res.apiSuccess(publicAdmin(admin), 'Giriş başarılı.');
        });
    } catch (error) {
        console.error('Admin login API hatası:', error);
        return res.apiError('Giriş yapılamadı.');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Admin logout API hatası:', err);
            return res.apiError('Çıkış yapılamadı.');
        }

        res.clearCookie(process.env.SESSION_COOKIE_NAME || 'evginler_admin.sid');
        return res.apiSuccess(null, 'Çıkış yapıldı.');
    });
};
