const bcrypt = require("bcryptjs");
const faker = require("@faker-js/faker").faker;
const chatModel = require("../model/Chat"); // Adjust path based on your structure
const houseworkerModel = require("../model/HouseWorker");


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

const generateHouseworker = () => {
// const generateHouseworker = async () => {
    // const imageUrl = faker.image.avatar()
    // const {picturePath, picturePublicId} = await uploadImageToCloudinary(imageUrl);
    // console.log("picturePath: ", picturePath);
    // console.log("picturePublicId: ", picturePublicId);

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
        address: faker.location.streetAddress(),
        description: faker.lorem.sentence(),
        phoneNumber: faker.phone.number(),
        age: faker.number.int({ min: 18, max: 65 }),
        city: faker.helpers.arrayElement(city_options),
        gender: faker.helpers.arrayElement(genders),
        houseworkerProfessions: JSON.stringify(
            faker.helpers.arrayElements(profession_options, faker.number.int({ min: 1, max: 3 })).map(prof => ({
                label: prof,
                working_hour: faker.number.int({ min: 5, max: 12 }) // Random working hours
            }))
        )
    }
};

const seedHouseworkers = async (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        // const user = await generateHouseworker();
        const user = generateHouseworker();
        try {
            const hashedPassword = bcrypt.hashSync(user.password, 12);
            const redisUser = await chatModel.createUser(user.username, hashedPassword, user.picturePath, user.picturePublicId);

            if (redisUser.success) {
                user.id = Number(redisUser.id);
                user.password = hashedPassword;
                await houseworkerModel.create(user);
                users.push(user);
            }
        } catch (error) {
            console.error(`Error creating Houseworker:`, error);
        }
    }
    return users;
};

// const clientsData = await seedClients(clientCount);

module.exports = { seedHouseworkers };
 