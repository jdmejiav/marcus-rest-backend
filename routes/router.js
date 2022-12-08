const express = require("express")
const router = express.Router()
const viewController = require("../controller/viewController.js")


// Fetch WebFlowers
router.get("/fetchWorkOrders", viewController.fetchWorkOrders)
router.get("/fetchInventory", viewController.fetchInventory)
router.get("/refreshInventory", viewController.refreshInventory)
router.get("/getInventory", viewController.getInventory)

// Operations Routes
router.get("/newDay", viewController.newDay)

router.post("/moveDay", viewController.moveDay)

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

// MoveHist SameDay Routes
router.get("/sameday/getMovementHist", viewController.getMovementHistSameDay)
router.get("/sameday/popMovement", viewController.popMovementSameDay)

router.post("/sameday/addMovement", viewController.addMovementSameDay)

//RECIPES ROUTES
router.delete("/deleteRecipe/:id", viewController.deleteRecipe)

router.get("/getRecipes", viewController.getRecipes)

router.post("/addRecipe", viewController.addRecipe)
router.post("/updateRecipe/:id", viewController.updateRecipeById)



//AUTH ROUTES
router.post("/login", viewController.login)
router.post("/register", viewController.register)







module.exports = router;