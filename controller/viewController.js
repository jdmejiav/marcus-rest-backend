const axios = require("axios")
const connection = require("../model/connection.js")
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const { Recipe, MoveHistSameDay, MoveHistNextDay, SameDay, NextDay, Inventory } = require("../model/mongo")
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
    try {
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
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.fetchInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find()
        return res.status(200).json(inventory[0].inventory);
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.refreshInventory = async (req, res) => {
    try {
        await Inventory.deleteMany({})
        let retorno = {}
        let customers = {}
        let products = {}
        await AxiosInstance.get(`/Inventory/GetProductInventoryHistory/BQC/0`)
            .then(async res => {
                const data = res.data
                data.forEach((val) => {

                    if (!(val.customer in customers)) {
                        customers[val.customer] = "1"
                    }
                    if (products[val.name] != undefined) {
                        let boxCode = val.boxCode.replace(/\s/g, '')
                        if (products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)] == undefined) {
                            products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)] = {
                                po: val.poId,
                                age: val.age,
                                numBoxes: Number.parseInt(val.boxes),
                                boxType: val.boxCode.replace(/\s/g, ''),
                                customer: val.customer,
                                reference: val.reference,
                                pack: val.pack
                            }
                        } else {

                            let copy = products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)]
                            products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)].numBoxes = Number.parseInt(copy.numBoxes) + Number.parseInt(val.boxes)
                        }
                    } else {
                        let boxCode = val.boxCode.replace(/\s/g, '')
                        products[val.name] = {}
                        products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)] = {
                            po: val.poId,
                            age: val.age,
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference,
                            pack: val.pack
                        }
                    }
                    if (products[val.customer] != undefined) {
                        let boxCode = val.boxCode.replace(/\s/g, '')
                        if (products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] == undefined) {
                            products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] = {
                                po: val.poId + val.reference.split(" ")[0],
                                age: val.age,
                                numBoxes: Number.parseInt(val.boxes),
                                boxType: val.boxCode.replace(/\s/g, ''),
                                customer: val.customer,
                                reference: val.reference,
                                pack: val.pack
                            }
                        } else {
                            let copy = products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)]
                            products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)].numBoxes = Number.parseInt(copy.numBoxes) + Number.parseInt(val.boxes)
                        }
                    } else {
                        let boxCode = val.boxCode.replace(/\s/g, '')
                        products[val.customer] = {}
                        products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] = {
                            po: val.poId + val.reference.split(" ")[0],
                            age: val.age,
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference,
                            pack: val.pack
                        }
                    }

                })
            }).catch(error => console.log('error', error));
        let begin = new Date()
        let end = new Date()

        await AxiosInstance.get("/Procurement/GetPurchaseProducts/BQC/All", {
            params: {
                DateFrom: moment(begin).format("YYYY-MM-DD"),
                DateTo: moment(end).format("YYYY-MM-DD"),
                DateType: "DueDate"
            }
        }).then(res => {
            const data = res.data
            data.forEach((val) => {
                if (!(val.customer in customers)) {
                    customers[val.customer] = "1"
                }
                if (products[val.productName] != undefined) {
                    let boxCode = val.boxCode.replace(/\s/g, '')
                    if (products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)] == undefined) {
                        products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)] = {
                            po: val.poNumber,
                            age: "NR",
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference,
                            pack: val.pack
                        }
                    } else if (products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)].age === "NR") {
                        let copy = products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)]
                        products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)].numBoxes = Number.parseInt(copy.numBoxes) + Number.parseInt(val.boxes)
                    }
                } else {
                    let boxCode = val.boxCode.replace(/\s/g, '')
                    products[val.productName] = {}
                    products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)] = {
                        po: val.poNumber,
                        age: "NR",
                        numBoxes: Number.parseInt(val.boxes),
                        boxType: val.boxCode.replace(/\s/g, ''),
                        customer: val.customer,
                        reference: val.reference,
                        pack: val.pack
                    }
                }
                if (products[val.customer] != undefined) {
                    let boxCode = val.boxCode.replace(/\s/g, '')
                    if (products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] == undefined) {
                        products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] = {
                            po: val.poNumber + val.reference.split(" ")[0],
                            age: "NR",
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference,
                            pack: val.pack
                        }
                    } else if (products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)].age === "NR") {
                        let copy = products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)]
                        products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)].numBoxes = Number.parseInt(copy.numBoxes) + Number.parseInt(val.boxes)
                    }
                } else {
                    let boxCode = val.boxCode.replace(/\s/g, '')
                    products[val.customer] = {}
                    products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] = {
                        po: val.poNumber + val.reference.split(" ")[0] + val.reference.split(" ")[0],
                        age: "NR",
                        numBoxes: Number.parseInt(val.boxes),
                        boxType: val.boxCode.replace(/\s/g, ''),
                        customer: val.customer,
                        reference: val.reference,
                        pack: val.pack
                    }
                }
            })
        }).catch(err => console.log(err))
        retorno.items = products
        retorno.customers = Object.keys(customers)
        const inventory = await Inventory.create({ inventory: retorno })
        //console.log(products["BH EURO BQT WINTER"]["114079F"])
        return res.status(200).json(inventory.inventory)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.fetchInventoryLegacy = async (req, res) => {
    try {
        let retorno = {}
        let customers = {}
        let products = {}
        await AxiosInstance.get(`/Inventory/GetProductInventoryHistory/BQC/0`)
            .then(async res => {
                const data = res.data
                data.forEach((val) => {
                    if (!(val.customer in customers)) {
                        customers[val.customer] = "1"
                    }
                    if (products[val.name] != undefined) {
                        let boxCode = val.boxCode.replace(/\s/g, '')
                        if (products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)] == undefined) {

                            products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)] = {
                                po: val.poId,
                                age: val.age,
                                numBoxes: Number.parseInt(val.boxes),
                                boxType: val.boxCode.replace(/\s/g, ''),
                                customer: val.customer,
                                reference: val.reference,
                                pack: val.pack
                            }
                        } else {
                            let copy = products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)]
                            products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)].numBoxes = Number.parseInt(copy.numBoxes) + Number.parseInt(val.boxes)
                        }
                    } else {
                        let boxCode = val.boxCode.replace(/\s/g, '')
                        products[val.name] = {}
                        products[val.name][val.poId + boxCode.charAt(boxCode.length - 1)] = {
                            po: val.poId,
                            age: val.age,
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference,
                            pack: val.pack
                        }
                    }
                    if (products[val.customer] != undefined) {
                        let boxCode = val.boxCode.replace(/\s/g, '')
                        if (products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] == undefined) {
                            products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] = {
                                po: val.poId + val.reference.split(" ")[0],
                                age: val.age,
                                numBoxes: Number.parseInt(val.boxes),
                                boxType: val.boxCode.replace(/\s/g, ''),
                                customer: val.customer,
                                reference: val.reference,
                                pack: val.pack
                            }
                        } else {
                            let copy = products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)]
                            products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)].numBoxes = Number.parseInt(copy.numBoxes) + Number.parseInt(val.boxes)
                        }
                    } else {
                        let boxCode = val.boxCode.replace(/\s/g, '')
                        products[val.customer] = {}
                        products[val.customer][val.poId + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] = {
                            po: val.poId + val.reference.split(" ")[0],
                            age: val.age,
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference,
                            pack: val.pack
                        }
                    }
                })
            }).catch(error => console.log('error', error));


        let begin = new Date()
        let end = new Date()

        await AxiosInstance.get("/Procurement/GetPurchaseProducts/BQC/All", {
            params: {
                DateFrom: moment(begin).format("YYYY-MM-DD"),
                DateTo: moment(end).format("YYYY-MM-DD"),
                DateType: "DueDate"
            }
        }).then(res => {
            const data = res.data
            data.forEach((val) => {
                if (!(val.customer in customers)) {
                    customers[val.customer] = "1"
                }
                if (products[val.productName] != undefined) {
                    let boxCode = val.boxCode.replace(/\s/g, '')
                    if (products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)] == undefined) {
                        products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)] = {
                            po: val.poNumber,
                            age: "NR",
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference,
                            pack: val.pack
                        }
                    } else {
                        let copy = products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)]
                        products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)].numBoxes = Number.parseInt(copy.numBoxes) + Number.parseInt(val.boxes)
                    }
                } else {
                    let boxCode = val.boxCode.replace(/\s/g, '')
                    products[val.productName] = {}
                    products[val.productName][val.poNumber + boxCode.charAt(boxCode.length - 1)] = {
                        po: val.poNumber,
                        age: "NR",
                        numBoxes: Number.parseInt(val.boxes),
                        boxType: val.boxCode.replace(/\s/g, ''),
                        customer: val.customer,
                        reference: val.reference,
                        pack: val.pack
                    }
                }
                if (products[val.customer] != undefined) {
                    let boxCode = val.boxCode.replace(/\s/g, '')
                    if (products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] == undefined) {
                        products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] = {
                            po: val.poNumber + val.reference.split(" ")[0],
                            age: "NR",
                            numBoxes: Number.parseInt(val.boxes),
                            boxType: val.boxCode.replace(/\s/g, ''),
                            customer: val.customer,
                            reference: val.reference,
                            pack: val.pack
                        }
                    } else {
                        let copy = products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)]
                        products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)].numBoxes = Number.parseInt(copy.numBoxes) + Number.parseInt(val.boxes)
                    }
                } else {
                    let boxCode = val.boxCode.replace(/\s/g, '')
                    products[val.customer] = {}
                    products[val.customer][val.poNumber + val.reference.split(" ")[0] + boxCode.charAt(boxCode.length - 1)] = {
                        po: val.poNumber + val.reference.split(" ")[0] + val.reference.split(" ")[0],
                        age: "NR",
                        numBoxes: Number.parseInt(val.boxes),
                        boxType: val.boxCode.replace(/\s/g, ''),
                        customer: val.customer,
                        reference: val.reference,
                        pack: val.pack
                    }
                }
            })
        }).catch(err => console.log(err))
        retorno.items = products
        retorno.customers = Object.keys(customers)
        return res.status(200).json(retorno)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }

}
controller.fetchInventoryLegacyDeprecated = async (req, res) => {
    try {
        let retorno = {}
        await AxiosInstance.get(`/Inventory/GetProductInventoryHistory/BQC/0`)
            .then(async res => {
                const data = res.data
                let customers = {}
                let products = {}
                data.forEach((val) => {
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
                //end.setDate(end.getDate() + 1)

                await AxiosInstance.get("/Procurement/GetPurchaseProducts/BQC/All", {
                    params: {
                        DateFrom: moment(begin).format("YYYY-MM-DD"),
                        DateTo: moment(end).format("YYYY-MM-DD"),
                        DateType: "DueDate"
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
                                    age: "NR",
                                    numBoxes: val.pack,
                                    boxType: val.boxCode.replace(/\s/g, ''),
                                    customer: val.customer,
                                    reference: val.reference,
                                    pack: val.pack
                                })
                                products[val.productName] = {
                                    poDetails: arrTemp,
                                    numBoxes: Number.parseInt(products[val.productName].numBoxes) + Number.parseInt(val.pack)
                                }
                            } else {
                                products[val.productName] = {
                                    poDetails: Array({
                                        po: val.poNumber,
                                        age: "NR",
                                        numBoxes: Number.parseInt(val.pack),
                                        boxType: val.boxCode.replace(/\s/g, ''),
                                        customer: val.customer,
                                        reference: val.reference,
                                        pack: val.pack
                                    }),
                                    name: val.productName,
                                    numBoxes: val.pack
                                }
                            }
                            if (val.customer in products) {
                                const arrTemp = products[val.customer].poDetails;
                                arrTemp.push({
                                    po: val.poNumber + val.reference.split(" ")[0],
                                    age: "NR",
                                    numBoxes: val.pack,
                                    boxType: val.boxCode.replace(/\s/g, ''),
                                    customer: val.customer,
                                    reference: val.reference,
                                    pack: val.pack
                                })
                                products[val.customer] = {
                                    poDetails: arrTemp,
                                    numBoxes: Number.parseInt(products[val.productName].numBoxes) + Number.parseInt(val.pack)
                                }
                            } else {
                                products[val.customer] = {
                                    poDetails: Array({
                                        po: val.poNumber + val.reference.split(" ")[0],
                                        age: "NR",
                                        numBoxes: Number.parseInt(val.pack),
                                        boxType: val.boxCode.replace(/\s/g, ''),
                                        customer: val.customer,
                                        reference: val.reference,
                                        pack: val.pack
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
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

// OPERATION ROUTES

controller.moveDay = async (req, res) => {
    try {
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
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.newDay = async (req, res) => {
    try {
        const newDay = await SameDay.deleteMany({}).then(async () => await NextDay.find())

        newDay.reverse().map(async item => {
            let temp = JSON.parse(JSON.stringify(item))
            delete temp._id
            await SameDay.create(temp)
        })
        await NextDay.deleteMany({})
        return res.status(200).json(newDay)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}
//CRUD

// SAME DAY
controller.addRowSameDay = async (req, res) => {
    try {
        const sameDay = new SameDay({ ...req.body })
        const insertSameDayRow = await sameDay.save()
        return res.status(200).json(insertSameDayRow)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}
controller.getRowsSameDay = async (req, res) => {
    try {
        const allRows = await SameDay.find();
        return res.status(200).json(allRows)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }

}
controller.getRowSameDayById = async (req, res) => {
    try {
        const { id } = req.params
        const row = await SameDay.findById(id)
        return res.status(200).json(row)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}
controller.updateRowSameDayById = async (req, res) => {
    try {
        const { id } = req.params;
        var rowUpdated = await SameDay.findOneAndUpdate({ _id: id }, req.body)
        return res.status(200).json(rowUpdated._id)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}
controller.deleteRowSameDayById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRow = await SameDay.findByIdAndDelete(id);
        return res.status(200).json(deletedRow);
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

// NEXT DAY
controller.addRowNextDay = async (req, res) => {
    try {
        const nextDay = new NextDay({ ...req.body })
        const insertNextDayRow = await nextDay.save()
        return res.status(200).json(insertNextDayRow)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}
controller.getRowsNextDay = async (req, res) => {
    try {
        const allRows = await NextDay.find();
        return res.status(200).json(allRows)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}
controller.getRowNextDayById = async (req, res) => {
    try {
        const { id } = req.params
        const row = await NextDay.findById(id)
        return res.status(200).json(row)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}
controller.updateRowNextDayById = async (req, res) => {
    try {
        const { id } = req.params;
        var rowUpdated = await NextDay.findOneAndUpdate({ _id: id }, req.body)
        return res.status(200).json(rowUpdated._id)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}
controller.deleteRowNextDayById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRow = await NextDay.findByIdAndDelete(id);
        return res.status(200).json(deletedRow);
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

// MOVE HIST SAME DAY

controller.addMovementSameDay = async (req, res) => {
    try {
        let allRows = JSON.parse(JSON.stringify(await SameDay.find()))
        let movement = { moveHistSameDay: allRows }
        let moveHistSameDay = await MoveHistSameDay.create(movement)
        return res.status(200).json(moveHistSameDay)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.getMovementHistSameDay = async (req, res) => {
    try {
        let movements = await MoveHistSameDay.find();
        return res.status(200).json(movements)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.popMovementSameDay = async (req, res) => {
    try {
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
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

//MOVE HIST NEXTDAY

controller.addMovementNextDay = async (req, res) => {
    try {
        let allRows = JSON.parse(JSON.stringify(await NextDay.find()))
        let movement = { moveHistNextDay: allRows }
        let moveHistNextDay = await MoveHistNextDay.create(movement)
        return res.status(200).json(moveHistNextDay)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.getMovementHistNextDay = async (req, res) => {
    try {
        let movements = await MoveHistNextDay.find();
        return res.status(200).json(movements)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.popMovementNextDay = async (req, res) => {
    try {
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
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

// RECIPES

controller.addRecipe = async (req, res) => {
    try {
        const recipe = new Recipe({ ...req.body })
        const insertRecipe = await recipe.save()
        return res.status(200).json(insertRecipe)
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.getRecipes = async (req, res) => {
    try {
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
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

controller.updateRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        var recipe = await Recipe.findOneAndUpdate({ _id: id }, req.body)
        return res.status(200).json(recipe)
    }
    catch (err) {
        return res.status(500)
    }
}


controller.deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRecipe = await Recipe.findByIdAndDelete(id);
        return res.status(200).json(deletedRecipe);
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

// Auth EndPoints
controller.login = async (req, res) => {
    try {
        let render = {
            message: "Usuario no encontrado",
            "success": false
        }
        const hash = crypto.randomBytes(64).toString('hex')
        console.log("Hash ", hash)
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
    catch (err) {
        console.log(err)
        return res.status(500)
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