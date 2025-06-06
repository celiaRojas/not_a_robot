const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// models
const User = require('../models/User');
const Login = require('../models/Login');


// Ajouter un nouvel utilisateur
router.post('/create', async (req, res) => {
    const { firstname, lastname, password, mail } = req.body;

    try {
        // Créez un nouvel utilisateur avec le modèle
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User(firstname, lastname, hashedPassword, mail);

        let sql = 'INSERT INTO USER (FIRSTNAME, LASTNAME, PASSWORD, MAIL) VALUES (?, ?, ?, ?)';
        db.query(sql, [newUser.firstname, newUser.lastname, newUser.password, newUser.mail], (err, result) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                res.json({ message: 'User added successfully' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error encrypting the password' });
    }
});

// Route pour connecter un utilisateur
router.post('/login', (req, res) => {
    const { mail, password } = req.body;

    let sql = 'SELECT * FROM USER WHERE MAIL = ?';
    db.query(sql, [mail], async (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else if (results.length === 0) {
            res.status(400).json({ error: 'Email incorrect' });
        } else {
            const user = results[0];
            const match = await bcrypt.compare(password, user.PASSWORD);

            if (match) {
                const token = jwt.sign({ id: user.ID, mail: user.MAIL }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({
                    token,
                    user: {
                        id: user.ID,
                        firstname: user.FIRSTNAME,
                        lastname: user.LASTNAME,
                        mail: user.MAIL
                    }
                });
            } else {
                res.status(400).json({ error: 'Mot de passe invalide' });
            }
        }
    });
});

// Route pour réinitialiser le mot de passe
router.post('/resetpassword', (req, res) => {
    const { idUser, mail, oldPassword, newPassword } = req.body;

    let sql = 'SELECT * FROM USER WHERE ID = ? AND MAIL = ?';
    db.query(sql, [idUser, mail], async (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else if (results.length === 0) {
            res.status(400).json({ error: 'Utilisateur non trouvé' });
        } else {
            const user = results[0];
            const match = await bcrypt.compare(oldPassword, user.PASSWORD);

            if (match) {
                const hashedNewPassword = await bcrypt.hash(newPassword, 10);
                let updateSql = 'UPDATE USER SET PASSWORD = ? WHERE ID = ? AND MAIL = ?';
                db.query(updateSql, [hashedNewPassword, idUser, mail], (updateErr, updateResult) => {
                    if (updateErr) {
                        res.status(500).json({ error: updateErr });
                    } else {
                        res.json({ message: 'Mot de passe modifié avec succès' });
                    }
                });
            } else {
                res.status(400).json({ error: 'Ancien mot de passe invalide' });
            }
        }
    });
});

// Route pour envoyer un mail de reset password
router.post('/send-mail-reset-password', async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email requis.' });

    try {
        // Vérification si l’email existe en BDD
        const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Adresse email introuvable.' });
        }

        const user = users[0];

        // 2. Génération du token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const resetLink = `http://localhost:4200/reset-password/${token}`;

        // 3. Envoi de l’email
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',  // serveur SMTP Outlook
            port: 587,
            secure: false,               // STARTTLS est utilisé (false ici)
            auth: {
                user: process.env.MAIL_USER,  // ton email Outlook
                pass: process.env.MAIL_PASS,  // ton mot de passe Outlook ou mot de passe d'application
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        const mailOptions = {
            from: 'noreply@tonsite.com',
            to: email,
            subject: 'Réinitialisation de mot de passe',
            text: `Bonjour ${user.name},\n\nClique sur ce lien pour réinitialiser ton mot de passe :\n\n${resetLink}\n\nCe lien expire dans 15 minutes.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Email envoyé avec succès.' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;
