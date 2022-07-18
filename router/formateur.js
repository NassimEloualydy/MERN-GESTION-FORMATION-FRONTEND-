const express=require('express');
const Router=express.Router();
const {hellow,addEtudient,getAll,getimage,deleteFotmateur,updateFormateur,sendEmail}=require('../controllers/formateurController');
Router.get('/hellow',hellow);
Router.post('/add',addEtudient);
Router.post('/getAll/:skip',getAll);
Router.get('/getimage/:_id',getimage);
Router.delete('/delete/:id',deleteFotmateur);
Router.post('/update/:id',updateFormateur);
Router.post('/sendEmail/:emailTo',sendEmail);
module.exports=Router;
