var express = require('express');
var cookieParser = require('cookie-parser');
const http = require('http');
const cors = require("cors")
const mongoose = require("mongoose");
var router = require('./routes/router');
const app = express()
require('dotenv').config()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: "*" }))
app.use('/', router);

const start = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mongodbtest.wrrye7l.mongodb.net/?retryWrites=true&w=majority`
        );
        var serverRest = http.createServer(app);
        serverRest.listen(process.env.PORT, () => console.log("Server Started on Port 8080"))

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};


start();