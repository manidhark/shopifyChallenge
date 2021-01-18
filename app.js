const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

// const bodyParser= require('body-parser');
// const fileUpload = require('express-fileupload');


// const swaggerJsDoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

const port = process.env.PORT || 5000;

// const swaggerOptions = {
//     swaggerDefinition: {
//         info: {
//             title: 'Shopify Challenge Backend APIs',
//             description: 'Image Repository APIs',
//             contact: {
//                 name: 'Manidhar Koduupaka'
//             },
//             servers: ['http://localhost:5000'],
//             tags: [
//                 {
//                     name: 'Authentication',
//                     description: 'All APIs for authenticatio'
//                 }
//             ]
//         }
//     },
//     apis: ['./routes/**/*.js'],
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;


// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use(express.static('./public'));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(fileUpload());

// Routes
app.use('/', require('./routes/index.js'));
app.use('/authentication', require('./routes/authentication.js'));
app.use('/image', require('./routes/imageUpload.js'));

const PORT = process.env.PORT || 5000;

app.listen(port , () => {
    console.log(`Server listening on port ${port}`);
});