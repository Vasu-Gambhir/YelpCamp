if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const path = require('path');
const helmet = require('helmet');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override'); 
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const localStrategy = require('passport-local'); 
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL || `mongodb://localhost:27017/yelp-camp`;
const MongoStore = require('connect-mongo');
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const User = require('./models/user');

const mongoose = require('mongoose');
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Datbase Connected");
});


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith:'_',
}));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    secret,
    touchAfter : 24*60*60,
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR");
})

const sessionComfig = {
    store,
    name : 'session',
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        // secure : true,
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7,
    }
};

app.use(session(sessionComfig));
app.use(flash());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/daldikwor/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/daldikwor/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/daldikwor/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/daldikwor/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/daldikwor/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/daldikwor/" ],
            childSrc   : [ "blob:" ]
        }
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.query)
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


// app.get('/fakeUser', async(req, res) => {
//     const user = new User({email: 'vg@gmail.com' , username : 'vg'});
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);
// })

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

//for reviews

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
    //res.send('404!!!');
})

app.use((err, req, res , next) => {
    const {status = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong';
    res.status(status).render('error',{err});
    // res.send("OH BOY! Something went wrong");
})

app.listen(port , () => {
    console.log(`listening on port ${port}`);
});