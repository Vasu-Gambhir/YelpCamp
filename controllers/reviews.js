const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    foundCampground.reviews.push(review);
    await review.save();
    await foundCampground.save();
    req.flash('success' , 'Created new review!');
    res.redirect(`/campgrounds/${foundCampground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    console.log(id , reviewId);
    const foundCampground = await Campground.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash('success' , 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}