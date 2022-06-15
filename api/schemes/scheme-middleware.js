const db = require('../../data/db-config');

/*
  If `scheme_id` does not exist in the database:

  status 404
  {
    "message": "scheme with scheme_id <actual id> not found"
  }
*/
const checkSchemeId = (req, res, next) => {
  const id = req.params.scheme_id;
  db('schemes')
    .where({ scheme_id: id })
    .first()
    .then(result => {
      if (!result) {
        res.status(404).json({ message: `scheme with scheme_id ${req.params.scheme_id} not found` });
        return;
      }

      next();
    })

}

/*
  If `scheme_name` is missing, empty string or not a string:

  status 400
  {
    "message": "invalid scheme_name"
  }
*/
const validateScheme = (req, res, next) => {

  if (!(req.body).hasOwnProperty('scheme_name')
      || !req.body.scheme_name
      || req.body.scheme_name.toString() !== req.body.scheme_name) {
    res.status(400).json({ message: 'invalid scheme_name' });
    return;
  }

  next();
}

/*
  If `instructions` is missing, empty string or not a string, or
  if `step_number` is not a number or is smaller than one:

  status 400
  {
    "message": "invalid step"
  }
*/
const validateStep = (req, res, next) => {

  if (!(req.body).hasOwnProperty('instructions')
      || !req.body.instructions
      || req.body.instructions.toString() !== req.body.instructions
      || !(req.body).hasOwnProperty('step_number')
      || 0+req.body.step_number !== req.body.step_number
      || req.body.step_number < 0) {
    res.status(400).json({ message: 'invalid step' });
    return;
  }

  next();
}

module.exports = {
  checkSchemeId,
  validateScheme,
  validateStep,
}
