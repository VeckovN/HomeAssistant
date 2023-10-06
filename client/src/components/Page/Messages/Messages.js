import {useEffect, useRef, useReducer, useState} from 'react'; 
import { useSelector } from 'react-redux';
import Chat from './Chat/Chat.js';
import Rooms from './Rooms/Rooms.js';
import { toast } from 'react-toastify';
import { MessagesReducer } from './MessagesReducer.js';
import {getHouseworkers} from '../../../services/houseworker.js';
import { listenOnMessageInRoom } from '../../../sockets/socketListen.js';
import { emitRoomJoin, emitLeaveRoom } from '../../../sockets/socketEmit.js';
import {getUserRooms, deleteRoom, addUserToRoom, getMessagesByRoomID} from '../../../services/chat.js';
import Spinner from '../../UI/Spinner.js';

//@TODO = ADD button on Houseworker Card for addding this user in some chat
//@TODO = Add Search form for searching for houseworker which you want to add in chat 
//instead fetching all houseworkers and list them

const Messages = ({socket,connected}) =>{

    const {user} = useSelector((state) => state.auth)

    const initialState = {
        rooms:[],
        roomMessages: [],
        houseworkers:'',
        enteredRoomID:'',
    }

    const roomRef = useRef(); //value(roomID) of showned room
    const [state, dispatch] = useReducer(MessagesReducer, initialState);

    useEffect(() => {
            if(connected && user){
                console.log("HEEEEEEEEE");
                //io.to(roomKey).emit("messageRoom", messageObj)
                //users which looking on chat will  receive message 
                listenOnMessageInRoom(socket, dispatch);
    
                //when is created new room show it with others
                socket.on('show.room', (room) =>{
                    
                })
            }
        },[socket]) //on socket change (SOCKET WILL CHANGE WHEN IS MESSAGE SEND --- socket.emit)
    
        const fetchAllRooms = async () =>{   
            const data = await getUserRooms(user.username);
            dispatch({type:"SET_ROOMS", data:data})
            console.log('DATA ROOMS : \n' + JSON.stringify(data));
        }

        const getAllHouseworkers = async() =>{
            const houseworkerResult = await getHouseworkers();
            dispatch({type:"SET_HOUSEWORKERS", data:houseworkerResult});
        }
    
        //onClick username read messages from him(from roomID where is it )
        const onRoomClickHanlder = async e =>{
            const roomID = e.target.value;
            //Assing clicked roomID to roomRef (read roomID valuewiht roomRef.current.value)
            roomRef.current = e.target;
            if(state.enteredRoomID !='' && state.enteredRoomID != roomID){
                //socket.emit('leave.room', state.enteredRoomID);
                emitLeaveRoom(socket, state.enteredRoomID);
                console.log("leave.room : " + state.enteredRoomID);
            }

            emitRoomJoin(socket, roomID);
            console.log("JOIN ROOM: " + roomRef.current.value + "    ROOM ID " + roomID);

            dispatch({type:"SET_ENTERED_ROOM_ID", data:roomID})
            
            //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
            const messages = await getMessagesByRoomID(roomID)
            dispatch({type:"SET_ROOM_MESSAGES", data:messages})
        }
    
        const onDeleteRoomHandler = async(e)=>{ 
            const roomID = e.target.value;

            try{
                await deleteRoom(roomID);
                dispatch({type:"DELETE_ROOM", data:roomID});
    
                toast.success("You have successfully deleted the room",{
                    className:"toast-contact-message"
                });
            }
            catch(error){
                //catch error from service
                console.error(error);
                toast.error("The room can't be deleted",{
                    className:"toast-contact-message"
                });
            }
        }

        useEffect(() =>{
            fetchAllRooms()
            getAllHouseworkers();
        },[])
    
        const onAddUserToGroupHanlder = async(roomID, username)=>{
            if(username == ""){
                toast.info("Select user that you want to add in room",{
                    className:"toast-contact-message"
                })
                return
            }

            const roomInfo = {
                roomID:roomID,
                newUsername: username
            }

            const result = await addUserToRoom(roomInfo);
            const data = result.data;
            const newRoomID = data.roomID;
            const isPrivate = data.isPrivate;
            
            console.log("NEW ROOM ID: " + newRoomID );
            if(isPrivate){
                //users of the new rooms:
                console.log("ROOMS ssss: " + state.rooms);
                    
                const roomUsers = state.rooms.filter(room => room.roomID == roomID);

                const houseworker = roomUsers[0].users;
                console.log("RPPM :  " + roomUsers[0].users);
                //create new group (add user to new gruop)   
                dispatch({type:"CREATE_NEW_GRUOP" , roomID:roomID, newRoomID:newRoomID, user:houseworker, newUsername:username})
            }
            else{ //add user to existed group
                dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username});
            }

            toast.info("User is added to the room: "+ roomID );
        }
    
    return (
        <div className="chat_container">
            <Rooms 
                rooms={state.rooms}
                houseworkers={state.houseworkers}
                roomRef={roomRef}
                user={user}
                onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                onDeleteRoomHandler={onDeleteRoomHandler}
                onRoomClickHanlder={onRoomClickHanlder}
            />

            <Chat 
                socket={socket} 
                roomRef={roomRef}
                roomMessages={state.roomMessages}
                user={user}
            />
        </div>
    )
}

export default Messages;