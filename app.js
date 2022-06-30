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
        threads: [],
        threadPosts: [],
        newThreadName: "",
        newDescription: "",
        newCategory: "",
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
            let body = response.json();
            console.log(body);  
            console.log(response);

            //Check for successful login
            if (response.status == 201) {
                //Succesful login
                console.log("Successful login attempt");
                this.loginFailed = 0;
                this.loginPassWord = "";
                this.loginEmail = "";
                this.curPage = 3;
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
            // console.log(this.newEmail.slice(this.newEmail.length - 4));
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
            let body = response.json();
            console.log(body);  
            console.log(response);

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
            // console.log(this.newEmail.slice(this.newEmail.length - 4));
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
            console.log(threadID);
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
            console.log(body);  
            console.log(response);

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
        postThread: function () {
            if (this.newThreadName == "" || this.newDescription == "" || this.newCategory == "") {
                return;
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