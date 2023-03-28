const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server;

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

mongoose.connect(`${config.mongoose.url}`, config.mongoose.options).then(()=>{
  console.log('Connected to Database at', config.mongoose.url);
}).catch(()=>{
  console.log('Failed to connect');
})

app.listen(config.port, ()=>{
  console.log('Listening on port', config.port);
})
