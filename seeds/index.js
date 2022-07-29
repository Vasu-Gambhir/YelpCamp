const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
const {places,descriptors} = require('./seedHelpers');

mongoose.connect(`mongodb://localhost:27017/yelp-camp`);
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Datbase Connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() *1000)+1; 
        const price = Math.floor(Math.random() * 20)+ 10;
        const camp = new Campground({
            author : '62dda7b329cbe70745b61f3c',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            description : 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus commodi perferendis omnis facere, eveniet perspiciatis sapiente et asperiores totam suscipit fugit dolorum. Ea totam, rem asperiores similique non excepturi neque!',
            price,
            geometry: { 
              type: 'Point', 
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
              ] 
            },
            images : [
                {
                  url: 'https://res.cloudinary.com/daldikwor/image/upload/v1658868012/YelpCamp/r2g0zniru2uyie1agked.avif',
                  filename: 'YelpCamp/r2g0zniru2uyie1agked',
                },
                {
                  url: 'https://res.cloudinary.com/daldikwor/image/upload/v1658868012/YelpCamp/qk6izjupyow5rdagolae.avif',
                  filename: 'YelpCamp/qk6izjupyow5rdagolae',
                },
                {
                  url: 'https://res.cloudinary.com/daldikwor/image/upload/v1658868012/YelpCamp/zdm3ezqkvlkg04jfxma5.avif',
                  filename: 'YelpCamp/zdm3ezqkvlkg04jfxma5',
                }
              ]
                
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })