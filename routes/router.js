const express = require('express')
const router = new express.Router()
let controller = require('../controllers/controller')

router.get('/dataStore', controller.readDataFromFile)
router.delete('/dataStore', controller.deleteDataFromFile)
router.post('/dataStore/saveData', controller.saveDataInFile)

// exports all routes
module.exports = router