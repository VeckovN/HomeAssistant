
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

export const emitRoomJoin = (socket, roomID) =>{
    socket.emit('room.join', roomID);
}

export const emitLeaveRoom = (socket, roomID) =>{
    socket.emit('leave.room', roomID);
}