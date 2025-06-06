const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Session = require('../models/Session');

// Ajouter nouvel session
router.post('/add', async (req, res) => {
    const { name, date, duration, userId } = req.body;
    const status = 'A venir';

    try {
        const newSession = { name, date, duration, status, user: userId };

        let sqlInsert = 'INSERT INTO SESSION (NAME, DATE, DURATION, STATUS, USER) VALUES (?, ?, ?, ?, ?)';
        db.query(sqlInsert, [newSession.name, newSession.date, newSession.duration, newSession.status, newSession.user], (err, result) => {
            if (err) {
                console.error('Error inserting session:', err);
                res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout de votre session' });
            } else {
                const insertedId = result.insertId;
                let sqlSelect = 'SELECT id, name, date, duration, status FROM SESSION WHERE id = ?';
                db.query(sqlSelect, [insertedId], (err, rows) => {
                    if (err) {
                        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de la session' });
                    } else {
                        res.json(rows[0]);
                    }
                });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout de votre session' });
    }
});
// récup toutes les sessions de l'user
router.post('/', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'id utilisateur manquant dans la requête' });
    }

    let sql = 'SELECT id, name, date, duration, status FROM SESSION WHERE USER = ?';

    db.query(sql, [userId], (err, sessions) => {
        if (err) {
            res.status(500).json({ error: 'Erreur lors de la récupération des sessions' });
        } else {
            res.json(sessions);
        }
    });
});

// / récup session par id
router.get('/:id', (req, res) => {
    const sessionId = req.params.id;

    let sql = 'SELECT id, name, date, duration, status FROM SESSION WHERE ID = ?';

    db.query(sql, [sessionId], (err, session) => {
        if (err) {
            res.status(500).json({ error: 'Erreur lors de la récupération de la session' });
        } else {
            res.json(session[0]);
        }
    });
});

// / supp une session
router.delete('/delete/:id', (req, res) => {
    const sessionId = req.params.id;
    let sql = 'DELETE FROM SESSION WHERE ID = ?';

    db.query(sql, [sessionId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Erreur lors de la suppression de la session' });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({ message: 'Session non trouvée' });
            } else {
                res.status(200).json({ message: 'Session supprimée avec succès' });
            }
        }
    });
});

//update session
router.put('/update', async (req, res) => {
    const { id, name, date, duration, userId } = req.body;

    try {
        const sqlUpdate = 'UPDATE SESSION SET NAME = ?, DATE = ?, DURATION = ? WHERE id = ? AND USER = ? ';
        db.query(sqlUpdate, [name, date, duration, id, userId], (err, result) => {
            if (err) {
                console.error('Error updating session:', err);
                res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de votre session' });
            } else {
                res.status(200).json({ message: 'Session modifié avec succès' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de votre session' });
    }
});
module.exports = router;