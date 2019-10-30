var express =       require("express"),
    bodyParser =    require("body-parser"),
    session =       require("express-session"),
    handlebars =    require("express-handlebars").create({defaultLayout: 'main'}),
    request =       require("request"),
    mysql =         require('./middleware/dbcon.js');

var app = express();

// configure bodyParser
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// set handlebars as view engine, allow omission of .handlebars extension
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// set up access to public folder
app.use(express.static(__dirname + '/public'));

// configure sessions
app.use(session({
    secret: "We should pick a real secret",
    resave: false,
    saveUninitialized: false,
    store: mysql.sessionStore
}));

// set up routes
app.use(require('./routes'));

// handle errors
app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err,req,res,next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.send('500');
});

// start server
app.listen(process.env.PORT || 3000, function(){
    console.log('Indaba server started!');
});