const axios = require("axios")
const connection = require("../model/connection.js")
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const { Recipe, MoveHistSameDay, MoveHistNextDay, SameDay, NextDay } = require("../model/mongo")
const moment = require("moment")

require('dotenv').config();

const controller = {};


const AxiosInstance = axios.create({
    baseURL: process.env.WEBFLOWERS_URL,
    headers: {
        "Ocp-Apim-Subscription-Key": process.env.API_KEY,
        'Content-Type': 'application/json'
    }
})

//Fetch WebFlowers

controller.fetchWorkOrders = async (req, res) => {
    let workOrders = {}
    let today = new Date()
    let tumorrow = new Date()
    today.setDate(today.getDate())
    tumorrow.setDate(tumorrow.getDate() + 1)
    await AxiosInstance.get(`/production/GetProductionWorkOrders/BQC/${moment(today).format("YYYY-MM-DD")}/${moment(tumorrow).format("YYYY-MM-DD")}`)
        .then((res) => {
            const data = res.data
            data.forEach(item => {
                if (item.productionWorkOrderId in workOrders) {
                    workOrders[item.productionWorkOrderId].boxes = Number(workOrders[item.productionWorkOrderId].boxes) + Number(item.boxes)
                }
                else {
                    workOrders[item.productionWorkOrderId] = {
                        boxes: Number(item.boxes),
                        task: item.task + item.subTask,
                        boxCode: item.boxCode
                    }
                }
            }
            )
        })
        .catch(error => console.log('error', error));

    return res.status(200).json(workOrders)
}

controller.fetchInventory = async (req, res) => {
    let retorno = {}
    await AxiosInstance.get(`/Inventory/GetProductInventoryHistory/BQC/0`)
        .then(async res => {
            const data = res.data
            let customers = {}
            let products = {}
            data.forEach((val) => {

                if (val.poId == "112816") {
                    console.log("En 1: ", val)
                }
                if (!(val.customer in customers)) {
                    customers[val.customer] = "1"
                }
                if (val.name in products) {
                    const arrTemp = products[val.name].poDetails;
                    arrTemp.push({
                        po: val.poId,
                        age: val.age,
                        numBoxes: val.boxes,
                        boxType: val.boxCode.replace(/\s/g, ''),
                        customer: val.customer,
                        reference: val.reference
                    })
                    products[val.name] = {
                        poDetails: arrTemp,
                        numBoxes: Number.parseInt(products[val.name].numBoxes) + Number.parseInt(val.boxes)
                    }
                } else {
                    products[val.name] = {
                        poDetails: Array({
                            po: val.poId,
                            age: val.age,
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference
                        }),
                        name: val.name,
                        numBoxes: val.boxes
                    }
                }

                if (val.customer in products) {

                    const arrTemp = products[val.customer].poDetails;

                    arrTemp.push({
                        po: val.poId + val.reference.split(" ")[0],
                        age: val.age,
                        numBoxes: val.boxes,
                        boxType: val.boxCode.replace(/\s/g, ''),
                        customer: val.customer,
                        reference: val.reference
                    })
                    products[val.customer] = {
                        poDetails: arrTemp,
                        numBoxes: Number.parseInt(products[val.customer].numBoxes) + Number.parseInt(val.boxes)
                    }
                } else {
                    products[val.customer] = {
                        poDetails: Array({
                            po: val.poId + val.reference.split(" ")[0],
                            age: val.age,
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference
                        }),
                        name: val.name,
                        numBoxes: val.boxes
                    }
                }
            })
            let begin = new Date()
            let end = new Date()
            end.setDate(end.getDate() + 1)

            await AxiosInstance.get("/Inventory/GetProductInventoryHistory/BQC/0", {
                params: {
                    dateFrom: moment(begin).format("YYYY-MM-DD"),
                    dateTo: moment(end).format("YYYY-MM-DD")
                }
            }).then(res => {
                const data = res.data
                data.forEach((val) => {
                    if (val.dateReceived === null) {
                        if (!(val.customer in customers)) {
                            customers[val.customer] = "1"
                        }
                        if (val.productName in products) {
                            const arrTemp = products[val.productName].poDetails;
                            arrTemp.push({
                                po: val.poNumber,
                                age: "N.R",
                                numBoxes: val.pack,
                                boxType: val.boxCode.replace(/\s/g, ''),
                                customer: val.customer,
                                reference: val.reference
                            })
                            products[val.productName] = {
                                poDetails: arrTemp,
                                numBoxes: Number.parseInt(products[val.productName].numBoxes) + Number.parseInt(val.pack)
                            }
                        } else {
                            products[val.productName] = {
                                poDetails: Array({
                                    po: val.poNumber,
                                    age: "N.R",
                                    numBoxes: Number.parseInt(val.pack),
                                    boxType: val.boxCode.replace(/\s/g, ''),
                                    customer: val.customer,
                                    reference: val.reference
                                }),
                                name: val.productName,
                                numBoxes: val.pack
                            }
                        }
                        if (val.customer in products) {

                            const arrTemp = products[val.customer].poDetails;
                            arrTemp.push({
                                po: val.poNumber + val.reference.split(" ")[0],
                                age: "N.R",
                                numBoxes: val.pack,
                                boxType: val.boxCode.replace(/\s/g, ''),
                                customer: val.customer,
                                reference: val.reference
                            })
                            products[val.customer] = {
                                poDetails: arrTemp,
                                numBoxes: Number.parseInt(products[val.productName].numBoxes) + Number.parseInt(val.pack)
                            }
                        } else {
                            products[val.customer] = {
                                poDetails: Array({
                                    po: val.poNumber + val.reference.split(" ")[0],
                                    age: "N.R",
                                    numBoxes: Number.parseInt(val.pack),
                                    boxType: val.boxCode.replace(/\s/g, ''),
                                    customer: val.customer,
                                    reference: val.reference
                                }),
                                name: val.productName,
                                numBoxes: val.pack
                            }
                        }
                    }
                })
                retorno.items = products
                retorno.customers = Object.keys(customers)
            }).catch(error => console.log('error', error));
        }).catch(error => console.log('error', error));

    return res.status(200).json(retorno)
}

