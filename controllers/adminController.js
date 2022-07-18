const Admin=require('../model/admin');
const jwt=require('jsonwebtoken');
const formdibale=require('formidable');
const fs=require('fs');
const joi=require('joi');
const crypto=require('crypto');
const formidable = require('formidable');
require('dotenv').config();
exports.hellow=(req,res)=>{
    return res.json({msg:"Hellow"});
}
exports.connexion=(req,res)=>{
    const {login,pw}=req.body;
    Admin.findOne({login},(err,a)=>{
        if(err || !a){
            return res.status(400).json({err:"SVP le login et untrovable !!"});
        }
        if(!a.authenticate){
            return res.status(400).json({err:"le mot de passe ne correspond pas au login !!"})
        }
      const token=jwt.sign({_id:a._id},process.env.JWT_SECRET);
      res.cookie('token',token,{expire:new Date() + 800000});
      return res.json({token,nom:a.nom,prenom:a.prenom,_id:a._id});
    })
}
exports.inscrire=(req,res)=>{
    const form =new formdibale.IncomingForm();
    form.keepExtensions=true;
    form.parse(req, async (err,feilds,files)=>{
        const {nom,prenom,login,pw}=feilds;
        const schema=new joi.object({
            nom:joi.string().required().messages({'any.required':'SVP le nom est obligatoire !!','string.empty':'SVP le nom doit pas etre vide !!'}),
            prenom:joi.string().required().messages({'any.required':'SVP le prenom est obligatoire !!','string.empty':'SVP le prenom doit pas etre vide !!'}),
            login:joi.string().required().messages({'any.required':'SVP le login est obligatoire !!','string.empty':'SVP le login doit pas etre vide !!'}),
            pw:joi.string().required().messages({'any.required':'SVP le mot de passe est obligatoire !!','string.empty':'SVP le mot de passe doit pas etre vide !!'})
        })
        const {error}=schema.validate(feilds);
        if(error){
            return res.status(400).json({err:error.details[0].message});
        }
        let c=await Admin.find().select("-photo").and([{nom},{prenom}]);
        if(c.length!=0){
            return res.status(400).json({err:"SVP le nom et le prenom exit deja !!"});
        }
        c=await Admin.find({login}).select("-photo");
        if(c.length!=0){
            return res.status(400).json({err:"cet login exist deja !!"});
        }        
        const CryptPw=crypto.createHmac('sha1',pw).update(pw).digest('hex');
        c=await Admin.find({hashed_pw:CryptPw}).select("-photo");
        if(c.length!=0){
            return res.status(400).json({err:"cet mot de passe exist deja !!"});
        }
        let A=new Admin(feilds);
        if(files.photo){
           A.photo.data=fs.readFileSync(files.photo.path);
           A.photo.contentType=files.photo.type;
        }else{
            return res.status(400).json({err:"SVP le photo est obligatoire !!"});
        }
        A.save((err,a)=>{
            if(err){
                return res.status(400).json({err})
            }
            return res.json({msg:"Inscription avec success !!"});
        })
    })
}
exports.getImage=(req,res)=>{
    const nom=req.params.nom;
    const prenom=req.params.prenom;
}
exports.quitter=(req,res)=>{
    res.clearCookie('token');
    return res.json({msg:"à bientôt"});
}
exports.getImage=(req,res)=>{
    const _id=req.params.id;
    Admin.findOne({_id},(err,a)=>{
        if(err){
            return res.status(400).json({err});
        }
        const {data,ContentType}=a.photo;
        res.set("ContentType",ContentType);
        return res.send(data);
    })
}
exports.getcompt=(req,res)=>{
    const _id=req.params.id;
    Admin.findOne({_id},(err,a)=>{
        if(err) return res.status(400).json({err});
        return res.json({a});
    })
}
exports.updateAdmin=(req,res)=>{
    const _id=req.params.id;
    const form=new formidable.IncomingForm();
    form.keepExtensions=true;
    form.parse(req,async (err,fields,files)=>{
        const {nom,prenom,login,pw}=fields;
    let c=await Admin.find().select("-photo").and([{_id:{$ne:_id}},{nom},{prenom}]);
    if(c.length!=0)
      return res.status(400).json({err:"SVP le nom et le prenom exist deja !!"});
    c=await Admin.find().select("-photo").and([{_id:{$ne:_id}},{login}]);
      if(c.length!=0)
        return res.status(400).json({err:"SVP le login exist deja !!"});        
    Admin.findOne({_id},(err,a)=>{
        if(err) return res.status(400).json({err});
        a.nom=nom;
        a.prenom=prenom;
        a.login=login;
        if(pw)
        a.pw=pw;
        if(files.photo){
            a.photo.data=fs.readFileSync(files.photo.path);
            a.photo.contentType=files.photo.type;
         }
         a.save((err,a)=>{
            if(err) return res.status(400).json({err});
            const token=jwt.sign({_id:a._id},process.env.JWT_SECRET);
            res.cookie('token',token,{expire:new Date() + 800000});
            return res.json({token,nom:a.nom,prenom:a.prenom,_id:a._id});      
         })
    })
    })
}