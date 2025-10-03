const express = require('express');
const { client } = require('../db/redis');
const { driver } = require('../db/neo4j');

const router = express.Router();

router.get('/', async(req,res) =>{
    try{
        const redisPing = await client.ping();
    
        const session = driver.session();
        const neo4jPing = await session.run('RETURN 1 AS result');
        await session.close();
    
        return res.status(200).json({
            status: 'ok',
            redis: redisPing,
            neo4j: neo4jPing.records[0].get('result').toString(),
            timestamp: new Date()
        })

    }
    catch(error){
        console.log("Health check faild: ", error);
        return res.status(500).json({status: 'error', error: error.message})
    }
});

module.exports = router;