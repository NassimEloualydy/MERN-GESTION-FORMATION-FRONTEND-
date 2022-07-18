const mongoose = require('mongoose');
const {ObjectId}=mongoose.Schema;
const etudientSchema=new mongoose.Schema({
    photo:{data:Buffer,contentType:String},
    nom:{type:String,required:true},
    prenom:{type:String,required:true},
    email:{type:String,required:true},
    tel:{type:String,required:true},
    group:{type:ObjectId,ref:"Group",required:true}
},{timestamps:true});
module.exports=mongoose.model('Etudient',etudientSchema);
