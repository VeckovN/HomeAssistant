
export const emitCommentNotification = (socket, postComment) =>{
    socket.emit('commentNotification', postComment); //notification
    socket.emit('newComment', postComment); // newComment for Comment page and Modal
}

export const emitRatingNotification = (socket, ratingObj) =>{
    socket.emit('ratingNotification', {ratingObj});
}

export const emitMessage = (socket, messageObj) =>{
    socket.emit('message', messageObj)
}

export const emitCreteUserGroup = (socket, groupObj) =>{
    socket.emit("createUserGroup", groupObj)
}

export const emitUserAddedToChat = (socket, groupObj) =>{
    socket.emit("addUserToGroup", groupObj)
}

export const emitKickUserFromChat = (socket, dataObj) =>{
    socket.emit("kickUserFromGroup", dataObj);
}

export const emitUserDeleteRoom = (socket, groupObj) =>{
    socket.emit("deleteUserRoom", groupObj)
}

export const emitRoomJoin = (socket, roomID) =>{
    socket.emit('chatRoom.join', roomID);
}

export const emitLeaveRoom = (socket, roomID) =>{
    socket.emit('chatRoom.leave', roomID);
}




