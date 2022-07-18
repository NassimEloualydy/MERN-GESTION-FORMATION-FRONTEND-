const express=require('express');
const Router=express.Router();
const {hellow,connexion,inscrire,quitter,getImage,getcompt,updateAdmin}=require('../controllers/adminController');
Router.get('/hellow',hellow);
Router.post('/connexion',connexion);
Router.post('/inscrire',inscrire);
Router.get('/quitter',quitter);
Router.get('/getimage/:id',getImage);
Router.get('/getcompt/:id',getcompt);
Router.post('/update/:id',updateAdmin);
module.exports=Router;