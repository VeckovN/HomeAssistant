const bcrypt = require("bcryptjs");
const faker = require("@faker-js/faker").faker;
const chatModel = require("../model/Chat"); // Adjust path based on your structure
const clientModel = require("../model/Client");
// const houseworkerModel = require("../models/houseworkerModel");


// Predefined options
const city_options = [
    'Beograd', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica', 'Leskovac', 'Pancevo', 
    'Cacak', 'Krusevac', 'Kraljevo', 'Novi Pazar', 'Smederevo', 'Uzice', 'Valjevo', 
    'Vranje', 'Sabac', 'Sombor', 'Pozarevac', 'Pirot', 'Zajecar', 'Bor', 'Kikinda', 
    'Sremska Mitrovica', 'Jagodina', 'Vrsac'
];

const profession_options = [
    'Housekeeper', 'Nanny', 'Personal Chef', 'Gardener', 'Personal Driver',
    'Elderly Caregiver', 'Pet Sitter', 'Home Health Aide', 'Personal Shopper', 'Butler'
];

const genders = ['Male', 'Female']; // Only male and female


const uploadImageToCloudinary = async (imageUrl) => {
    try{
        const uploadResult = await cloudinary.uploader.upload(imageUrl, {
            folder: 'avatars', // Optional folder for organization
        });
        console.log("uploadResult: ", uploadResult);
        return {
            picturePath: uploadResult.secure_url, // Cloudinary URL
            picturePublicId: uploadResult.public_id // Public ID for future reference
        };
    }
    catch(error){
        console.error("Failed to upload image: ", error);
        return {picturePath:null, picturePublicId:null};
    }
}

const generateClient = () => {
// const generateClient = async () => {
    //uploading to cloudinary
    // const imageUrl = faker.image.avatar()
    // const {picturePath, picturePublicId} = await uploadImageToCloudinary(imageUrl);

    return{
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: 'same',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        // picturePath,
        // picturePublicId,
        picturePath: faker.image.avatar(),
        picturePublicId: faker.string.uuid(),
        city: faker.helpers.arrayElement(city_options),
        gender: faker.helpers.arrayElement(genders),
        interests: faker.helpers.arrayElements(profession_options, faker.number.int({ min: 1, max: 3 })).join(',')
    }

};

const seedClients = async (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        // const user = await generateClient();
        const user = generateClient();
        try {
            const hashedPassword = bcrypt.hashSync(user.password, 12);
            const redisUser = await chatModel.createUser(user.username, hashedPassword, user.picturePath, user.picturePublicId);

            if (redisUser.success) {
                user.id = Number(redisUser.id);
                user.password = hashedPassword;
                await clientModel.create(user);
                users.push(user);
                // console.log("Seed user: ", user);
            }
        } catch (error) {
            console.error(` Error creating Client:`, error);
        }
    }
    return users;
};

// const clientsData = await seedClients(clientCount);

module.exports = { seedClients };
 