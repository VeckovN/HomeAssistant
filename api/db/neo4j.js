const neo4j = require('neo4j-driver');
const dotenv = require('dotenv')
dotenv.config();

//ne4j configuration will be stored in .env
// const uri='neo4j+s://fd79543d.databases.neo4j.io';
// const neo4j_user = 'neo4j';
// const neo4j_password = 'HomeAssistantNeo4j';

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
const session = driver.session();


module.exports = session;


//PywSSJA3hJEFm8mnRB7PfndDl1bd9F9IV63gmwpsKto

//Difference betweeen the Session.run() and transaction.run() 
//https://stackoverflow.com/questions/39525713/session-run-vs-transaction-run-in-neo4j-bolt