const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'})

process.on('uncaughtException', err =>{
    console.log("Uncaught Exception, Shutting down...");
    console.log(err.name,err.message)
    process.exit(1);
})


const app = require('./app');
const port = process.env.PORT || 3000;

const DB = process.env.DB;
mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true, 
    useFindAndModify: false,
    useUnifiedTopology: true 
}).then(() => console.log('DB connection established'))

 
const server = app.listen(port,()=>{
    console.log('listening on port '+ port);
}) 
process.on('unhandledRejection',(err)=>{
console.log("Unhandled rejection, Shutting down...");
console.log(err.name,err.message)
server.close(()=>{
    process.exit(1);
})
})


