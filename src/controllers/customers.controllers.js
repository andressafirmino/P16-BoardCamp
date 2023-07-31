import { db } from "../database/database.js";

export async function getCustomers(req, res) {

    const {cpf, offset, limit, order, desc} = req.query;

    try {
        let query = 'SELECT * FROM customers';
        const customers = [];

        if (typeof cpf !== 'underfined' && cpf !== '') {
            customers.push(`${cpf}%`);
            query += 'WHERE cpf LIKE $1';
        }
        if (typeof offset !== 'underfined' && offset !== '') {
            customers.push(offset);
            query += ' OFFSET $' + customers.length;
        }
        if (typeof limit !== 'underfined' && limit !== '') {
            customers.push(limit);
            query += ' LIMIT $' + customers.length;
        }
        if (typeof order !== 'underfined' && order !== '') {
            const validadeColumn = ['name', 'id', 'cpf', "phone", "birthday"]

            if (validadeColumn.includes(order)) {
                query += ' ORDER BY "' + order + '"';
                if (typeof desc !== 'underfined' && desc.toLowerCase() === 'true') {
                    query += ' DESC';
                }
            } else {
                return res.status(400).send({message: "Parâmetro inválido!"});
            }            
        }
        const result = await db.query(query, customers);
        const updatedData = result.rows.map(item => {
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