import { validationResult } from 'express-validator';

// Runs after express-validator check() chains; short-circuits with 400 on failure
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export default validateRequest;