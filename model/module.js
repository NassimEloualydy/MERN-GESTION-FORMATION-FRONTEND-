const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema;
const moduleSchema= new mongoose.Schema({
    nom:{type:String,required:true},
    formateur:{type:ObjectId,ref:"formateur",required:true},
    niveau:{type:String,required:true},
    objectif:{type:String,required:true},
    massHoraire:{type:String,required:true},
},{timstemps:true});
module.exports=mongoose.model('Module',moduleSchema);
