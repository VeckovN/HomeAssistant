const houseworkerModel = require('../model/HouseWorker');
const queryString = require('querystring');

const getHouseworkerByUsername = async(req,res)=>{
    //from LocalStorage or Cookie
    const HouseworkerUsername = req.params.username;
    try{
        const result = await houseworkerModel.findByUsername(HouseworkerUsername);
        const {password, ...houseworkerData} = result;
        res.json(houseworkerData);
    }
    catch(err){
        console.log("ERROR GetHouseworkerBYUsername: " + err);
        res.send(err);
    }
}

const getHouseworkerWithFilters = async(req,res)=>{
    try{
        //take filter parameters from url
        const filters = req.query;
        const result = await houseworkerModel.findAllWithFilters(filters)

        const houseworkers = result.map(el =>{
            const {password, ...houseworkerData} =el;
            return houseworkerData;
        })
        res.json(houseworkers);

        //const result = await houseworkerModel.findUserWithFilters();
    }catch(err){
        console.log("ERROR HouseworkerFilters: " + err);
        res.send(err);
    }
}

const getHouseworkers = async(req,res)=>{
    try{
        const result = await houseworkerModel.findAll();   
        const houseworkers = result.map(el =>{
            const {password, ...houseworkerData} = el;
            return houseworkerData;
        })
        res.json(houseworkers);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.send(err);
    }
}

const deleteHouseworker = async(req, res)=>{
    const houseworkerUsername = req.params.username;
    try{
        const result = await houseworkerModel.findByUsernameAndDelete(houseworkerUsername);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.send(err);
    }
}

const getRatings = async(req,res)=>{
    // const houseworkerUsername = "Sara"
    try{
        //from session
        const username = req.session.user.username
        const result = await houseworkerModel.getRatings(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.send(err);
    }
}

const getRatingUsername = async(req,res)=>{
    try{
        //from session
        const username = req.params.username;
        const result = await houseworkerModel.getRatings(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.send(err);
    }
}

const getCities = async(req,res)=>{
    try{
        const result = await houseworkerModel.findCities();
        res.send(result);
    }
    catch(err){
        console.log("ERROR CITIES: " + err);
        res.send(err);
    }
}



const getComments = async(req,res)=>{
    // const houseworkerUsername = "Sara"
    try{
        const result = await houseworkerModel.getComments();
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.send(err);
    }
}

const getProfessions = async(req,res)=>{
    // const houseworkerUsername = "Sara"
    try{
        const result = await houseworkerModel.getProfessions();
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.send(err);
    }
}

const addProfession = async(req,res)=>{
    // const houseworkerUsername = "Sara"
    const profession = req.body.profession;
    const working_hour = req.body.working_hour;

    try{
        const result = await houseworkerModel.addProfession(profession, working_hour);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.send(err);
    }
}

const udpateHouseworker = async(req,res)=>{
    try{
        const newInfo = req.body;

        const result = await clientModel.update(newInfo);
        res.json(result);
    }
    catch(err){
        console.log("Error UpdateHouseworker(Yourself): " + err);
        res.send(err).status(400);
    }
}








module.exports ={
    getHouseworkerByUsername,
    getHouseworkers,
    deleteHouseworker,
    getRatings,
    getComments,
    getProfessions,
    addProfession,
    udpateHouseworker,
    getHouseworkerWithFilters,
    getRatingUsername,
    getCities
}