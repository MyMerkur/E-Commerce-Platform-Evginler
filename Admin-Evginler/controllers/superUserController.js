const Admin = require('../models/superUser');
const bcrypt = require('bcrypt');
const crypto = require('crypto');



//Register
exports.getRegister = (req,res,next)=>{
    res.render('superUser/register',{
        title:'Kullanıcı Oluştur',
        path:'/register',
       
    });
};
exports.postRegister = (req,res,next)=>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
  

    Admin.findOne({email:email})
        .then(admin=>{
            if(admin){
                req.session.errorMessage = "Daha Önce Bir Kayıt Oluşturulmuş";
                req.session.save(function(err){
                    console.log(err);
                    return res.redirect('/register');
                })
            }
            return bcrypt.hash(password,10);
        })
        .then(hashedPassword=>{
            const newAdmin = new Admin({
                name: name,
                email: email,
                password: hashedPassword,
            });
            return newAdmin.save()
        })
        .then(()=>{
            res.redirect('/login')
        })
        .catch(err=>{console.log(err)})

}

//Login
exports.getLogin = (req,res,next)=>{
    res.render('superUser/login',{
        title:'Admin Girişi',
        path:'/',
       
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    Admin.findOne({ email: email })
        .then(admin => {
            if (!admin) {
                req.session.errorMessage = "Kullanıcı Bulunamadı";
                req.session.save(function (err) {
                    console.log(err);
                    return res.redirect('/')
                })
            }
            bcrypt.compare(password, admin.password)
                .then(isSuccess => {
                    if (isSuccess) {
                        req.session.admin = admin;
                        req.session.isAuthenticated = true;
                        console.log(`Hoşgeldiniz ${req.session.admin.name}`);
                        return req.session.save(function (err) {
                            console.log(err);
                            res.redirect('/index');
                        });
                    }
                    res.redirect('/');
                })
                .catch(err => { console.log(err) });
        })
        .catch(err => { console.log(err) })
}



//Logout
exports.getLogout=(req,res,next)=>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/');
        console.log('Çıkış Yapıldı')
    })
}
