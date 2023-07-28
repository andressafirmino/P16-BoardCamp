import { db } from "../database/database.js";

export async function getCustomers(req, res) {

    try {
        const customers = await db.query(`SELECT * FROM customers;`);
        res.send(customers.rows);
    } catch (e) {
        res.status(500).send(e.message);
    }
}

export async function getCustomersId(req, res) {
    const {id} = req.params;

    try {
        const customer = await db.query(`SELECT * FROM customers WHERE id= $1;`, [id]);
        if(customer.rows.length === 0) {
            return res.status(404).send({ message: "Usuário não encontrado!" });
        }
        res.send(customer.rows);
    } catch (e) {
        res.status(500).send(e.message);
    }
}

export async function postCustomers(req, res) {
    const { name, phone, cpf, birthday } = req.body;

    try {
        const user = await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf]);
        if (user.rows.length !== 0) {
            return res.status(409).send({ message: "Cliente já cadastrado!" });
        }
        await db.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`, [name, phone, cpf, birthday]);

        res.sendStatus(201);
    } catch (e) {
        res.status(500).send(e.message);
    }
}
