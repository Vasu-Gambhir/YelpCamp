const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm =  (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res ,next) => {
    const newCampground = new Campground(req.body.campground);
    const geoData = await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1,
    }).send()
    if(geoData.body.features.length === 0){
        req.flash('error', 'Location not found, Kindly check and try again!');
        // geoData.body.features[0].geometry.coordinates = ['77.21667','28.66667'];
        return res.redirect('/campgrounds/new');
        // next();
    }
    newCampground.geometry = geoData.body.features[0].geometry;
    // console.log(geoData.body.features[0].geometry.coordinates)
    newCampground.images = req.files.map(f => ({url : f.path , filename : f.filename}));
    newCampground.author = req.user._id;
    await newCampground.save();
    // console.log(newCampground);
    req.flash('success' , 'Successfully made a new campground');
    res.redirect(`/campgrounds/${newCampground.id}`);
}

module.exports.showCampground = async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findById(id).populate({
        path : 'reviews',
        populate : {
            path : 'author'
        }
    }).populate('author');
    if(!foundCampground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect(`/campgrounds`);
    }
    // console.log(foundCampground.images.length);
    res.render('campgrounds/show',{foundCampground});
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const foundCampground = await Campground.findById(id);
    if(!foundCampground){
        req.flash('error', 'Cannot find that campground');
        res.redirect(`/campgrounds`);
    }
    else{
        res.render('campgrounds/edit', {foundCampground});
    }
}

module.exports.editCampground = async (req, res) =>{
    const {id} = req.params;
    console.log(req.body);
    const updatedCampground = await Campground.findByIdAndUpdate(id , {...req.body.campground }, {runValidators :true , new :true })
    const imgs = req.files.map(f => ({url : f.path , filename : f.filename}));
    updatedCampground.images.push(...imgs);
    await updatedCampground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({$pull : {images : {filename : {$in : req.body.deleteImages}}}});
        console.log(updatedCampground);
    }
    req.flash('success' , 'Successfully update campground!');
    res.redirect(`/campgrounds/${updatedCampground.id}`);
}

module.exports.deleteCampground = async (req, res) =>{
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success' , 'Successfully deleted campground!');
    res.redirect(`/campgrounds`);
}