require('dotenv').config();

const port = process.env.PORT;
// const hostname = process.env.HOSTNAME || null;
// const url = process.env.VIRTUAL_HOST || 'localhost:' + port;

const restify = require('restify');
const { Client } = require('pg');

// const client = new Client({
//     host     : process.env.PG_HOST,
//     port     : process.env.PG_PORT,
//     user     : process.env.PG_USER,
//     password : process.env.PG_PASSWORD,
//     database : process.env.PG_DATABASE
// });
const client = new Client({
    connectionString:process.env.DATABASE_URL,
    ssl:true
});

client.connect();

client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
    console.log(err ? err.stack : res.rows[0].message); // Hello World!
    // client.end()
});

//let q = 'SELECT * FROM test1.trx limit 100';
// let q = "select timestamp,action,sym,amt,cuid0,cuid1,actor,source,destination,note,tuid,external_id,ref_tuid from test1.trx where tuid = 'S9RZ-S28A' or ref_tuid = 'S9RZ-S28A' order by timestamp";
let tuidQuery = "select timestamp,action,sym,amt,cuid0,cuid1,actor,source,destination,note,tuid,external_id,ref_tuid " +
                "from test1.trx " +
                "where tuid = 'TUID' or ref_tuid = 'TUID' order by timestamp asc";

const server = restify.createServer({
    name: 'pgCurrent',
    version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/',(req,res,next) => {
    res.json(200, {
        status: 200,
        message: 'Hello PG Test',
    });
    next();
});

server.get('/history/tuid/:tuid',(req,res,next) => {
    let tuid = req.params.tuid || 'E1D7-R91A';
    console.log(tuid);
    let regExp = new RegExp('TUID','g');
    let q = tuidQuery.replace(regExp,tuid);
    console.log(q);

    client.query(q, (err, dbResult) => {
        console.log(err ? err.stack : dbResult.rows.length);

        res.json(200, {
            status: 200,
            rows: dbResult.rows,
        });

        next();
    });
});

server.get('/add',(req,res,next) => {
    let insertQ = createInsert(req.body);
    client.query(insertQ, (err, dbResult) => {
        console.log(err ? err.stack : dbResult.rows.length);

        res.json(200, {
            status: 200,
            rows: dbResult.rows,
        });

        next();
    });
});

function createInsert(rows) {
    console.log(rows);
    let insertQ = "INSERT INTO kschema1.junk3(sym, amt) VALUES ('foo', 23),('bar', 24);";

    return insertQ;
}

server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});