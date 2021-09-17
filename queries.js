require('dotenv').config({path:'.env'})

const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
})
const format = require('pg-format');  

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

  const getDefray = (request, response) => {
    var query = 'select * from electoral.sufragar';
    pool.query(query, (error, results) => {
      if(error){
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  /**
   * Create Defray
   * @param {*} request 
   * @param {*} response 
   */
  const createDefray = (request, response) => {

    const cedula_reporta = request.body.cedula_reporta;
    const id_movil = request.body.id_movil;
    const cedula_votante = request.body.cedula_votante;
    
    let d = new Date() // Date
    let datetime = "'"+d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+ " "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds().toString()+"'";
    
    /**
     * Array de Votantes
     */
    if(Array.isArray(request.body.cedula_votante)){
      var myArray = request.body.cedula_votante;
      
      var array = [];
      myArray.forEach((element, index) => {
        array.push([element,cedula_reporta,id_movil,datetime])
      });

      const arrayString = [];

      array.forEach(ele => arrayString.push("("+ ele.toString() +")" ));

      const query = "INSERT INTO electoral.sufragar(cedula_votante,cedula_reporta,id_movil,created_at) VALUES "+arrayString;
      console.log(query);

      pool.query(query, function(err,result){
        if(err){
          throw err
          pool.end();
        }
        response.status(201).send(`Defray added:`)
      });

    }else{
      /**
       * Registro de Un solo Votante
       */
      const { cedula_votante, cedula_reporta, id_movil } = request.body
    
      pool.query('INSERT INTO electoral.sufragar (cedula_votante, cedula_reporta, id_movil,created_at) VALUES ($1, $2, $3, now()) RETURNING *', [cedula_votante, cedula_reporta, id_movil], (error, result) => {
        if (error) {
          throw error
        }
        
        response.status(201).send(`Depray added with ID: ${result.rows[0].id}`)
      })
    }

  }
  
  module.exports = {
    getNumbers,
    getNumberByGroup,
    getDefray,
    createDefray,
  }