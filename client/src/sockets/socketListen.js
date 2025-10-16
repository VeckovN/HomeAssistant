import {toast} from "react-toastify"
import {handlerError} from "../utils/ErrorUtils.js";
import messageSound from '../assets/sounds/livechat-m.mp3'
import announcementSound from '../assets/sounds/new-notification.mp3'
import {getFriendsList} from '../services/chat.js';
import {updateUnreadMessages, removeUnreadMessages, forwardUnreadMessages} from '../store/unreadMessagesSlice.js';
import {updateUnreadComments} from "../store/unreadCommentSlice.js";
import {addNotification} from '../store/notificationsSlice.js';

const playSound = (soundName) =>{
    if(!document.hasFocus()){
        const sound = new Audio(soundName);
        sound.play();
    }
}

export const listenForCommentNotification = async(socket, reduxDispatch) => {
    socket.on(`privateCommentNotify`, (comm) =>{

        //changed 'fromUsername' to 'from' 
        const {commentID, comment, from, date} = comm.newComment;
        toast.info(`You received Comment from ${from} `,{
            className:"toast-contact-message"
        })

        const notification = comm.notificationObj;
        reduxDispatch(addNotification(notification));

        const newUpdateComment ={commentID, comment, from, date}
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

export const listenFormMessage = async(socket, reduxDispatch, getCurrentUserRoomID ) =>{
    socket.on("messageResponseNotify", (notifyObj) =>{
        const currentUserRoomID = getCurrentUserRoomID();
        const {roomID, fromUsername, unreadUpdateStatus, createRoomNotification} = notifyObj;

        if(createRoomNotification){
            toast.info(createRoomNotification.message,{
                className:"toast-contact-message"
            })
            reduxDispatch(addNotification(createRoomNotification));
            playSound(messageSound);
        }
        else{
             // If user is viewing this room, Don't show message 
            if(roomID === currentUserRoomID){
                reduxDispatch(updateUnreadMessages({roomID, unreadUpdateStatus}))
                return 
            }

            toast.info(`You received Message from ${fromUsername}`,{
                className:"toast-contact-message"
            })

            playSound(messageSound);
        }
        
        reduxDispatch(updateUnreadMessages({roomID, unreadUpdateStatus}))
        // playSound(messageSound);
      })
}

//users Joined in room (room.join(io.to(roomKey).emit()) listen for these events
export const listenOnMessageInRoom = (socket, dispatch, getCurrentRoomID) =>{
    socket.on("messageRoom", (contextObj) =>{

        const currentRoomID = getCurrentRoomID();
        const messageRoomID = contextObj.roomID;

        if(currentRoomID === messageRoomID) {
            console.log('[ACTION] Message belongs to current room, dispatching');
            dispatch({type:"SEND_MESSAGE", data:contextObj})
        } else {
            console.log('[SKIP] Message from different room, ignoring', {currentRoomID, messageRoomID});
        }
    })
}

//when the user is in the Message page 
export const listenOnMessageReceive = (socket, dispatch) =>{
    socket.on("messagePage", (contextObj) =>{
        const {roomID, lastMessage} = contextObj;
        dispatch({type:'SET_LAST_ROOM_MESSAGE', roomID:roomID, message:lastMessage}) 
    })
}

//only for houseworker (because client contanct houseworker on homePage and won't be able to see changing from message page)
export const listenOnFirstMessageReceive = (socket, dispatch) =>{
    socket.on("firstMessageConversation", (contextObj) =>{
        const {roomID, from, fromUsername, lastMessage} = contextObj;
        dispatch({type:'CREATE_CONVERSATION', roomID:roomID, clientID:from, clientUsername:fromUsername, message:lastMessage, clientPicturePath:null, online:true})  
    })
}

export const listenOnCreateUserGroupInRoom  = (socket, dispatch, enterRoomAfterAction) =>{
    socket.on("createUserGroupChangeInRoom", (context) =>{
        const {newUserID, newUsername, roomID, newRoomID, currentMember, clientUsername, newUserPicturePath, online} = context;
        dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, newUserID:newUserID, currentMember:currentMember, newUsername:newUsername, picturePath:newUserPicturePath, online})
        enterRoomAfterAction(newRoomID, true);
    })
}

export const listenOnCreateUserGroup = (socket, dispatch, self_id) =>{
    socket.on("createUserGroupChange", (context) =>{
        let {newUserID, newUsername, roomID, newRoomID, currentMember, clientUsername, newUserPicturePath, online} = context;
        if(self_id == newUserID){
            newUsername = clientUsername;
            newUserPicturePath = null
            online = true
        }

        //check is it private 
        dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, newUserID:newUserID, currentMember:currentMember, newUsername:newUsername, picturePath:newUserPicturePath, online})
    })
}

