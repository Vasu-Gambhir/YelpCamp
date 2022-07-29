const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const opts = {toJSON : { virtuals: true }};
const imageSchema = new Schema({
    url : String,
    filename : String,
});

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
});

const campgroundSchema = new Schema({
    title : { 
        type: String,
    },
    images : [imageSchema],
    geometry : {
        type : {
            type : String,
            enum : ['Point'],
            required : true,
        },
        coordinates : {
            type : [Number],
            required : true,
        },
    },
    price : { 
        type: Number,
    },
    description : {
        type: String,
    },
    location : {
        type: String,
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User',
    },
    reviews : [{
        type : Schema.Types.ObjectId,
        ref : 'Review',
    }],
},opts)

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}</p>`;
})

campgroundSchema.post('findOneAndDelete' , async(data) =>{
   if(data)
   {
    await Review.deleteMany({
        _id : {
            $in : data.reviews
        }
    })
   }
    console.log(data)
})

const Campground = mongoose.model('Campground', campgroundSchema);
module.exports = Campground;