// BASE SETUP
// =============================================================================
const express = require('express')
const bodyParser = require('body-parser')

//  ROUTES
const router = require(`${__dirname}/./routes/router`)
//  DEFINE OUR APP USING EXPRESS
const app = express()
//  BODYPARSER
//  Node.js body parsing middleware.
//  Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.urlencoded({
    extended: true,
}))
app.use(bodyParser.json())


app.use('/', router)
//  START THE SERVER
app.listen(8000, ()=>{console.log("app is listening to 8000")})
module.exports = app // for testing
