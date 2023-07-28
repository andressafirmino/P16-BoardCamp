import joi from "joi";

export const postRentalsSchema = joi.object({
    customerId: joi.number(),
    gameId: joi.number(),
    daysRented: joi.number()
})