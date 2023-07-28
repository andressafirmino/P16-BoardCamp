import joi from "joi";

export const postGameSchema = joi.object({
        name: joi.string().required(),
        image: joi.string(),
        stockTotal: joi.number().integer().min(1).required(),
        pricePerDay: joi.number().min(1).required()
      }
)