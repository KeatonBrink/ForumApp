const URL = "https://forum2022.codeschool.cloud";

var app = new Vue({
    el: "#app",
    data: {
        //Variables here
        loginEmail: "",
        loginPassWord: "",
        newFullName: "",
        newEmail: "",
        newPassWord: "",
        hasEmptyField: 0,
        curPage: 1,
        loginFailed: 0,
        creationFailed: 0,
        hasFailedThread: 0,
        threads: [],
        threadPosts: [],
        newThreadName: "",
        newDescription: "",
        newCategory: "",
        newPost: "",
        hasFailedPost: 0,
    },
    methods: {
        //functions here
        //GET /session - Ask the server if we are logged in
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                method: 'GET',
                //Absolutely needed for every fetch request
                credentials: "include"
            });
            //Are we logged in?
            if(response.status == 200){
                //Logged in
                console.log("logged in");
                let data = await response.json()
                console.log(data);
                this.curPage = 3;
                this.getThreads();
            } else if (response.status == 401) {
                //Not logged in
                console.log ("Not logged in")
                let data = await response.json()
                console.log(data);
            } else {
                console.log("Some sort of error when GET /session: ", response.status, response);
            }
        },
        //POST /session - Attempt to login
        postSession: async function () {
            this.emptyFields();
            let loginCredentials = {
                username: this.loginEmail, 
                password: this.loginPassWord
            };
            let response = await fetch(URL + "/session", {
                method: "POST",
                body: JSON.stringify(loginCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();

            //Check for successful login
            if (response.status == 201) {
                //Succesful login
                console.log("Successful login attempt");
                this.loginFailed = 0;
                this.loginPassWord = "";
                this.loginEmail = "";
                this.curPage = 3;
                getThreads();
            } else if (response.status == 401) {
                this.loginFailed = 1;
                console.log ("Unsuccesful login attempt")
                this.loginPassWord = "";
            } else {
                this.loginFailed = 1;
                console.log("Some sort of error when POST /session");
            }
        },
        postUser: async function () {
            this.emptyFields();
            let User = {
                username: this.newEmail, 
                password: this.newPassWord,
                fullname: this.newFullName
            };
            let response = await fetch(URL + "/user", {
                method: "POST",
                body: JSON.stringify(User),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();

            //Check for successful creation
            if (response.status == 201) {
                //Succesful creation
                this.curPage = 1;
                console.log("Successful user attempt");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful user creation attempt")
            } else {
                console.log("Some sort of error when POST /user");
            }
            if (this.newEmail.slice(this.newEmail.length - 4) != ".com") {
                this.creationFailed = 1;
                console.log("not a legit email")
                return;
            } else {
                this.creationFailed = 0;
            }
        },

        //GET threads
        getThreads: async function () {
            let response = await fetch(URL + "/thread", {
                //Never put body in get request
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            
            //Parse response data
            let body = await response.json();
            console.log(body);  
            console.log(response);

            //Check for successful creation
            if (response.status == 200) {
                //Succesful creation
                this.threads = body;
                console.log("Successful thread get");
                this.curPage = 3;
            } else if (response.status >= 400) {
                console.log ("Unsuccesful get threads")
            } else {
                console.log("Some sort of error when GET /thread");
            }
        },


        //GET thread posts
        getThreadPosts: async function (threadID) {
            let response = await fetch(URL + "/thread/" + threadID, {
                //Never put body in get request
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            
            //Parse response data
            let body = await response.json();

            //Check for successful creation
            if (response.status == 200) {
                //Succesful creation
                this.threadPosts = body;
                console.log("Successful thread get");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful get threads")
            } else {
                console.log("Some sort of error when GET /thread");
            }
        },


        //Post user thread
        postThread: async function () {
            if (this.newThreadName == "" || this.newDescription == "" || this.newCategory == "") {
                this.hasFailedThread = 1;
                return;
            }
            let Thread = {
                name: this.newThreadName, 
                description: this.newDescription,
                category: this.newCategory
            };
            let response = await fetch(URL + "/thread", {
                method: "POST",
                body: JSON.stringify(Thread),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();

            //Check for successful creation
            if (response.status >= 200 && response.status < 300) {
                //Succesful creation
                this.curPage = 3;
                this.hasFailedThread = 0;
                this.newCategory = "";
                this.newDescription = "";
                this.newThreadName = "";
                console.log("Successful user attempt");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful user creation attempt")
                this.hasFailedThread = 1;
            } else {
                console.log("Some sort of error when POST /user");
            }
        },

        delThread: async function (threadID) {
            let response = await fetch(URL + "/thread/" + threadID, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();

            //Check for successful creation
            if (response.status >= 200 && response.status < 300) {
                //Succesful creation
                console.log("Successful thread delete");
                this.getThreads();
            } else if (response.status >= 400) {
                console.log ("Unsuccesful thread delete")
            } else {
                console.log("Some sort of error when DELETE /thread/ID");
            }
        },

        postThreadPost: async function (threadID) {
            console.log("Thread ID in postThreadPost()", threadID);

            if (this.newPost == "") {
                console.log("Post entry is blank")
                this.hasFailedPost = 1;
                return;
            }

            let Post = {
                "body": this.newPost,
                "thread_id": this.threadID
            }
            let response = await fetch(URL + "/post", {
                method: "POST",
                body: JSON.stringify(Post),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();
            console.log("Body of postThreadPost: ", body);

            //Check for successful creation
            if (response.status >= 200 && response.status < 300) {
                //Succesful creation
                this.curPage = 4;
                this.hasFailedPost = 0;
                this.newPost= "";
                this.getThreadPosts(threadID);
                console.log("Successful user attempt");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful user post post")
                this.hasFailedPost = 1;
            } else {
                console.log("Some sort of error when POST /user");
                this.hasFailedPost = 1;
            }
        },

        delThreadPost: async function (threadID, postID) {
            let response = await fetch(URL + "/thread/" + threadID + "/post/" + postID, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Check for successful creation
            if (response.status >= 200 && response.status < 300) {
                //Succesful creation
                console.log("Successful post delete");
                this.getThreads();
            } else if (response.status >= 400) {
                console.log ("Unsuccesful post delete")
            } else {
                console.log("Some sort of error when DELETE /thread/threadID/postID");
            }
        },

        emptyFields: function () {
            if ((this.newEmail == "" || this.newFullName == "" || this.newPassWord == "") && (this.loginEmail == "" || this.loginPassWord == "")) {
                this.hasEmptyField = 1;
            }
        },
        changePage: function () {
            if (this.curPage == 1){
                this.hasEmptyField = 0;
                this.curPage = 2;
            }
        }
    },
    created: function () {
        this.getSession();
      }
});

Vue.component('full-thread', {
    template: `
    <div>
        <br />
            <h2>{{thread.name}}</h2>
            <h4>{{thread.description}}</h4>
            <h5>By: {{thread.user.fullname}}
        <br/>
    </div>
    `,
    props: [
        "thread"
    ],
    methods: {
        deleteAddress: function (dIndex) {
            this.alist.splice(dIndex, 1); 
        }
    }
})