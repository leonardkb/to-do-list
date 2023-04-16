//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");



//mongodb connectivity process , connecting to port 27017
main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb://localhost:27017/todolistdb');
  }

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//creating item schema

const itemSchema = {

    name:String,


};
// creating mongoose model


const Item =mongoose.model("item",itemSchema);

//adding items
const item1 = new Item({
          name:"welcome to your to do list"
});

const item2 = new Item({
  name:"hit + icon to add new item"
});
const item3 = new Item({
  name:"<-- hit this to delete"
});

// creating list schema 
const listSchema = {
    name:String,
    items:[itemSchema]
};

//creating list mongoose model

const List=mongoose.model("list",listSchema);



//storing  items array into defaultitem variable
//also inserting values into Item collection in todolist db


const defaultitem=[item1,item2,item3];
Item.insertMany(defaultitem).then(function(){
  console.log("successfully added to db");
})
.catch(function(err){
  console.log(err);
});


//get function of Today 

app.get("/", function(req, res) {

  Item.find().then(function(foundItems){
    if (foundItems.length == 0) {
      Item.insertMany(defaultitem).then(function(){
        console.log("Succesfully saved all the items to todolistDB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});
  //   if(foundItems.length==0)
  //   {
  //       return  Item.insertMany(defaultitem);
  //   }else{
  //       return foundItems;
  //   }
  // }).then(savedItem=>{
  //   res.render("list",{
  //     listTitle:"Today",
  //     newListItems:savedItem
  // });
  // })
  // .catch(function(err){
  //   console.log(err);
  // });

  
 
// });




//post function of today

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname= req.body.list;


      const item = new Item({
            name:itemName
      });

          if(listname=="Today"){

               item.save();
                res.redirect("/");
          } else{
            List.findOne({name:listname}).then(function(foundlist){
              foundlist.items.push(item);
              foundlist.save();
              res.redirect("/"+listname);
            
            });
          }
          

          
});

// creating a post method for delete to delete the values and redirect to current page

app.post("/delete",function(req,res){
   let checkedItemId=(req.body.checkbox.trim());
   const listname= (req.body.listname);

   if(listname=="Today"){

        Item.findByIdAndRemove(checkedItemId).then(function(del){
             if(del){
                  console.log("deleted");
                }
            });
                res.redirect("/");
          }else{

                  List.findOneAndUpdate({name:listname},
                    {$pull:{items:{_id: checkedItemId}}}).then(function(foundList){
                                
                                res.redirect("/"+ listname);
                    }).catch(err=>console.log(err));
                    
              }
    
          
});
   

   


 //creating express parameters

app.get("/:customListName", (req,res) => {
  //adding new list that completed by the user
  customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name: customListName}) 
  .then((foundList)=> 
  {
     if(!foundList)
     {
       //Creating a new list 
       const list = new List({
         name: customListName,
         item: defaultitem
      });
      list.save();
      res.redirect("/" + customListName);
     }
     else
     {
       //Show an existing list
       res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
     }
  })
  .catch((err)=>{
    console.log(err);
  })
 });  

 // creating about page

app.get("/about", function(req, res){
  res.render("about");
});

//listening to server 3000 port

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
