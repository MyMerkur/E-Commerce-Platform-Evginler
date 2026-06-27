const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Brand = require('../models/brands');
const Category = require('../models/category');
const Product = require('../models/products');

const projectRoot = path.resolve(__dirname, '../..');
const jsonPath = process.env.IMPORT_PRODUCTS_JSON_PATH
    ? path.resolve(process.env.IMPORT_PRODUCTS_JSON_PATH)
    : path.join(projectRoot, 'urunler-gorselli.json');
const errorsPath = process.env.IMPORT_ERRORS_PATH
    ? path.resolve(process.env.IMPORT_ERRORS_PATH)
    : path.join(projectRoot, 'import-errors.json');
const dryRun = process.env.DRY_RUN !== 'false';
const defaultBrandImageUrl =
    process.env.DEFAULT_BRAND_IMAGE_URL ||
    'https://placehold.co/400x400/f4eee6/2f5d50?text=Evginler';

const knownBrands = [
    { match: 'EMSAN', name: 'Emsan' },
    { match: 'SCHAFER', name: 'Schafer' },
    { match: 'AROW', name: 'Arow' },
    { match: 'OLIKA', name: 'Olika' }
];

const summary = {
    createdBrands: 0,
    createdCategories: 0,
    createdSubcategories: 0,
    insertedProducts: 0,
    updatedProducts: 0,
    fallbackBrands: 0,
    fallbackProductCodes: 0,
    productsWithoutImages: 0,
    errorProducts: 0,
    matchedByProductCode: 0,
    matchedBySlug: 0,
    matchedByNameBrand: 0
};

const plannedBrands = new Map();
const plannedCategories = new Map();
const plannedSubcategories = new Set();
const plannedProducts = new Set();
const plannedSlugs = new Set();
const importErrors = [];
const createDebugList = [];

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeText = value =>
    String(value || '')
        .trim()
        .replace(/\s+/g, ' ');

const normalizeForMatch = value =>
    normalizeText(value)
        .toLocaleUpperCase('tr-TR')
        .replace(/\./g, ' ')
        .replace(/\s+/g, ' ');

const slugify = value => {
    const trMap = {
        ç: 'c',
        Ç: 'c',
        ğ: 'g',
        Ğ: 'g',
        ı: 'i',
        I: 'i',
        İ: 'i',
        ö: 'o',
        Ö: 'o',
        ş: 's',
        Ş: 's',
        ü: 'u',
        Ü: 'u'
    };

    return normalizeText(value)
        .replace(/[çÇğĞıIİöÖşŞüÜ]/g, char => trMap[char] || char)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'urun';
};

const parseTurkishPrice = value => {
    if (typeof value === 'number') return value;
    const normalized = normalizeText(value).replace(/\./g, '').replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

const parseNumber = value => {
    if (typeof value === 'number') return value;
    const normalized = normalizeText(value).replace(/\./g, '').replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

const detectBrandFromName = productName => {
    const name = normalizeForMatch(productName);
    const asciiName = slugify(productName).replace(/-/g, ' ').toUpperCase();
    const found = knownBrands.find(brand => name.includes(brand.match) || asciiName.includes(brand.match));
    return found ? found.name : '';
};

const detectImageSource = url => {
    const value = normalizeText(url).toLowerCase();

    if (value.includes('cdn.dsmcdn.com')) {
        return 'trendyol';
    }

    if (value.includes('hepsiburada')) {
        return 'hepsiburada';
    }

    return 'external';
};

const toImageObjects = imageUrls =>
    imageUrls.map((url, index) => ({
        url,
        isMain: index === 0,
        source: detectImageSource(url)
    }));

const inferCategory = productName => {
    const name = normalizeForMatch(productName);

    if (name.includes('YEMEK TAKIMI') || name.includes('YEMEK TAK') || name.includes('60 PRÇ') || name.includes('72 PARÇA')) {
        return { categoryName: 'Sofra & Sunum', subcategoryName: 'Yemek Takımı' };
    }

    if (name.includes('KAHVALTI')) {
        return { categoryName: 'Sofra & Sunum', subcategoryName: 'Kahvaltı Takımı' };
    }

    if (name.includes('FİNCAN') || name.includes('KAHVE FİNCAN')) {
        return { categoryName: 'Sofra & Sunum', subcategoryName: 'Kahve Fincan Takımı' };
    }

    if (name.includes('ÇAY SETİ') || name.includes('ÇAYDANLIK')) {
        return { categoryName: 'Mutfak', subcategoryName: 'Çaydanlık' };
    }

    if (name.includes('TENCERE SETİ') || name.includes('TENCERE')) {
        return { categoryName: 'Mutfak', subcategoryName: 'Tencere' };
    }

    if (name.includes('TAVA')) {
        return { categoryName: 'Mutfak', subcategoryName: 'Tava' };
    }

    if (name.includes('DÜDÜKLÜ')) {
        return { categoryName: 'Mutfak', subcategoryName: 'Düdüklü Tencere' };
    }

    if (
        name.includes('TOST MAKİNESİ') ||
        name.includes('BLENDER') ||
        name.includes('SU ISITICI') ||
        name.includes('AIRFRYER')
    ) {
        return { categoryName: 'Küçük Ev Aletleri', subcategoryName: 'Genel' };
    }

    if (name.includes('BANYO SETİ')) {
        return { categoryName: 'Banyo', subcategoryName: 'Banyo Seti' };
    }

    if (name.includes('ÇEYİZ SETİ') || name.includes('ÇKB') || name.includes('Ç K B')) {
        return { categoryName: 'Çeyiz Setleri', subcategoryName: 'Çatal Kaşık Bıçak Seti' };
    }

    return { categoryName: 'Diğer', subcategoryName: 'Genel' };
};

const findByName = (Model, name) =>
    Model.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });

