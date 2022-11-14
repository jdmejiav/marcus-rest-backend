const controller = {};
const connection = require("../model/connection.js")
const bcrypt = require('bcrypt')
require('dotenv').config()
const crypto = require("crypto")
const { MongoClient } = require('mongodb');

const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mongodbtest.wrrye7l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(url);
controller.login = async (req, res, next) => {
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

controller.recipes = async (req, res, next) => {
    const fetchData = async (client, list) => {
        const result = await client.db("planeacion").collection("planeacion").findOne({ _id: list })
        //console.log(`El resultado seria ${result}`)
        return result.data
    }
    console.log(fetchData(client, "recipes"))
    res.send(JSON.stringify(await fetchData(client, "recipes")))
}

controller.updateRecipe = async (req, res, next) => {
    const fetchData = async (client, list) => {
        const result = await client.db("planeacion").collection("planeacion").findOne({ _id: list })
        //console.log(`El resultado seria ${result}`)
        return result.data
    }
    const updateData = async (client, list, data) => {
        await client.db("planeacion").collection("planeacion").updateOne(
            {
                _id: list
            },
            {
                $set: {
                    _id: list,
                    data: data
                }
            }
        )
        return data
    }
    var recipes = await fetchData(client, "recipes")
    const product = req.body.product;
    const recipe = req.body.recipe;

    recipes[product] = recipe

    res.send(JSON.stringify(await updateData(client, "recipes", recipes)))
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