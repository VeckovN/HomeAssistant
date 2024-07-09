import {toast} from "react-toastify"
import messageSound from '../assets/sounds/message-sound.mp3'
import announcementSound from '../assets/sounds/announcement-sound.mp3'

// export const listenForCommentNotification = async(socket, self_id) => {
//     socket.on(`privateCommentNotify-${self_id}`, (client_username) =>{
//         toast.info(`You received Comment from ${client_username} `,{
//             className:"toast-contact-message"
//         })

//         if(!document.hasFocus()){
//             const sound = new Audio(announcementSound);
//             sound.play();
//         }
//     })
// }

//REFACTORED
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

//notify newAdded user that is added to group
//notify all others users of group that the newUser is added
export const listenOnUserAddToGroupNotification = (socket) =>{
    // {nwe User -> Thehouseworker} is added to group

    //exclude sender
    //other users -> The {username-client} added {houseworker} to the group

    //redner new added users room(if the user is on page)
    socket.on("notifyUserToGroup")
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

//BUG AFRTER ADDING (ERROR OCURED)
export const listenOnCreateUserGroup = (socket, dispatch) =>{
    socket.on("createUserGroupChange", (context) =>{
        console.log("CONTEXTTTTT GROUP: ", context);
        const {roomID, newRoomID, currentUser, username, newUserPicturePath} = context;
        // dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username, picturePath:newUserPicturePath});    
        // dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username, picturePath:newUserPicturePath});    
        dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, user:currentUser, newUsername:username, picturePath:newUserPicturePath})
        //update room view
    })
}

//NOT IMPLEMENTED
export const listenOnUserAddToGroup = (socket, dispatch) =>{
    socket.on("addUserToGroupChange", (context) =>{
        console.log("CONTEXT ADD TO GROUP: ", context);
        // dispatch({type:""})
        const {roomID, newRoomID, username, newUserPicturePath} = context;
        // dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username, picturePath:newUserPicturePath});    
        dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username, picturePath:newUserPicturePath});    
        //update room view
    })
}

//WORKING (BUG* After removing room (that contans user that is added after removing))
export const listenOnCreateUserNotification = (socket, self_id) =>{
    socket.on(`createUserToGroupNotify-${self_id}`, (messageObj) =>{
        //only one user got notification (new added)
        console.log("MESSA A OBOOBJJBJ : ", messageObj);
        const client = messageObj.currentUser[0].username; 
        toast.info(`Client ${client} added you to group`,{
            className:"toast-contact-message"
        })

        if(!document.hasFocus()){
            const sound = new Audio(announcementSound);
            sound.play();
        }
    })
    
}

//NOT IMPLEMENTED
export const listenOnAddUserToGroupNotification = (socket, self_id) =>{
    socket.on("", (messageObj) =>{
        console.log("socket.on(messageResponseNotify)");
        const {from, roomID, fromUsername} = messageObj;
        const users = roomID.split(':');

        //exclude the sender from users notification
        const notifyUsers = users.filter(el => el!=from);
        //if our userID is in array of notifyUsers
        if(notifyUsers.includes(self_id)){
            toast.info(`You received Message from ${fromUsername}`,{
                className:"toast-contact-message"
            })
        }

        if(!document.hasFocus()){
            const sound = new Audio(messageSound);
            sound.play();
        }

      })
}

// export const listenOnAddedUser = (socket) =>{
//     //render room view of users that are joined the room
//     //All users will see added user (real time update)

//     //the user's that are joined, send them a update
//     socket.emit('room.join', roomID);
// }

// export const listenOn
