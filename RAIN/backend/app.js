var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var cors = require('cors');
//Routes
var userRoutes = require('./routes/userRoutes');
var gpsRoutes = require('./routes/gpsRoutes');
var accelerometerRoutes = require('./routes/accelerometerRoutes');
var scraperRoutes = require('./routes/scraperRoutes');
var recipeRoutes = require('./routes/recipeRoutes');

var app = express();

var allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  credentials: true,
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin)===-1){
      var msg = "The CORS policy does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// SESSION
var session = require('express-session');
app.use(session({
  secret: 'hard work',
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true
  }
}));
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.get('/', async (req, res) => {
  try {
    //Renderiramo index.ejs s seznamom vprašanj
    res.render('index', { title: 'RAIN' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error!');
  }
});

app.use('/users', userRoutes);
app.use('/gps', gpsRoutes);
app.use('/accelerometer', accelerometerRoutes);
app.use('/scrape', scraperRoutes);
app.use('/recipes', recipeRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@massive.s1l5p0y.mongodb.net/?retryWrites=true&w=majority&appName=Massive`;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conection to MongoDB successful'))
  .catch(err => console.log('An error occured:', err));
  

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Aplikacija teče na http://localhost:${port}`);
});

module.exports = app;
