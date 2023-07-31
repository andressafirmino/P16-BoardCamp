import { db } from "../database/database.js";

export async function getRentals(req, res) {
    const { customerId, gameId, offset, limit, order, desc, status, startDate } = req.query;

    try {
        const rentals = [];
        let query = `
        SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name) AS game
        FROM rentals
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id
        `;
        const conditional = []
        if (typeof customerId !== 'undefined' && customerId !== '') {
            rentals.push(customerId);
            conditional.push(`"customerId" = $${rentals.length}`);
        }
        if (typeof gameId !== 'undefined' && gameId !== '') {
            rentals.push(gameId);
            conditional.push(`"gameId" = $${rentals.length}`);
        }       
        if (typeof order !== 'undefined' && order !== '') {
            const validadeColumn = ['id', "customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee"];

            if (validadeColumn.includes(order)) {
                query += ` ORDER BY "${order}"`;
                if (typeof desc !== 'undefined' && desc.toLowerCase() === 'true') {
                    query += ' DESC';
                }
            } else {
                return res.status(400).send({message: "Parâmetro inválido!"});
            }            
        }
        if(typeof startDate !== 'undefined' && startDate !== '') {
            const formatStartDate = new Date(startDate);
            if(isNaN(formatStartDate)){
                return res.status(400).send({message: "Data inválida!"});
            }
            const formatDate = formatStartDate.toISOString().split('T')[0];
            rentals.push(formatDate);
            conditional.push(`"rentDate" >= $${rentals.length}`);
        }
        const validateStatus = {
            open: ' "returnDate" IS NULL',
            close: ' "returnDate" IS NOT NULL'
        }
        if(typeof status !== 'undefined' && status in validateStatus) {
            conditional.push(validateStatus[status])
        } else if(typeof status !== 'undefined') {
            return res.status(400).send({message: "Status inválido!"});
        }
        if(conditional.length > 0) {
            query += ' WHERE' + conditional.join(' AND ');
        }
        if (typeof offset !== 'undefined' && offset !== '') {
            rentals.push(offset);
            query += ' OFFSET $' + rentals.length;
        }
        if (typeof limit !== 'undefined' && limit !== '') {
            rentals.push(limit);
            query += ' LIMIT $' + rentals.length;
        }
        const result = await db.query(query, rentals);
        const updatedData = result.rows.map(item => {
            const date = new Date(item.rentDate);
            const formatDate = date.toISOString().split('T')[0];
            return {
                ...item,
                rentDate: formatDate,
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
// dias atrasados
let delay = 0;
// multa por atraso
let delayF = 0;
function counterDays(rented, days, returned) {
    
    let formatRented = new Date(rented);
    formatRented.setDate(formatRented.getDate() + days);
    const rentDate = new Date(formatRented);
    const formatDate = rentDate.toISOString().split('T')[0];

    const dat1 = new Date(returned);
    const dat2 = new Date(formatDate);
    const result = dat1 - dat2;
    const time = 24 * 60 * 60 * 1000;
    delay = result / time;
}

export async function postReturn(req, res) {
    const { id } = req.params;

    try {
        const rental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
        if (rental.rows.length === 0) {
            return res.status(404).send({ message: "Aluguel não encontrado!" });
        }
        if (rental.rows[0].returnDate !== null) {
            return res.status(400).send({ message: "Jogo já devolvido!" });
        }
        const rentDate = new Date(rental.rows[0].rentDate);
        const formatDate = rentDate.toISOString().split('T')[0];

        const currentDate = new Date()
        const formatCurrentDate = currentDate.toISOString().split('T')[0];
        counterDays(formatDate, rental.rows[0].daysRented, formatCurrentDate);

        if (delay > 0) {
            delayF = delay * (rental.rows[0].originalPrice / rental.rows[0].daysRented)
        }

        await db.query(`UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;`, [new Date(), delayF, id]);
        res.sendStatus(200);
    } catch (e) {
        res.status(500).send(e.message);
    }
}

export async function deleteRentals(req, res) {
    const { id } = req.params;

    try {
        const rental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id]);
        if (rental.rows.length === 0) {
            return res.status(404).send({ message: "Aluguel não encontrado!" });
        }
        if (rental.rows[0].returnDate === null) {
            return res.status(400).send({ message: "Jogo não devolvido!" });
        }
        await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);
        res.sendStatus(200);
    } catch (e) {
        res.status(500).send(e.message);
    }
}
