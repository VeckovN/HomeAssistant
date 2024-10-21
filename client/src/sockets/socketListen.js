import {toast} from "react-toastify"
import messageSound from '../assets/sounds/livechat-m.mp3'
import announcementSound from '../assets/sounds/new-notification.mp3'
import {getFriendsList} from '../services/chat.js';
import {updateUnreadMessages} from '../store/unreadMessagesSlice.js';
import {updateUnreadComments} from "../store/unreadCommentSlice.js";
import {addNotification} from '../store/notificationsSlice.js';

const playSound = (soundName) =>{
    if(!document.hasFocus()){
        const sound = new Audio(soundName);
        sound.play();
    }
}

// export const listenForCommentNotification = async(socket) => {
export const listenForCommentNotification = async(socket, reduxDispatch) => {
    // socket.on(`privateCommentNotify`, (client_username) =>{
    socket.on(`privateCommentNotify`, (comm) =>{

        const {commentID, comment, fromUsername, date} = comm.newComment;
        toast.info(`You received Comment from ${fromUsername} `,{
            className:"toast-contact-message"
        })

        const notification = comm.notificationObj;
        reduxDispatch(addNotification(notification));

        const newUpdateComment ={commentID, comment, from:fromUsername, date}
        reduxDispatch(updateUnreadComments({newUpdateComment}));
        playSound(announcementSound);
    })
}

export const listenForRatingNotfication = async(socket, self_id, reduxDispatch) =>{
    socket.on(`privateRatingNotify-${self_id}`, (rateObj) =>{
        const {client, notification} = rateObj;
        const client_username = client;

        toast.info(`You got a Rate from ${client_username} `,{
            className:"toast-contact-message"
        })

        reduxDispatch(addNotification(notification));
        playSound(announcementSound);
    })
}

export const listenFormMessage = async(socket, reduxDispatch) =>{
    //Maybe solution:
    //check is the user in room(conversation) than don't display notification
    //if(roomID == currentRoomID)

    socket.on("messageResponseNotify", (notifyObj) =>{
        const {roomID, userID, fromUsername, fromUserID, lastMessage, unreadUpdateStatus} = notifyObj;
        toast.info(`You received Message from ${fromUsername}`,{
            className:"toast-contact-message"
        })
        
        reduxDispatch(updateUnreadMessages({roomID, unreadUpdateStatus}))
        playSound(messageSound);
      })
}


//users Joined in room (room.join(io.to(roomKey).emit()) listen for these events
export const listenOnMessageInRoom = (socket, dispatch) =>{
    socket.on("messageRoom", (contextObj) =>{
        dispatch({type:"SEND_MESSAGE", data:contextObj})
    })
}
//when the user is in the Message page 
export const listenOnMessageReceive = (socket, dispatch) =>{
    socket.on("messagePage", (contextObj) =>{
        const {roomID, lastMessage} = contextObj;
        dispatch({type:'SET_LAST_ROOM_MESSAGE', roomID:roomID, message:lastMessage})
    })
}

export const listenOnCreateUserGroup = (socket, dispatch) =>{
    socket.on("createUserGroupChange", (context) =>{
        const {newUsername, roomID, newRoomID, currentMember, newUserPicturePath} = context;
        dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, currentMember:currentMember, newUsername:newUsername, picturePath:newUserPicturePath})
    })
}

export const listenOnAddUserToGroup = (socket, dispatch, self_id) =>{
    socket.on("addUserToGroupChange", (context) =>{
        const {newUserID, newUsername, roomID, newRoomID, currentMember, newUserPicturePath} = context;
        //If the newly added user is the current user, create a new group and display it
        if(newUserID == self_id)
            dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, currentMember:currentMember, newUsername:newUsername, picturePath:newUserPicturePath})
        else
            //Update othercaht members by adding the new user to the group
            dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:newUsername, picturePath:newUserPicturePath});    
    })
}

export const listenOnKickUserFromGroup = (socket, dispatch, self_id) =>{
    socket.on("kickUserFromGroupChange", (context) =>{
        const {roomID, newRoomID, kickedUsername, kickedUserID} = context;

        if(kickedUserID === self_id)
            dispatch({type:"DELETE_ROOM", data:roomID})
        else
            dispatch({type:"KICK_USER_FROM_GROUP", roomID, newRoomID, username:kickedUsername})        
    })
}

export const listenOnDeleteUserFromGroup = (socket, dispatch) =>{
    socket.on("deleteUserRoomChange", (context) => {
        const {roomID} = context;
        dispatch({type:"DELETE_ROOM", data:roomID});
    })
}

export const listenOnCreateUserNotification = (socket, self_id) =>{
    socket.on(`createUserToGroupNotify`, (messageObj) =>{
        const {newHouseworkerID, clientUsername, newHouseworkerUsername} = messageObj;

        //only one user gets the notification (tne newly added one)
        if(newHouseworkerID == self_id){
            toast.info(`Client ${clientUsername} added you to the group`,{
                className:"toast-contact-message"
            })
        }
        else{
            //Notification for existing members(clients) in the chat, excluding the sender and new added client
            toast.info(`Client ${clientUsername} added the ${newHouseworkerUsername} to group`,{
                className:"toast-contact-message"
            })
        }

        playSound(announcementSound);
    })
}

export const listenOnAddUserToGroupNotification = (socket, self_id, reduxDispatch) =>{
    socket.on("addUserToGroupNotify", (notification) =>{

        const notificationMessage = notification.message;
        toast.info(notificationMessage,{
            className:"toast-contact-message"
        })

        reduxDispatch(addNotification(notification));
        playSound(announcementSound);
      })
}

export const listenOnKickUserFromGroupNotification = (socket, self_id, reduxDispatch) =>{
    socket.on("kickUserFromGroupNotify", (notification) =>{
        const notificationMessage = notification.message;
        toast.info(notificationMessage,{
            className:"toast-contact-message"
        })

        reduxDispatch(addNotification(notification));        
        playSound(announcementSound);
    })
}

export const listenOnDeleteUserRoomNotification = (socket, reduxDispatch) =>{
    socket.on("deleteUserRoomNotify", (roomObj) =>{
        const {roomID, clientUsername, notification} = roomObj;

        toast.info(`Client ${clientUsername} delete conversation: ${roomID}`,{
            className:"toast-contact-message"
        })

        reduxDispatch(addNotification(notification));
        playSound(announcementSound);
      })
}


export const listenNewOnlineUser = async(socket, dispatch, self_id) =>{
    socket.on("newOnlineUser", async(userData) =>{
        const {type, userID} = userData;

        const friendsList = await getFriendsList(self_id);
        //if newOnline user match the friend list then trigger
        if(!friendsList.includes(userID))
            return;

        if(type==="Add"){
            dispatch({type:"ADD_ONLINE_USER", data:userID});
        }
        else if(type==="Remove"){
            dispatch({type:"REMOVE_ONLINE_USER", data:userID});
        }
        else
            return

      })
}
