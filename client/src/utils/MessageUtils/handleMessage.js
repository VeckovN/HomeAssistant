import { emitMessage } from "../../sockets/socketEmit";
import { sendMessageToUser } from "../../services/chat";

export const sendMessage = async(socket, messageObj) =>{
    const result = await sendMessageToUser(messageObj);
    const {roomKey, dateFormat, lastMessage, unreadMessArray, createRoomNotification} = result;
    const messageWithRoomKey = {
        ...messageObj, 
        roomKey, 
        date:dateFormat, 
        lastMessage, 
        unreadMessArray, 
        createRoomNotification
    };
    emitMessage(socket, {data:messageWithRoomKey});
}