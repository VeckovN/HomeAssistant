import {useEffect, useRef, useReducer} from 'react'; 
import { useSelector } from 'react-redux';
import Chat from './Chat/Chat.js';
import Rooms from './Rooms/Rooms.js';
import { toast } from 'react-toastify';
import { MessagesReducer } from './MessagesReducer.js';
import {getHouseworkers} from '../../../services/houseworker.js';
import {getUserRooms, deleteRoom, addUserToRoom, getMessagesByRoomID} from '../../../services/chat.js';


//@TODO = ADD button on Houseworker Card for addding this user in some chat
//@TODO = Add Search form for searching for houseworker which you want to add in chat 
//instead fetching all houseworkers and list them

const Messages = ({socket,connected}) =>{

    const {user} = useSelector((state) => state.auth)

    const initialState = {
        rooms:[],
        roomMessages: [],
        selectedUsername :'',
        houseworkers:'',
        enteredRoomID:''
    }

    const roomRef = useRef(); //value(roomID) of showned room
    const [state, dispatch] = useReducer(MessagesReducer, initialState);

    useEffect(() => {
            if(connected && user){
                console.log("HEEEEEEEEE");
                //io.to(roomKey).emit("messageRoom", messageObj)
                //users which looking on chat will  receive message 
                socket.on("messageRoom", (contextObj) =>{
                    const messageObj = JSON.parse(contextObj);
                    dispatch({type:"SEND_MESSAGE", data:messageObj})
                })
    
                //when is created new room show it with others
                socket.on('show.room', (room) =>{
                    
                })
            }
        },[socket]) //on socket change (SOCKET WILL CHANGE WHEN IS MESSAGE SEND --- socket.emit)
    
        const fetchAllRooms = async () =>{    
            const data = await getUserRooms(user.username);
            dispatch({type:"SET_ROOMS", data:data})
        }

        const getAllHouseworkers = async() =>{
            const houseworkerResult = await getHouseworkers();
            dispatch({type:"SET_HOUSEWORKERS", data:houseworkerResult});
        }

        const onChangeSelectHandler = (e)=>{
            dispatch({type:"SET_SELECTED_USERNAME", data:e.target.value})
        }
    
        //onClick username read messages from him(from roomID where is it )
        const onRoomClickHanlder = async e =>{
            const roomID = e.target.value;
            //Assing clicked roomID to roomRef (read roomID valuewiht roomRef.current.value)
            roomRef.current = e.target;
            if(state.enteredRoomID !='' && state.enteredRoomID != roomID){
                socket.emit('leave.room', state.enteredRoomID);
                console.log("leave.room : " + state.enteredRoomID);
            }

            socket.emit('room.join', roomID);
            console.log("JOIN ROOM: " + roomRef.current.value + "    ROOM ID " + roomID);

            dispatch({type:"SET_ENTERED_ROOM_ID", data:roomID})
            
            //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
            const messages = await getMessagesByRoomID(roomID)
            dispatch({type:"SET_ROOM_MESSAGES", data:messages})

        }
    
        const onDeleteRoomHandler = async(e)=>{ 
            const roomID = e.target.value;
            await deleteRoom(roomID);
            dispatch({type:"DELETE_ROOM", data:roomID});

            toast.success("You have successfully deleted the room",{
                className:"toast-contact-message"
            });
        }

        useEffect(() =>{
            fetchAllRooms()
            getAllHouseworkers();
        },[])
    
        const onAddUserToGroupHanlder = async(e)=>{
            const roomID = e.target.value;

            if(state.selectedUsername == ""){
                toast.info("Select user that you want to add in room",{
                    className:"toast-contact-message"
                })
                return
            }

            const roomInfo = {
                roomID:roomID,
                newUsername: state.selectedUsername
            }
    
            await addUserToRoom(roomInfo);

            toast.info("Korisnik je dodat u Sobu: "+ roomID );
            dispatch({type:"ADD_USER_TO_GROUP", data:roomID});
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
                onChangeSelectHandler ={onChangeSelectHandler}
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