import { db } from "../database/database.js";

export async function getRentals(req, res) {

}

export async function postRentals(req, res) {
    const {customerId, gameId, daysRented} = req.body;
    try {

        res.sendStatus(201);
    } catch (e) {
        res.status(500).send(e.message);
    }
}