import { db } from "../database/database.js";

export async function getCustomers(req, res) {

    try {
        const customers = await db.query(`SELECT * FROM customers;`);
        res.send(customers.rows);
    } catch (e) {
        res.status(500).send(e.message);
    }
}