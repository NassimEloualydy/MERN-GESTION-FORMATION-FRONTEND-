const mongoose=require('mongoose');
const formateurSchema=new mongoose.Schema({
    photo:{data:Buffer,contentType:String},
    nom:{type:String,required:true},
    prenom:{type:String,required:true},
    email:{type:String,required:true},
    tel:{type:String,required:true},
    nbrHeur:{type:String,required:true},
    prixHeur:{type:String,required:true},
},{timestamps:true});
module.exports=mongoose.model('Formateur',formateurSchema);
