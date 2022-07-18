const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const adminRouter=require('./router/admin');
const filierRouter=require("./router/filier");
const groupRouter=require('./router/group');
const etudientRouter=require('./router/etudient');
const formateurRouter=require('./router/formateur');
const moduleRouter=require('./router/module');
const vacationRouter=require('./router/vacation');
const cookieParser=require('cookie-parser');
require('dotenv').config();
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/API/admin",adminRouter);
app.use("/API/filier",filierRouter);
app.use('/API/group',groupRouter);
app.use('/API/vacation',vacationRouter);
app.use('/API/etudient',etudientRouter);
app.use('/API/formateur',formateurRouter);
app.use('/API/module',moduleRouter);
const PORT =process.env.PORT || 5000;

mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
 console.log("Connected");
}).catch(err=>{console.log(err)});
app.listen(PORT,()=>{
    console.log(`server running on port  ${PORT}`)
});
