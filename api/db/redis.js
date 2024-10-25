const session = require('express-session');
const Redis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

// const client = new Redis('redis://default:Ic4AULQZTPHR9QALfyqKW2jDJWDVi6Ro@redis-17664.c300.eu-central-1-1.ec2.cloud.redislabs.com:17664')
const client = new Redis(process.env.REDIS_URL)

let RedisStore = require("connect-redis")(session)

// const incr = (key = "key") =>{
//     new Promise((resolve, reject) =>{
//         client.incr(key, (resolve,reject)=>{
//             return (err,data)=>{
//                 if(err){
//                     reject(err);
//                 }
//                 resolve(data);
//             }
//         })
//     })
// } 


client.on('error', function(err) {
    console.log('Redis error: ' + err);
}); 

const resolvePromise = (resolve,reject)=>{
    // console.log("TESSS");
    return (err,data)=>{
        if(err)
            reject(err)
        resolve(data)
    }
}

const incr = (key = "key") =>//default ="key" if isn't assigned
    new Promise((resolve, reject) => client.incr(key, resolvePromise(resolve, reject)));
                                 
const decr = (key = "key") =>
    new Promise((resolve, reject) => client.decr(key, resolvePromise(resolve, reject)))

const exists = (key = "key") =>//default ="key" if isn't assigned
    new Promise((resolve, reject) => client.exists(key, resolvePromise(resolve, reject)))

const set = (key = "key", value) =>
    new Promise((resolve, reject) => client.set(key, value, resolvePromise(resolve, reject)))

const get = (key = "key") =>
    new Promise((resolve, reject) => client.get(key, resolvePromise(resolve, reject)))

const hgetall = (key = "key") =>
    new Promise((resolve, reject) => client.hgetall(key, resolvePromise(resolve, reject)))

const zadd = (key, key2 , value) =>
    new Promise((resolve, reject) => client.zadd(key, key2, value, resolvePromise(resolve, reject)))

const sadd = (key = "key", value) =>
    new Promise((resolve, reject) => client.sadd(key, value, resolvePromise(resolve, reject)))
  
const hmset = (key = "key", values = []) =>
    new Promise((resolve, reject) => client.hmset(key, values, resolvePromise(resolve, reject)))

const hset = (key, field, value ) => 
    new Promise((resolve, reject) => client.hset(key, field, value, resolvePromise(resolve, reject)))

const hmget = (key = "key", key2 = "") =>
    new Promise((resolve, reject) => client.hmget(key, key2, resolvePromise(resolve, reject)))

const sismember = (key = "key", key2 = "") =>
    new Promise((resolve, reject) => client.sismember(key, key2, resolvePromise(resolve, reject)))

const smembers = (key = "key") =>
    new Promise((resolve, reject) => client.smembers(key, resolvePromise(resolve, reject)))

const srem = (key = "key", key2 = "") =>
    new Promise((resolve, reject) => client.srem(key, key2, resolvePromise(resolve, reject)))

const expire = (key = "key", value = "0") =>
    new Promise((resolve, reject) => client.expire(key, value, resolvePromise(resolve, reject)))

const zrange = (key, value, value2) => {
    return new Promise((resolve, reject)=> client.zrange(key, value, value2, resolvePromise(resolve, reject)))
}
const zrangescores = (key, value, value2) => {
    return new Promise((resolve, reject)=> client.zrange(key, value, value2, "WITHSCORES", resolvePromise(resolve, reject)))
}

const zrangerev = (key, value, value2) => {
    return new Promise((resolve, reject)=> client.zrange(key, value, value2, "REV", resolvePromise(resolve, reject)))
}
const zrangerevscores = (key, value, value2) => {
    return new Promise((resolve, reject)=> client.zrange(key, value, value2, "REV", "WITHSCORES", resolvePromise(resolve, reject)))
}

//key, offset, size
const zrangelimit = (key, value, value2) => {
    const limit = parseInt(value+value2);
    return new Promise((resolve, reject)=> client.zrange(key, value, limit, resolvePromise(resolve, reject)))
}

const zrem = (key, value) =>
    new Promise((resolve, reject) =>client.zrem(key,value, resolvePromise(resolve, reject)))

const del = (key)=>
    new Promise((resolve, reject)=> client.del(key, resolvePromise(resolve, reject) ))

const rename = (key, newKey)=>
    new Promise((resolve, reject)=> client.rename(key, newKey, resolvePromise(resolve, reject) ))

const scard = (key, newKey)=>
    new Promise((resolve, reject)=> client.scard(key,  resolvePromise(resolve, reject) ))

module.exports ={
    client,
    RedisStore,
    incr,
    decr,
    exists,
    set,
    get,
    hgetall,
    zadd,
    sadd,
    hmset,
    hmget,
    hset,
    sismember,
    smembers,
    srem,
    zrange,
    zrangerev,
    zrem,
    del,
    expire,
    rename,
    scard,
    zrangelimit,
    zrangescores,
    zrangerevscores
}
