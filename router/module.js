const express=require('express');
const Router=express.Router();
const {hellow,getFormateur,addModule,getAll,deleteModule,updateModule,chart1,chart2}=require('../controllers/moduleController');
Router.get('/hellow',hellow);
Router.get('/getFormateur',getFormateur);
Router.post('/submit',addModule);
Router.post('/getAll/:skip',getAll);
Router.delete('/delete/:id',deleteModule);
Router.post('/update/:id',updateModule);
Router.get('/chart1',chart1);
Router.get('/chart2',chart2);
module.exports=Router;