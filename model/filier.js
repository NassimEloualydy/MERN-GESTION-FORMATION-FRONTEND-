const mongoose=require('mongoose');
const filierSchema=new mongoose.Schema({
    nom:{type:String,required:true},
    niveau:{type:String,required:true},
    nbrEtudientMax:{type:String,required:true},
    nbrAnnee:{type:String,required:true}
},{timeseries:true});
module.exports=mongoose.model('Filier',filierSchema);
