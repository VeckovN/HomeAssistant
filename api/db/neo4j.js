const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');
dotenv.config();

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
const session = driver.session();

async function initNeo4j() {
    try{
        // Genders
        await session.run(`MERGE (:Gender {type: "Male"})`);
        await session.run(`MERGE (:Gender {type: "Female"})`);

        // Cities
        const cities = ["Belgrade", "Nis", "Novi Sad"];
        for (const city of cities) {
            await session.run(`MERGE (:City {name: $name})`, { name: city });
        }

        const professions = [
            "Housekeeper",
            "Nanny",
            "Personal Chef",
            "Gardener",
            "Butler",
            "Personal Driver",
            "Elderly Caregiver",
            "Pet Sitter",
            "Home Health Aide",
            "Personal Shopper"
        ];

        for (const title of professions) {
            await session.run(`MERGE (:Profession {title: $title})`, { title });
        }

        // Indexes (safe create if not exist)
        await session.run(
            `CREATE INDEX user_username_index IF NOT EXISTS FOR (u:User) ON (u.username)`
        );
        await session.run(
            `CREATE INDEX client_username_index IF NOT EXISTS FOR (c:Client) ON (c.username)`
        );
        await session.run(
            `CREATE INDEX houseworker_username_index IF NOT EXISTS FOR (h:HouseWorker) ON (h.username)`
        );
        await session.run(
            `CREATE INDEX city_name_index IF NOT EXISTS FOR (c:City) ON (c.name)`
        );
        await session.run(
            `CREATE INDEX gender_type_index IF NOT EXISTS FOR (g:Gender) ON (g.type)`
        );
        await session.run(
            `CREATE INDEX comment_id_index IF NOT EXISTS FOR (c:Comment) ON (c.timestamp)`
        );

        console.log("✅ Initial Neo4j setup done.");

    }
    catch(error){
        console.error("initNeo4j queries can't be executed");
    }
}

initNeo4j();

module.exports = {session, driver};
//Difference betweeen the Session.run() and transaction.run() 
//https://stackoverflow.com/questions/39525713/session-run-vs-transaction-run-in-neo4j-bolt


// run this initial create nodes if doesn't exist (these nodes are required to App functional propperly )
// session.

//Initial Queries:
//Gender:
// CREATE(n:Gender {type:"Male"})
// CREATE(n:Gender {type:"Female"})

//Cities:
// CREATE(a:City {name:"Belgrade"}),(b:City {name:"Nis"})...

//Professions:
//Profession titiles should be on Enlgish
// CREATE(a:Profession {title:"Cistac"}),(b:Profession{title:"Dadilja"}),(c:Profession{title:"Kuvar"}),(d:Profession{title:"Staratelj"}), (e:Profession{title:"Sobarica"}),(f:Profession {title:"Domacica"}),(g:Profession {title:"Bastovan"})

//Indexes (afther the users createdf):
// CREATE INDEX user_Susername_index FOR (n:User) ON (n.username);
// CREATE INDEX client_username_index FOR (n:Client) ON (n.username);
// CREATE INDEX houseworker_username_index FOR (n:HouseWorker) ON (n.username);
// CREATE INDEX city_name_index FOR (c:City) ON (c.name);
// CREATE INDEX gender_type_index FOR (g:Gender) ON (g.type);
// CREATE INDEX comment_id_index FOR (c:Comment) ON (c.timestamp);

