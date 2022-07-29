const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    body : {
        type : String,
    },
    rating : {
        type : Number,
    },
    campground : {
        type : Schema.Types.ObjectId,
        ref : 'Campground',
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User',
    },
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;