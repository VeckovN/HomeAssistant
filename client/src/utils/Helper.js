// Format room ID to start with the lower user ID value
export const getRoomIdInOrder = (firstUserID, secondUserID) =>{
    // The room ID should be formatted as minID:maxID (e.g., room:1:2, room:4:9, not room:8:2)
   const minUserID = firstUserID > secondUserID ? secondUserID : firstUserID;
   const maxUserID = firstUserID > secondUserID ? firstUserID : secondUserID;
   // Generate the room ID in the format minID:maxID between two users
   return `${minUserID}:${maxUserID}`
}