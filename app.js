const API_URL = "https://forum2022.codeschool.cloud";

var app = new Vue({
    el: "#app",
    data: {
        //Variables here
        loginEmail: "",
        loginPassWord: "",
        newFullName: "",
        newEmail: "",
        newPassWord: "",
        curPage: 1,
    },
    methods: {
        //functions here
        submitNewData: function () {

        },
        submitLoginData () {

        }
    },
    created: async function () {
        // GET request using fetch with async/await
        // const response = await fetch(API_URL + "/products");
        // const data = await response.json();
        // this.products = data;
      }
});