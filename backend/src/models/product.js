const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/300x200'
    },
    inStock: {
        type: Boolean,
        default: true
    },
    // Extra fields for search/filter
    views: {
        type: Number,
        default: 0
    },
    promotion: {
        // percent discount 0..100
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);