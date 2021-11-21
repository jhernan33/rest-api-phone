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
  var query ='SELECT distinct comu.numero as number,mess.description as message,comu.enviado,comu.id \
   FROM comun.comunica_g as comu left outer join comun.message_template as mess on comu.id_message = mess.id \
    where inactivo=false and enviado = false ORDER BY comu.numero ASC limit 100';
    pool.query(query, (error, results) => {
      if (error) {
        throw error
      }
      // if(results.rows.length >0){
      //     //console.log("Longitud de la Consulta="+results.rows);
      //     // for(var i =0; i< results.rows.length; i++){
      //     //   //console.log("id="+JSON.stringify(results.rows[i].id));
      //     //   let xid = JSON.stringify(results.rows[i].id);
      //     //   pool.query("update comun.comunica_g set enviado ='true' where id=$1 ",[xid], (error,result) =>{
      //     //     if(error){
      //     //       throw error
      //     //     }
      //     //     console.log("guardado");
      //     //   });
      //     // }
      //   }
      response.status(200).json(results.rows)
    })
  }
  
  const getNumberByGroup = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT distinct comu.numero as number,mess.description as message,comu.enviado \
     FROM comun.comunica_g as comu left outer join comun.message_template as mess on comu.id_message = mess.id \
      where inactivo=false and grupo =$1 ORDER BY 2 ASC', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  const getDefray = (request, response) => {
    var query = 'select * from electoral.sufragar order by id desc';
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
    //console.log('Valor de la Funcion isArray=='+Array.isArray(request.body.votantes));
    const _array = [];
    if(Array.isArray(request.body.votantes)){
      var myArray = request.body.votantes;
      
      // console.log("Longitud Array "+myArray.length);
      for(var i =0; i< myArray.length; i++){
        //console.log(myArray[i]);
        let cedula = myArray[i];
        //console.log("Cedula=="+cedula);
        pool.query('SELECT * from electoral.sufragar where cedula_votante =$1', [cedula])
      .then(res => {
        let filas = res.rows.length;
        if(filas==0){
          //_array.push([cedula,cedula_reporta,id_movil,datetime]);
          //console.log("valores:::"+_array);
          pool.query('INSERT INTO electoral.sufragar (cedula_votante, cedula_reporta, id_movil,created_at) VALUES ($1, $2, $3, now()) RETURNING *', [cedula, cedula_reporta, id_movil], (error, result) => {
            if (error) {
              throw error
            }
            //response.status(201).send(`Depray added with ID: ${result.rows[0].id}`)
          })
        }
      })
      .catch(e => console.error(e.stack))
      }
      response.status(201).send(`Depray added`);
    }else{
      /**
       * Registro de Un solo Votante
       */
      const { cedula_votante, cedula_reporta, id_movil } = request.body

      pool.query('SELECT * from electoral.sufragar  where cedula_votante =$1', [cedula_votante], (error, results) => {
        if (error) {
          throw error
        }
        if(results.rows.length <1){
          pool.query('INSERT INTO electoral.sufragar (cedula_votante, cedula_reporta, id_movil,created_at) VALUES ($1, $2, $3, now()) RETURNING *', [cedula_votante, cedula_reporta, id_movil], (error, result) => {
            if (error) {
              throw error
            }
            response.status(201).send(`Depray added with ID: ${result.rows[0].id}`)
          })    
        }
       })
    }
  }

  const getDefrayId = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * from electoral.sufragar  where id =$1', [id], (error, results) => {
      if (error) {
        throw error
      }
      if(results.rows.length >0){
        response.status(200).json(results.rows)
      }else{
        response.status(200).json("No Encontro")
      }
    })
  }

  /**
   * Function send not defray
   */
   const getNumberDefray = (request, response) => {
    let query ="select distinct on(prna.cedu_pena)prna.cedu_pena,dpa.codi_pena,dpa.tel1_pena \
      from electoral.patrol_d as dpa \
    left outer join comun.pers_natu as prna on dpa.codi_pena = prna.codi_pena \
    where prna.cedu_pena is not null \
    and not exists \
    ( \
      select suf.cedula_votante \
      from electoral.sufragar as suf \
      where suf.cedula_votante = prna.cedu_pena \
    ) \
    order by prna.cedu_pena";
      pool.query(query, (error, results) => {
        if (error) {
          throw error
        }
        // if(results.rows.length >0){
        //   console.log("Longitud de la Consulta="+results.rows);
        //   // for(var i =0; i< myArray.length; i++){

        //   // }
        // }
        response.status(200).json(results.rows)
      })
    }
  
  module.exports = {
    getNumbers,
    getNumberByGroup,
    getDefray,
    createDefray,
    getDefrayId,
    getNumberDefray,
  }