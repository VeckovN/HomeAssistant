export const getRoomIdInOrder = (firstUserID, secondUserID) =>{
    const userIDs = [Number(firstUserID), Number(secondUserID)];
    const [minUserID, maxUserID] = userIDs.sort((a,b) => a - b);
    return `${minUserID}:${maxUserID}`;
}