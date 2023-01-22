const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');
dotenv.config();

//console.log("OPR: " + process.env.NEO4J_URI +" . " + process.env.NEO4J_USER + " / " + process.env.NEO4J_PASSWORD) ;

//WON"T WORK WIHT PASSWORD AND USERNAME FROM .ENV
// const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER,process.env.NEO4J_PASSWORD));
const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic('neo4j','HomeAssistantNeo4j'));

const session = driver.session();


module.exports = {session, driver};


//Difference betweeen the Session.run() and transaction.run() 
//https://stackoverflow.com/questions/39525713/session-run-vs-transaction-run-in-neo4j-bolt