'use strict';

const fs = require('fs');
const express = require('express');

const app = express();

const ip = '127.0.0.1';
const port = 8081;

// Class to hold user data
class RegisteredUser {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
}

// In-memory way of saving registered users
let registeredUsers = {};

// Set view rendering engine
app.set('view engine', 'ejs');
// Set folder for static assets
app.use(express.static('public'));
// Set possibility to send form params
// Here a link from w3schools to a really good comparison between GET and POST requests https://www.w3schools.com/tags/ref_httpmethods.asp
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    // null means, no registration attempt was made, true means, they're registered and false means there was an error
    let registered = null;
    if ('success' in req.query) {
        registered = req.query.success === 'true';
    }

    // Render the index template with two additional variables bound to the rendering engine
    res.render('index_simple', { registered: registered, registeredUsers: registeredUsers });
    // res.render('index', { registered: registered, registeredUsers: registeredUsers });
});

app.post('/register', (req, res) => {
    // When you want to fetch form data from post requests, you have to go for the req.body object
    if (!req.body['name']) {
        // If it does not exist, directly redirect the user
        res.redirect('/?success=false');
        return;
    }

    if (!req.body['email']) {
        res.redirect('/?success=false');
        return;
    }

    let name = req.body.name;
    let email = req.body.email;

    // Check if the user is already registered, if they are, redirect immediately
    if (email in registeredUsers) {
        res.redirect('/?success=false');
        return;
    }

    // Actually you would store them now inside a database or so
    registeredUsers[email] = new RegisteredUser(name, email);

    // As a result, redirect back and set a query parameter (aka GET parameter) to indicate success
    res.redirect('/?success=true')
});

// This is a little messy, since mail addresses are not necessarily url safe, better to use some kind of id or hash for that
app.get('/user/:email', (req, res) => {
    // :email is a named parameter, meaning, that it can contain anything like john.doe@example.com
    // You should put some protection here
    if (!registeredUsers[req.params.email]) {
        // If we didn't find the user, we can directly tell the browser semantically correct, that it wasn't found
        res.sendStatus(404);
        res.send('Not found');

        return;
    }

    // Let's fetch the registered user from our global object
    let registeredUser = registeredUsers[req.params.email];

    // Render the user template
    res.render('user_simple', { registeredUser: registeredUser });
    // res.render('user', { registeredUser: registeredUser });
});

// Same here
app.get('/unregister/:email', (req, res) => {
    // You should put some protection here
    if (!registeredUsers[req.params.email]) {
        res.sendStatus(404);
        res.send('Not found');

        return;
    }

    // Remove auser from our global object
    delete registeredUsers[req.params.email];

    res.redirect('/');
});

app.listen(port, ip, () => {
    console.log(`Server running at http://${ip}:${port}/`);
});