const Filier=require('../model/filier');
const Group=require('../model/group');
const joi=require('joi');
exports.hellow=(req,res)=>{
    return res.json({msg:"hellow"});
}
exports.getFilier= async (req,res)=>{
    const niveau= await req.params.niveau;
    await Filier.find({niveau:niveau}).select().exec((err,f)=>{
        if(err) 
        return res.status(400).json({err:err});
        return res.json({f});
    })
}
exports.addGroup= async (req,res)=>{
const {annee,filier,nbrEtudient,niveau,nom}=req.body;
const schema=new joi.object({
    nom:joi.string().required().messages({"any.required":`SVP le nom  est obligatoire !!`,"string.empty":`SVP le nom doit pas etre vide !!`}),
    annee:joi.string().pattern(/\d/).required().messages({"any.required":`SVP l'annee est obligatoire !!`,"string.empty":`SVP l'annee doit pas etre vide !!`,"string.pattern.base":`SVP l'annee doit etre un chiffre !!`}),
    nbrEtudient:joi.string().pattern(/\d/).required().messages({"any.required":`SVP le nombre des etudient est obligatoire !!`,"string.empty":`SVP le nombre des etudient doit pas etre vide !!`,"string.pattern.base":`SVP le nombre des etudient doit etre un chiffre !!`}),
    niveau:joi.string().required().messages({"any.required":`SVP le niveau des etudient est obligatoire !!`,"string.empty":`SVP le niveau des etudient doit pas etre vide !!`}),
    filier:joi.string().required().messages({"any.required":`SVP la filier est obligatoire !!`,"string.empty":"SVP la filier doit pas etre vide !!"})
});
const {error}=schema.validate({annee,filier,nbrEtudient,niveau,nom});
if(error)
 return res.status(400).json({err:error.details[0].message});
let c=await Group.find().select().and([{nom},{filier},{niveau}]);
if(c.length!=0)
 return res.status(400).json({err:"SVP cet group exist deja !!"});
Filier.findOne({filier},(err,f)=>{
    if(err) return res.status(400).json({err});
    if(f.nbrEtudientMax<nbrEtudient)
     return res.status(400).json({err:"SVP le group est depacer le nombre maxiamle de la filier specifier !!"});
     else{
         f.nbrEtudientMax=f.nbrEtudientMax-nbrEtudient;
         f.save((err,f)=>{
            if(err) return res.status(400).json({err})
         })       
     }
});
let g=new Group(req.body);
g.save((err,g)=>{
    if(err) 
    return res.status(err).json({err});
    return res.json({msg:"Ajouter Avec succes !!"});
})
}
exports.getall=(req,res)=>{
    const skip=req.params.skip;
    const {annee,filier,nbrEtudient,niveau,nom}=req.body;
    const searchQuery={};
    searchQuery.annee={$regex:'.*'+annee+'.*',$options:'i'};
    searchQuery.nbrEtudient={$regex:'.*'+nbrEtudient+'.*',$options:'i'};
    searchQuery.annee={$regex:'.*'+annee+'.*',$options:'i'};
    searchQuery.niveau={$regex:'.*'+niveau+'.*',$options:'i'};
    searchQuery.nom={$regex:'.*'+nom+'.*',$options:'i'};
    Group.find(searchQuery).populate([{
        path:"filier",
        model:"Filier",
        select:["nom","nbrEtudientMax","nbrAnnee"],
        match:{
            nom:{$regex:'.*'+nom+'.*',$options:'i'}
        }
    }]).select().limit(5).skip(skip).exec((err,g)=>{
        if(err) return res.status(400).json({err});
        return res.json({g});
    })
}
exports.deleteGroup=(req,res)=>{
    const _id=req.params.id;
    Group.findOne({_id},(err,g)=>{
        if(err)
          return res.status(400).json({err});
        g.remove((err,g)=>{
            if(err) return res.status(400).json({err});
            return res.json({msg:"Supprimer avec success !!"});
        })
    })
}
exports.updateGroup= async (req,res)=>{
    const _id=req.params.id;
    const {annee,filier,nbrEtudient,niveau,nom}=req.body;
    const schema=new joi.object({
        nom:joi.string().required().messages({"any.required":`SVP le nom  est obligatoire !!`,"string.empty":`SVP le nom doit pas etre vide !!`}),
        annee:joi.string().pattern(/\d/).required().messages({"any.required":`SVP l'annee est obligatoire !!`,"string.empty":`SVP l'annee doit pas etre vide !!`,"string.pattern.base":`SVP l'annee doit etre un chiffre !!`}),
        nbrEtudient:joi.string().pattern(/\d/).required().messages({"any.required":`SVP le nombre des etudient est obligatoire !!`,"string.empty":`SVP le nombre des etudient doit pas etre vide !!`,"string.pattern.base":`SVP le nombre des etudient doit etre un chiffre !!`}),
        niveau:joi.string().required().messages({"any.required":`SVP le niveau des etudient est obligatoire !!`,"string.empty":`SVP le niveau des etudient doit pas etre vide !!`}),
        filier:joi.string().required().messages({"any.required":`SVP la filier est obligatoire !!`,"string.empty":"SVP la filier doit pas etre vide !!"})
    });
    const {error}=schema.validate({annee,filier,nbrEtudient,niveau,nom});
    if(error)
     return res.status(400).json({err:error.details[0].message});
    
    let c= await Group.find().select().and([{_id:{$ne:_id}},{nom},{filier},{niveau}]);
    if(c.length!=0)
      return res.status(400).json({err:"SVP cet group exist deja !!"});
    Group.findOne({_id},(err,g)=>{
        if(err)
          return res.status(400).json({errr:err});
        g.annee=annee;
        g.filier=filier;
        g.nbrEtudient=nbrEtudient;
        g.niveau=niveau;
        g.nom=nom;
        g.save((err,g)=>{
            if(err) return res.status(400).json({errr:err});
            return res.json({msg:"Moddifier Avec success !!"});
        })
    })
}
exports.chart1= async (req,res)=>{
   const f=await Group.aggregate([{
      $group:{_id:"$filier",count:{$sum:1}}
   }
   ,
   {
      $lookup:{
        from:"filiers",
        localField:"_id",
        foreignField:"_id",
        as:"filier"
      }
   }
])    
return res.json({f});
}
exports.chart2= async (req,res)=>{
    const f=await Group.aggregate([{
        $group:{_id:"$annee",count:{$sum:1}}
    }
    // ,{
    //     $lookup:{from:}
    // }
]);
return res.json({f});
}

