import {useRef} from 'react';
import {handlerError} from '../../utils/ErrorUtils.js';
import {toast} from 'react-toastify';
import {getRoomIdInOrder} from '../../utils/Helper';
import {sendMessage} from '../../utils/MessageUtils/handleMessage.js';

const useHouseworkerContact = (socket, isClient, userID, client_username) =>{

    const contactMessageRef = useRef(null);

    const onContactHandler = async(e)=>{
        if(!isClient)
            toast.error("Log in to send a message",{
                className:"toast-contact-message"
            })
        else{   
            const messageFromContact = contactMessageRef.current.value

            if(messageFromContact!='')
            {
                const currentUserID = userID;
                const houseworkerID = e.target.value;

                const RoomID = getRoomIdInOrder(currentUserID, houseworkerID);

                const messageObj = {
                        message: messageFromContact,
                        from:currentUserID,
                        roomID:RoomID,
                        fromUsername:client_username,
                        contact:true,
                }
                try{
                    await sendMessage(socket, messageObj);
                    toast.success("The message is send",{
                        className:'toast-contact-message'
                    })
                    contactMessageRef.current.value='';
                }
                catch(err){
                    handlerError(err);
                }
            }
            else
                toast.error("You cannot send the empty message",{
                    className:"toast-contact-message"
                })
        }   
    }

    return {contactMessageRef, onContactHandler}
}

export default useHouseworkerContact;