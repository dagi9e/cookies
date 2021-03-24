const express = require('express')
const cookieParser = require("cookie-parser")
const { v4: uuidv4 } = require('uuid');
const matchCredentials = require('./utils.js')
const fake_db = require('./db.js')
const app = express()

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))


// show home with forms
app.get('/', function(req, res) {
    res.render('pages/home')
})

// create a user account
app.post('/create', function(req, res) {
    let body = req.body
    let user = {
        username: body.username,
        password: body.password
    }
    fake_db.users[user.username] = user
    res.redirect('/')
})

// login

let global_id = 0; //this global variable will later be used to hold the current session unique ID

app.post('/login', function(req, res) {
    if (matchCredentials(req.body)) {
        let user = fake_db.users[req.body.username]

        let id = uuidv4()

        global_id = id;


        fake_db.sessions[id] = {
            user: user,
            timeOfLogin: Date.now()
        }

        // create cookie that holds the UUID (the Session ID)

        res.cookie('SID', id, {
            expires: new Date(Date.now() + 900000),
            httpOnly: true
        })
        res.render('pages/members')
    } else {
        res.redirect('/error')
    }
})


// this is the protected route
app.get('/supercoolmembersonlypage', function(req, res) {
    let id2 = req.cookies.SID
    let session = fake_db.sessions[id2]
    if (session) {
        res.render('pages/members')
    } else {
        res.render('pages/error')
    }
})

//the line of code below is the solution to the challenge
app.get('/clc', function(req, res) {

    res.cookie('SID', null, {
        expires: new Date(Date.now() - 900000),
        httpOnly: true
    })

    delete fake_db.sessions.global_id //global_id varriable is the copy of the unique id created by uuidv4()

    res.render('pages/home')
})

// if something went wrong, you get sent here
app.get('/error', function(req, res) {
    res.render('pages/error')
})

// 404 handling
app.all('*', function(req, res) {
    res.render('pages/error')
})

app.listen(1612)
console.log('running')