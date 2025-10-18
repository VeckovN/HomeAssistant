const { seedClients } = require("./seedClients");
const { seedHouseworkers } = require("./seedHouseworkers");  
const { seedCommentsToRandom, seedCommentsToHouseworker } = require("./seedComments");
const { seedRatesToRandom, seedRatesToHouseworker } = require("./seedRates");
 
//to run script -> npm run seed 
(async () => {
    try {
        //Seed Users
        const clients = await seedClients(2);
        console.log("Client Seeded Users: ", clients);

        const houseworkers = await seedHouseworkers(20);
        console.log("Houseworker Seeded Users: ", houseworkers);

        //Seed comments:
        const comments = await seedCommentsToRandom(2, 2); //clientCount, houseworkerCount
        console.log("User Comments seeds: ", comments);

        const houseworkerUsername = "Sara22";
        const houseworkerComments = await seedCommentsToHouseworker(houseworkerUsername, 5); 
        console.log(`Houseworker ${houseworkerUsername} seeds: `, houseworkerComments);
        

        //Seed ratings:
        const ratings = await seedRatesToRandom(2, 10);
        console.log("Rating val: ", ratings);
        
        const houseworkerRatingUsername = "Sara22"
        const houseworkerRating = await seedRatesToHouseworker(houseworkerRatingUsername, 3);
        console.log("Rating val: ", houseworkerRating);

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
})();