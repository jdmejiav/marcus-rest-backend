const express = require("express")
const router = express.Router()
const viewController = require("../controller/viewController.js")



router.post("/login", viewController.login)
router.post("/register", viewController.register)


module.exports = router;