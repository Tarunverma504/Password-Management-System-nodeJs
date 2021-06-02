const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');

const { body, validationResult } = require('express-validator');
var userModel =require("../modules/user");
var passModel=require("../modules/userdata");
const cryptr = new Cryptr('myTotalySecretKey');
function checkLoginUser(req,res,next){
   
    try {

        var userToken=localStorage.getItem('userToken');
        if(userToken){
            var decoded = jwt.verify(userToken, 'loginToken');
            next();
        }
        else{
         throw err;
        }
       
      } catch(err) { 
        res.redirect("/"); 
      }
     
}



if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }


function checkEmail(req,res,next){
    var email=req.body.email;
    var checkexitemail = userModel.findOne({email:email});
    checkexitemail.exec((err,data)=>{
        if(err) throw err;
        if(data){
            return res.render("signup.ejs",{title:'Login',msg:'Email already Exist '});

        }
        next();
    })
}

function checkUsername(req,res,next){
    var username =req.body.username;
    var checkexitusername = userModel.findOne({username:username});
    checkexitusername.exec((err,data)=>{
        if(err) throw err;
        if(data){
            return res.render("signup.ejs",{title:'Login',msg:'Username already Exist '});

        }
        next();
    })
}

function validate(req,res,next){
    var a= req.body.passwordCategory;
    a=a.trim();
    if(a.length<=0){
        var loginUser=localStorage.getItem('loginUser');
        res.render("addNewCategory.ejs",{title:'Password Management System',loginUser:loginUser,err:"Enter Category Name",success:""});
        console.log('err');
    }
    else{
        var passCatName=req.body.passwordCategory;
        var passcatDetails = new passCatModel({
            password_category:passCatName
        })
        passcatDetails.save((err,doc)=>{
            if(err) throw err;
            var loginUser=localStorage.getItem('loginUser');
        res.render("addNewCategory.ejs",{title:'Password Management System',loginUser:loginUser,err:"",success:"Password Category Added Successfully"});
        })
    }
    
    
}

router.get("/",async(req,res,next)=>{
     var loginUser=localStorage.getItem('loginUser');
     if(loginUser){
         res.redirect('/dashboard');
     }
     else{
        res.render("index.ejs",{title:'Login',msg:""}); 
     }  
    
    
}) 

router.post("/",async(req,res,next)=>{
    
    try{
        var username=req.body.username;
        var password= req.body.password;
        var checkUser = userModel.findOne({username:username});
        checkUser.exec((err,data)=>{
            if(err){
                res.render("index.ejs",{title:'Login',msg:"Invalid Username and Passowrd"});
            };
            var getUserId=data._id; 
            var getPassword= data.password;
            if(bcrypt.compareSync(password,getPassword)){
                var token = jwt.sign({ userId: getUserId }, 'loginToken');
                localStorage.setItem('userToken', token);
                localStorage.setItem('loginUser', username);
                localStorage.setItem("userId",getUserId);
                res.redirect("/dashboard");
            }
            else{
                res.render("index.ejs",{title:'Login',msg:"Invalid Username and Passowrd"});
            }
            
            
        })
    }
    catch(err){
        res.send(err);
    }

    
})

router.get("/signup",async(req,res,next)=>{
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
        res.redirect('/dashboard');
    }
    else{                        
    res.render("signup.ejs",{title:'Login',msg:""});
    }
}) 

router.post ("/signup",checkUsername,checkEmail,async(req,res,next)=>{   

    var username=req.body.username;
    var email=req.body.email;
    var password=req.body.password;
    var  confpassword=req.body.confpassword;
    if(password!=confpassword){
        res.render("signup.ejs",{title:'Login',msg:'Password Not Matched '});
    }
    else{

        password = bcrypt.hashSync(req.body.password,10);
        var userDetails=new userModel({
            username:username,
            email:email,
            password:password
        });
        userDetails.save((err,doc)=>{
            if(err) throw err;
            res.render("signup.ejs",{title:'Login',msg:'User Register Successfully '});
        });
 
    }

}) ;

router.get('/dashboard',checkLoginUser,async(req,res,next)=>{
    var loginUser=localStorage.getItem('loginUser');
    res.render("dashboard.ejs",{title:'Password Management System',loginUser:loginUser});
})

router.get("/addNewPassword",checkLoginUser,async(req,res,next)=>{
    var loginUser=localStorage.getItem('loginUser');
    res.render("addNewPassword.ejs",{title:'Password Management System',loginUser:loginUser,success:"",warning:""})
})

