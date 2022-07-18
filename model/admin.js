const mongoose=require('mongoose');
const crypto=require('crypto');
const adminSchema=new mongoose.Schema({
    photo:{data:Buffer,contentType:String},
    nom:{type:String,required:true},
    prenom:{type:String,required:true},
    login:{type:String,required:true},
    hashed_pw:{type:String,required:true}
},{timeseries:true});
adminSchema.virtual('pw')
.set(function(pw){
    this._pw=pw;
    this.hashed_pw=this.cryptPW(pw);
})
.get(
    function(){
        return this._pw;
    }
);
adminSchema.methods={
    authenticate:function(plaintext){
        return this.cryptPW(plaintext)===this.hashed_pw;
    },
    cryptPW:function(pw){
     try{
        if(!pw){
            return '';
        }
        return crypto.createHmac('sha1',pw).update(pw).digest('hex')
     } 
     catch(err){
        return err;
     }
    }
}
module.exports=mongoose.model('Admin',adminSchema);