const express=require('express');
const Filier=require('../model/filier');
const joi=require('joi');
const filier = require('../model/filier');
exports.hellow=(req,res)=>{
    return res.json({msg:"Hellow filier"});
}
exports.addFilier= async (req,res)=>{
    const {nom,niveau,nbrEtudientMax,nbrAnnee}=req.body;
    const schema=new joi.object({
        nom:joi.string().required().messages({"any.required":"SVP le nom est obligatoire !!","string.empty":"SVP le nom doit pas etre vide !!"}),
        niveau:joi.string().required().messages({"any.required":"SVP le niveau est obligatoire !!","string.empty":"SVP le niveau doit pas etre vide !!"}),
        nbrEtudientMax:joi.string().pattern(/\d/).messages({"any.required":"SVP le nombre des etudient est obligatoire !!","string.empty":"svp le nombre des etudient doit pas etre vide !!","string.pattern.base":"SVP le nombre des etudient doit etre un chiffre !!"}),        
        nbrAnnee:joi.string().pattern(/\d/).messages({"any.required":"SVP le nombre des Annee est obligatoire !!","string.empty":"svp le nombre des Annee doit pas etre vide !!","string.pattern.base":"SVP le nombre des annee doit etre un chiffre !!"})        
    })
    const {error}=schema.validate(req.body);
    if(error){
        return res.status(400).json({err:error.details[0].message});
    }
    const c=await Filier.find().select().and([{nom,niveau}]);
    if(c.length!=0){
        return res.status(400).json({err:"SVP cet filier exist deja !!"});
    }
    const F=new Filier(req.body);
    F.save((err,f)=>{
        if(err){
            return res.status(400).json({err})
        }
        return res.json({msg:"Ajouter avec success !!"});
    })
}
exports.getall= async (req,res)=>{
    var skip=req.params.skip;
    const {nom,niveau,nbrEtudientMax,nbrAnnee}=req.body;
    const searchQuery={};
    searchQuery.nom={$regex:".*"+nom+".*",$options:"i"};
    searchQuery.niveau={$regex:".*"+niveau+".*",$options:"i"};
    searchQuery.nbrEtudientMax={$regex:".*"+nbrEtudientMax+".*",$options:"i"};
    searchQuery.nbrAnnee={$regex:".*"+nbrAnnee+".*",$options:"i"};

    var c=await Filier.find().select().count();
    Filier.find(searchQuery).select().limit(5).skip(skip).sort([["createdAt","desc"]]).exec((err,f)=>{
        if(err) 
        return res.status(400).json({err});
        return res.json({f});
    })
}
exports.deleteFilier=(req,res)=>{
    const _id=req.params.id;
    Filier.findOne({_id},(err,f)=>{
        if(err){
            return res.status(400).json({err});
        }
        f.remove((err,f)=>{
            if(err){
                return res.status(400).json({err});
            }
            return res.json({msg:"Supprimer avec success !!"});   
        });
    })
}
exports.updateFilier= async (req,res)=>{
    const _id=req.params.id;
    const {nom,niveau,nbrEtudientMax,nbrAnnee}=req.body;
    const c=await Filier.find().select().and([{_id:{$ne:_id}},{nom},{niveau}]);
    if(c.length!=0){
        return res.status(400).json({err:"SVP cet filier exist deja !!"});
    }
    Filier.findOne({_id},(err,f)=>{
        if(err){
            return res.status(400).json({err});
        }
        f.nom=nom;
        f.nbrEtudientMax=nbrEtudientMax;
        f.niveau=niveau;
        f.nbrAnnee=nbrAnnee;
        f.save((err,f)=>{
            if(err){
                return res.status(400).json({err});
            }
            return res.json({msg:"Moddifier Avec success !!"});                
        })
    })
}
exports.search=(req,res)=>{
    const {nom,niveau,nbrEtudientMax,nbrAnnee}=req.body;
    const searchQuery={};
    const skip=req.params.skip;
    searchQuery.nom={$regex:".*"+nom+".*",$options:"i"};
    searchQuery.niveau={$regex:".*"+niveau+".*",$options:"i"};
    searchQuery.nbrEtudientMax={$regex:".*"+nbrEtudientMax+".*",$options:"i"};
    searchQuery.nbrAnnee={$regex:".*"+nbrAnnee+".*",$options:"i"};
    Filier.find(searchQuery).select().limit(5).skip(skip).exec((err,f)=>{
     if(err) return res.status(400).json({err});
    return res.json({f});
    })
}
exports.nbrEtudient=(req,res)=>{
    Filier.find().select("nbrEtudientMax").exec((err,f)=>{
        if(err) return res.status(400).json({err});
        return res.json({f});
    })
}
exports.distinctFilier=(req,res)=>{
    Filier.find().select().distinct("nom").exec((err,f)=>{
        if(err) return res.status(400).json({err});
        return res.json({f})
    })
}
exports.totaleFilier=(req,res)=>{
    Filier.find().select().exec((err,f)=>{
        if(err) return res.status(400).json({err});
        return res.json({f});
    })
}