export const listenOnAddUserToGroup = (socket, dispatch, self_id) =>{
    socket.on("addUserToGroupChange", (context) =>{
        const {newUserID, newUsername, roomID, newRoomID, currentMember, clientUsername, newUserPicturePath, online} = context;
        //If the newly added user is the current user, create a new group and display it
        if(newUserID == self_id)
        {
            dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, newUserID:newUserID, currentMember:currentMember, newUsername:clientUsername, picturePath:null, online:true});
        }
        else{
            //Update othercaht members by adding the new user to the group
            dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUserID:newUserID, newUsername:newUsername, picturePath:newUserPicturePath, online:online});    
        }        
    })
}

export const listenOnAddUserToGroupInRoom  = (socket, enterRoomAfterAction) =>{
    socket.on("addUserToGroupChangeInRoom", (newRoomID) =>{
        enterRoomAfterAction(newRoomID, true);
    })
}

export const listenOnKickUserFromGroup = (socket, dispatch, self_id) =>{
    socket.on("kickUserFromGroupChange", (context) =>{
        const {roomID, newRoomID, kickedUsername, kickedUserID} = context;

        if(kickedUserID === self_id)
            dispatch({type:"DELETE_ROOM_AFTER_USER_KICK", data:roomID})
        else
            dispatch({type:"KICK_USER_FROM_GROUP", roomID, newRoomID, username:kickedUsername})        
    })
}

export const listenOnKickUserFromGroupInRoom  = (socket, self_id, enterRoomAfterAction) =>{
    socket.on("kickUserFromGroupChangeInRoom", (context) =>{
        const {firstRoomID, kickedUserID, newRoomID} = context;
        //kicked user -> newRoomID is deleted so enterFirst/last room
        if(kickedUserID === self_id)
            enterRoomAfterAction(firstRoomID, true);
        else
            enterRoomAfterAction(newRoomID, false);
        
    })
}

export const listenOnDeleteUserFromGroup = (socket, dispatch) =>{
    socket.on("deleteUserRoomChange", (context) => {
        const {roomID} = context;
        dispatch({type:"DELETE_ROOM", data:roomID});
    })
}

export const listenOnCreateUserNotification = (socket, reduxDispatch) =>{
    socket.on(`createUserToGroupNotify`, (notification) =>{
        const notificationMessage = notification.message;
        toast.info(notificationMessage,{
            className:"toast-contact-message"
        })

        reduxDispatch(addNotification(notification));
        playSound(announcementSound);
    })
}

export const listenOnAddUserToGroupNotification = (socket, reduxDispatch) =>{
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
    socket.on("kickUserFromGroupNotify", (data) =>{
        const {roomID, newRoomID, kickedUserID, notification} = data;
        const message = notification.message;

        toast.info(message,{
            className:"toast-contact-message"
        })

        if(self_id != kickedUserID){
            reduxDispatch(forwardUnreadMessages({
                oldRoomID:roomID, 
                newRoomID, 
                kickedUserID
            }));
        }
        else{
            reduxDispatch(removeUnreadMessages({roomID})) 
        }     
        
        reduxDispatch(addNotification(notification));  
        playSound(announcementSound);
    })
}

export const listenOnDeleteUserRoomNotification = (socket, reduxDispatch) =>{
    socket.on("deleteUserRoomNotify", (notification) =>{
        const {message, roomID, to} = notification;
        const notificationMessage = message;
        toast.info(notificationMessage,{
            className:"toast-contact-message"
        })

        reduxDispatch(addNotification(notification));
        reduxDispatch(removeUnreadMessages({roomID}))
        playSound(announcementSound);
      })
}

export const listenNewOnlineUser = async(socket, dispatch, self_id) =>{
    socket.on("newOnlineUser", async(userData) =>{
        const {type, userID} = userData;

        try{
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
        }
        catch(err){
            handlerError(err);
        }

      })
}
