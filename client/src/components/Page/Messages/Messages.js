import {useEffect, useRef, useReducer, useState, useCallback} from 'react'; 
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

import '../../../sass/pages/_messages.scss';

//@TODO = ADD button on Houseworker Card for addding this user in some chat
//@TODO = Add Search form for searching for houseworker which you want to add in chat 
//instead fetching all houseworkers and list them

const Messages = ({socket,connected}) =>{

    const {user} = useSelector((state) => state.auth)

    const initialState = {
        loading:true,
        rooms:[],
        roomMessages: [], //current room messages
        roomInfo:{}, //current room Info (roomID, users)
        houseworkers:'',
        roomsAction:'' //for handling different state.rooms update actions
    }
    console.log("Messages");
    const roomRef = useRef(); //value(roomID) of showned room
    const [state, dispatch] = useReducer(MessagesReducer, initialState);
    const [showMenu, setShowMenu] = useState(false);

    console.log("ROOM INFO", state.roomInfo);

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
    

        const onShowMenuToggleHandler = () =>{
            setShowMenu(prev => !prev);
        }

        const fetchAllRooms = ( async () =>{   
            console.log("fetchAllRooms");
            const data = await getUserRooms(user.username);
            dispatch({type:"SET_ROOMS", data:data})
            console.log('DATA ROOMS : \n' + JSON.stringify(data));

            //show message of first fetched room
            const roomID = data[0].roomID;
            const users = data[0].users;
            //insted setting only enterdRoomID set whole object (roomID, users[])
            dispatch({type:"SET_ROOM_INFO", ID:roomID, usersArray:users});
            roomRef.current = roomID;

            //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
            const messages = await getMessagesByRoomID(roomID)
            dispatch({type:"SET_ROOM_MESSAGES", data:messages})
            dispatch({type:"SET_LOADING", payload:false})
        });

        const getAllHouseworkers = async() =>{
            console.log("getAllhouseworekres")
            const houseworkerResult = await getHouseworkers();
            dispatch({type:"SET_HOUSEWORKERS", data:houseworkerResult});
        }
    
        //onClick username read messages from him(from roomID where is it )

        const onRoomClickHanlder = ( async e =>{
            const roomID = e.target.value;
            //Assing clicked roomID to roomRef (read roomID valuewiht roomRef.current.value)
            roomRef.current = e.target;

            //don't applie logic if is clicked on same room
            if(roomID === state.roomInfo.roomID)
                return;
            

            console.log("\n roomID " + roomID);
            console.log("State RoomID \n" + state.roomInfo.roomID);
            
            dispatch({type:"SET_ENTERED_ROOM_ID", data:roomID})
            dispatch({type:"SET_ROOM_INFO_BY_ID", ID:roomID});
    
            if(state.roomInfo.roomID !='' && state.roomInfo.roomID != roomID){
                emitLeaveRoom(socket, state.roomInfo.roomID);
                console.log("leave.room : " + state.roomInfo.roomID);
            }

            emitRoomJoin(socket, roomID);
            console.log("JOIN ROOM: " + roomRef.current.value + "    ROOM ID " + roomID);

            //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
            const messages = await getMessagesByRoomID(roomID)
            dispatch({type:"SET_ROOM_MESSAGES", data:messages})

            // if(showMenu) //useCallback is used and this doesn't make sense to be wrttien
            //useCallback will memoize it as false value(initial) and never changed due to dependecies being empty
            //if(showMenu)    
                setShowMenu(false);
        })
    
        const onDeleteRoomHandler = useCallback( async(e)=>{ 
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
        },[])

        useEffect(() =>{
            fetchAllRooms()
            getAllHouseworkers();
        },[])

        //This is bit complex async logic(taking rooms after deleting room from it(async call))
        //Maybe use redux for this purpose.

        const MessagesAfterDeletingRoom = async(roomID) =>{
            alert("MESSAGE FETCH")
            const messages = await getMessagesByRoomID(roomID)
            dispatch({type:"SET_ROOM_MESSAGES", data:messages})
            dispatch({type:"SET_ROOM_INFO_BY_ID", ID:roomID});
            setShowMenu(false);
        }
        useEffect(()=>{
            alert("state>room>useEffect")

            if(state.roomsAction == "DELETE_ROOM")
            {

                if (state.rooms.length > 0) {
                    const firstRoomID = state.rooms[0].roomID;
                    MessagesAfterDeletingRoom(firstRoomID);
                  }
            }

        },[state.rooms]) //when is room changed ()
    
        const onAddUserToGroupHanlder = useCallback(async(roomID, username)=>{
            console.log("onAddUserTo");
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
        }, [])
    
    return (
        <div className='container'> 
            {state.loading ? <Spinner className='spinner'/> :
            <div className='messages-container'>
                {/* <nav className='menu'>
                    <ul>
                        <li className="item">
                            <i className="fa fa-home" aria-hidden="true">Ho</i>
                        </li>
                        <li className="item">
                            <i className="fa fa-user" aria-hidden="true">Us</i>
                        </li>
                        <li className="item">
                            <i className="fa fa-pencil" aria-hidden="true">Pe</i>
                        </li>
                        <li className="item item-active">
                            <i className="fa fa-commenting" aria-hidden="true">Co</i>
                        </li>
                        <li className="item">
                            <i className="fa fa-file" aria-hidden="true">Fi</i>
                        </li>
                        <li className="item">
                            <i className="fa fa-cog" aria-hidden="true">C</i>
                        </li>
                    </ul>
                </nav> */}

                <section className='rooms-container'>
                    <div className='room search'>
                        <div className="searchbar">
                            <i className="fa fa-search" aria-hidden="true"></i>
                            <input type="text" placeholder="Search..."></input>
                        </div>
                    </div>

                    <Rooms 
                        rooms={state.rooms}
                        houseworkers={state.houseworkers}
                        roomRef={roomRef}
                        roomInfo={state.roomInfo}
                        user={user}
                        onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                        onDeleteRoomHandler={onDeleteRoomHandler}
                        onRoomClickHanlder={onRoomClickHanlder}
                    />
                </section>

                <section className='chat-container'>
                    <Chat 
                        socket={socket} 
                        roomRef={roomRef}
                        rooms={state.rooms}
                        roomMessages={state.roomMessages}
                        roomInfo={state.roomInfo}
                        user={user}
                        showMenu={showMenu}
                        houseworkers={state.houseworkers}
                        onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                        onDeleteRoomHandler={onDeleteRoomHandler}
                        onShowMenuToggleHandler={onShowMenuToggleHandler}
                    />
                </section>
            </div>
            }
        </div>
    )
}

export default Messages;

