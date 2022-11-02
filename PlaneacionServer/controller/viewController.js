const controller = {};
const connection = require("../model/connection.js")
const bcrypt = require('bcrypt')
require('dotenv').config()






controller.login = async (req, res, next) => {
    // Insert Login Code Here
    let render = {}
    connection.query(`SELECT * FROM planeacion.user where user.username='${req.body.username}';`, async (err, rows, fields) => {
        if (err === null) {
            const log = await bcrypt.compare(req.body.password, rows[0].password);
            
            if (log) {
                render = { "message": log }
            } else {
                render = { "message": log };
            }
        } else {
            console.log(err);
        }
        res.send(JSON.stringify(render))
    })

}


controller.register = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let user = {
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword
        }

        connection.query(`INSERT INTO planeacion.user (username, password, nombre, apellido) VALUES ('${req.body.username}', '${hashedPassword}', 'juan', 'diego')`, (err, rows, fields) => {
            if (err != undefined) {
                console.log(err)
            }
            console.log(err)
        })

        res.send(hashedPassword)
    }
    catch (e) {
        console.log(e)
        res.send("Melon't")
    }

}




module.exports = controller;