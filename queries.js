const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'siam',
  password: '123456',
  port: 5432,
})

const getNumbers = (request, response) => {
  var query ='SELECT distinct comu.numero as number,mess.description as message FROM comun.comunica_g as comu left outer join comun.message_template as mess on comu.id_message = mess.id where inactivo=false ORDER BY comu.numero ASC';
    pool.query(query, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  
  const getNumberByGroup = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT distinct comu.numero as number,mess.description as message FROM comun.comunica_g as comu left outer join comun.message_template as mess on comu.id_message = mess.id where inactivo=false and grupo =$1 ORDER BY 2 ASC', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  
  module.exports = {
    getNumbers,
    getNumberByGroup,
  }