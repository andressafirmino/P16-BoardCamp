import { db } from "../database/database.js";


export async function getGame(req, res) {

    try {
        const games = await db.query(`SELECT * FROM games;`);
        res.send(games.rows);
    } catch (e) {
        res.status(500).send(e.message);
    }
}