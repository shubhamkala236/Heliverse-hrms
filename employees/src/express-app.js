const express = require('express');
const cors  = require('cors');
const cookieParser = require("cookie-parser");
const  fileUpload = require('express-fileupload');

const { employee, appEvents  } = require('./api');
const HandleErrors = require('./utils/error-handler')


module.exports = async (app) => {

    app.use(fileUpload({
        useTempFiles : true
    }));
    
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser())

    app.use(express.urlencoded({ extended: true }));

    //Listeners
    // appEvents(app);

    //api
    employee(app);

    // error handling
    app.use(HandleErrors);
    
}