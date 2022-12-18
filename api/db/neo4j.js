const neo4j = require('neo4j-driver');

//ne4j configuration will be stored in .env
const uri='neo4j+s://fd79543d.databases.neo4j.io';
const neo4j_user = 'neo4j';
const neo4j_password = '9YoFUA3ZpZbzhsmSdIOTuxc3oXGRuHOuLhwlNQKyMX4';

const driver = neo4j.driver(uri, neo4j.auth.basic(neo4j_user, neo4j_password));
const session = driver.session();


module.exports = session;



//Difference betweeen the Session.run() and transaction.run() 
//https://stackoverflow.com/questions/39525713/session-run-vs-transaction-run-in-neo4j-bolt