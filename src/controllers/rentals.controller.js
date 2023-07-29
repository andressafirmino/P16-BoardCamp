import { db } from "../database/database.js";

export async function getRentals(req, res) {

}

export async function postRentals(req, res) {
    const {customerId, gameId, daysRented} = req.body;

    try {
        const price = await db.query(`SELECT ("pricePerDay") FROM games WHERE id = $1;`, [gameId]);
        await db.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") 
        VALUES ($1, $2, $3, $4, $5, $6, $7);`, [customerId, gameId, new Date(), daysRented, null, 3*price.rows[0].pricePerDay, null]);
        res.sendStatus(201);
    } catch (e) {
        res.status(500).send(e.message);
    }
}