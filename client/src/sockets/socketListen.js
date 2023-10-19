import {toast} from "react-toastify"
import messageSound from '../assets/sounds/message-sound.mp3'
import announcementSound from '../assets/sounds/announcement-sound.mp3'

export const listenForCommentNotification = async(socket, self_id) => {
    socket.on(`privateCommentNotify-${self_id}`, (client_username) =>{
        toast.info(`You received Comment from ${client_username} `,{
            className:"toast-contact-message"
        })

        if(!document.hasFocus()){
            //sound notification
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
            //sound notification
            const sound = new Audio(announcementSound);
            sound.play();
        }
    })
}

export const listenFormMessage = async(socket, self_id) =>{
    socket.on("messageResponseNotify", (messageObj) =>{
        const {from, roomID, fromUsername} = messageObj;
        const users = roomID.split(':');

        //exclude sender from users notification
        const notifyUsers = users.filter(el => el!=from);
        //if our userID is in array of notifyUsers
        if(notifyUsers.includes(self_id)){
            toast.info(`You received Message from ${fromUsername}`,{
                className:"toast-contact-message"
            })
        }

        if(!document.hasFocus()){
            //sound notification
            const sound = new Audio(messageSound);
            sound.play();
        }

      })
}

export const listenOnMessageInRoom = (socket, dispatch) =>{
    socket.on("messageRoom", (contextObj) =>{
        dispatch({type:"SEND_MESSAGE", data:contextObj})
    })
    
}

// export const listenOn
