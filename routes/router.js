const express = require("express")
const router = express.Router()
const viewController = require("../controller/viewController.js")


// Fetch WebFlowers
router.get("/fetchWorkOrders", viewController.fetchWorkOrders)
router.get("/fetchInventory", viewController.fetchInventory)

// SameDay Routes
router.delete("/sameday/deleteRow/:id", viewController.deleteRowSameDayById)

router.get("/sameday/getRowById/:id", viewController.getRowSameDayById)
router.get("/sameday/getRows", viewController.getRowsSameDay)

router.post("/sameday/addRow", viewController.addRowSameDay)
router.post("/sameday/updateRow/:id", viewController.updateRowSameDayById)


// NextDay Routes
router.delete("/nextday/deleteRow/:id", viewController.deleteRowNextDayById)

router.get("/nextday/getRowById/:id", viewController.getRowNextDayById)
router.get("/nextday/getRows", viewController.getRowsNextDay)

router.post("/nextday/addRow", viewController.addRowNextDay)
router.post("/nextday/updateRow/:id", viewController.updateRowNextDayById)















router.get("/recipes", viewController.recipes)
router.post("/addRecipe", viewController.addRecipe)
router.post("/login", viewController.login)
router.post("/register", viewController.register)



router.delete("/deleterecipe/:id", viewController.deleteRecipe)



module.exports = router;