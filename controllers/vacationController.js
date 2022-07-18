const Module = require('../model/module');
const Group = require('../model/group');
const Vacation=require('../model/vacation');
const joi=require('joi');
exports.hellow=(req,res)=>{
    return res.json({msg:"Hellow"});
}
exports.loadeModules=(req,res)=>{
  Module.find().populate([{
    path:"formateur",
    model:"Formateur",
    select:["nom","prenom"]
  }]).select().exec((err,m)=>{
    if(err) return res.status(400).json({err});
    return res.json({m});
  });
}
exports.getGroup=(req,res)=>{
    const _id=req.params.module;
    Module.findOne({_id},(err,m)=>{
        if(err) return res.status(400).json({err});
        Group.find({niveau:m.niveau}).select().exec((err,g)=>{
        if(err) return res.status(400).json({err});
            return res.json({g});
        })
    })
}
exports.addVacation= async (req,res)=>{
 const {date,nbrHeure,module,group}=req.body;
 const schema=new joi.object({
  date:joi.string().pattern(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/).messages({'any.required':"SVP le nombre des heure est obligatoire !!","string.empty":"SVP la date est obligatoire !!","string.pattern.base":"svp la format de la date est incorrecte !!"}),
  nbrHeure:joi.string().pattern(/\d/).messages({'any.required':"SVP le nombre des heure est obligatoire !!","string.empty":"SVP le nombre des heure est obligatoire !!","string.pattern.base":"svp lo nombre des heur doit etre un chiffre !!"}),
  module:joi.string().messages({'any.required':"SVP le module des heure est obligatoire !!","string.empty":"SVP le module des heure est obligatoire !!"}),
  group:joi.string().messages({'any.required':"SVP le group des heure est obligatoire !!","string.empty":"SVP le group des heure est obligatoire !!"})
 });
 const {error}=schema.validate({date,nbrHeure,module,group});
 if(error)
  return res.status(400).json({err:error.details[0].message});
 const m=await Module.find({_id:module}).select();
 const ttV=await Vacation.find({module}).select();
 var i=0;
 for(const d of ttV){
     i=i+parseInt(d.nbrHeure);
}
    
 if(parseInt(m[0].massHoraire)<parseInt(nbrHeure)+i)
 return res.status(400).json({err:"SVP tu deppaser la mass horaire corespendent a ce module !"});
 const v=new Vacation();
 v.nbrHeure=nbrHeure;
 v.module=module;
 v.group=group;
 v.date=date;
 v.save((err,v)=>{
    if(err) return res.status(400).json({err});
    return res.json({msg:"Vacation Ajouter avec success !!"});
 })
}
exports.getAll= async (req,res)=>{
    const {date,nbrHeure, module,group}=req.body;
    console.log({date,nbrHeure, module,group});
    const skip=req.params.skip;
    const v=await Vacation.aggregate([
        {
        $lookup:{
            from:"modules",
            localField:"module",
            foreignField:"_id",
            as:"module"
        }       
    },
    {
    $lookup:{
        from:"groups",
        localField:"group",
        foreignField:"_id",
        as:"group"
    }
},
{
    $lookup:{
        from:"formateurs",
        localField:"module.formateur",
        foreignField:"_id",
        as:"formateur"
    }
}
    ,{
        $project:{
            "_id":1,
            "nbrHeure":1,
            "date":1,
            "module._id":1,
            "module.nom":1,
            "module.niveau":1,
            "module.massHoraire":1,
            "module.objectif":1,
            "formateur._id":1,
            "formateur.nom":1,
            "formateur.prenom":1,
            "formateur.email":1,
            "formateur.tel":1,
            "group._id":1,
            "group.nom":1,
            "group.annee":1,
            "group.nbrEtudient":1,
        }
    },
    {
        $match:{
            "nbrHeure":{$regex:'.*'+nbrHeure+'.*',$options:'i'},
            "date":{$regex:'.*'+date+'.*',$options:'i'},
            "module.nom":{$regex:'.*'+module+'.*',$options:'i'},
            "group.nom":{$regex:'.*'+group+'.*',$options:'i'}
        }
    },
    {
        $skip:parseInt(skip)
    },
    {
        $limit:5
    }

]); 
return res.json({v});
}
exports.deleteVacation= async (req,res)=>{
    const _id=req.params.id;
    Vacation.findOne({_id},async(err,v)=>{
        if(err) return res.status(400).json({err});
        v.remove((err,v)=>{
        if(err) return res.status(400).json({err});
            return res.json({msg:"Supprimer avec success !!"});
        });
        
    })
}
exports.updateVacation= async (req,res)=>{
    const _id=req.params.id;
    const {date,nbrHeure, module,group}=req.body;
    Vacation.findOne({_id}, async (err,v)=>{
        if(err) return res.status(400).json({err});
        const m=await Module.find({_id:module}).select();
        const ttV=await Vacation.find({module}).select();
        var i=0;
        for(const d of ttV){
            i=i+parseInt(d.nbrHeure);
       }
           
        if(parseInt(m[0].massHoraire)<parseInt(nbrHeure)+i && module!=v.module)
        return res.status(400).json({err:"SVP tu deppaser la mass horaire corespendent a ce module 1!"});
        let j=i-parseInt(v.nbrHeure)+parseInt(nbrHeure);
        if(parseInt(m[0].massHoraire)<j && module==v.module)
        return res.status(400).json({err:"SVP tu deppaser la mass horaire corespendent a ce module 2!"+m[0].massHoraire});
        
        v.nbrHeure=nbrHeure;
        v.module=module;
        v.group=group;
        v.date=date;
        v.save((err,v)=>{
           if(err) return res.status(400).json({err});
           return res.json({msg:"Vacation Moddifier avec success !!"});
        });            
    })   
}
exports.chart1= async (req,res)=>{
    const c=await Vacation.aggregate([
        {
            $group:{
                _id:"$module",count:{$sum:1}
            }
        },{
            $lookup:{
                from:"modules",
                localField:"_id",
                foreignField:"_id",
                as:"module"
            }
        }
    ]);
    return res.json({c});
}
exports.chart2= async (req,res)=>{
    const c=await Vacation.aggregate([
        {
            $group:{
                _id:"$group",count:{$sum:1}
            }
        },{
            $lookup:{
                from:"groups",
                localField:"_id",
                foreignField:"_id",
                as:"group"
            }
        }
    ]);
    return res.json({c});
}