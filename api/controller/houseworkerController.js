const houseworkerModel = require('../model/HouseWorker');
const userModel = require('../model/User')
const bcrypt = require('bcrypt');

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
        res.status(404).json({error:'GetHouseworkerBYUsername Error'});
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

    }catch(err){
        console.log("ERROR HouseworkerFilters: " + err);
        res.status(404).json({error:'Houseworker filter error'});
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
        res.status(404).json({error:'Houseworkers Error'});
    }
}


const getHouseworkerInfo = async(req,res)=>{
    //logged user session
    try{
        const username = req.session.user.username;
        const result = await houseworkerModel.getInfo(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetClientInfo: " + err);
        res.status(404).json({error:'Houseworkers Error'});
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
        res.status(500).json({error:`Houseworkers can't be deleted`});
    }
}

const getRatings = async(req,res)=>{
    // const houseworkerUsername = "Sara"
    try{
        //from session
        const username = req.session.user.username
        console.log("saaaasasasas :" + username);
        const result = await houseworkerModel.getRatings(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.status(505).json({error:'Rating error'});
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
        res.status(404).json({error:'Get rating error'});
    }
}

const getCities = async(req,res)=>{
    try{
        const result = await houseworkerModel.findCities();
        res.send(result);
    }
    catch(err){
        console.log("ERROR CITIES: " + err);
        res.status(404).json({error:'City error'});
    }
}


//COmments without parrameters(session based)
const getOurComments = async(req,res)=>{
    // const houseworkerUsername = "Sara"
    console.log("HEREEE");
    try{
        const username = req.session.user.username
        console.log("\n COMMENTSESSON:" + JSON.stringify(req.session))
        const result = await houseworkerModel.getComments(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR Comments: " + err);
        res.status(404).json({error:'User comments error'});
    }
}

//Client click on Houseowrker comment button
const getComments = async(req,res)=>{
    // const houseworkerUsername = "Sara"
    try{
        const username = req.params.username;
        console.log("USEE: " + username)
        const result = await houseworkerModel.getComments(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR Comments: " + err);
        res.status(404).json({error:'Comments Error'});
    }
}

const getHouseworkerCommentsCount = async(req,res)=>{
    try{
        const username = req.params.username;
        const result = await houseworkerModel.getCommentsCount(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR Comments: " + err);
        res.status(404).json({error:'Comments Count error'});
    }
}

const getAllProfessions = async(req,res) => {
    try{
        const result = await houseworkerModel.getAllProffesions();
        res.json(result);

    }catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.status(404).json({error:'Professions error'});
    }
}

const getProfessions = async(req,res)=>{
    try{
        //const username = req.params.username;
        const username = req.session.user.username;
        const result = await houseworkerModel.getProfessions(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.status(404).json({error:'Professions error'});
    }
}

//username passed through put method
const getProfessionsByUsername = async(req,res)=>{
    try{
        const username = req.params.username;
        const result = await houseworkerModel.getProfessions(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.status(404).json({error:'Professions error'});
    }
}

const addProfession = async(req,res)=>{
    // const houseworkerUsername = "Sara"
    const username = req.session.user.username;
    const profession = req.body.profession;
    const working_hour = req.body.working_hour;

    try{
        const result = await houseworkerModel.addProfession(username, profession, working_hour);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.status(500).json({error:`Proffessions can't be added`});
    }
}

const deleteProfession = async(req,res)=>{
    const username = req.session.user.username;
    const profession = req.params.profession;
    try{
        const result = await houseworkerModel.deleteProfession(username, profession);
        const listOfProfessions = result.records.map(record => ({ profession:record.get(0), working_hour:record.get(1)})) //or record.get('title')
        res.json(listOfProfessions);
    }
    catch(err){
        console.log("ERROR GetHouseworkers: " + err);
        res.status(500).json({error:`Proffessions can't be deleted`});
    }
}

const udpateHouseworker = async(req,res)=>{
    try{
        const newData = req.body;
        const username = req.session.user.username;

        if(newData.email){
            const emailExists = await userModel.checkEmail(newData.email)
            if(emailExists)
                return res.status(400).json({error:"User with this email exists"})
        }

        if(newData.password)
            newData.password = bcrypt.hashSync(newData.password, 12);

        const {address, phone_number, description, city, professions, ...newUserInfo} = newData;
        const newHouseworkerInfo = {address, phone_number, description};
        await houseworkerModel.update(username, newUserInfo, newHouseworkerInfo);
        
        if(city)
            await houseworkerModel.updateCity(username, city);
        
        // if(professions){
        //     await houseworkerModel.updateProfessions(username,professions);
        // }
        res.send("Successfuly updated!!!");
    }
    catch(err){
        console.log("Error UpdateHouseworker(Yourself): " + err);
        res.status(500).json({error:`Update error`});
    }
}

const updateProfessionWorkingHour = async(req,res)=>{
    try{
        const username = req.session.user.username;
        const profession = req.body.profession;
        const working_hour = req.body.working_hour;

        console.log("USER: " + username + " \n PROFESSION: " + profession + " \n WORKING_HOUR: " + working_hour)
        // const result = await houseworkerModel.updateWorkingHour(profession, working_hour);
        const result = await houseworkerModel.updateWorkingHour(username, profession, working_hour);
        res.status(200).json(result);
    }
    catch(err){
        console.log("Error updateProfessionWorkingHour: " + err);
        res.status(500).json({error:`Working hour update error`});
    }
}


module.exports ={
    getHouseworkerByUsername,
    getHouseworkers,
    deleteHouseworker,
    getRatings,
    getComments,
    getOurComments,
    getProfessions,
    getProfessionsByUsername,
    getAllProfessions,
    addProfession,
    deleteProfession,
    udpateHouseworker,
    updateProfessionWorkingHour,
    getHouseworkerWithFilters,
    getRatingUsername,
    getCities,
    getHouseworkerInfo,
    getHouseworkerCommentsCount
}