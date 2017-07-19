const express = require('express');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator=require('express-validator');
const flash=require('connect-flash');
const session=require('express-session');
mongoose.connect('mongodb://localhost:27017/nodeKb');
let db = mongoose.connection;

//check Connection
db.once('open', function () {
    console.log('Connected to MongoDB');

});


//check error for Database Connection
db.on('error', function (err) {
    console.log(err);
})



//Init app
const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


//Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,

}));

//messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
//Load view engine

app.engine('ejs', require('express-ejs-extend'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//bring in models
let Article = require('./models/article');

//Home route
app.get('/', function (req, res) {

    Article.find({}, function (err, articles) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });

        }
    })


});


//Get Article By Id
app.get('/article/:id', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        if (err) {
            console.log(err);
        } else {

            res.render('article_one', {

                article: article
            });
        }



    });
});


//Add Route
app.get('/articles/add', function (req, res) {

    res.render('add', {
        title: 'Add Article'
    });


});


//add submit route
app.post('/articles/add', function (req, res) {

    req.checkBody('title','Title is Required').notEmpty();
        req.checkBody('author','author is Required').notEmpty();
         req.checkBody('body','body is Required').notEmpty();


        //get errors

   let errors= req.validationErrors();

    if(errors){
res.render('add',{
    title:'Add Article',
    errors:errors
})
    }else{
 let article = new Article({
        title: req.body.title,
        author: req.body.author,
        body: req.body.body
    });
    article.save(function (err, response) {

        if (err) {
            console.log(err);
            return;
        } else {
             req.flash('success','Article Added');
            res.redirect('/');
        }

    });
    }
   


});

//Update Article
app.get('/article/edit/:id', function (req, res) {

    Article.findById(req.params.id, function (err, article) {
        if (err) {
            console.log(err);
        } else {

            res.render('article_edit', {
                title: 'Edit Article',
                article: article
            });
        }



    });
});
app.post('/article/edit/:id', function (req, res) {
    let article = {};

    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id };

    Article.update(query, article, function (err, response) {

        if (err) {
            console.log(err);
            return;
        } else {
             req.flash('success','Article Updated');
            res.redirect('/');
        }

    });


});



//delete Article

app.delete('/article/:id', function (req, res) {

    let query = { _id: req.params.id };

    Article.remove(query, function (err) {
        if (err) {
            alert(err);
        } else {
            res.send('success');
            // res.redirect('/');
        }
    });
});








//Start Server
app.listen(3000, function () {
    console.log('server started at port number 3000...');
})

