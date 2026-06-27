const { request } = require('express');
const Category = require('../models/category');
const Product = require('../models/products');
const axios = require('axios')
const Order = require('../models/order');
const Brand = require('../models/brands');

//Category Operations

exports.getCategories = (req, res, next) => {
    Category.find()
        .then(categories=>{
            console.log(categories)
            res.render('admin/categoryOperations/categories',{
                title:'Kategoriler',
                path:'/admin/categories',
                categories:categories,
                action:req.query.action,
            });
        })
        .catch(err=>{console.log(err)});
};

exports.getAddCategory = (req, res, next) => {
    res.render('admin/categoryOperations/addCategory', {
        title: 'Kategori Ekleme Sayfası',
        path: '/addCategory',
    });
};

exports.postAddCategory = (req, res, next) => {
    const name = req.body.name;
    const subcategories = req.body.subcategories;

    let subcategoryArray = [];
    if (typeof subcategories === 'string') {
        subcategoryArray = [subcategories];
    } else if (Array.isArray(subcategories)) {
        subcategoryArray = subcategories;
    }

    const category = new Category({
        name: name,
        subcategories: subcategoryArray
    });

    category.save()
        .then(result => {
            res.redirect('/addCategory?action=create');
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getEditCategory = (req, res, next) => {
    Category.findById(req.params.categoryid)
        .then(category=>{
            res.render('admin/categoryOperations/editCategory',{
                title:'Kategori Düzenleme Sayfası',
                path:'/editCategory',
                category:category,
                admin:req.session.admin
            })
        })
        .catch(err=>{console.log(err)});
};

exports.postEditCategory = (req, res, next) => {
    const id = req.params.categoryid;
    const name = req.body.name;
    const subcategories = req.body.subcategories.filter(subcategory => subcategory.trim() !== ''); 

    Category.findById(id)
        .then(category => {
            category.name = name;
            category.subcategories = subcategories.length > 0 ? subcategories : null; 

            return category.save();
        })
        .then(() => {
            res.redirect('/categories?action=edit');
        })
        .catch(err => {
            console.log(err);
        });
}


exports.postDeleteCategory=(req,res,next)=>{
    const id = req.body.categoryid;

    Category.deleteOne({_id:id})
        .then(()=>{
            res.redirect('/categories?action=delete')
        })
        .catch(err=>{console.log(err)});
}

exports.getCategoriesJSON = (req, res, next) => {
    Category.find()
        .then(categories => {
            res.status(200).json(categories); 
        })
        .catch(error => {
            console.error('Kategorileri alma sırasında bir hata oluştu:', error);
            res.status(500).json({ error: 'Kategorileri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }); 
        });
}

