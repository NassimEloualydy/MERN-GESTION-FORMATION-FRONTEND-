const Formateur=require('../model/Formateur');
const Module=require('../model/module');
const joi=require('joi');
exports.hellow=(req,res)=>{
    return res.json({msg:"hellow"});
}
exports.getFormateur=(req,res)=>{
  Formateur.find().select("-photo").exec((err,f)=>{
     if(err) return res.status(400).json({err});
     return res.json({f});
  })
}
exports.addModule= async (req,res)=>{
    const {formateur,massHoraire, niveau, nom,objectif}=req.body;
    const schema=new joi.object({
      nom:joi.string().required().messages({"string.empty":"SVP le nom est obligatoire !!"}),
      formateur:joi.string().required().messages({'any.required':"SVP le formateur est obligatoire !!","string.empty":"SVP le formateur est obligatoire !!"}),
      niveau:joi.string().required().messages({'any.required':"SVP le niveau est obligatoire !!","string.empty":"SVP le niveau est obligatoire !!"}),
      objectif:joi.string().required().messages({'any.required':"SVP le objectif est obligatoire !!","string.empty":"SVP le objectif est obligatoire !!"}),
      massHoraire:joi.string().required().pattern(/\d/).messages({'any.required':"SVP la mass horaire est obligatoire !!","string.empty":"SVP la mass horaire est obligatoire !!","string.pattern.base":"SVP la mass horaire doit etre un chiffre"})
    });
    const {error}=schema.validate({formateur,massHoraire, niveau, nom,objectif});
    if(error) 
      return  res.status(400).json({err:error.details[0].message});
    const c = await Module.find().select().and([{nom},{formateur},{niveau}]);
    if(c.length!=0) 
       return res.status(400).json({err:"SVP cet module exist deja pour ce formateur !!"});
    const f=await Formateur.find({_id:formateur}).select();
    if(f[0].nbrHeur<massHoraire)
      return res.status(400).json({err:"SVP tu depasser le nombre des heure de cet formateur !!"});
      f[0].nbrHeur=f[0].nbrHeur-massHoraire;
      f[0].save((err,f)=>{if(err) return res.status(400).json({err})});
    const m=new Module({formateur,massHoraire, niveau, nom,objectif});
    m.save((err,m)=>{
      if(err) return res.status(400).json({err});
      return res.json({msg:"Ajouter avec success "});
    })
}
exports.getAll=(req,res)=>{
  const skip=req.params.skip;
  const {nom,formateur,niveau,objectif,massHoraire}=req.body;
  const searchQuery={};
  searchQuery.nom={$regex:'.*'+nom+'.*',$options:'i'};
  searchQuery.niveau={$regex:'.*'+niveau+'.*',$options:'i'};
  searchQuery.objectif={$regex:'.*'+objectif+'.*',$options:'i'};
  searchQuery.massHoraire={$regex:'.*'+massHoraire+'.*',$options:'i'};
  
  Module.find(searchQuery).populate([{
       path:"formateur",
       model:"Formateur",
       select:["nom","prenom","email","tel"]
  }]).select().limit(5).skip(skip).exec((err,m)=>{
    if(err){
      return res.status(400).json({err});
    }
    return res.json({m});
  })
}
exports.deleteModule= async (req,res)=>{
  const _id=req.params.id;
  Module.findOne({_id}, async (err,m)=>{
    if(err) return res.status(400).json({err});
    const f=await Formateur.find({_id:m.formateur._id}).select();
    f[0].nbrHeur=f[0].nbrHeur+m.massHoraire;
    f[0].save((err,f)=>{if(err) return res.status(400).json({err})});
    m.remove((err,m)=>{
    if(err) return res.status(400).json({err});
    return res.json({msg:"Supprimer avec success !!"});
    });
  })
}
exports.updateModule= async (req,res)=>{
  const _id=req.params.id;
  const {formateur,massHoraire, niveau, nom,objectif}=req.body;
  const schema=new joi.object({
    nom:joi.string().required().messages({"string.empty":"SVP le nom est obligatoire !!"}),
    formateur:joi.string().required().messages({'any.required':"SVP le formateur est obligatoire !!","string.empty":"SVP le formateur est obligatoire !!"}),
    niveau:joi.string().required().messages({'any.required':"SVP le niveau est obligatoire !!","string.empty":"SVP le niveau est obligatoire !!"}),
    objectif:joi.string().required().messages({'any.required':"SVP le objectif est obligatoire !!","string.empty":"SVP le objectif est obligatoire !!"}),
    massHoraire:joi.string().required().pattern(/\d/).messages({'any.required':"SVP la mass horaire est obligatoire !!","string.empty":"SVP la mass horaire est obligatoire !!","string.pattern.base":"SVP la mass horaire doit etre un chiffre"})
  });
  const {error}=schema.validate({formateur,massHoraire, niveau, nom,objectif});
  if(error) 
    return  res.status(400).json({err:error.details[0].message});
  const c = await Module.find().select().and([{_id:{$ne:_id}},{nom},{formateur},{niveau}]);
    if(c.length!=0) 
       return res.status(400).json({err:"SVP cet module exist deja pour ce formateur !!"});

  const m=await Module.find({_id}).select();
  const f=await Formateur.find({_id:formateur}).select();
  if(parseInt(f[0].nbrHeur)+parseInt(m[0].massHoraire)<=parseInt(massHoraire))
      return res.status(400).json({err:"SVP tu depasser le nombre des heure de cet formateur !!"});
      f[0].nbrHeur=f[0].nbrHeur-massHoraire;
      f[0].save((err,f)=>{if(err) return res.status(400).json({err})});
  m[0].nom=nom;
  m[0].formateur=formateur;
  m[0].niveau=niveau;
  m[0].objectif=objectif;
  m[0].massHoraire=massHoraire;
  m[0].save((err,m)=>{
    if(err) 
    return res.status(400).json({err})
    return res.json({msg:"Moddifier avec success !!"});
  })
}
exports.chart1= async (req,res)=>{
   const c=await Module.aggregate([{
    $group:{_id:"$formateur",count:{$sum:1}}
   },
   {
     $lookup:{
      from :"formateurs",
      localField:"_id",
      foreignField:"_id",
      as:"formateur"
     }   
   }
  ]);
   return res.json({c});
}
exports.chart2= async (req,res)=>{
 const c=await Module.aggregate([{
    $group:{_id:"$niveau",count:{$sum:1}}
 }]);
 return res.json({c});

}