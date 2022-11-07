const controller = {};
const connection = require("../model/connection.js")
const bcrypt = require('bcrypt')
require('dotenv').config()
const crypto = require("crypto")

controller.login = async (req, res, next) => {
    // Insert Login Code Here
    let render = {
        message: "Usuario no encontrado",
        "success": false
    }
    const hash = crypto.randomBytes(64).toString('hex')
    console.log(hash)
    try {
        connection.query(`SELECT * FROM planeacion.user where user.username='${req.body.username}';`, async (err, rows, fields) => {
            if (rows.length != 0) {
                const log = await bcrypt.compare(req.body.password, rows[0].password);
                if (log) {
                    render = {
                        "message": "Inicio Sesión con éxito",
                        "success": true,
                        "token": hash,
                        "rol": rows[0].rol
                    }
                } else {
                    render = { "message": "Clave incorrecta" };
                }
            } else {
                console.log(err);
            }
            res.send(JSON.stringify(render))
        })
    }
    catch (e) {
        res.send(JSON.stringify({
            message: "Usuario o clave incorrectos"
        }))
    }
}

controller.register = async (req, res, next) => {
    var render = {
        message: "Hubo un error",
        success: false
    }
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const hash = crypto.randomBytes(64).toString('hex')
        connection.query(`INSERT INTO planeacion.user (username, password, nombre, apellido) VALUES ('${req.body.username}', '${hashedPassword}', '${req.body.firstName}', '${req.body.lastName}')`, (err, rows, fields) => {
            if (err === null) {
                render = {
                    "message": "Registro Exitoso",
                    "success": true,
                    "token": hash
                }
            } else {
                render = {
                    message: "Usuario ya registrado",
                    "success": false
                }
            }
            res.send(JSON.stringify(render))
        })
    }
    catch (e) {
        console.log(e)
        res.send(JSON.stringify(render))
    }

}

module.exports = controller;