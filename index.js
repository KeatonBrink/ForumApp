const app = require("./server/server.js");
const {connect, onConnect} = require("./persist/connect");
//This file is missing for security reasons
const config = require("./config")

onConnect(() => {
    app.listen(8080, () => {
        console.log("serving on port 8080");
    });    
})

try{
    //I should really set this up to pass in a password
    connect(config.mongo_user, config.mongo_pass);
    // connect();
} catch (err) {
    console.log(err);
    throw "couldn't connect";
}