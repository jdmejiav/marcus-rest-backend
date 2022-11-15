const controller = {};
const connection = require("../model/connection.js")
const bcrypt = require('bcrypt');
require('dotenv').config();
const crypto = require("crypto");
const { Recipe, MoveHistSameDay, MoveHistNextDay, SameDay, NextDay } = require("../model/mongo")




//CRUD



// SAME DAY
controller.addRowSameDay = async (req, res) => {
    const sameDay = new SameDay({ ...req.body })
    const insertSameDayRow = await sameDay.save()
    return res.status(200).json(insertSameDayRow._id)
}
controller.getRowsSameDay = async (req, res) => {
    const allRows = await SameDay.find();
    return res.status(200).json(allRows)
}
controller.getRowSameDayById = async (req, res) => {
    const { id } = req.params
    const row = await SameDay.findById(id)
    return res.status(200).json(row)
}
controller.updateRowSameDayById = async (req, res) => {
    const { id } = req.params;
    var rowUpdated = await SameDay.findOneAndUpdate({ _id: id }, req.body)
    return res.status(200).json(rowUpdated._id)
}
controller.deleteRowSameDayById = async (req, res) => {
    const { id } = req.params;
    const deletedRow = await NextDay.findByIdAndDelete(id);
    return res.status(200).json(deletedRow);
}




// NEXT DAY
controller.addRowNextDay = async (req, res) => {
    const NextDay = new NextDay({ ...req.body })
    const insertNextDayRow = await NextDay.save()
    return res.status(200).json(insertNextDayRow._id)
}
controller.getRowsNextDay = async (req, res) => {
    const allRows = await NextDay.find();
    return res.status(200).json(allRows)
}
controller.getRowNextDayById = async (req, res) => {
    const { id } = req.params
    const row = await NextDay.findById(id)
    return res.status(200).json(row)
}
controller.updateRowNextDayById = async (req, res) => {
    const { id } = req.params;
    var rowUpdated = await NextDay.findOneAndUpdate({ _id: id }, req.body)
    return res.status(200).json(rowUpdated._id)
}
controller.deleteRowNextDayById = async (req, res) => {
    const { id } = req.params;
    const deletedRow = await NextDay.findByIdAndDelete(id);
    return res.status(200).json(deletedRow);
}







// RECIPES

controller.addRecipe = async (req, res) => {
    const recipe = new Recipe({ ...req.body })
    const insertRecipe = await recipe.save()
    return res.status(200).json(insertRecipe)
}

controller.recipes = async (req, res) => {
    const allRecipes = await Recipe.find();
    return res.status(200).json(allRecipes)
}


controller.deleteRecipe = async (req, res) => {
    const { id } = req.params;
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    return res.status(200).json(deletedRecipe);
}



// Auth EndPoints
controller.login = async (req, res) => {
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


controller.register = async (req, res) => {
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