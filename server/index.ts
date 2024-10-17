import express from 'express';
import getNotes from './routes/getNotes';
import postNotes from './routes/postNotes';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

const connection = mysql.createPool({
    host: 'localhost',
    user: process.env.mysql_username,
    password: process.env.mysql_password,
    database: 'cloud_notes',
});

app.db = connection;

app.get('/notes', getNotes);
app.post('/notes', postNotes);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
