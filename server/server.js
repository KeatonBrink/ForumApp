//Connecting all required files
const express = require('express');
const {User, Thread} = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();

/*
Check authenticated
Check authorized
Perform action
*/

//Tell your server to understand how to handle json
app.use(express.json());

//allow serving of UI code
app.use(express.static(`${__dirname}/../public`));

setUpSession(app);
setUpAuth(app);


//This should probably go in another file
//Interval will close threads after a certain time (50s)
const closeInterval = setInterval(closeTimer, 10000);


async function closeTimer() {
    let curDate = new Date()
    try {
        threads = await Thread.find();
        for (let i in threads) {
            console.log("Looking at thread: ", i, " Here is the number for comparison: ", curDate.getTime() - threads[i].updatedAt.getTime());
            if ((curDate.getTime() - threads[i].updatedAt.getTime() > 5000000) && threads[i].isClosed != true) {
                try {
                    await Thread.findByIdAndUpdate(
                        threads[i]._id,
                        {isClosed: true},
                    )
                    console.log("The thread has been modified: ", threads[i]._id)
                } catch(err) {
                    console.log(err, "failed to change close post");
                }
            }
        }
    } catch(err) {
        console.log("Could not find all threads to for closing", err);
    }
}

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

//Allows the post of thread
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

app.patch("/thread/:threadid/:closeIt", async (req, res) => {
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let thread;
    try {
        thread = await Thread.findById(req.params.threadid);
        console.log(thread.user_id, " ", req.user.id)
        if (thread.user_id != req.user.id) {
            res.status(403).json({
                message: "The user is not owner of thread"
            })
            return;
        }
    } catch(err) {
        res.status(404).json({
            message: "Thread could not be found",
            error: err,
        })
        return;
    }
    try {
        thread = await Thread.findByIdAndUpdate(
            req.params.threadid,
            {isClosed: req.params.closeIt},

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
            message: "failed to change close/open post",
            error: err
        })
        return;
    }
    res.status(200).json(thread)
})

//Gets all threads without posts
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

//Get thread by id
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

//Delete thread by id
app.delete("/thread/:id", async (req, res) => {
    let threadID = req.params.id;
    //Check authentication
    if(!req.user) {
        res.status(403).json({message: "unauthorized"});
        return;
    }
    let thread
    //Find thread
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

    //Check ownership
    let threadUserId = thread.user_id
    if (threadUserId != req.user.id) {
        res.status(403).json({message: "unauthorized"});
        return;
    }

    //Delete thread
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

//Post a post to a thread
app.post("/post", async (req, res) => {
    if (!req.user) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }
    let thread;
    try {
        thread = await Thread.findById(req.body.thread_id);
        if (thread.isClosed == true) {
            res.status(403).json({
                message: "The thread is closed"
            })
            return;
        }
    } catch(err) {
        res.status(404).json({
            message: "The Thread could not be found"
        })
        return;
    }
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

//Delete a post from a thread
app.delete("/thread/:threadid/post/:postid", async (req, res) => {
    let threadID = req.params.threadid;
    let postID = req.params.postid;
    //Check authentication
    if(!req.user) {
        res.status(403).json({message: "unauthorized"});
        return;
    }

    let thread;
    //Find thread
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
    let index = -1;
    let post;
    //For loop to verify the post can be delted by the user
    for (let i in thread.posts) {
        //Find the post
        if (thread.posts[i]._id == postID) {
            //index = -2 for error message check
            index = -2
            //Ensure correct user id
            if(req.user.id == thread.posts[i].user_id) {
                //Commit the post index to be deleted
                post = thread.posts[i];
                index = i;
            }
        }
    }
    if (index == -1) {
        res.status(404).json({
            message: "Post could not be found"
        })
        return;
    } else if (index == -2) {
        res.status(403).json({
            message: "This user is not the author of the post"
        })
        return;
    }

    let delThread;
    try {
        delThread = await Thread.findByIdAndUpdate(threadID, {
            $pull: {
                posts: {
                    _id: postID,
                }
            },
        },
        )
    } catch(err) {
        res.status(500).json({
            message: "Could not find and delete",
            error: err,
        })
        return;
    }

    // Return deleted post
    res.status(200).json(post);
})



module.exports = app;
