import { db } from "../database/database.js";


export async function getGame(req, res) {

    const { name, offset, limit, order, desc } = req.query

    try {
        let query = 'SELECT * FROM games';
        const games = [];

        if (typeof name !== 'underfined' && name !== '') {
            games.push(`${name}%`);
            query += 'WHERE name LIKE $1';
        }
        if (typeof offset !== 'underfined' && offset !== '') {
            games.push(offset);
            query += ' OFFSET $' + games.length;
        }
        if (typeof limit !== 'underfined' && limit !== '') {
            games.push(limit);
            query += ' LIMIT $' + games.length;
        }
        if (typeof order !== 'underfined' && order !== '') {
            const validadeColumn = ['name', 'id', 'image', "stockTotal", "pricePerDay"]

            if (validadeColumn.includes(order)) {
                query += ' ORDER BY "' + order + '"';
                if (typeof desc !== 'underfined' && desc.toLowerCase() === 'true') {
                    query += ' DESC';
                }
            } else {
                return res.status(400).send({message: "Parâmetro inválido!"});
            }            
        }
        const result = await db.query(query, games);
        const request = result.rows;
        res.send(request);
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
        await db.query(`INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4);`, [name, image, stockTotal, pricePerDay]);

        res.sendStatus(201);
    } catch (e) {
        res.status(500).send(e.message);
    }
}