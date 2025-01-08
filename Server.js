const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// SQL Server configuration
const dbConfig = {
    user: 'your_db_user',
    password: 'your_db_password',
    server: 'your_db_server',
    database: 'your_db_name',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// API route to save quiz data
app.post('/save-quiz', async (req, res) => {
    try {
        const { userName, quizName, score } = req.body;
        const dateTimeTaken = new Date();

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('UserName', sql.NVarChar, userName)
            .input('QuizName', sql.NVarChar, quizName)
            .input('DateTimeTaken', sql.DateTime, dateTimeTaken)
            .input('Score', sql.Int, score)
            .query(`
                INSERT INTO Quizzes (UserName, QuizName, DateTimeTaken, Score)
                VALUES (@UserName, @QuizName, @DateTimeTaken, @Score)
            `);

        res.send('Quiz saved successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving quiz data.');
    }
});

// API route to fetch all quizzes
app.get('/quizzes', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Quizzes ORDER BY QuizID DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching quizzes.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
