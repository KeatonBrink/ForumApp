const express = require('express');
const {User, Thread} = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();

//Tell your server to understand how to handle json
app.use(express.json());

//allow serving of UI code
app.use(express.static(`${__dirname}/../public`));

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
        return;
    }
});

app.post("/thread", async (req, res) => {
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    try {
        let thread = await Thread.create({
            user_id: req.user.id,
            name: req.body.name,
            description: req.body.description,
            category: req.body.category
        });
        res.status(201).json(thread);
    } catch (err) {
        res.status(500).json({message: "could not create thread", error: err,})
    }
    return;
})

app.get("/thread", async (req, res) => {
    let threads;
    try {
        threads = await Thread.find({}, "-posts");

        //Should have worked, but didn't
        // threads.forEach((indThread) => {
        //     // console.log(indThread.user_id);
        //     console.log(User.findById(indThread.user_id));
        //     indThread.originalPoster = User.findById(indThread.user_id)
        // })
        // res.json(threads);
    } catch(err) {
        console.log("Could not get threads. Error: ", err);
        res.status(500).json({
            message:"list request unfullfilled",
            error: err,
        });
        return;
    }
    for (let i in threads) {
        try {
            // console.log(i);
            threads[i] = threads[i].toObject();
            threads[i].user = await User.findById(threads[i].user_id, "-password");
        } catch(err) {
            console.log("Error with get thread: ", err);
            return;
        }
    }

    res.status(200).json(threads)
})

app.get("/thread/:id", async (req, res) => {
    let threadID = req.params.id
    let threadPosts;

    try {
        threadPosts = await Thread.findById(threadID)
        if (!threadPosts) {
            res.status(404).json({
                message: "Could not find thread",
            });
            return;
        }
    } catch(err) {
        res.status(500).json({
            message:"Could not find specific thread",
            error: err,
        });
        return;
    }


    try {
        threadPosts = threadPosts.toObject();
        threadPosts.user = await User.findById(threadPosts.user_id, "-password");
        // console.log("Username: ", threadPosts.user);
    } catch(err) {
        res.status(500).json({
            message:"Could not find user ID",
            error: err,
        });
        return;
    }
    //Add posts and such

    try {
        for (let i in threadPosts.posts){
            threadPosts.posts[i].user = await User.findById(threadPosts.posts[i].user_id, "-password")
        }
    } catch(err) {
        res.status(500).json({
            message: "Could not find post user ID",
            error: err,
        })
    }
    res.status(200).json(threadPosts);
});

app.delete("/thread/:id", async (req, res) => {
    let threadID = req.params.id;
    if(!req.user) {
        res.status(403).json({message: "unauthorized"});
        return;
    }
    let thread
    try {
        thread = await Thread.findById(threadID);
        if (!thread) {
            res.status(404).json({
                message: "Thread could not be found",
            })
            return;
        }
    } catch(err) {
        res.status(500).json({
            message: "Error finding thread",
            error: err,
        })
        return;
    }

    let threadUserId = thread.user_id
    if (threadUserId != req.user.id) {
        res.status(403).json({message: "unauthorized"});
        return;
    }

    try {
        thread = await Thread.findByIdAndDelete(threadID);
        if (!thread) {
            res.status(404).json({
                message: "Thread could not be found",
            })
            return;
        }
    } catch(err) {
        res.status(500).json({
            message: "Error finding thread",
            error: err,
        })
        return;
    }

    res.status(200).json(thread)
})

app.post("/post", async (req, res) => {
    if (!req.user) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }
    let thread;

    try {
        thread = await Thread.findByIdAndUpdate(
            req.body.thread_id,
            {
                $push: {
                    posts: {
                        user_id: req.user.id,
                        body: req.body.body,
                        thread_id: req.body.thread_id,
                    },
                }
            },

            //Return after changes are made
            {
                new: true,
            }
        )
        if (!thread) {
            res.status(404).json({
                message: "Thread not found"
            })
            return;
        }
    } catch(err) {
        res.status(500).json({
            message: "failed to insert post",
            error: err
        })
        return;
    }
    res.status(200).json(thread.posts)
})


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