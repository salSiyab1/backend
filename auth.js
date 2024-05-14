const express = require('express');
const app = express();
const port = 3000;

// app.js
const postgres = require('postgres');
require('dotenv').config();

app.use(express.json());


app.use(express.static('public'));

  app.post('/register', async (req, res) => {
    const { Fname, username, email, password } = req.body;
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        await sql`INSERT INTO person (Fname, username, email, password) VALUES (${Fname}, ${username}, ${email}, ${hashPassword})`;
        res.redirect('/Sign_In.html');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error registering user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await sql`SELECT * FROM person WHERE email = ${email}`;
        if (user.length > 0) {
            const validPassword = await bcrypt.compare(password, user[0].password);
            if (validPassword) {
                res.redirect('/index.html');
            } else {
                res.status(400).send('Invalid password');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error logging in');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});