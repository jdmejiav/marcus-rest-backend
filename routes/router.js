const express = require("express")
const router = express.Router()
const viewController = require("../controller/viewController.js")


// SameDay Routes
router.delete("/deleteRowSameDay/:id", viewController.deleteRowSameDayById)

router.get("/getRowSameDayById/:id", viewController.getRowSameDayById)
router.get("/getRowsSameDay", viewController.getRowsSameDay)

router.post("/addRowSameDay", viewController.addRowSameDay)
router.post("/updateRowSameDay/:id", viewController.updateRowSameDayById)


// NextDay Routes
router.delete("/deleteRowNextDay/:id", viewController.deleteRowNextDayById)

router.get("/getRowNextDayById/:id", viewController.getRowNextDayById)
router.get("/getRowsNextDay", viewController.getRowsNextDay)

router.post("/addRowNextDay", viewController.addRowNextDay)
router.post("/updateRowNextDay/:id", viewController.updateRowNextDayById)















router.get("/recipes", viewController.recipes)
router.post("/addRecipe", viewController.addRecipe)
router.post("/login", viewController.login)
router.post("/register", viewController.register)



router.delete("/deleterecipe/:id", viewController.deleteRecipe)



module.exports = router;