const mongoose = require("mongoose");

//All database types need a schema with appropriate fields
const postSchema = mongoose.Schema (
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        body: {type: String, required: true, default: ""},
        thread_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
            required: true,
        },
    },
    {timestamps: true}
);

const threadSchema = mongoose.Schema (
    {
    user_id: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User",
        required: true,

    },
    name: {type: String, required: true, default: ""},
    description: {type: String, required: true, default: ""},
    category: {type: String, required: true, default: []},
    isClosed: {type: Boolean, required: true, default: false},
    posts: { type: [postSchema], required: true, default: []},
    },
    {timestamps: true}
)

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: {type: String, required: true},
    password: {type: String, required: true}
});

//These schemas can be used to create models with a specified type
const User = mongoose.model("User", userSchema);
const Thread = mongoose.model("Thread", threadSchema)

//Export these models fosho
module.exports = {
    User,
    Thread,
}