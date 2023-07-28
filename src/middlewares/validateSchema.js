export function validateSchema(schema) {
    return (req, res, next) => {
        const validate = schema.validate(req.body, { abortEarly: false });
        if (validate.error) {
            const errors = validate.error.details.map(detail => detail.message);
            console.log(errors)
            return res.status(400).send(errors);
        }
        next();
    }
}
