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
        const {notification} = rateObj;

        const notificationMessage = notification.message;
        toast.info(notificationMessage,{
            className:"toast-contact-message"
        })

        reduxDispatch(addNotification(notification));
        playSound(announcementSound);
    })
}

export const listenFormMessage = async(socket, reduxDispatch) =>{
    socket.on("messageResponseNotify", (notifyObj) =>{
        const {roomID, fromUsername, unreadUpdateStatus, createRoomNotification} = notifyObj;

        if(createRoomNotification){
            toast.info(createRoomNotification.message,{
                className:"toast-contact-message"
            })
            reduxDispatch(addNotification(createRoomNotification));
        }
        else{
            toast.info(`You received Message from ${fromUsername}`,{
                className:"toast-contact-message"
            })
        }
        
        reduxDispatch(updateUnreadMessages({roomID, unreadUpdateStatus}))
        playSound(messageSound);
      })
}


//users Joined in room (room.join(io.to(roomKey).emit()) listen for these events
export const listenOnMessageInRoom = (socket, dispatch) =>{
    socket.on("messageRoom", (contextObj) =>{
        console.log("messageRoom ContextOBJ:  ", contextObj);
        dispatch({type:"SEND_MESSAGE", data:contextObj})
    })
}

//when the user is in the Message page 
export const listenOnMessageReceive = (socket, dispatch) =>{
    socket.on("messagePage", (contextObj) =>{
        const {roomID, lastMessage} = contextObj;
        console.log("listenOnMessageReceive ContextOBJ:  ", contextObj);
        dispatch({type:'SET_LAST_ROOM_MESSAGE', roomID:roomID, message:lastMessage}) 
    })
}

//only for houseworker (because client contanct houseworker on homePage and won't be able to see changing from message page)
export const listenOnFirstMessageReceive = (socket, dispatch, enterRoomAfterAction) =>{
    socket.on("firstMessageConversation", (contextObj) =>{
        const {roomID, from, fromUsername, lastMessage} = contextObj;
        dispatch({type:'CREATE_CONVERSATION', roomID:roomID, clientID:from, clientUsername:fromUsername, message:lastMessage, clientPicturePath:null, online:true})  
    })
}

export const listenOnCreateUserGroupInRoom  = (socket, dispatch, enterRoomAfterAction) =>{
    socket.on("createUserGroupChangeInRoom", (context) =>{
        console.log("listenOnCreateUserGroupInRoom ,: ", context);
        const {newUserID, newUsername, roomID, newRoomID, currentMember, clientUsername, newUserPicturePath, online} = context;
        //If the newly added user is the current user, create a new group and display it
        dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, newUserID:newUserID, currentMember:currentMember, newUsername:newUsername, picturePath:newUserPicturePath, online})
        enterRoomAfterAction(newRoomID);
    })
}

export const listenOnCreateUserGroup = (socket, dispatch, self_id) =>{
    socket.on("createUserGroupChange", (context) =>{
        let {newUserID, newUsername, roomID, newRoomID, currentMember, clientUsername, newUserPicturePath, online} = context;
        //If the newly added user is the current user, create a new group and display it
        if(self_id == newUserID){
            newUsername = clientUsername;
            newUserPicturePath = null
            online = true
        }

        //check does is private 
        dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, newUserID:newUserID, currentMember:currentMember, newUsername:newUsername, picturePath:newUserPicturePath, online})
    })
}

export const listenOnAddUserToGroup = (socket, dispatch, self_id, enterRoomAfterAction) =>{
    socket.on("addUserToGroupChange", (context) =>{
        const {newUserID, newUsername, roomID, newRoomID, currentMember, clientUsername, newUserPicturePath, online} = context;
        //If the newly added user is the current user, create a new group and display it
        if(newUserID == self_id)
        {
            dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, newUserID:newUserID, currentMember:currentMember, newUsername:clientUsername, picturePath:null, online:true})
            console.log("CREATE_NEW_GROUP");
        }
        else{
            //Update othercaht members by adding the new user to the group
            dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUserID:newUserID, newUsername:newUsername, picturePath:newUserPicturePath, online:online});    
            console.log("ADD_USER_TO_GROUP");
        }        
    })
}

///io.to(roomKey).emit("addUserToGroupChangeInRoom": than trigger enterToNewRoomAction because 
//it's wathcing that room and pointer on that room must be changed 
export const listenOnAddUserToGroupInRoom  = (socket, enterRoomAfterAction) =>{
    socket.on("addUserToGroupChangeInRoom", (newRoomID) =>{
        enterRoomAfterAction(newRoomID);
    })
}

export const listenOnKickUserFromGroup = (socket, dispatch, self_id) =>{
    socket.on("kickUserFromGroupChange", (context) =>{
        const {roomID, newRoomID, kickedUsername, kickedUserID} = context;

        if(kickedUserID === self_id){
            // dispatch({type:"DELETE_ROOM", data:roomID})
            dispatch({type:"DELETE_ROOM_AFTER_USER_KICK", data:roomID})
        }
        else
            dispatch({type:"KICK_USER_FROM_GROUP", roomID, newRoomID, username:kickedUsername})        
    })
}

export const listenOnKickUserFromGroupInRoom  = (socket, self_id, enterRoomAfterAction) =>{
    socket.on("kickUserFromGroupChangeInRoom", (context) =>{
        const {firstRoomID, kickedUserID, newRoomID} = context;
        //kicked user -> newRoomID is deleted so enterFirst/last room
        if(kickedUserID === self_id){
            //dispatch to set roomID 
            enterRoomAfterAction(firstRoomID);
        }
        else{
            enterRoomAfterAction(newRoomID)
            console.log("ENTER ROOM KickUSer IN ROOM --- newRoomID: " + newRoomID)
        }
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
    socket.on("deleteUserRoomNotify", (notification) =>{
       
        const notificationMessage = notification.message;
        toast.info(notificationMessage,{
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
