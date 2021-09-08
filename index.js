const express = require('express')
const LOG = require('debug')('app');
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000
const host = '127.0.0.1'

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/numbers', db.getNumbers)
app.get('/numbers/:id', db.getNumberByGroup)

app.get('/debug',(req,res) =>{
  LOG('This is a console message');
  res.send('Using debug module with Node.js');
});

app.listen(port,host, () => {
  console.log(`App running on port ${port} and ip ${host}.`)
})