const mongoose=require('mongoose');
const filier = require('./filier');
const {ObjectId} = mongoose.Schema;
// Groupe (idG,  nomG, annee,nbretudient,  #idF)
const groupSchema=new mongoose.Schema({
 nom:{type:String,required:true},
 annee:{type:String,required:true},
 niveau:{type:String,required:true},
 nbrEtudient:{type:String,required:true},
 filier:{type:ObjectId,ref:"Filier",required:true}
},{timestamps:true});
module.exports=mongoose.model('Group',groupSchema);