//Connects to mongoose
const mongoose = require('mongoose')
const db = mongoose.connection;

async function connect(user, pass){
    //mongoose.set("useCreateIndex", true);
    try {
        // await mongoose.connect(`mongoose://${user}:${pass}@${host}:${port}/${db_name}`, {
        await mongoose.connect(`mongodb+srv://${user}:${pass}@cluster0.tdfgs.mongodb.net/?retryWrites=true&w=majority`, {
        // await mongoose.connect(`mongodb+srv://keatonbrinkerhoff:keatonbrinkerhoff@cluster0.tdfgs.mongodb.net/?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    } catch (err) {
        console.log("Error connecting to mongoose: ", err);
        throw "Mongo could not connect";
    }
}

async function onConnect (callback) {
    db.once("open", ()=>{
        console.log("Server connection open");
        callback();
    })
}

module.exports = {
    connect,  
    onConnect,
}