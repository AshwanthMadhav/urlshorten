const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
},{ timestamps: true })

module.exports = mongoose.model('counters', counterSchema)