const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    correctAnswer: {
        type: String,
        required: true,
    }
});

const qcmSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    questions: [questionSchema]
});

const QCM = mongoose.model('QCM', qcmSchema);

module.exports = QCM;
