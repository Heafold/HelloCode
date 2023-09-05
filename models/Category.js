const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    }
});

module.exports = mongoose.model('Category', categorySchema);
