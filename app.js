const express=require("express");
var bodyParser=require("body-parser");


const MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://andreafoo11:andreafoo@cluster0-blvfe.mongodb.net/test?\
          retryWrites=true&w=majority";
var app = express();
var adr = require('url');
const path = require('path');
const multer = require('multer');




app.use(express.static(path.join(__dirname, '/')));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const dbo = client.db('Cookbook');

    var curr_user;

    app.get('/',function(req,res){
        console.log(__dirname);
        res.sendFile(path.join(__dirname + '/public/login.html'));
        // res.sendFile(path.join(__dirname + '/public/index.html'));
    });

    app.get('/signup.html',function(req,res){
        console.log(__dirname);
        res.sendFile(path.join(__dirname + '/public/signup.html'));
    });
    
  

    app.get('/login.html',function(req,res){
        console.log(__dirname);
        res.sendFile(path.join(__dirname + '/public/login.html'));
    });
    
    app.get('/search.html',function(req,res){
        console.log(__dirname);
        dbo.collection("Recipes").find({username: curr_user.username} , { projection: { _id: 0, title : 1, image : 1, ingr : 1, instr : 1, time : 1, username: 1 } }).toArray()
        .then(results => {
            console.log(results);
           res.render('search.ejs', {data : { recipes: results , name: curr_user.username }})
        })
        .catch(error => console.error(error))
    });

    app.get('/index.html',function(req,res){
        console.log(__dirname);
          dbo.collection("Recipes").find({username: curr_user.username} , { projection: { _id: 0, title : 1, image : 1, ingr : 1, instr : 1, time : 1, username: 1 } }).toArray()
          .then(results => {
              console.log(results);
             res.render('index.ejs', {data : { recipes: results , name: curr_user.username }})
          })
          .catch(error => console.error(error))
      
        
    });
    
    app.get('/edit.html',function(req,res){
      var recipe_url = require('url');
      var adr = req.url;
      var q = recipe_url.parse(adr, true);

      console.log(q.search); //returns '?year=2017&month=february'
      var qdata = q.query; //returns an object: { year: 2017, month: 'february' }
      var recipe_to_search = qdata.title;
      console.log("here: " + recipe_to_search);
      
      dbo.collection("Recipes").find({title : recipe_to_search} , { projection: { _id: 0, title : 1, ingr : 1, instr : 1, time : 1, image : 1, username: 1} }).toArray()
      .then(results => {
        console.log(results[0].title);
         res.render('edit.ejs', {data : { recipes: results[0] , name: curr_user.username }})
      })
      .catch(error => console.error(error))
      
        
    });
    
    app.get('/recipes.html',function(req,res) {
      var recipe_url = require('url');
      var adr = req.url;
      var q = recipe_url.parse(adr, true);

      console.log(q.search); //returns '?year=2017&month=february'
      var qdata = q.query; //returns an object: { year: 2017, month: 'february' }
      var recipe_to_search = qdata.title;
      console.log("here: " + recipe_to_search);
      
      dbo.collection("Recipes").find({title : recipe_to_search} , { projection: { _id: 0, title : 1, ingr : 1, instr : 1, time : 1, image : 1, username: 1} }).toArray()
      .then(results => {
        console.log(results[0].title);
         res.render('recipes.ejs', {data : { recipes: results[0] , name: curr_user.username }})
      })
      .catch(error => console.error(error))
      
    });
    
    // app.post('/uploadphoto', upload.single('picture'), (req, res) => {
    //       var img = fs.readFileSync(req.file.path);
    //       var encode_image = img.toString('base64');
    //       // Define a JSONobject for the image attributes for saving to database
    // 
    //       var finalImg = {
    //         contentType: req.file.mimetype,
    //         image:  new Buffer(encode_image, 'base64'),
    // 
    //       };
    //       db.collection('quotes').insertOne(finalImg, (err, result) => {
    //       console.log(result)
    // 
    //       if (err) return console.log(err)
    // 
    //       console.log('saved to database')
    //       res.redirect('/')
    // 
    // 
    //     })
    //   });

    app.post('/submit-login', function(req,res){
        curr_user = { username : req.body.username,
                        Password : req.body.password };
        dbo.collection("Users").find(curr_user).toArray(function(err, result) {
                        if (err) throw err;
                        console.log(result)
                        if (result.length == 0) {
                          res.render('login.ejs', {error: "Incorrect login information"})
                        }
                        else {
                          dbo.collection("Recipes").find({username: curr_user.username} , { projection: { _id: 0, title : 1, image : 1, ingr : 1, instr : 1, time : 1, username: 1 } }).toArray()
                          .then(results => {
                              console.log(results);
                             res.render('index.ejs', {data : { recipes: results , name: curr_user.username }})
                          })
                          .catch(error => console.error(error))
                        }
                    });
    });

    app.post('/submit-signup', function(req,res){
        curr_user = { username : req.body.username,
                      Password : req.body.password };
        dbo.collection("Users").insertOne(curr_user)
          .then(user_result => {
               res.render('index.ejs', {data : { name: curr_user.username }})
            })
          .catch(error => console.error(error))
    });
    
    app.get('/add_new.html',function(req,res){
        console.log(curr_user);
        res.render('add_new.ejs', {data : {name: curr_user.username}});
    });
    
    app.post('/search',function(req,res){
        var obj = req.body.recipe_to_search;
        dbo.collection("Recipes").find({title : obj} , { projection: { _id: 0, title : 1, ingr : 1, instr : 1, time : 1, image : 1, username: 1} }).toArray()
        .then(results => {
          console.log("Found");
           res.render('search_results.ejs', {data : { recipes: results , name: curr_user.username }})
        })
        .catch(error => console.error(error))
        
    });
    
    app.post('/create_new_recipe', function(req,res){
        // var curr_user = req.body.username;
        console.log("Here: " + curr_user);
        var recipe = { username : curr_user.username,
                       title : req.body.title,
                       ingr : req.body.ingr,
                       instr : req.body.instr,
                       time : req.body.time,
                       image: req.body.image};
        // console.log(user);
         dbo.collection("Recipes").insertOne(recipe)
           .then(user_result => {
                 dbo.collection("Recipes").find({username: curr_user.username} , { projection: { _id: 0, title : 1, ingr : 1, instr : 1, time : 1, image : 1 , username: 1} }).toArray()
                 .then(results => {
                    res.render('index.ejs', {data : { recipes: results , name: curr_user.username }})
                 })
                 .catch(error => console.error(error))
             })
           .catch(error => console.error(error))
    
    });
    
    app.post('/update_recipe', function(req,res){
        // var curr_user = req.body.username;
        var recipe = { username : curr_user.username,
                       title : req.body.title,
                       ingr : req.body.ingr,
                       instr : req.body.instr,
                       time : req.body.time,
                       image: req.body.image};
        
        
         var newvalues = { $set: {    title : req.body.title,
                                      ingr : req.body.ingr,
                                      instr : req.body.instr,
                                      time : req.body.time,
                                      image: req.body.image}};
         dbo.collection("Recipes").updateOne({title: recipe.title}, newvalues, function(err, res) {
            if (err) throw err;
            console.log("updated");
          });
          
          dbo.collection("Recipes").find({username: curr_user.username} , { projection: { _id: 0, title : 1, ingr : 1, instr : 1, time : 1, image : 1 , username: 1} }).toArray()
          .then(results => {
             res.render('index.ejs', {data : { recipes: results , name: curr_user.username }})
          })
          .catch(error => console.error(error))
             
    
    });
    
    

});



app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0' );
