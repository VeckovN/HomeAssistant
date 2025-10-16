module.exports = (io, socket, redisClient) => {
    const ID = socket.handshake.query.userID; //use handshake for static data

    socket.on('joinRoom', (userID)=>{
        socket.join(`user:${userID}`);
    })

    socket.on('leaveRoom', userID =>{
        socket.leave(`user:${userID}`);
    })

    socket.on("chatRoom.join", id =>{ 
        socket.join(`room:${id}`); 
    })

    socket.on("chatRoom.leave", id =>{
        console.log("You left the room: " + id);
        socket.leave(`room:${id}`)
    })

    //listen on onlineUser event (/thissocket.id could be identifier as well as userID )
    socket.on("addOnlineUser", (userData) =>{
        const data ={type:"Add", userID: userData.userID};
        redisClient.sadd(`onlineUsers`, userData.userID ,(err,res) =>{
            if(err){
                console.log("Error with adding user to onlineUser set");
            }
            else{
                console.log(`User ${userData.userID} hass been added to onlineUser set`);
                io.emit('newOnlineUser', data);
            }
        });
    })  

    socket.on("commentNotification", (commentObj) =>{
        const houseworkerID = commentObj.newComment.houseworkerID;
        //optimization
        //use JoinedRoom instead of dynamicName emit for 'newCommentChange', it's broadCasting the unnecessary traffics (data)
        io.to(`user:${houseworkerID}`).emit('privateCommentNotify', commentObj);
        io.to(`user:${houseworkerID}`).emit(`newCommentChange`, commentObj.newComment);
    })

    socket.on("ratingNotification", (ratingObj) =>{
        const houseworkerID = ratingObj.houseworkerID;
        io.emit(`privateRatingNotify-${houseworkerID}`, ratingObj);
    })

    socket.on("message", ({data})=>{ 
        try{
            const roomKey = data.roomKey;
            io.to(roomKey).emit("messageRoom", data) //entered chat page(view)

            const {from, roomID, fromUsername, lastMessage, unreadMessArray, createRoomNotification, contact} = data;
            const users = roomID.split(':');
            const notifyUsers = users.filter(el => el!=from);

            notifyUsers.forEach(id =>{
                const unreadUser = unreadMessArray.find(el => el.recipientID == id);
                const unreadUpdateStatus = unreadUser ? unreadUser.updateStatus : null;

                let notificationData ={
                    roomID, 
                    fromUsername, 
                    fromUserID:from, 
                    userID:id, 
                    lastMessage, 
                    unreadUpdateStatus:unreadUpdateStatus, 
                    createRoomNotification:createRoomNotification
                }

                //on conversation start *client sent message through contact home page (not from chat)
                if(contact)
                    io.to(`user:${id}`).emit("firstMessageConversation" , data);
                else
                    io.to(`user:${id}`).emit("messagePage" , data);
            
                io.to(`user:${id}`).emit("messageResponseNotify" , notificationData);
            })
        }
        catch(error){
            console.error("Error Handling message: ", error);
        }
    })

    socket.on("startTypingRoom", ({roomID, user}) =>{
        try{
            const {userID, username} = user;
            const roomKey = `room:${roomID}`

            const sender ={
                senderID:userID, 
                senderUsername:username,
                roomID: roomID
            }
            io.to(roomKey).emit("typingMessageStart", sender) 
        }
        catch(err){
            console.error("errpr: " , err);
        }
    })

    socket.on("stopTypingRoom", ({roomID, user}) =>{
        try{
            const {userID, username} = user;
            const roomKey = `room:${roomID}`

            const sender ={
                senderID:userID, 
                senderUsername:username,
                roomID: roomID
            }
            //send it in room (sender should check does is he sender userID === senderID and dont show (...))
            io.to(roomKey).emit("typingMessageStop", sender) 
        }
        catch(err){
            console.error("errpr: " , err);
        }
    })

    socket.on("createUserGroup", ({data}) =>{
        const {newRoomID, roomID, clientID, notifications} = data;                        
        const users = newRoomID.split(':');
        const notifyUsers = users.filter(el => el!=clientID);

        // const roomKey = `room:${roomID}`;
        // io.to(roomKey).emit("createUserToGroupChangeInRoom", newRoomID) //entered chat p

        notifyUsers.forEach(id =>{
            const matchedNotification = notifications.find(notification => notification.to === id);
            io.to(`user:${id}`).emit('createUserToGroupNotify', matchedNotification);
            //send data for chat room update
            io.to(`user:${id}`).emit('createUserGroupChange', data);
        })
    })

    socket.on("addUserToGroup", ({data}) =>{
        const {newRoomID, roomID, clientID, notifications} = data;
        const users = newRoomID.split(':');

        const roomKey = `room:${roomID}`;
        io.to(roomKey).emit("addUserToGroupChangeInRoom", newRoomID) //entered chat p

        const notifyUsers = users.filter(el => el!=clientID);
        notifyUsers.forEach(id =>{
            const matchedNotification = notifications.find(notification => notification.to === id);
            io.to(`user:${id}`).emit("addUserToGroupNotify" , matchedNotification);
            io.to(`user:${id}`).emit("addUserToGroupChange" , data);
        })
    })

    socket.on("kickUserFromGroup", (data) =>{
        const {firstRoomID, roomID, newRoomID, kickedUserID, clientID, notifications} = data;
        const users = roomID.split(":");
        const notifyUsers = users.filter(el => el!=clientID);

        const roomKey = `room:${roomID}`;
        //user's that are in the room right now
        io.to(roomKey).emit("kickUserFromGroupChangeInRoom", {kickedUserID, newRoomID, firstRoomID}) //entered chat p
        
        notifyUsers.forEach(id =>{
            const matchedNotification = notifications.find(notification => notification.to === id);
            io.to(`user:${id}`).emit("kickUserFromGroupNotify" , {roomID, newRoomID, kickedUserID, notification:matchedNotification});
            io.to(`user:${id}`).emit("kickUserFromGroupChange" , data);
        });

    });

    socket.on("deleteUserRoom", (data) =>{
        const {roomID, clientID, notifications} = data;   
        const users = roomID.split(':');
        const notifyUsers = users.filter(el => el!=clientID);

        notifyUsers.forEach(id =>{
            const matchedNotification = notifications.find(notification => notification.to === id);

            io.to(`user:${id}`).emit("deleteUserRoomNotify" , {roomID:roomID, ...matchedNotification});
            io.to(`user:${id}`).emit("deleteUserRoomChange" , data);
        })
    })

    socket.on('disconnect', async()=>{
        //handshake query prop (ID) is used for disconnection.
        redisClient.srem("onlineUsers", ID, (err,res)=>{
            if(err){
                console.log("Error with removing user from onlineUser set");
            }
            else{
                console.log(`User ${ID} hass been removed to onlineUser set`);
                const data ={type:"Remove", userID:ID};
                io.emit('newOnlineUser', data);
            }
        });
    })
}