router.post("/addNewPassword",checkLoginUser,async(req,res,next)=>{
    try{
            var loginUser=localStorage.getItem('loginUser');
            var userId=localStorage.getItem("userId");
            var pass_cat=req.body.pass_category;
            pass_cat=pass_cat.trim();
            var password=req.body.password;
            password=password.trim();
            var pass_details=req.body.editor1;
            if(pass_cat.length<=0 || password.length<=0){
                console.log("sdmnd");
                res.render("addNewPassword.ejs",{title:'Password Management System',loginUser:loginUser,success:"",warning:"Please fill all the fields"})
            }
            else{
                var password_details = new passModel({
                    password_category:pass_cat,
                    password:cryptr.encrypt(password),
                    password_details:pass_details
            
                });
                
                var pass_data;
                    var pass_data = await  password_details.save();
                var addid=await userModel.findByIdAndUpdate({_id:userId},{$push:{data:pass_data._id}});
                res.render("addNewPassword.ejs",{title:'Password Management System',loginUser:loginUser,success:"Password Added Successfully",warning:""});
            }
     }
    catch(err)
    {
        res.send(err);
    }
})

router.get("/viewAllCategory",checkLoginUser,async(req,res,next)=>{
    var loginUser=localStorage.getItem('loginUser');
    var userId=localStorage.getItem("userId");
    var data=await userModel.findById({_id:userId}).populate("data");
    res.render("viewAllCategory.ejs",{title:"view Category",loginUser:loginUser,records:data.data});
})

router.post("/abc",async(req,res)=>{
    var userDetails=new userModel({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password
    });
    userDetails.save((err,doc)=>{
        if(err) throw err;
        res.send(userDetails);
    });

})

router.get("/editCategory/:id",async(req,res)=>{
    try{
        let loginUser=localStorage.getItem('loginUser');
        let userId=localStorage.getItem("userId");
        let _id=req.params.id;
        console.log(_id);
        let data= await passModel.findById({_id:_id});
        res.render("editCategory.ejs",{title:"Edit Category",loginUser:loginUser,success:"",warning:"",category:data.password_category,id:data._id});
    }
    catch(err){
        res.send(err);
    }
})

router.get("/editPassword/:id",async(req,res)=>{
    try{
        let loginUser=localStorage.getItem('loginUser');
        let userId=localStorage.getItem("userId");
        let _id=req.params.id;
        console.log(_id);
        let data= await passModel.findById({_id:_id});
        res.render("editPassword.ejs",{title:"Edit Category",loginUser:loginUser,success:"",warning:"", details:data.password_details,category:data.password_category,id:data._id, password:cryptr.decrypt(data.password)});
    }
    catch(err){
        res.send(err);
    }
})

router.post("/savecategory",async(req,res)=>{
    try{
        let loginUser=localStorage.getItem('loginUser');
        let userId=localStorage.getItem("userId");
        let id=req.body.getid;
        let category=req.body.pass_category;
        category=category.trim();
        if(category.length<=0){
            let data= await passModel.findById({_id:id});
            res.render("editCategory.ejs",{title:"Edit Category",loginUser:loginUser,success:"",warning:"Enter Category",category:data.password_category,id:data._id});

        }
        else{
            let data= await passModel.findByIdAndUpdate({_id:id},{password_category:category});
            res.redirect("/viewAllCategory");
        }
        
    }
    catch(err){
        res.send(err);
    }
})

router.post("/savepassword",async(req,res)=>{
    try{
        let loginUser=localStorage.getItem('loginUser');
        let userId=localStorage.getItem("userId");
        let id=req.body.getid;
        let category=req.body.pass_category;
        category=category.trim();
        let password=req.body.password;
        password=password.trim();
        let details=req.params.editor1;
        if(category.length<=0|| password.length<=0){
            let data= await passModel.findById({_id:id});
            res.render("editCategory.ejs",{title:"Edit Category",loginUser:loginUser,success:"",warning:"fill all the fields",category:data.password_category,id:data._id});

        }
        else{
            password=cryptr.encrypt(password);
            let data= await passModel.findByIdAndUpdate({_id:id},{password_category:category,password:password,password_details:details});
            
            res.redirect("/viewAllPassword");
        }

    }
    catch(err){
        res.send(err);
    }
})

router.get("/viewAllPassword",async(req,res)=>{
    try{
        let loginUser=localStorage.getItem('loginUser');
        let userId=localStorage.getItem("userId");
        var data=await userModel.findById({_id:userId}).populate("data");
         data.data.forEach(function(row){
             row.password=cryptr.decrypt(row.password);
         })
        res.render("viewAllPassword.ejs",{title:"view Category",loginUser:loginUser,records:data.data});
    }
    catch(err){

    }
});

router.get("/removePassword/delete/:id",async(req,res)=>{
    try{
        let loginUser=localStorage.getItem('loginUser');
        let userId=localStorage.getItem("userId");
        let id=req.params.id;
        await passModel.findByIdAndRemove({_id:id});
        await userModel.findByIdAndUpdate({_id:userId},{$pull:{data:id}});
        res.redirect("/viewAllPassword");

    }
    catch(err){
        res.send(err);
    }
})

router.get("/logout", async(req,res,next)=>{
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUser');
    res.redirect("/");

});


module.exports = router;