const getOrCreateBrand = async (brandName, imageUrl) => {
    const existing = await findByName(Brand, brandName);
    if (existing) return existing;

    if (plannedBrands.has(brandName)) {
        return plannedBrands.get(brandName);
    }

    summary.createdBrands += 1;
    const brandData = {
        _id: new mongoose.Types.ObjectId(),
        name: brandName,
        imageUrl: imageUrl || defaultBrandImageUrl
    };
    plannedBrands.set(brandName, brandData);

    if (!dryRun) {
        return new Brand(brandData).save();
    }

    return brandData;
};

const getOrCreateCategory = async (categoryName, subcategoryName) => {
    const subKey = `${normalizeForMatch(categoryName)}::${normalizeForMatch(subcategoryName)}`;
    const existing = await findByName(Category, categoryName);

    if (existing) {
        const hasSubcategory = existing.subcategories.some(
            subcategory => normalizeForMatch(subcategory) === normalizeForMatch(subcategoryName)
        );

        if (!hasSubcategory && !plannedSubcategories.has(subKey)) {
            summary.createdSubcategories += 1;
            plannedSubcategories.add(subKey);
            if (!dryRun) {
                existing.subcategories.push(subcategoryName);
                await existing.save();
            }
        }

        return existing;
    }

    if (plannedCategories.has(categoryName)) {
        const category = plannedCategories.get(categoryName);

        if (!plannedSubcategories.has(subKey)) {
            category.subcategories.push(subcategoryName);
            plannedSubcategories.add(subKey);
            summary.createdSubcategories += 1;
        }

        return category;
    }

    summary.createdCategories += 1;
    summary.createdSubcategories += 1;
    plannedSubcategories.add(subKey);

    const categoryData = {
        _id: new mongoose.Types.ObjectId(),
        name: categoryName,
        subcategories: [subcategoryName]
    };
    plannedCategories.set(categoryName, categoryData);

    if (!dryRun) {
        return new Category(categoryData).save();
    }

    return categoryData;
};

const buildUniqueProductCode = async (baseCode, currentProductId = null) => {
    let candidate = baseCode;
    let suffix = 2;

    while (plannedProducts.has(candidate)) {
        candidate = `${baseCode}-${suffix}`;
        suffix += 1;
    }

    while (true) {
        const existing = await Product.findOne({ productCode: candidate }).select('_id');
        if (!existing || (currentProductId && existing._id.equals(currentProductId))) {
            plannedProducts.add(candidate);
            return candidate;
        }

        candidate = `${baseCode}-${suffix}`;
        suffix += 1;
    }
};

