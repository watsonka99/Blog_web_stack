var express = require("express");
app = express()
var exoressSanitizer = require("express-sanitizer");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const expressSanitizer = require("express-sanitizer");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

mongoose.connect("mongodb://localhost:27017/blog", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var blog = new mongoose.model("blog", blogSchema);

// Restful routes
// Index
app.get("/blogs", function(req, res){
    blog.find({}, function(err, blogs){
        if(err){
            console.log("Error");
        } else {
            res.render("index.ejs", {blogs: blogs});
        }
    }) 
});

// New 
app.get("/blogs/new", function(req, res){
  res.render("new");
});

// Create
app.post("/blogs", function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body)
  blog.create(req.body.blog, function(err, newBlog){
    if (err) {
      console.log("Error");
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  })
});

// show
app.get("/blogs/:id", function(req, res) {
  blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      res.render("show", {blog:foundBlog});
    }
  })
});

// edit
app.get("/blogs/:id/edit", function(req, res){
  blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog:foundBlog});
    }
  })
});

// update
app.put("/blogs/:id", function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body)
  blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if (err){
      res.redirect("index");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  })
});


// Destroy
app.delete("/blogs/:id", function(req, res){
  blog.findByIdAndRemove(req.params.id, function(err){
    if (err){
      res.redirect("/blogs")
    } else {
      res.redirect("/blogs")
    }
  })
})


var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
