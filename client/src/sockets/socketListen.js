import {toast} from "react-toastify"
import messageSound from '../assets/sounds/message-sound.mp3'
import announcementSound from '../assets/sounds/announcement-sound.mp3'


export const listenForCommentNotification = async(socket) => {
    socket.on(`privateCommentNotify`, (client_username) =>{
        toast.info(`You received Comment from ${client_username} `,{
            className:"toast-contact-message"
        })

        if(!document.hasFocus()){
            const sound = new Audio(announcementSound);
            sound.play();
        }
    })
}

export const listenForRatingNotfication = async(socket, self_id) =>{
    socket.on(`privateRatingNotify-${self_id}`, (client_username) =>{
        toast.info(`You got a Rate from ${client_username} `,{
            className:"toast-contact-message"
        })

        if(!document.hasFocus()){
            const sound = new Audio(announcementSound);
            sound.play();
        }
    })
}

export const listenFormMessage = async(socket) =>{
    socket.on("messageResponseNotify", (fromUsername) =>{
        toast.info(`You received Message from ${fromUsername}`,{
            className:"toast-contact-message"
        })

        if(!document.hasFocus()){
            const sound = new Audio(messageSound);
            sound.play();
        }
      })
}

//users Joined in room (room.join(io.to(roomKey).emit()) listen for these events
export const listenOnMessageInRoom = (socket, dispatch) =>{
    socket.on("messageRoom", (contextObj) =>{
        dispatch({type:"SEND_MESSAGE", data:contextObj})
        //this updates messages of room(adding new message)
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

        console.log("NEW ADDE DUSER ID : " + newUserID);
        console.log("SELF ID:")

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

        if(!document.hasFocus()){
            const sound = new Audio(announcementSound);
            sound.play();
        }
    })
}

export const listenOnAddUserToGroupNotification = (socket, self_id) =>{
    socket.on("addUserToGroupNotify", (messageObj) =>{
        const {newHouseworkerID, clientUsername, newHouseworkerUsername} = messageObj;

        if(newHouseworkerID == self_id){
            toast.info(`Client ${clientUsername} added you to the group`,{
                className:"toast-contact-message"
            })
        }
        else{
            toast.info(`Client ${clientUsername} added the ${newHouseworkerUsername} to group`,{
                className:"toast-contact-message"
            })
        }

        if(!document.hasFocus()){
            const sound = new Audio(announcementSound);
            sound.play();
        }

      })
}

export const listenOnKickUserFromGroupNotification = (socket, self_id) =>{
    socket.on("kickUserFromGroupNotify", (dataObj) =>{
        const {newRoomID, kickedUserID, kickedUsername, clientID, clientUsername} = dataObj;
        
        if(kickedUserID == self_id){
            toast.info(`Client ${clientUsername} has kicked you from the chat`,{
                className:"toast-contact-message"
            })
        }
        else{ 
            toast.info(`Client ${clientUsername} has kicked the ${kickedUsername} from the chat`,{
                className:"toast-contact-message"
            })
        }
        
        if(!document.hasFocus()){
            const sound = new Audio(announcementSound);
            sound.play();
        }
    })
}

export const listenOnDeleteUserRoomNotification = (socket) =>{
    socket.on("deleteUserRoomNotify", (roomObj) =>{
        const {roomID, clientUsername} = roomObj;

        toast.info(`Client ${clientUsername} delete conversation: ${roomID}`,{
            className:"toast-contact-message"
        })

        if(!document.hasFocus()){
            const sound = new Audio(announcementSound);
            sound.play();
        }
      })
}
