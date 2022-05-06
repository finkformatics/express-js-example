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
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    // null means, no registration attempt was made, true means, they're registered and false means there was an error
    let registered = null;
    if ('success' in req.query) {
        registered = req.query.success === 'true';
    }

    res.render('index', { registered: registered, registeredUsers: registeredUsers });
});

app.post('/register', (req, res) => {
    if (!req.body['name']) {
        res.redirect('/?success=false');
        return;
    }

    if (!req.body['email']) {
        res.redirect('/?success=false');
        return;
    }

    let name = req.body.name;
    let email = req.body.email;

    if (email in registeredUsers) {
        res.redirect('/?success=false');
        return;
    }

    registeredUsers[email] = new RegisteredUser(name, email);

    res.redirect('/?success=true')
});

// This is a little messy, since mail addresses are not necessarily url safe, better to use some kind of id or hash for that
app.get('/user/:email', (req, res) => {
    // You should put some protection here
    if (!registeredUsers[req.params.email]) {
        console.log(registeredUsers);
        res.sendStatus(404);
        res.send('Not found');

        return;
    }

    let registeredUser = registeredUsers[req.params.email];

    res.render('user', { registeredUser: registeredUser });
});

// Same here
app.get('/unregister/:email', (req, res) => {
    // You should put some protection here
    if (!registeredUsers[req.params.email]) {
        res.sendStatus(404);
        res.send('Not found');

        return;
    }

    delete registeredUsers[req.params.email];

    res.redirect('/');
});

app.listen(port, ip, () => {
    console.log(`Server running at http://${ip}:${port}/`);
});