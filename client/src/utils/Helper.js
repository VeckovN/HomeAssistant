export const getRoomIdInOrder = (firstUserID, secondUserID) =>{
    const userIDs = [Number(firstUserID), Number(secondUserID)];
    const [minUserID, maxUserID] = userIDs.sort((a,b) => a - b);
    return `${minUserID}:${maxUserID}`;
}

export const loadDefaultImageOnError = e =>{
    e.target.onerror = null;
    e.target.src = `assets/userImages/userDefault.png`;
}