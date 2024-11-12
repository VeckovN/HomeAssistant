const houseworkerModel = require('../model/HouseWorker');
const userModel = require('../model/User')
const bcrypt = require('bcrypt');

const getHouseworkerByUsername = async(req,res)=>{e
    const HouseworkerUsername = req.params.username;
    try{
        const result = await houseworkerModel.findByUsername(HouseworkerUsername);
        const {password, ...houseworkerData} = result;
        res.status(200).json(houseworkerData);
    }
    catch(err){
        // console.log("ERROR GetHouseworkerBYUsername: " + err);
        // res.status(404).json({error:'GetHouseworkerBYUsername Error'});
        console.error(err);
        res.status(500).json({error: err.message || "Error getting houseworker"});
    }
}

const getHouseworkerWithFilters = async(req,res)=>{
    const filters = req.query;
    try{
        const result = await houseworkerModel.findAllWithFilters(filters)

        const houseworkers = result.map(el =>{
            const {password, ...houseworkerData} =el;
            return houseworkerData;
        })
        res.status(200).json(houseworkers);

    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error houseworker filter"});
    }
}

const getHouseworkers = async(req,res)=>{
    try{
        const result = await houseworkerModel.findAll();   
        const houseworkers = result.map(el =>{
            const {password, ...houseworkerData} = el;
            return houseworkerData;
        })
        res.status(200).json(houseworkers);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting houseworkers"});
    }
}

const getHouseworkerUsersCount = async(req, res) =>{
    try{
        const result = await houseworkerModel.getHouseworkersCount();
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error houseworker count"});
    }
}

