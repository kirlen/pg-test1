require('dotenv').config();

const restify = require('restify');
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: (process.env.LOCAL ? false : true)
});

// test connection
client.connect();

client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
    console.log(err ? err.stack : res.rows[0].message); // Hello World!
    // client.end() // TODO: should be connecting and ending after each request
});

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

server.post('/history',(req,res,next) => {
    // console.log(req.body);

    let insertQ = createInsert(req.body);
    // console.log(insertQ);

    client.query(insertQ, (err, dbResult) => {
        console.log(err ? err.stack : dbResult.rows.length);

        res.json(200, {
            status: 200,
            rows: dbResult.rows,
        });

        next();
    });

});

function createInsert(dataObj) {
    let insertQ = "INSERT INTO test1.trx(";
    let fieldStr = '';
    let valueStr = '';

    Object.keys(dataObj).forEach(function(key,index) {
        let data = dataObj[key];

        if (data == null) {
            return; // skip
        }

        if (typeof data === 'string') {
            data =  "'" + data + "'";   // TODO: escape quotes!
        }

        let commaIfNeeded = (index > 0) ? ',' : '';

        fieldStr += commaIfNeeded + key;
        valueStr += commaIfNeeded + data;
    });

    insertQ += fieldStr + ') VALUES (' + valueStr + ');';

    return insertQ;
}


let tuidQuery = "select timestamp,action,sym,amt,cuid0,cuid1,actor,source,destination,note,tuid,external_id,ref_tuid " +
    "from test1.trx " +
    "where tuid = 'TUID' or ref_tuid = 'TUID' order by timestamp asc";

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

const port = process.env.PORT;

server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});