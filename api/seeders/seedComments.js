const clientModel = require("../model/Client");
const houseworkerModel = require("../model/HouseWorker");
const faker = require("@faker-js/faker").faker;

const seedCommentsToRandom = async(clientCount, houseworkerCount) =>{
    try{        
        // const clients = ['Veckov', 'Justina61', 'Holden35']; //Or pass array of hardcoded  clients:
        const clients = await clientModel.getRandomUsernames(clientCount);
        const houseworkers = await houseworkerModel.getRandomUsernames(houseworkerCount);


        if(clients.length === 0 || houseworkers.length === 0){
            console.log("No clients or houseworkers found. Comment seeding skipped");
            return;
        }

        const commentsResult = [];
        for(let i = 0; i < houseworkers.length; i++){
            const randClient = faker.helpers.arrayElement(clients);
            const randHouseWorker = faker.helpers.arrayElement(houseworkers);
            const comment = faker.lorem.sentence();

            const result = await clientModel.commentHouseworker(randClient, randHouseWorker, comment);
            commentsResult.push(result);
        }

        return commentsResult;

    } catch (error) {
        console.error("Error seeding comments:", error);
    }

}

//clients(count) will post comment to passed houseworkerUsername
const seedCommentsToHouseworker = async (houseworkerUsername, clientsCount) =>{
    try{        
        const checkDoesExist = await houseworkerModel.findByUsername(houseworkerUsername);
        if(!checkDoesExist){
            console.log("Houseworker doesn't exist!");
            return;
        }

        //ofc. clients can be hardcoded: 
        //const clients = ['Veckov', 'Justina61', 'Holden35'];
        const clients = await clientModel.getRandomUsernames(clientsCount);

        if(clients.length === 0 ){
            console.log("No clients found. Comment seeding skipped");
            return;
        }

        const commentsResult = [];
        for(let i = 0; i < clients.length; i++){
            const randClient = faker.helpers.arrayElement(clients);
            const comment = faker.lorem.sentence();

            const result = await clientModel.commentHouseworker(randClient, houseworkerUsername, comment);
            commentsResult.push(result);
        }
        return commentsResult;

    } catch (error) {
        console.error("Error seeding comments:", error);
    }
}


module.exports = { 
    seedCommentsToRandom,
    seedCommentsToHouseworker
};