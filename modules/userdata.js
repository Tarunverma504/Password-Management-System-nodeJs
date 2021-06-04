const mongoose = require('mongoose');
require('dotenv').config();
const password=process.env.password;
mongoose.connect(`mongodb+srv://admin:${password}@cluster0.vux7t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false} )

            .then(()=>{
                console.log("connection is successful");
            })
                .catch((err)=>{
                    console.log("failed");
                    console.log(err);
                })

var passSchema = new mongoose.Schema({
    password_category:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    password_details:{
            type:String,
        },
    
    
});

var  passModel = mongoose.model('passData',passSchema);
module.exports=passModel; 