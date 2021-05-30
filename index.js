const port = process.env.PORT || 8000;
const express =require("express");
const app = express();
const path = require('path');
const ejs = require("ejs");
const Routes = require("./routes/route");
let  bcrypt = require("bcrypt");
const static_parth=path.join(__dirname, "/public");
const template_parth=path.join(__dirname, "/views");
app.set("view engine", "ejs"); 
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_parth));
app.use(Routes);
app.set("view engine", "ejs"); 
app.set("views",template_parth);
app.listen(port,()=>{
    console.log(`listen to port ${port}`);
});