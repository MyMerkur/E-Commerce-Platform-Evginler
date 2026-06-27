const mongoose = require('mongoose');
const brands = require('./brands');

const productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    productCode: {
        type: String,
        required: false,
        trim: true,
        index: true
    },
    slug: {
        type: String,
        required: false,
        trim: true,
        unique: true,
        sparse: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: false,
        default: 0
    },
    size: {
        type: Number,
        required: false
    },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        }
    ],
    subcategories: [
        {
            type: String,
            required: false
        }
    ],
    brands: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            required: true
        }
    ],
    stock: {
        type: Number,
        required: true
    },
    imageUrl: [
        {
            type: String,
            required: true
        }
    ],
    images: [
        {
            url: {
                type: String,
                required: true
            },
            isMain: {
                type: Boolean,
                default: false
            },
            source: {
                type: String,
                default: 'external'
            }
        }
    ],
    description: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isReturned: {
        type: Boolean,
        default: false
    },
    returnReason: {
        type: String,
    }
}, { timestamps: true }); // createdAt ve updatedAt alanlarını otomatik olarak ekler

// İndirimli fiyatı hesaplayan fonksiyonu ekleyin
productsSchema.methods.getDiscountedPrice = function() {
    return this.price - (this.price * (this.discount / 100));
};

productsSchema.methods.decreaseStock = function(quantity) {
    this.stock = this.stock - quantity;
    return this.save();
};

module.exports = mongoose.model('Product', productsSchema);
