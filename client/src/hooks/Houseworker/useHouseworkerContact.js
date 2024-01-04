import {useRef} from 'react';
import { emitMessage } from '../../sockets/socketEmit';
import { toast } from 'react-toastify';

const useHouseworkerContact = (socket, isClient, userID, client_username) =>{

    const contactMessageRef = useRef(null);

    const onContactHandler = (e)=>{
        if(!isClient)
            toast.error("Log in to send a message",{
                className:"toast-contact-message"
            })
        else{   
            const messageFromContact = contactMessageRef.current.value

            if(messageFromContact!='')
            {
                const ourID = userID;
                //props.id from button
                const houseworkerID = e.target.value;

                const RoomID = `${ourID}:${houseworkerID}`;
                const messageObj = {
                        message: messageFromContact,
                        from:ourID,
                        roomID:RoomID,
                        fromUsername:client_username
                }
                emitMessage(socket, {messageObj});
                
                toast.success("The message is send",{
                    className:'toast-contact-message'
                })
                contactMessageRef.current.value='';
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