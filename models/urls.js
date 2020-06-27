const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
    },
    hits: {
        type: Number,
        required: true,
        default: 0
    }
},{ timestamps: true })

module.exports = mongoose.model('urls', urlSchema)