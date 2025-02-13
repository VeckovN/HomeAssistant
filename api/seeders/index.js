const { seedClients } = require("./seedClients");
const { seedHouseworkers } = require("./seedHouseworkers");  

//to run script -> npm run seed 

(async () => {
    try {
        const clients = await seedClients(10);
        console.log("Client Seeded Users: ", clients);
        const houseworkers = await seedHouseworkers(5);
        console.log("Houseworker Seeded Users: ", houseworkers);

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
})();