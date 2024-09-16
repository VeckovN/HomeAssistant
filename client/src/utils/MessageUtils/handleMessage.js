import { emitMessage } from "../../sockets/socketEmit";
import { sendMessageToUser } from "../../services/chat";

export const sendMessage = async(socket, messageObj) =>{
    const result = await sendMessageToUser(messageObj);
    const {roomKey, dateFormat, lastMessage, unreadMessArray} = result;
    const messageWithRoomKey = {...messageObj, roomKey:roomKey, date:dateFormat, lastMessage:lastMessage, unreadMessArray:unreadMessArray};
    
    emitMessage(socket, {data:messageWithRoomKey});
}