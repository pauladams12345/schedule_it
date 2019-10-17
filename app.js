var express =       require("express"),
    bodyParser =    require("body-parser"),
    session =       require("express-session"),
    handlebars =    require("express-handlebars").create({defaultLayout: 'main'});

var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require("express-session")({
    secret: "We should pick a real secret",
    resave: false,
    saveUninitialized: false
}));

app.get('/', function(req, res) {
    res.render('login');
});

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

app.listen(process.env.PORT || 3000, function(){
    console.log('Indaba server started!');
});