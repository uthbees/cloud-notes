import express from 'express';
import getNotes from './routes/getNotes';
import postNote from './routes/postNote';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import patchNote from './routes/patchNote';
import deleteNote from './routes/deleteNote';

dotenv.config();

const connection = mysql.createPool({
    host: 'localhost',
    user: process.env.mysql_username,
    password: process.env.mysql_password,
    database: 'cloud_notes',
});

const app = express();
app.use(express.json({ limit: '500kb' }));

app.db = connection;

app.get('/notes', getNotes);
app.post('/notes', postNote);
app.patch('/notes/:uuid', patchNote);
app.delete('/notes/:uuid', deleteNote);

const port = 3001;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
