const express = require('express');
const app = express();
const port = 3000;
const userId = 1;

// app.js
const postgres = require('postgres');
require('dotenv').config();

app.use(express.json());


app.use(express.static('public'));

const sql = postgres({
    host: 'ep-crimson-meadow-a1ts5lsq.ap-southeast-1.aws.neon.tech',
    database: 'The Box',  // Decoded from URL encoding for clarity and correct usage
    user: 'The Box_owner',  // Decoded and changed 'username' to 'user'
    password: 'q5aBdXfk8UEr',
    port: 5432,
    ssl: {
      require: true,  // Changed to a more typical SSL configuration object
      rejectUnauthorized: false  // You may need this if you do not have the CA certificate
    },
    connection: {
      options: `project=ep-crimson-meadow-a1ts5lsq`,  // Removed unnecessary template literal
    },
  });
  

async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result);
}

getPgVersion();

//__________________________________________________________________
//get boxes for a user
async function getAllBoxesForUser(userId) {
    try {
        const result = await sql`
            SELECT b.boxid, b.balance, b.targetvalue, b.minvalue, b.boxname, b.dateofcreation, p.fname AS admin
            FROM Box b
            JOIN Person p ON b.admin = p.personID
            WHERE b.admin = ${userId};
        `;
        return result;
    } catch (error) {
        console.error('Error fetching boxes for user:', error);
        return [];
    }
}

app.get('/boxes', async (req, res) => {
     // Assuming the user ID is passed 
    const boxes = await getAllBoxesForUser(userId);
    res.json(boxes);
});


// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


//__________________________________________________________________
// handling request of loans
app.post('/submit-loan', async (req, res) => {
    const { boxId, amount, justification, userId } = req.body;
    try {
        const currentDate = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
        await sql`
            INSERT INTO Request (boxID, dateOfRequest, justification, personID, status, amount)
            VALUES (${boxId}, ${currentDate}, ${justification}, ${userId}, 'request in process', ${amount});
        `;
        res.json({ message: 'Loan request submitted successfully.' });
    } catch (error) {
        console.error('Error submitting loan request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//________________________________________________________________
// handling user loans:


app.get('/user-loans', async (req, res) => {
    try {
        const userLoans = await sql`
            SELECT * FROM Loan WHERE personID = ${userId} AND status = 'request in process';
        `;
        res.json(userLoans);
    } catch (error) {
        console.error('Error fetching user loans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/pay-loan', async (req, res) => {
    const { loanId } = req.body;
    console.log("Received loanId to pay:", loanId);  // Ensure loanId is not undefined

    if (!loanId) {
        return res.status(400).json({ error: 'loanId is required' });
    }

    try {
        await sql`
            UPDATE Loan SET status = 'paid' WHERE loanID = ${loanId};
        `;
        res.json({ message: 'Loan paid successfully.' });
    } catch (error) {
        console.error('Error paying loan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//________________________________________________________________
app.post('/create-box', async (req, res) => {
    const { boxName, targetValue, minValue, admin, startingBalance } = req.body;
    const dateOfCreation = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    try {
        const result = await sql`
            INSERT INTO Box (boxName, targetValue, minValue, admin, balance, dateOfCreation)
            VALUES (${boxName}, ${targetValue}, ${minValue}, ${admin}, ${startingBalance}, ${dateOfCreation})
            RETURNING boxID;
        `;
        res.json({ message: 'Box created successfully.', boxID: result[0].boxID });
    } catch (error) {
        console.error('Error creating box:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



