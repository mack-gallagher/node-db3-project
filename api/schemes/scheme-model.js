const db = require('../../data/db-config');

function find() { // EXERCISE A
  /*
    1A- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`.
    What happens if we change from a LEFT join to an INNER join?

      SELECT
          sc.*,
          count(st.step_id) as number_of_steps
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      GROUP BY sc.scheme_id
      ORDER BY sc.scheme_id ASC;

    2A- When you have a grasp on the query go ahead and build it in Knex.
    Return from this function the resulting dataset.
  */ 

  return db('schemes')
    .select('*')
    .count('steps.step_id AS number_of_steps')
    .leftJoin('steps','schemes.scheme_id','=','steps.scheme_id')
    .groupBy('steps.scheme_id')
    .orderBy('steps.scheme_id', 'asc')
    .then(schemes => {

      let k = 0;
      for (let i = 0; i < schemes.length; i++) {
        if (schemes[i].scheme_id > k) {
          k = schemes[i].scheme_id; 
        }
      }

      k++;

      for (let i = 0; i < schemes.length; i++) {
        if (!schemes[i].scheme_id) {
          schemes[i].scheme_id = k;
          k++;
        }
      }

      return schemes.sort((a,b) => { return a.scheme_id - b.scheme_id });
    })
}

function findById(scheme_id) { // EXERCISE B
  /*
    1B- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`:

      SELECT
          sc.scheme_name,
          st.*
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      WHERE sc.scheme_id = 1
      ORDER BY st.step_number ASC;

    2B- When you have a grasp on the query go ahead and build it in Knex
    making it parametric: instead of a literal `1` you should use `scheme_id`.

    3B- Test in Postman and see that the resulting data does not look like a scheme,
    but more like an array of steps each including scheme information:

      [
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 2,
          "step_number": 1,
          "instructions": "solve prime number theory"
        },
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 1,
          "step_number": 2,
          "instructions": "crack cyber security"
        },
        // etc
      ]

    4B- Using the array obtained and vanilla JavaScript, create an object with
    the structure below, for the case _when steps exist_ for a given `scheme_id`:

      {
        "scheme_id": 1,
        "scheme_name": "World Domination",
        "steps": [
          {
            "step_id": 2,
            "step_number": 1,
            "instructions": "solve prime number theory"
          },
          {
            "step_id": 1,
            "step_number": 2,
            "instructions": "crack cyber security"
          },
          // etc
        ]
      }

    5B- This is what the result should look like _if there are no steps_ for a `scheme_id`:

      {
        "scheme_id": 7,
        "scheme_name": "Have Fun!",
        "steps": []
      }
  */

  return db('schemes')
    .select('*')
    .select('steps.*')
    .leftJoin('steps','schemes.scheme_id','=','steps.scheme_id')
    .where('schemes.scheme_id',scheme_id)
    .then(result => {
      const ans = {};
      ans.scheme_id = parseInt(scheme_id);
      ans.scheme_name = result[0].scheme_name;
      ans.steps = [];
      let new_part = {};
      for (let i = 0; i < result.length; i++) {
        if (!result[i].step_id) break;
        new_part.step_id = parseInt(result[i].step_id);
        new_part.instructions = result[i].instructions;
        new_part.step_number = parseInt(result[i].step_number);
        ans.steps.push(new_part);
        new_part = {};
      }
      ans.steps = ans.steps.sort((a,b) => a.step_number-b.step_number);
      return ans;
    })

}

function findSteps(scheme_id) { // EXERCISE C
  /*
    1C- Build a query in Knex that returns the following data.
    The steps should be sorted by step_number, and the array
    should be empty if there are no steps for the scheme:

      [
        {
          "step_id": 5,
          "step_number": 1,
          "instructions": "collect all the sheep in Scotland",
          "scheme_name": "Get Rich Quick"
        },
        {
          "step_id": 4,
          "step_number": 2,
          "instructions": "profit",
          "scheme_name": "Get Rich Quick"
        }
      ]
  */

  return db('schemes')
    .select('schemes.scheme_name')
    .select('steps.step_id','steps.step_number','steps.instructions')
    .join('steps','schemes.scheme_id','=','steps.scheme_id')
    .where({ 'schemes.scheme_id': scheme_id })
    .orderBy('steps.step_number','asc')
    .then(result => {
      for (let i = 0; i < result.length; i++) {
        result[i].step_number = parseInt(result[i].step_number);
        result[i].step_id = parseInt(result[i].step_number);
      }
      return result;
    });

}

function add(scheme) { // EXERCISE D
  /*
    1D- This function creates a new scheme and resolves to _the newly created scheme_.
  */

  return db('schemes')
    .insert(scheme)
    .then(ids => {
      return db('schemes')
              .where({ scheme_id: ids[0] })
              .first();
    })
}

function addStep(scheme_id, step) { // EXERCISE E
  /*
    1E- This function adds a step to the scheme with the given `scheme_id`
    and resolves to _all the steps_ belonging to the given `scheme_id`,
    including the newly created one.
  */

  let max_step_number = 0;

  db('steps')
    .where({ scheme_id })
    .then(result => {
      for (let i = 0; i < result.length; i++) {
        if (result[i].step_number > max_step_number) {
          max_step_number = result[i].step_number;
        }
      }
    })

  max_step_number++;

  const our_step = {};
  our_step.scheme_id = parseInt(scheme_id);
  if (!step.hasOwnProperty('step_number')) {
    our_step.step_number = max_step_number;
  } else {
    our_step.step_number = step.step_number;
  }
  our_step.instructions = step.instructions;

  return db('steps')
    .insert(our_step)
    .then(ids => {
      return db('steps')
        .where({ scheme_id })
        .orderBy('step_number');
    })
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
}
