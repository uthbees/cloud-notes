import express from 'express';
import getNotes from './routes/getNotes';
import postNotes from './routes/postNotes';
import mysql from 'mysql';

const app = express();
const port = 3001;

const connection = mysql.createPool({
    host: 'localhost',
    user: 'me',
    password: 'insecure-hardcoded-password', // TODO: Use an .env file instead of hardcoding the password like this
    database: 'my_db',
});

app.db = connection;

// example
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//     if (error) throw error;
//     console.log('The solution is: ', results[0].solution);
// });

app.get('/notes', getNotes);
app.post('/notes', postNotes);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