const buildUniqueSlug = async (baseSlug, currentProductId = null) => {
    let candidate = baseSlug;
    let suffix = 2;

    while (plannedSlugs.has(candidate)) {
        candidate = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    while (true) {
        const existing = await Product.findOne({ slug: candidate }).select('_id');
        if (!existing || (currentProductId && existing._id.equals(currentProductId))) {
            plannedSlugs.add(candidate);
            return candidate;
        }

        candidate = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
};

const findExistingProductBySlug = async (baseSlug, productName, brandName) => {
    const exactSlugProduct = await Product.findOne({ slug: baseSlug }).populate({ path: 'brands', select: 'name' });
    if (exactSlugProduct) {
        return exactSlugProduct;
    }

    const slugRegex = new RegExp(`^${escapeRegex(baseSlug)}(-\\d+)?$`);
    const candidates = await Product.find({ slug: slugRegex }).populate({ path: 'brands', select: 'name' });
    return candidates.find(product => {
        const sameName = normalizeForMatch(product.name) === normalizeForMatch(productName);
        const sameBrand = product.brands.some(brand => normalizeForMatch(brand.name) === normalizeForMatch(brandName));
        return sameName && sameBrand;
    }) || null;
};

const findExistingProductByNameBrand = async (productName, brandName) => {
    const brand = await findByName(Brand, brandName);
    if (!brand) return null;

    return Product.findOne({
        name: new RegExp(`^${escapeRegex(productName)}$`, 'i'),
        brands: brand._id
    });
};

const findExistingProduct = async ({ rawProductCode, fallbackProductCode, baseSlug, productName, brandName }) => {
    if (rawProductCode) {
        const product = await Product.findOne({ productCode: rawProductCode });
        if (product) {
            return { product, matchedBy: 'productCode' };
        }
    }

    if (fallbackProductCode) {
        const product = await Product.findOne({ productCode: fallbackProductCode });
        if (product) {
            return { product, matchedBy: 'productCode' };
        }
    }

    const slugProduct = await findExistingProductBySlug(baseSlug, productName, brandName);
    if (slugProduct) {
        return { product: slugProduct, matchedBy: 'slug' };
    }

    const nameBrandProduct = await findExistingProductByNameBrand(productName, brandName);
    if (nameBrandProduct) {
        return { product: nameBrandProduct, matchedBy: 'nameBrand' };
    }

    return { product: null, matchedBy: null };
};

const normalizeItem = async item => {
    const errors = [];
    const productName = normalizeText(item['Ürün Adı']);
    const rawBrand = normalizeText(item.Marka);
    const fallbackBrand = rawBrand ? '' : detectBrandFromName(productName);
    const brandName = rawBrand || fallbackBrand;
    const price = parseTurkishPrice(item['Perakende Satış Fiyatı']);
    const stock = parseNumber(item.Envanter);
    const imageUrls = Array.isArray(item.images) ? item.images.filter(Boolean).slice(0, 3) : [];
    const rawProductCode = normalizeText(item['Ürün Kodu']);
    const fallbackProductCode = rawProductCode ? '' : `AUTO-${slugify(`${brandName} ${productName}`)}`;
    const baseSlug = slugify(`${brandName} ${productName}`);

    if (!productName) errors.push('Ürün adı eksik.');
    if (!brandName) errors.push('Marka eksik ve ürün adından çıkarılamadı.');
    if (price === null) errors.push('Fiyat number formatına çevrilemedi.');
    if (stock === null) errors.push('Envanter number formatına çevrilemedi.');
    if (imageUrls.length === 0) {
        summary.productsWithoutImages += 1;
        errors.push('Ürün görseli yok.');
    }

    const productCode = rawProductCode || fallbackProductCode;
    const match = productCode && brandName && productName
        ? await findExistingProduct({ rawProductCode, fallbackProductCode, baseSlug, productName, brandName })
        : { product: null, matchedBy: null };
    const existingProduct = match.product;
    const isPlannedProduct = rawProductCode ? plannedProducts.has(rawProductCode) : false;
    const finalProductCode = rawProductCode
        ? productCode
        : existingProduct?.productCode || await buildUniqueProductCode(fallbackProductCode, existingProduct?._id);
    const finalSlug = existingProduct?.slug || await buildUniqueSlug(baseSlug, existingProduct?._id);

    return {
        productName,
        rawBrand,
        fallbackBrand,
        brandName,
        price,
        stock,
        imageUrls,
        rawProductCode,
        fallbackProductCode: rawProductCode ? '' : finalProductCode,
        baseFallbackProductCode: fallbackProductCode,
        productCode: finalProductCode,
        baseSlug,
        slug: finalSlug,
        existingProduct,
        matchedBy: match.matchedBy,
        isPlannedProduct,
        errors
    };
};

const addImportError = (item, index, normalized, reason) => {
    summary.errorProducts += 1;
    importErrors.push({
        index,
        productCode: normalized?.rawProductCode || normalizeText(item['Ürün Kodu']) || null,
        fallbackProductCode: normalized?.fallbackProductCode || null,
        brand: normalized?.rawBrand || normalizeText(item.Marka) || null,
        fallbackBrand: normalized?.fallbackBrand || null,
        productName: normalized?.productName || normalizeText(item['Ürün Adı']) || null,
        reason,
        rawProduct: item
    });
};

const buildDescription = item => {
    const note = normalizeText(item.Not);
    const createdAt = normalizeText(item['Oluşturulma Tarihi']);
    const parts = [];

    if (note) parts.push(note);
    if (createdAt) parts.push(`Kaynak oluşturulma tarihi: ${createdAt}`);

    return parts.join('\n');
};

const importProduct = async (item, index) => {
    const normalized = await normalizeItem(item);

    if (normalized.errors.length > 0) {
        addImportError(item, index, normalized, normalized.errors);
        return;
    }

    if (normalized.fallbackBrand) {
        summary.fallbackBrands += 1;
    }

    if (normalized.fallbackProductCode) {
        summary.fallbackProductCodes += 1;
    }

    const { categoryName, subcategoryName } = inferCategory(normalized.productName);
    const [brand, category] = await Promise.all([
        getOrCreateBrand(normalized.brandName, normalized.imageUrls[0]),
        getOrCreateCategory(categoryName, subcategoryName)
    ]);

    const productData = {
        name: normalized.productName,
        productCode: normalized.productCode,
        slug: normalized.slug,
        price: normalized.price,
        discount: 0,
        categories: [category._id],
        subcategories: [subcategoryName],
        brands: [brand._id],
        stock: normalized.stock,
        imageUrl: normalized.imageUrls,
        images: toImageObjects(normalized.imageUrls),
        description: buildDescription(item),
        isActive: false
    };

    if (normalized.existingProduct || normalized.isPlannedProduct) {
        summary.updatedProducts += 1;
        plannedProducts.add(normalized.productCode);

        if (normalized.matchedBy === 'productCode') {
            summary.matchedByProductCode += 1;
        } else if (normalized.matchedBy === 'slug') {
            summary.matchedBySlug += 1;
        } else if (normalized.matchedBy === 'nameBrand') {
            summary.matchedByNameBrand += 1;
        }

        if (!dryRun && normalized.existingProduct) {
            await Product.updateOne({ _id: normalized.existingProduct._id }, { $set: productData });
        }

        return;
    }

    summary.insertedProducts += 1;
    plannedProducts.add(normalized.productCode);
    createDebugList.push({
        index,
        productName: normalized.productName,
        brand: normalized.rawBrand || null,
        fallbackBrand: normalized.fallbackBrand || null,
        productCode: normalized.rawProductCode || null,
        fallbackProductCode: normalized.fallbackProductCode || null,
        slug: normalized.slug,
        finalProductCode: normalized.productCode
    });

    if (!dryRun) {
        await new Product(productData).save();
    }
};

const loadJson = () => {
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`JSON dosyası bulunamadı: ${jsonPath}`);
    }

    const content = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
        throw new Error('JSON kök değeri ürün dizisi olmalı.');
    }

    return data;
};

