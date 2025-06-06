// server.js
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
const sessionRoutes = require('./routes/session');
const cors = require('cors');

// Charge les variables d'environnement à partir du fichier .env
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use('/api/session', sessionRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