// OPERATION ROUTES

controller.moveDay = async (req, res) => {
    let { id, date } = req.body;
    let row = JSON.parse(JSON.stringify(await SameDay.findById(id)))
    let allRows = await NextDay.find()
    row.date = date
    delete row._id
    row.id = allRows[allRows.length - 1] === undefined ? 1 : allRows[allRows.length - 1].id + 1
    const rowMoved = new NextDay({ ...row })
    const insertNextDayRow = await rowMoved.save()
    await SameDay.findByIdAndDelete(id)
    return res.status(200).json(insertNextDayRow)
}

controller.newDay = async (req, res) => {
    const newDay = await SameDay.deleteMany({}).then(async () => await NextDay.find())

    newDay.map(async item => {
        let temp = JSON.parse(JSON.stringify(item))
        delete temp._id
        await SameDay.create(temp)
    })
    await NextDay.deleteMany({})
    return res.status(200).json(newDay)
}
//CRUD

// SAME DAY
controller.addRowSameDay = async (req, res) => {
    const sameDay = new SameDay({ ...req.body })
    const insertSameDayRow = await sameDay.save()
    return res.status(200).json(insertSameDayRow)
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
    const deletedRow = await SameDay.findByIdAndDelete(id);
    return res.status(200).json(deletedRow);
}

// NEXT DAY
controller.addRowNextDay = async (req, res) => {
    const nextDay = new NextDay({ ...req.body })
    const insertNextDayRow = await nextDay.save()
    return res.status(200).json(insertNextDayRow)
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

// MOVE HIST SAME DAY

controller.addMovementSameDay = async (req, res) => {
    let allRows = JSON.parse(JSON.stringify(await SameDay.find()))
    let movement = { moveHistSameDay: allRows }
    let moveHistSameDay = await MoveHistSameDay.create(movement)
    return res.status(200).json(moveHistSameDay)
}

controller.getMovementHistSameDay = async (req, res) => {
    let movements = await MoveHistSameDay.find();
    return res.status(200).json(movements)
}

controller.popMovementSameDay = async (req, res) => {
    let movement = await MoveHistSameDay.findOneAndDelete(
        { "field": "a" },
        { "sort": { "_id": -1 } }
    )
    if (movement != null) {
        const rows = await SameDay.deleteMany({})
        movement.moveHistSameDay.forEach(async item => {
            let newRow = JSON.parse(JSON.stringify(item));
            await SameDay.create(newRow);
        })
    }
    return res.status(200).json(movement)
}

//MOVE HIST NEXTDAY

controller.addMovementNextDay = async (req, res) => {
    let allRows = JSON.parse(JSON.stringify(await NextDay.find()))
    let movement = { moveHistNextDay: allRows }
    let moveHistNextDay = await MoveHistNextDay.create(movement)
    return res.status(200).json(moveHistNextDay)
}

controller.getMovementHistNextDay = async (req, res) => {
    let movements = await MoveHistNextDay.find();
    return res.status(200).json(movements)
}

controller.popMovementNextDay = async (req, res) => {
    let movement = await MoveHistNextDay.findOneAndDelete(
        { "field": "a" },
        { "sort": { "_id": -1 } }
    )
    if (movement != null) {
        const rows = await NextDay.deleteMany({})
        awaitmovement.moveHistNextDay.forEach(async item => {
            let newRow = JSON.parse(JSON.stringify(item));
            await NextDay.create(newRow);
        })
    }
    return res.status(200).json(movement)
}

// RECIPES

controller.addRecipe = async (req, res) => {
    const recipe = new Recipe({ ...req.body })
    const insertRecipe = await recipe.save()
    return res.status(200).json(insertRecipe)
}

controller.getRecipes = async (req, res) => {
    const allRecipes = await Recipe.find();
    let retorno = {}
    allRecipes.forEach(item => {
        retorno[item.product] = {
            product: item.product,
            wp: item.wp,
            dry: item.dry,
            _id: item._id
        }
    })
    return res.status(200).json(retorno)
}

controller.updateRecipeById = async (req, res) => {
    const { id } = req.params;
    var recipe = await Recipe.findOneAndUpdate({ _id: id }, req.body)
    return res.status(200).json(recipe)
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