const express = require('express');
const Router=express.Router();
const {hellow,getGroup,addEtudient,getAll,deletEtudient,updateEtudient,getimage,getData1,sendEmail}=require('../controllers/etudientController');
Router.get('/hellow',hellow);
Router.get('/getGroup/:niveau',getGroup);
Router.post('/add',addEtudient);
Router.post('/getAll/:skip',getAll);
Router.delete('/delete/:_id',deletEtudient);
Router.post('/update/:id',updateEtudient);
Router.get('/getimage/:id',getimage);
Router.get('/chart1',getData1);
Router.post('/sendEmail/:emailTo',sendEmail);
module.exports=Router;