const writeErrors = () => {
    fs.writeFileSync(errorsPath, JSON.stringify(importErrors, null, 2));
};

const printSummary = totalCount => {
    console.log('\nImport özeti');
    console.log('------------');
    console.log(`Mod: ${dryRun ? 'DRY_RUN - veritabanına yazılmadı' : 'WRITE - veritabanına yazıldı'}`);
    console.log(`Okunan ürün sayısı: ${totalCount}`);
    console.log(`Oluşturulacak/oluşturulan marka sayısı: ${summary.createdBrands}`);
    console.log(`Oluşturulacak/oluşturulan kategori sayısı: ${summary.createdCategories}`);
    console.log(`Oluşturulacak/oluşturulan alt kategori sayısı: ${summary.createdSubcategories}`);
    console.log(`Eklenecek/eklenen ürün sayısı: ${summary.insertedProducts}`);
    console.log(`Güncellenecek/güncellenen ürün sayısı: ${summary.updatedProducts}`);
    console.log(`Fallback marka kullanılan ürün sayısı: ${summary.fallbackBrands}`);
    console.log(`Fallback ürün kodu kullanılan ürün sayısı: ${summary.fallbackProductCodes}`);
    console.log(`Görselsiz ürün sayısı: ${summary.productsWithoutImages}`);
    console.log(`Hata alan ürün sayısı: ${summary.errorProducts}`);
    console.log(`ProductCode ile eşleşen ürün sayısı: ${summary.matchedByProductCode}`);
    console.log(`Slug ile eşleşen ürün sayısı: ${summary.matchedBySlug}`);
    console.log(`Ürün adı + marka ile eşleşen ürün sayısı: ${summary.matchedByNameBrand}`);
    console.log(`Create olarak görünen ürün sayısı: ${createDebugList.length}`);

    if (createDebugList.length > 0) {
        console.log('\nCreate olarak görünen ürünler');
        console.log('-----------------------------');
        createDebugList.forEach(product => {
            console.log(JSON.stringify(product, null, 2));
        });
    }

    console.log(`Update olarak görünen ürün sayısı: ${summary.updatedProducts}`);
    console.log(`Hata raporu: ${errorsPath}`);
};

const main = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_CONNECT;

    if (!mongoUri) {
        throw new Error('MONGODB_URI veya MONGODB_CONNECT .env içinde tanımlı olmalı.');
    }

    const products = loadJson();
    await mongoose.connect(mongoUri);

    for (const [index, item] of products.entries()) {
        await importProduct(item, index);
    }

    writeErrors();
    printSummary(products.length);
};

main()
    .catch(error => {
        console.error('Import başarısız:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
