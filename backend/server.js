const express = require('express');
const { NFC } = require('nfc-pcsc');
const WebSocket = require('ws');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const app = express();

  

app.use(express.json());
app.use(cors(
    {
    origin: ["http://localhost:5173"],
    methods: ["POST, GET"],
    credentials: true
    }
));
app.use(cookieParser());


//This is connecttion for database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cspclibray_log'
});

try {
    connection.connect();
    console.log("Connected to the database");
} catch (error) {
    console.error("Error connecting to database:", error.message);
}

// //This is handle for scanner 
const wss = new WebSocket.Server({ port: 8081 });
const eventEmitter = new NFC();
const connections = new Set();

wss.on('connection', function connection(ws) {
    console.log('WebSocket connection established.');

    connections.add(ws);

    ws.on('close', function () {
        connections.delete(ws);
        console.log('WebSocket connection closed.');
    });
});

eventEmitter.on('reader', reader => {
    reader.on('card', async card => {
        console.log(`${reader.reader.name} card detected`, card);

        const uid = card.uid.toString('hex');

        // Query user data from the database based on UID
        const query = `SELECT * FROM users WHERE smartid = '${uid}'`;

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error querying MySQL:', error);
                return;
            }

            if (results.length === 0) {
                console.log('User not found for UID:', uid);
                connections.forEach(ws => {
                    ws.send(`User not found for UID: ${uid}`);
                });
                return;
            }

            const userData = results[0];

            // Send user data to all connected clients
            connections.forEach(ws => {
                ws.send(JSON.stringify(userData));
            });


// Construct the query
const logQuery = `INSERT INTO log (department, student_no, time_in , date) VALUES (?, ?, DATE_FORMAT(NOW(), '%H:%i:%s'), NOW())`;
const logValues = [userData.department, userData.student_no];

            connection.query(logQuery, logValues, (err, result) => {
                if (err) {
                    console.error('Error inserting data into log table:', err);
                    return;
                }
                console.log('Data inserted into log table successfully');
            });
        });
    });

    reader.on('error', err => {
        console.log(`${reader.reader.name} an error occurred`, err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name} device removed`);
    });
});

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        return res.json({Message: "We need token please provide it."})
    }else{
        jwt.verify(token, "cspclibrary", (err, decoded) => {
            if(err){
                return res.json({Message: "Auth Error"})
            } else {
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/dashboard',verifyUser, (req, res) => {
    return res.json({Status: "Success", name: req.name})
})


app.post('/login', (req, res) => {
    const sql = "SELECT * FROM account WHERE username = ? AND password = ?";
    connection.query(sql, [req.body.username, req.body.password], (err, data) => {
        if(err) return res.json({Message: "Server Side Error"});
        if(data.length > 0){ 
            const name = data[0].name;
            const token = jwt.sign({name}, "cspclibrary", {expiresIn: '1d'});
            res.cookie('token', token);
            return res.json({Status: "Success"})
        } else {
            return res.json({Message: "No Records Found!"});
        }
    })
})
          

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Success"})
})

app.post('/register', (req, res) => {
    const userData = req.body;

  
    connection.query('INSERT INTO users SET ?', userData, (error, results, fields) => {
        if (error) {
            console.error('Error inserting user data into database: ' + error.stack);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        console.log('User data inserted successfully!');
        res.status(200).json({ message: 'Register Successful' });
    });
});


app.get('/piechart', (req, res) => {
    const query = 'SELECT * FROM log';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        console.log(results);
        res.json(results);
    });
});


// New endpoint to fetch logs by specific date
app.get('/logs', (req, res) => {
    const { year, month, day } = req.query;

    if (!year || !month) {
        res.status(400).json({ error: 'Please provide year and month parameters.' });
        return;
    }

    let startDate, endDate;
    if (day) {
        startDate = `${year}-${month}-${day}`;
        endDate = `${year}-${month}-${(parseInt(day) + 1).toString().padStart(2, '0')}`;
    } else {
        startDate = `${year}-${month}-01`;
        endDate = new Date(year, month, 0).toISOString().split('T')[0];
    }

    const query = 'SELECT * FROM log WHERE date >= ? AND date < ?';
    connection.query(query, [startDate, endDate], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        console.log(results);
        res.json(results);
    });
});




// Start the server
app.listen(5000, () => {
    console.log("Your server is running!");
})