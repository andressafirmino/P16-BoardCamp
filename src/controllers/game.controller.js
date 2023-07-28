import { db } from "../database/database.js";


export async function getGame(req, res) {

    try {
        const games = await db.query(`SELECT * FROM games;`);
        res.send(games.rows);
    } catch (e) {
        res.status(500).send(e.message);
    }
}

export async function postGame(req, res) {
    const { name, image, stockTotal, pricePerDay } = req.body;

    try {
        const game = await db.query(`SELECT * FROM games WHERE name = $1;`, [name]);
        if (game.rows.length !== 0) {
            return res.status(409).send({ message: "Jogo já cadastrado!" });
        }
        await db.query(`INSERT INTO games (name, image, stockTotal, pricePerDay) VALUES ($1, $2, $3, $4);`, [name, image, stockTotal, pricePerDay]);

        res.sendStatus(201);
    } catch (e) {
        res.status(500).send(e.message);
    }
}