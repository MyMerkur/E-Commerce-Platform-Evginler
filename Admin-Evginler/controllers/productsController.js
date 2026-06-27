const { request } = require('express');
const Category = require('../models/category');
const Product = require('../models/products');
const axios = require('axios')
const Order = require('../models/order');
const Brand = require('../models/brands');



//Product Operations
exports.getProducts = (req, res, next) => {
    const searchQuery = req.query.searchQuery;

    Product.find()
        .populate({
            path: 'categories',
            model: 'Category',
            select: 'name description imageUrl'
        })
        .populate({
            path: 'brands', 
            model: 'Brand',
            select: 'name'
        })
        .then(products => {
            if (searchQuery) {
                products = products.filter(product => {
                    // Ürün adında veya kategorisinde arama yap
                    const productName = product.name.toLowerCase();
                    const categoryNames = product.categories.map(category => category.name.toLowerCase());
                    return productName.includes(searchQuery.toLowerCase()) || categoryNames.includes(searchQuery.toLowerCase());
                });
            }
            
            products = products.map(product => {
                product.discountedPrice = product.getDiscountedPrice();
                return product;
            });

            Category.find()
                .then(categories => {
                    Brand.find() 
                        .then(brands => {
                            res.render('admin/productOperations/products', {
                                title: 'Tüm Ürünler',
                                path: '/products',
                                action: req.query.action,
                                products: products,
                                categories: categories,
                                brands: brands 
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
};

// Product Json
exports.getProductsJSON = (req, res, next) => {
    Product.find()
        .populate({
            path: 'categories',
            model: 'Category',
            select: 'name description imageUrl'
        })
        .then(products => {
            res.status(200).json(products); 
        })
        .catch(error => {
            console.error('Ürünleri alma sırasında bir hata oluştu:', error);
            res.status(500).json({ error: 'Ürünleri alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }); 
        });
};

exports.getProductDetailsJSON = (req, res, next) => {
    const productId = req.params.productId;

    Product.findById(productId)
        .populate({
            path: 'categories',
            model: 'Category',
            select: 'name description imageUrl'
        })
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Ürün bulunamadı.' });
            }
            res.status(200).json(product);
        })
        .catch(error => {
            console.error('Ürün detaylarını alma sırasında bir hata oluştu:', error);
            res.status(500).json({ error: 'Ürün detaylarını alırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' });
        });
};

// Product Admin Page
exports.getAddProduct = (req, res, next) => {
    Category.find()
        .then(categories => {    
            Brand.find()
                .then(brands => {
                    const tumAltKategoriler = {};
                    categories.forEach(category => {
                        tumAltKategoriler[category.name] = category.subcategories;
                    });
                    console.log('Alt Kategoriler:',tumAltKategoriler)
                    res.render('admin/productOperations/addProduct', {
                        title: 'Ürün Ekleme Sayfası',
                        path: '/addProduct',
                        categories: categories,
                        subcategories:tumAltKategoriler,
                        brands: brands, 
                        action: req.query.action
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/'); 
                });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/'); 
        });
};

exports.postAddProduct = (req, res, next) => {
    const name = req.body.name;
    const price = req.body.price;
    const discount = req.body.discount || 0;
    const size = req.body.size;
    const categoryId = req.body.categoryId;
    const subcategoryId = req.body.subcategoryId;
    const brandId = req.body.brandId;
    const stock = req.body.stock;
    const description = req.body.description;
    const imageUrl1 = req.body.imageUrl1;
    const imageUrl2 = req.body.imageUrl2;
    const imageUrl3 = req.body.imageUrl3;

    const imageUrlArray = [];
    if (imageUrl1) imageUrlArray.push(imageUrl1);
    if (imageUrl2) imageUrlArray.push(imageUrl2);
    if (imageUrl3) imageUrlArray.push(imageUrl3);

    // Hata listesi oluştur
    const errors = [];

    // Gerekli alanları kontrol et
    if (!name) {
        errors.push({ param: 'name', msg: 'Ürün ismi zorunludur.' });
    }
    if (!price) {
        errors.push({ param: 'price', msg: 'Ürün fiyatı zorunludur.' });
    }
    if (!categoryId || categoryId === '-1') {
        errors.push({ param: 'categoryId', msg: 'Kategori seçmelisiniz.' });
    }
    if (!subcategoryId || subcategoryId === '-1') {
        errors.push({ param: 'subcategoryId', msg: 'Alt kategori seçmelisiniz.' });
    }
    if (!brandId || brandId === '-1') {
        errors.push({ param: 'brandId', msg: 'Marka seçmelisiniz.' });
    }
    if (!stock) {
        errors.push({ param: 'stock', msg: 'Stok durumu zorunludur.' });
    }
    if (!imageUrl1) {
        errors.push({ param: 'imageUrl1', msg: 'Ürün görseli zorunludur.' });
    }

    // Eğer hata varsa formu tekrar render et
    if (errors.length > 0) {
        Category.find()
            .then(categories => {
                Brand.find()
                    .then(brands => {
                        const tumAltKategoriler = {};
                        categories.forEach(category => {
                            tumAltKategoriler[category.name] = category.subcategories;
                        });

                        res.render('admin/productOperations/addProduct', {
                            title: 'Ürün Ekleme Sayfası',
                            path: '/addProduct',
                            categories: categories,
                            subcategories: tumAltKategoriler,
                            brands: brands,
                            action: req.query.action,
                            errors: errors, // Hata mesajlarını template'e gönder
                            // Aşağıdaki alanlar ise form alanlarını doldurmak için
                            name: name,
                            price: price,
                            discount: discount,
                            size: size,
                            categoryId: categoryId,
                            subcategoryId: subcategoryId,
                            brandId: brandId,
                            stock: stock,
                            description: description,
                            imageUrl1: imageUrl1,
                            imageUrl2: imageUrl2,
                            imageUrl3: imageUrl3
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect('/'); // Marka bulunamadığında ana sayfaya yönlendir
                    });
            })
            .catch(err => {
                console.log(err);
                res.redirect('/'); // Kategori bulunamadığında ana sayfaya yönlendir
            });
        return;
    }

    // Hata yoksa yeni ürün oluştur ve veritabanına kaydet
    const product = new Product({
        name: name,
        price: price,
        discount: discount,
        size: size,
        categories: categoryId,
        subcategories: subcategoryId,
        brands: brandId,
        stock: stock,
        description: description,
        imageUrl: imageUrlArray
    });

    product.save()
        .then(() => {
            res.redirect('/products'); // Başarıyla kaydedildiğinde ürünleri listeleme sayfasına yönlendir
        })
        .catch(err => {
            console.log(err);
            // Veritabanı hatası durumunda uygun bir işlem yapılabilir, örneğin hata mesajını kullanıcıya göstermek gibi
            res.redirect('/');
        });
};

//Edit Product
exports.getEditProduct = (req, res, next) => {
    Product.findOne({ _id: req.params.productid })
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            return Promise.all([Category.find(), Brand.find(), product]);
        })
        .then(([categories, brands, product]) => {
            categories = categories.map(category => {
                if (product.categories) {
                    product.categories.find(item => {
                        if (item.toString() === category._id.toString()) {
                            category.selected = true;
                        }
                    });
                }
                return category;
            });

            brands = brands.map(brand => {
                if (product.brands) {
                    product.brands.find(item => {
                        if (item.toString() === brand._id.toString()) {
                            brand.selected = true;
                        }
                    });
                }
                return brand;
            });
            const tumAltKategoriler = {};
            categories.forEach(category => {
                tumAltKategoriler[category.name] = category.subcategories;
            });

            console.log('Tüm Alt Kategoriler Edit:', tumAltKategoriler);
            res.render('admin/productOperations/editProduct', {
                title: 'Edit Product',
                path: '/editProduct',
                product: product,
                categories: categories,
                subcategories:tumAltKategoriler,
                brands: brands
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};


exports.postEditProduct = (req, res, next) => {
    const productid = req.body.productid;
    const name = req.body.name;
    const price = req.body.price;
    const discount = req.body.discount || 0;
    const description = req.body.description;
    const stock = req.body.stock;
    const categoryId = req.body.categoryId;
    const subcategories = req.body.subcategoryId
    const brandId = req.body.brandId; 
    const imageUrl1 = req.body.imageUrl1;
    const imageUrl2 = req.body.imageUrl2;
    const imageUrl3 = req.body.imageUrl3;

    const imageUrlArray = [];
    if (imageUrl1) imageUrlArray.push(imageUrl1);
    if (imageUrl2) imageUrlArray.push(imageUrl2);
    if (imageUrl3) imageUrlArray.push(imageUrl3);

    Product.findOne({ _id: productid })
        .then(product => {
            if (!product) {
                return res.redirect('/products');
            }
            product.name = name;
            product.price = price;
            product.discount = discount;
            product.description = description;
            product.stock = stock;
            product.categories = categoryId;
            product.subcategories = subcategories;
            product.brands = brandId; 
            // Mevcut görselleri güncelle
            if (imageUrlArray.length > 0) {
                // Yeni görselleri ekleyin
                product.imageUrl = imageUrlArray;
            }

            return product.save();
        })
        .then(result => {
            res.redirect('/products?action=edit');
        })
        .catch(err => {console.log(err);});
};

exports.postDeleteProduct=(req,res,next)=>{
    const id = req.body.productid;

    Product.findOne({_id:id})
        .then(product=>{
            if(!product){
                return next(new Error('Silmek istediğiniz ürün bulunamadı'));
            }
            return Product.deleteOne({_id:id})
        })
        .then((result)=>{
            if(result.deletedCount === 0){
                return res.redirect('/index');
            }
            res.redirect('/products?action=delete');
        })
        .catch(err=>{console.log(err)});
}

exports.getProductReturn = (req, res, next) => {
    res.render('admin/productOperations/productReturn', {
        title: 'İade Ürünler',
        path: '/productReturn',
    });
};
