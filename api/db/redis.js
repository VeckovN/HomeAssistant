// const {createClient} = require('redis');
// const connectRedis = require('connect-redis');
// const redisClient = createClient({legacyMode:true});

// //RedisStore has been created and put expressSession-object in it
// const RedisStore = connectRedis(expressSession);
// //contect to redis instance
// redisClient.connect()
// .catch(err=>{
//     console.log("Couldn't connect to redis", err);
// })

// module.exports = {redisClient, RedisStore, connectRedis}