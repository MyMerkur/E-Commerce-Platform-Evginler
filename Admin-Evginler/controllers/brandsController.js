const { request } = require('express');
const Category = require('../models/category');
const Product = require('../models/products');
const axios = require('axios')
const Order = require('../models/order');
const Brand = require('../models/brands');

//Brands Operations
exports.getBrands = (req, res, next) => {
    Brand.find()
        .then(brands=>{
            console.log(brands)
            res.render('admin/brandsOperations/brands',{
                title:'Brands',
                path:'/brands',
                brands:brands,
                action:req.query.action,
            });
        })
        .catch(err=>{console.log(err)});
};

exports.getAddBrand = (req, res, next) => {
    res.render('admin/brandsOperations/addBrand', {
        title: 'Marka Ekleme Sayfası',
        path: '/addBrand',
    });
};

exports.postAddBrand = (req,res,next)=>{
    const name = req.body.name;
    const imageUrl = req.body.imageUrl
    const brand = new Brand({
        name:name,
        imageUrl:imageUrl
    });
    brand.save()
        .then(result=>{
            res.redirect('/brands?action=create')
        })
        .catch(err=>{console.log(err)});
}

exports.getEditBrand = (req, res, next) => {
    Brand.findById(req.params.brandid)
        .then(brand=>{
            res.render('admin/brandsOperations/editBrand',{
                title:'Edit Brand',
                path:'/editBrand',
                brand:brand,
                admin:req.session.admin
            })
        })
        .catch(err=>{console.log(err)});
};

exports.postEditBrand = (req,res,next)=>{
    const id = req.body.id;
    const name = req.body.name;
    const imageUrl = req.body.imageUrl

    Brand.findById(id)
        .then(brand=>{
            brand.name = name;
            brand.imageUrl = imageUrl
            return brand.save();
        })
        .then(()=>{
            res.redirect('/brands?action=edit')   
        })
        .catch(err=>{console.log(err)});
}

exports.postDeleteBrand=(req,res,next)=>{
    const id = req.body.brandid;

    Brand.deleteOne({_id:id})
        .then(()=>{
            res.redirect('/brands?action=delete')
        })
        .catch(err=>{console.log(err)});
}

exports.getBrandsJSON=(req,res,next)=>{
    Brand.find()
        .then(brands => {
            res.status(200).json(brands); 
        })
        .catch(error => {
            console.error('Markaları alma sırasında bir hata oluştu:', error);
            res.status(500).json({ error: 'Kategorileri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }); 
        });
}