const getHouseworkerInfo = async(req,res)=>{
    //logged user session
    const username = req.session.user.username;
    try{
        const result = await houseworkerModel.getInfo(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error houseworker info"});
    }
}

const getHomeInfo = async(req,res) =>{
    const username = req.params.username;
    try{
        const result = await houseworkerModel.getHomeInfo(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error houseworker home info"});
    }
}

const deleteHouseworker = async(req, res)=>{
    const houseworkerUsername = req.params.username;
    try{
        const result = await houseworkerModel.findByUsernameAndDelete(houseworkerUsername);
        //status-204 => Use when a request is successful but there’s no data to send back, especially for DELETE actions. 
        //but we return something
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error deleting houseworker"});
    }
}

const getRatings = async(req,res)=>{
    const username = req.session.user.username
    try{
        const result = await houseworkerModel.getRatings(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error rating houseworker"});
    }
}

const getRatingUsername = async(req,res)=>{
    const username = req.params.username;
    try{
        const result = await houseworkerModel.getRatings(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting houseworker rating"});
    }
}

const getCities = async(req,res)=>{
    try{
        const result = await houseworkerModel.findCities();
        res.status(200).send(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting houseworker city"});
    }
}

const getOurComments = async(req,res)=>{
    const username = req.session.user.username
    const pageNumber = req.params.pageNumber;
    try{
        const result = await houseworkerModel.getComments(username, pageNumber);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting comments"});
    }
}


const getComments = async(req,res)=>{
    const username = req.params.username;
    const pageNumber = req.params.pageNumber;
    try{
        const result = await houseworkerModel.getComments(username, pageNumber);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting houseworker comments"});
    }
}

const getHouseworkerCommentsCount = async(req,res)=>{
    const username = req.params.username;
    try{
        const result = await houseworkerModel.getCommentsCount(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting houseworker cooments count"});
    }
}

const getHouseworkerUnreadComments = async(req,res)=>{
    const username = req.params.username;
    try{
        const result = await houseworkerModel.getUnreadComments(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting unread comments"});
    }
}

const getHouseworkerUnreadCommentsCount = async(req,res)=>{
    const username = req.params.username;
    try{
        const result = await houseworkerModel.getUnreadCommentsCount(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting unread comments count"});
    }
}

const markHouseworkerUnreadComments = async(req,res) =>{
    const username = req.params.username;
    try{
        const result = await houseworkerModel.markAllCommentsAsRead(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting unread comments"});
    }
}

const getAllProfessions = async(req,res) => {
    try{
        const result = await houseworkerModel.getAllProffesions();
        res.status(200).json(result);

    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting all professions"});
    }
}

const getProfessions = async(req,res)=>{
    const username = req.session.user.username;
    try{
        const result = await houseworkerModel.getProfessions(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting professions"});
    }
}

//username passed through put method
const getProfessionsByUsername = async(req,res)=>{
    const username = req.params.username;
    try{
        const result = await houseworkerModel.getProfessions(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting houseworker professions"});
    }
}

const addProfession = async(req,res)=>{
    const username = req.session.user.username;
    const profession = req.body.profession;
    const working_hour = req.body.working_hour;

    try{
        const result = await houseworkerModel.addProfession(username, profession, working_hour);
        res.status(201).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error adding profession"});
    }
}

const deleteProfession = async(req,res)=>{
    const username = req.session.user.username;
    const profession = req.params.profession;
    try{
        const result = await houseworkerModel.deleteProfession(username, profession);
        const listOfProfessions = result.records.map(record => ({ profession:record.get(0), working_hour:record.get(1)})) //or record.get('title')
        res.status(200).json(listOfProfessions);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error removing profession"});
    }
}

const udpateHouseworker = async(req, res) =>{
    const newData = req.body;
    const username = req.session.user.username;
    try{
        if(newData.email){
            const emailExists = await userModel.checkEmail(newData.email)
            if(emailExists)
                return res.status(409).json({error:"User with this email exists"})
        }

        if(newData.password)
            newData.password = bcrypt.hashSync(newData.password, 12);

        //picturePath is part of UserModal 
        const picturePath = req.files[0]?.filename;
        const {address, phone_number, description, city, professions, ...userModalInfo} = newData;
        const newUserInfo ={...userModalInfo, picturePath}; //userModal update info
        const newHouseworkerInfo = {address, phone_number, description}; //houseworkerModal update info (city and professions seperated request)
        await houseworkerModel.update(username, newUserInfo, newHouseworkerInfo);

        if(city)
            await userModel.updateCityRelation(username, city);
        res.status(200).send("Successfuly updated!!!");
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error updating houseworker"});
    }
}

const updateProfessionWorkingHour = async(req,res)=>{
    const username = req.session.user.username;
    const profession = req.body.profession;
    const working_hour = req.body.working_hour;

    try{
        const result = await houseworkerModel.updateWorkingHour(username, profession, working_hour);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error updating profession working hour"});
    }
}

const getHouseworkerProfessionsAndRating = async(req,res) =>{
    const username = req.params.username;
    try{
        const result = await houseworkerModel.getProfessionsAndRating(username);
        res.status(200).json(result);
    }
    catch(err){
          console.error(err);
        res.status(500).json({error: err.message || "Error getting professions and rating"});
    }
}

//GET /notifications/userID?offset=10&size=20
const getNotifications = async(req,res) =>{
    const username = req.params.username;
    const offset = req.query.offset;
    const size = req.query.size;

    try{
        const result = await houseworkerModel.getRecordedNotifications(username, offset, size);        
        res.status(200).json(result);
    }
    catch(err){
          console.error(err);
        res.status(500).json({error: err.message || "Error getting notifications"});
    }
}

const getMoreNotifications = async(req,res) =>{
    const username = req.params.username;
    const batchNumber = req.params.batchNumber;

    try{
        const notifications = await houseworkerModel.getMoreRecordedNotifications(username, batchNumber);
        res.status(200).json(notifications);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting more notifications"});
    }
}

const markUnreadNotification = async(req,res) =>{
    const {notificationID, batchNumber} = req.body;
    const userID = req.session.user.userID;

    try{  
        await houseworkerModel.markNotificationAsRead(userID, notificationID, batchNumber);
        res.status(200).send("Successfuly marked");
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error marking unread notifications"});
    }
}

module.exports ={
    getHouseworkerByUsername,
    getHouseworkers,
    getHouseworkerUsersCount,
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
    getHouseworkerCommentsCount,
    getHomeInfo,
    getHouseworkerProfessionsAndRating,
    getHouseworkerUnreadComments,
    getHouseworkerUnreadCommentsCount,
    markHouseworkerUnreadComments,
    getNotifications,
    getMoreNotifications,
    markUnreadNotification
}