const Formateur=require('../model/Formateur');
const formidable=require('formidable');
const joi=require('joi');
const fs=require('fs');
const nodemailer=require('nodemailer');
require('dotenv').config();
exports.hellow=(req,res)=>{
    return res.json({msg:"Hellow"});
}
exports.addEtudient=(req,res)=>{
 const form=new formidable.IncomingForm();
 form.keepExtensions=true;
 form.parse(req, async (err,fields,files)=>{
    const {nom,prenom,email,tel,nbrHeur,prixHeur}=fields;
    if(!files.photo) return res.status(400).json({err:"SVP l'image est obligatoire !!"});
    const schema=new joi.object({
        nom:joi.string().required().messages({'any.required':"SVP le nom et obligatoire !!",'string.empty':"SVP le nom et obligatoire !!"}),
        prenom:joi.string().required().messages({'any.required':"SVP le prenom et obligatoire !!",'string.empty':"SVP le nom et obligatoire !!"}),
        email:joi.string().pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).required().messages({"any.required":"SVP le gmail est obligatoire !!","string.empty":"SVP le gmail doit pas etre vide !!","string.pattern.base":"SVP le format de gmail est invalide !!"}),
        tel:joi.string().pattern(/0[0-9]{9}/).required().messages({"any.required":"SVP le telephone est obligatoire !!","string.empty":"SVP le telephone doit pas etre vide !!","string.pattern.base":"SVP le format de telephone est invalide !!"}),
        nbrHeur:joi.string().pattern(/\d/).required().messages({"any.required":"SVP le nombre des heure est obligatoire !!","string.empty":"SVP le nombre des heure doit pas etre vide !!","string.pattern.base":"SVP le format de nombre des heure est invalide !!"}),
        prixHeur:joi.string().pattern(/\d/).required().messages({"any.required":"SVP le prix par heure est obligatoire !!","string.empty":"SVP le prix par heure doit pas etre vide !!","string.pattern.base":"SVP le format de prix par heure est invalide !!"}),                 
    });
    const {error}=schema.validate({nom,prenom,email,tel,nbrHeur,prixHeur});
    if(error) return res.status(400).json({err:error.details[0].message});
    let c=await Formateur.find().select("-photo").and([{nom},{prenom}]);
    if(c.length!=0) return res.status(400).json({err:"SVP le nom et le prenom exist deja !!"});
    c=await Formateur.find({email}).select("-photo");
    if(c.length!=0) return res.status(400).json({err:"SVP l'email exist deja !!"});
    c=await Formateur.find({tel}).select("-photo");
    if(c.length!=0) return res.status(400).json({err:"SVP le telephone exist deja !!"});
    const f=new Formateur(fields); 
    f.photo.data=fs.readFileSync(files.photo.path);
    f.photo.contentType=files.photo.type;
    f.save((err,f)=>{
        if(err) return res.status(400).json({err:err});
        return res.json({msg:"Ajouter avec success !!"});
    })  
 });   
}
exports.getAll=(req,res)=>{
    const {nom,prenom,email,tel,nbrHeur,prixHeur}=req.body;
    const searchQuery={};
    searchQuery.nom={$regex:'.*'+nom+'.*',$options:'i'};
    searchQuery.prenom={$regex:'.*'+prenom+'.*',$options:'i'};
    searchQuery.email={$regex:'.*'+email+'.*',$options:'i'};
    searchQuery.tel={$regex:'.*'+tel+'.*',$options:'i'};
    searchQuery.nbrHeur={$regex:'.*'+nbrHeur+'.*',$options:'i'};
    searchQuery.prixHeur={$regex:'.*'+prixHeur+'.*',$options:'i'};
    
    const skip=req.params.skip;
    Formateur.find(searchQuery).select("-photo").limit(5).skip(skip).exec((err,f)=>{
        if(err) return res.status(400).json({err});
        return res.json({f});
    })
}
exports.getimage=(req,res)=>{
    const _id=req.params._id;
    Formateur.findOne({_id},(err,f)=>{
        if(err) return res.status(400).json({err});
        const {data,contentType}=f.photo;
        res.set('contentType',contentType);
        return res.send(data);
    })
}
exports.deleteFotmateur=(req,res)=>{
    const _id=req.params.id;
    Formateur.findOne({_id},(err,f)=>{
        if(err) return res.status(400).json({err});
        f.remove((err,f)=>{
        if(err) return res.status(400).json({err});
         return res.json({msg:"Suppromer avec success !!"});
        })
    })
}
exports.updateFormateur=(req,res)=>{
    const form =new formidable.IncomingForm();
    form.keepExtensions=true;
    form.parse(req, async (err,fields,files)=>{
        const _id=req.params.id;
        const {nom,prenom,email,tel,nbrHeur,prixHeur}=fields;
        const schema=new joi.object({
            nom:joi.string().required().messages({'any.required':"SVP le nom et obligatoire !!",'string.empty':"SVP le nom et obligatoire !!"}),
            prenom:joi.string().required().messages({'any.required':"SVP le prenom et obligatoire !!",'string.empty':"SVP le nom et obligatoire !!"}),
            email:joi.string().pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).required().messages({"any.required":"SVP le gmail est obligatoire !!","string.empty":"SVP le gmail doit pas etre vide !!","string.pattern.base":"SVP le format de gmail est invalide !!"}),
            tel:joi.string().pattern(/0[0-9]{9}/).required().messages({"any.required":"SVP le telephone est obligatoire !!","string.empty":"SVP le telephone doit pas etre vide !!","string.pattern.base":"SVP le format de telephone est invalide !!"}),
            nbrHeur:joi.string().pattern(/\d/).required().messages({"any.required":"SVP le nombre des heure est obligatoire !!","string.empty":"SVP le nombre des heure doit pas etre vide !!","string.pattern.base":"SVP le format de nombre des heure est invalide !!"}),
            prixHeur:joi.string().pattern(/\d/).required().messages({"any.required":"SVP le prix par heure est obligatoire !!","string.empty":"SVP le prix par heure doit pas etre vide !!","string.pattern.base":"SVP le format de prix par heure est invalide !!"}),                 
        });
        const {error}=schema.validate({nom,prenom,email,tel,nbrHeur,prixHeur});
        if(error) return res.status(400).json({err:error.details[0].message});    
        let c=await Formateur.find().select("-photo").and([{_id:{$ne:_id}},{nom},{prenom}]);
        if(c.length!=0) return res.status(400).json({err:"SVP le nom et le prenom exist deja !!"});
        c=await Formateur.find().select("-photo").and([{_id:{$ne:_id}},{email}]);
        if(c.length!=0) return res.status(400).json({err:"SVP le email exist deja !!"});
        c=await Formateur.find().select("-photo").and([{_id:{$ne:_id}},{tel}]);
        if(c.length!=0) return res.status(400).json({err:"SVP le telephone exist deja !!"});
        Formateur.findOne({_id},(err,f)=>{
            if(err) return res.status(400).json({err});
            f.nom=nom;
            f.prenom=prenom;
            f.email=email;
            f.tel=tel;
            f.nbrHeur=nbrHeur;
            f.prixHeur=prixHeur;
            if(files.photo){
                f.photo.data=fs.readFileSync(files.photo.path);
                f.photo.contentType=files.photo.type;
            }
            f.save((err,f)=>{
                if(err) return res.status(400).json({err});
                return res.json({msg:"Moddifier avec success"});
            })
        })       
    })
}
exports.sendEmail=(req,res)=>{
    const emailTo=req.params.emailTo;
    const {objet,message}=req.body;
    const PASS=process.env.PASS;
    const USER=process.env.USER;
    var transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:USER,
            pass:PASS
        }
    });
    var mailOptions={
        from:"nassimesofian@gmail.com",
        to:emailTo,
        subject:objet,
        text:message
    }
    transporter.sendMail(mailOptions,(err,info)=>{
        if(err) return res.status(400).json({err});
        return res.json({msg:"email envoyer avec success !!"});
    })
}