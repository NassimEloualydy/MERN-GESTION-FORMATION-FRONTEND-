const Etudient=require('../model/Etudient');
const Group=require('../model/group');
const formidable=require('formidable');
const fs=require('fs');
const joi=require('joi');
const nodemailer=require('nodemailer');
require('dotenv').config();
exports.hellow=(req,res)=>{
    return res.json({msg:'Hellow e'});
}
exports.getGroup=(req,res)=>{
    const niveau=req.params.niveau;
    Group.find({niveau}).select().exec((err,g)=>{
        if(err) return res.status(400).json({err});
        return res.json({g});
    });
}
exports.addEtudient=(req,res)=>{
    const form=new formidable.IncomingForm();
    form.keepExtesions=true;
    form.parse(req, async (err,fields,files)=>{
        const {nom,prenom,email,tel,group}=fields;
        const schema=new joi.object({
            nom:joi.string().required().messages({"any.required":"SVP le nom est obligatoire !!","string.empty":"SVP le nom doit pas etre vide !!"}),
            prenom:joi.string().required().messages({"any.required":"SVP le prenom est obligatoire !!","string.empty":"SVP le prenom doit pas etre vide !!"}),
            email:joi.string().pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).required().messages({"any.required":"SVP le gmail est obligatoire !!","string.empty":"SVP le gmail doit pas etre vide !!","string.pattern.base":"SVP le format de gmail est invalide !!"}),
            tel:joi.string().pattern(/0[0-9]{9}/).required().messages({"any.required":"SVP le telephone est obligatoire !!","string.empty":"SVP le telephone doit pas etre vide !!","string.pattern.base":"SVP le format de telephone est invalide !!"}),
            group:joi.string().required().messages({"any.required":"SVP le group est obligatoire !!","string.empty":"SVP le group est obligatoire !!"})
        });        
        const {error}=schema.validate({nom,prenom,email,tel,group});
        if(error)
        return res.status(400).json({err:error.details[0].message});
        let c=await Etudient.find().select("-photo").and([{nom},{prenom}]);
        if(c.length!=0) return res.status(400).json({err:"Svp le nom et le prenom exist deja !!"});
        c=await Etudient.find({email}).select("-photo");
        if(c.length!=0) return res.status(400).json({err:"Svp cet email exist deja !!"});
        c=await Etudient.find({tel}).select("-photo");
        if(c.length!=0) return res.status(400).json({err:"Svp cet telephone exist deja !!"});
        Group.findOne({group},(err,g)=>{
            if(err) return res.status(400).json({err});
            if(g.nbrEtudient==0)
              return res.status(400).json({err:"Svp ce group est complet !!"});
            else{
                g.nbrEtudient=g.nbrEtudient-1;
                g.save((err,g)=>{
                    if(err) return res.status(400).json({err});
                })
             }
        });
        const e=new Etudient(fields);
        if(files.photo){
            e.photo.data=fs.readFileSync(files.photo.path);
            e.photo.contentType=files.photo.type;
        }else 
        return res.status(400).json({err:"Svp l'image est obligatoire !!"});
        e.save((err,e)=>{
            if(err) return res.status(400).json({err});
            return res.json({msg:"Ajouter avec success !!"})
        })
 
    })
}
exports.getAll=(req,res)=>{
    const skip=req.params.skip;
    const {nom,prenom,email,tel,group}=req.body;
    const saerchQuery={};
    saerchQuery.nom={$regex:'.*'+nom+'.*',$options:'i'};
    saerchQuery.prenom={$regex:'.*'+prenom+'.*',$options:'i'};
    saerchQuery.email={$regex:'.*'+email+'.*',$options:'i'};
    saerchQuery.tel={$regex:'.*'+tel+'.*',$options:'i'};
    if(group!="")
    saerchQuery.group={$eq:group};
    Etudient.find(saerchQuery).populate([{
        path:"group",
        model:"Group",
        select:["nom","niveau","annee"]
    }]).select("-photo").limit(5).skip(skip).exec((err,e)=>{
        if(err) return res.status(400).json({err});
        return res.json({e});
    })
}
exports.deletEtudient=(req,res)=>{
    const _id=req.params._id;
    Etudient.findOne({_id},(err,e)=>{
        if(err)
         return res.status(400).json({err});
         e.remove((err,e)=>{
            if(err) return res.status(400).json({err});
            return res.json({msg:"Supprimer avec success !!"});
         })
    })
}
exports.updateEtudient=(req,res)=>{
    const form=new formidable.IncomingForm(); 
    form.keepExtesions=true;
    form.parse(req, async (err,fields,files)=>{
        const {nom,prenom,email,tel,group}=fields;
        const _id=req.params.id;
        const schema=new joi.object({
            nom:joi.string().required().messages({"any.required":"SVP le nom est obligatoire !!","string.empty":"SVP le nom doit pas etre vide !!"}),
            prenom:joi.string().required().messages({"any.required":"SVP le prenom est obligatoire !!","string.empty":"SVP le prenom doit pas etre vide !!"}),
            email:joi.string().pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).required().messages({"any.required":"SVP le gmail est obligatoire !!","string.empty":"SVP le gmail doit pas etre vide !!","string.pattern.base":"SVP le format de gmail est invalide !!"}),
            tel:joi.string().pattern(/0[0-9]{9}/).required().messages({"any.required":"SVP le telephone est obligatoire !!","string.empty":"SVP le telephone doit pas etre vide !!","string.pattern.base":"SVP le format de telephone est invalide !!"}),
            group:joi.string().required().messages({"any.required":"SVP le group est obligatoire !!","string.empty":"SVP le group est obligatoire !!"})
        });        
        const {error}=schema.validate({nom,prenom,email,tel,group});
        if(error)
        return res.status(400).json({err:error.details[0].message});
        let c=await Etudient.find().select("-photo").and([{_id:{$ne:_id}},{nom},{prenom}]);
        if(c.length!=0) return res.status(400).json({err:"Svp le nom et le prenom exist deja !!"});
        c=await Etudient.find().select("-photo").and([{_id:{$ne:_id}},{email}]);
        if(c.length!=0) return res.status(400).json({err:"Svp cet email exist deja !!"});
        c=await Etudient.find().select("-photo").and([{_id:{$ne:_id}},{tel}]);
        if(c.length!=0) return res.status(400).json({err:"Svp cet telephone exist deja !!"});
        Etudient.findOne({_id},(err,e)=>{
            if(err) return res.status(400).json({err});
            if(e.group!=group){
                Group.findOne({group},(err,g)=>{
                    if(err) return res.status(400).json({err});
                    if(g.nbrEtudient==0) return res.status(400).json({err:"SVP cet group est complet !!"});
                    else{
                        g.nbrEtudient=g.nbrEtudient-1;
                        g.save((err,g)=>{if(err) return res.status(400).json({err})})
                    }
                })
            }
            e.nom=nom;
            e.prenom=prenom;
            e.email=email;
            e.tel=tel;
            e.group=group;
            if(files.photo){
                e.photo.data=fs.readFileSync(files.photo.path);
                e.photo.contentType=files.photo.type;    
            }
            e.save((err,e)=>{
                if(err) return res.status(400).json({err});
                return res.json({msg:"Moddifier avec success"});
            })
        })
   
    })
}
exports.getimage=(req,res)=>{
    const _id=req.params.id;
    Etudient.findOne({_id},(err,e)=>{
        if(err) return res.status(400).json({err})
        const {data,contentType}=e.photo;
        res.set('contentType',contentType);
        return res.send(data);
    })
}
exports.getData1= async (req,res)=>{
const c=await Etudient.aggregate([{
        $group:{_id:"$group",count:{$sum:1}}
    },{
        $lookup:{
            from:"groups",
            foreignField:"_id",
            localField:"_id",
            as:"group"
        }
    }
]);
    
    return res.json({c});
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
        if(err) return res.status(400).json({err:err});
        return res.json({msg:"Message envoyer avec success !!"});
    })
}
