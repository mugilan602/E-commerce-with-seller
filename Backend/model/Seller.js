const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const sellerSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        buyerIds: [{
            type: mongoose.Types.ObjectId,
            ref: 'User',
        }]
    }],
    role: {
        type: String,
        required: true,
        default: 'seller'
    }
}, { timestamps: true });

// Static method for login
sellerSchema.statics.login = async function(email, password) {
    if (!email || !password) {
        throw new Error("All fields must be filled");
    }
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error("Incorrect email");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error("Incorrect password");
    }
    return user;
};

// Static method for signup
sellerSchema.statics.signup = async function(email, password) {
    const exists = await this.findOne({ email });
    if (exists) {
        throw new Error("Email already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({ email, password: hash });
    return user;
};

module.exports = mongoose.model('Seller', sellerSchema);
