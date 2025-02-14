const clientModel = require("../model/Client");
const houseworkerModel = require("../model/HouseWorker");
const faker = require("@faker-js/faker").faker;

const seedRatesToRandom = async(clientCount, houseworkerCount) =>{
    try{        
        // const clients = ['Veckov', 'Justina61', 'Holden35']; //Or pass array of hardcoded  clients:
        const clients = await clientModel.getRandomUsernamesAndID(clientCount);
        const houseworkers = await houseworkerModel.getRandomUsernamesAndID(houseworkerCount);

        if(clients.length === 0 || houseworkers.length === 0){
            console.log("No clients or houseworkers found. Rates seeding skipped");
            return;
        }

        const ratingArray = [];
        for(let i = 0; i < houseworkers.length; i++){
            const randClient = faker.helpers.arrayElement(clients);
            const randHouseWorker = faker.helpers.arrayElement(houseworkers);
            const rating = faker.number.int({ min: 1, max: 5 });

            console.log(`randClient: =--ID:${randClient.id} ===Username: ${randClient.username}`)
            console.log(`randHouseworker: =--ID:${randHouseWorker.id} ===Username: ${randHouseWorker.username}`)
            const result = await clientModel.rateHouseworker(randClient.id, randClient.username, randHouseWorker.username, rating);
            //the reusult is notification object
            
            ratingArray.push(result);
        }

        return ratingArray;

    } catch (error) {
        console.error("Error seeding comments:", error);
    }

}

//clients(count) will post comment to passed houseworkerUsername
const seedRatesToHouseworker = async (houseworkerUsername, clientsCount) =>{
    try{        
        const checkDoesExist = await houseworkerModel.findByUsername(houseworkerUsername);
        if(!checkDoesExist){
            console.log("Houseworker doesn't exist!");
            return;
        }

        //ofc. clients can be hardcoded: 
        //const clients = ['Veckov', 'Justina61', 'Holden35'];
        const clients = await clientModel.getRandomUsernamesAndID(clientsCount);

        if(clients.length === 0 ){
            console.log("No clients found. Rating seeding skipped");
            return;
        }

        const ratingArray = [];
        for(let i = 0; i < clients.length; i++){
            const randClient = faker.helpers.arrayElement(clients);
            const rating = faker.number.int({ min: 1, max: 5 });

            console.log(`randClient: =--ID:${randClient.id} ===Username: ${randClient.username}`)
            const result = await clientModel.rateHouseworker(randClient.id, randClient.username, houseworkerUsername, rating);
            
            ratingArray.push(result);
        }
        return ratingArray;

    } catch (error) {
        console.error("Error seeding comments:", error);
    }
}


module.exports = { 
    seedRatesToRandom,
    seedRatesToHouseworker
};