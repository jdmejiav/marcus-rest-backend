const express = require("express")
const router = express.Router()
const viewController = require("../controller/viewController.js")

router.get("/recipes", viewController.recipes)
router.post("/updateRecipes", viewController.updateRecipe)
router.post("/login", viewController.login)
router.post("/register", viewController.register)

module.exports = router;