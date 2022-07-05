const express = require('express');
const {User} = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();

//Tell your server to understand how to handle json
app.use(express.json());

//allow serving of UI code
app.use(express.static(`${__dirname}/public`));

setUpSession(app);
setUpAuth(app);


//How the backend handles a create user request
app.post("/user", async (req, res) => {
    try {
        let user = await User.create({
            username: req.body.username,
            fullname: req.body.fullname,
            // Very bad, the password should be encrypted
            password: req.body.password,
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: `post request failed, create better user`,
            error: err,
        });
    }
});

module.exports = app;

/*
mondule.exports ={
    mongo_user: "new_user",
    mongo_pass: "password",
    mongo_port: 27018,
    mongo_port: ,
    mongo_db: ,
}
*/