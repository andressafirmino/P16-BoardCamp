import { db } from "../database/database.js";

export async function getRentals(req, res) {
    try {
        const rentals = await db.query(`
        SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name) AS game
        FROM rentals
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id
        ;`);
        console.log(rentals.rows)
        const updatedData = rentals.rows.map(item => {
            const date = new Date(item.rentDate);
            const formatDate = date.toISOString().split('T')[0];
            return {
                ...item,
                rentDate: formatDate
            }
        });
        res.send(updatedData);
    } catch (e) {
        res.status(500).send(e.message);
    }

}

export async function postRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body;

    try {
        const customer = await db.query(`SELECT * FROM customers WHERE id= $1;`, [customerId]);
        const game = await db.query(`SELECT * FROM games WHERE id= $1;`, [gameId]);
        const rental = await db.query(`SELECT * FROM rentals WHERE "gameId"= $1;`, [gameId]);
        
        if (customer.rows.length === 0 || game.rows.length === 0 || game.rows[0].stockTotal <= rental.rows.length) {
            return res.sendStatus(400);
        }
        const price = await db.query(`SELECT ("pricePerDay") FROM games WHERE id = $1;`, [gameId]);
        await db.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") 
        VALUES ($1, $2, $3, $4, $5, $6, $7);`, [customerId, gameId, new Date(), daysRented, null, daysRented * game.rows[0].pricePerDay, null]);
        res.sendStatus(201);
    } catch (e) {
        res.status(500).send(e.message);
    }
}