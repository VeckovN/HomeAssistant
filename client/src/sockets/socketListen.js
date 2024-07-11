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
        const {newUsername, roomID, newRoomID, currentMember, newUserPicturePath} = context;
        dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, currentMember:currentMember, newUsername:newUsername, picturePath:newUserPicturePath})
    })
}

//NOT IMPLEMENTED
export const listenOnAddUserToGroup = (socket, dispatch) =>{
    socket.on("addUserToGroupChange", (context) =>{
        //if(self_id == NewUserName)
            //dispatch(Create_Group);

        const {newUserID, newUsername, roomID, newRoomID, clientID ,clientUsername, newUserPicturePath} = context;
        dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:newUsername, picturePath:newUserPicturePath});    
    })
}

export const listenOnCreateUserNotification = (socket, self_id) =>{
    // setGroupAddingListener(socket, listenerName, messageObj);
    socket.on(`createUserToGroupNotify`, (messageObj) =>{
        const {newHouseworkerID, clientUsername, newHouseworkerUsername} = messageObj;

        //only one user got notification (new added)
        if(newHouseworkerID == self_id){
            //Notification for added client
            toast.info(`Client ${clientUsername} added you to the group`,{
                className:"toast-contact-message"
            })
        }
        else{
            //Notification for members(clients) in chat excluded sender and added client
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

//NOT IMPLEMENTED
export const listenOnAddUserToGroupNotification = (socket, self_id) =>{
    socket.on("addUserToGroupNotify", (messageObj) =>{
        const {newHouseworkerID, clientUsername, newHouseworkerUsername} = messageObj;

        if(newHouseworkerID == self_id){
            //Notification for added client
            toast.info(`Client ${clientUsername} added you to the group`,{
                className:"toast-contact-message"
            })
        }
        else{
            //Notification for members(clients) in chat excluded sender and added client
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

export const listenOnDeleteUserRoomNotification = (socket) =>{
    socket.on("deleteUserRoomNotify", (roomObj) =>{
        const {roomID, clientID, clientUsername} = roomObj;

        //Notification for members(clients) in chat excluded sender and added client
        toast.info(`Client ${clientUsername} delete conversation: ${roomID}`,{
            className:"toast-contact-message"
        })

        if(!document.hasFocus()){
            const sound = new Audio(announcementSound);
            sound.play();
        }
      })
}


// const setGroupAddingListener = (socket, listenerName, dateObject, selfID) =>{
//     socket.on(listenerName, (dateObject) =>{
//         const {newHouseworkerID, clientUsername, newHouseworkerUsername} = dateObject;

//         //only one user got notification (new added)
//         if(newHouseworkerID == selfID){
//             //Notification for added client
//             toast.info(`Client ${clientUsername} added you to the group`,{
//                 className:"toast-contact-message"
//             })
//         }
//         else{
//             //Notification for members(clients) in chat excluded sender and added client
//             toast.info(`Client ${clientUsername} added the ${newHouseworkerUsername} to group`,{
//                 className:"toast-contact-message"
//             })
//         }

//         if(!document.hasFocus()){
//             const sound = new Audio(announcementSound);
//             sound.play();
//         }
//     })
// }


// export const listenOnAddedUser = (socket) =>{
//     //render room view of users that are joined the room
//     //All users will see added user (real time update)

//     //the user's that are joined, send them a update
//     socket.emit('room.join', roomID);
// }

// export const listenOn
