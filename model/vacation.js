const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema;
const vacatonSchema=new mongoose.Schema({
 date:{type:String,required:true},
 nbrHeure:{type:String,required:true},
 module:{type:ObjectId,ref:"module",required:true},
 group:{type:ObjectId,ref:"group",required:true}
},{timestamps:true});
module.exports=mongoose.model('Vacation',vacatonSchema);