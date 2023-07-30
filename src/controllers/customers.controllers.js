import { db } from "../database/database.js";

export async function getCustomers(req, res) {

    const {cpf} = req.query;

    try {
        let customers = [];
        if (typeof cpf !== 'undefined' && cpf !== '') {
            // Construir a consulta SQL usando o operador LIKE
            customers = await db.query(`SELECT * FROM games WHERE name LIKE $1;`, [`${cpf}%`]);

            // Execute a consulta SQL no banco de dados aqui
        } else {
            customers = await db.query(`SELECT * FROM customers;`);
        }
        const updatedData = customers.rows.map(item => {
            const date = new Date(item.birthday);
            const formatDate = date.toISOString().split('T')[0];
            return {
                ...item,
                birthday: formatDate
            }
        });
        res.send(updatedData);
    } catch (e) {
        res.status(500).send(e.message);
    }
}

export async function getCustomersId(req, res) {
    const { id } = req.params;

    try {
        const customer = await db.query(`SELECT * FROM customers WHERE id= $1;`, [id]);
        if (customer.rows.length === 0) {
            return res.status(404).send({ message: "Usuário não encontrado!" });
        }
        const updatedData = customer.rows.map(item => {
            const date = new Date(item.birthday);
            const formatDate = date.toISOString().split('T')[0];
            return {
                ...item,
                birthday: formatDate
            }
        });
        res.send(updatedData[0]);
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

export async function putCustomers(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    const { id } = req.params;

    try {
        const user = await db.query(`SELECT * FROM customers WHERE cpf = $1 ;`, [cpf]);
                
        if (user.rows.length !== 0 && user.rows[0].id !== parseInt(id)) {
            return res.status(409).send({ message: "Cliente já cadastrado!" });
        }
        await db.query(`UPDATE customers SET name = $1, phone = $2, 
        cpf = $3, birthday = $4 WHERE id = $5;`, [name, phone, cpf, birthday, parseInt(id)]);

        res.sendStatus(200);
    } catch (e) {
        res.status(500).send(e.message);
    }
}