const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerEmail: {
        type: String,
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    customerPhone: {
        type: String,
        trim: true
    },
    shippingAddress: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        default: 'Cash on Delivery',
        enum: ['Cash on Delivery', 'Credit Card', 'PayPal', 'Bank Transfer']
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
            // REMOVED: required: true - TEMPORARILY
        },
        productName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative']
        },
        image: {
            type: String,
            default: '/images/default-product.jpg'
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// ========== FIXED: SIMPLIFIED pre-save hook ==========
orderSchema.pre('save', function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        
        // SIMPLE order number generation - NO async database query
        this.orderNumber = `ORD-${year}${month}${day}-${random}`;
    }
    next();
});

// Virtual for formatted date
orderSchema.virtual('formattedDate').get(function() {
    if (!this.createdAt) return 'No date';
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for formatted total amount
orderSchema.virtual('formattedTotal').get(function() {
    return `$${(this.totalAmount || 0).toFixed(2)}`;
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
    if (!this.items) return 0;
    return this.items.reduce((total, item) => total + (item.quantity || 0), 0);
});

// SIMPLIFIED - Remove all other virtuals and methods for now
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;