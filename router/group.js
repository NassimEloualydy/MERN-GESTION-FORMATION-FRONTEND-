const express=require('express');
const Router=express.Router();
const {hellow,getFilier,addGroup,getall,deleteGroup,updateGroup,chart1,chart2}=require("../controllers/groupController");
Router.get('/hellow',hellow);
Router.get('/getFilier/:niveau',getFilier);
Router.post('/add',addGroup);
Router.post('/getall/:skip',getall);
Router.delete('/delete/:id',deleteGroup);
Router.post('/update/:id',updateGroup);
Router.get('/chart1',chart1);
Router.get('/chart2',chart2);
module.exports=Router;

