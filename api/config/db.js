const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config(); // Charge les variables d'environnement à partir du fichier .env

// Configurer la connexion à la base de données
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Database Connected...');
});

module.exports = db;
