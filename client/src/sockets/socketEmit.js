
export const emitCommentNotification = (socket, commentObj) =>{
    socket.emit('commentNotification', commentObj); 
    socket.emit('newComment', commentObj.newComment);
}

export const emitRatingNotification = (socket, ratingObj) =>{
    socket.emit('ratingNotification', ratingObj);
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
    if (socket && socket.connected) {
        socket.emit('chatRoom.join', roomID);
    }
}

export const emitLeaveRoom = (socket, roomID) =>{
    if (socket && socket.connected) {
        socket.emit('chatRoom.leave', roomID);
    }
}

export const emitStartTyping = (socket, roomID, user) =>{
    if (socket && socket.connected) {
        socket.emit("startTypingRoom", {roomID, user})
    }
}

export const emitStopTyping = (socket, roomID, user) =>{
    if (socket && socket.connected) {
        socket.emit("stopTypingRoom", {roomID, user})
    }
}