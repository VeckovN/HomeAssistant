import {useEffect, useReducer, useState, useCallback} from 'react'; 
import {useSelector} from 'react-redux';
import Chat from '../components/Chat/Chat.js';
import Rooms from '../components/Chat/Rooms.js';
import {toast} from 'react-toastify';
import {MessagesReducer} from '../components/MessagesReducer.js';
import {getHouseworkers} from '../services/houseworker.js';
import {listenOnMessageInRoom} from '../sockets/socketListen.js';
import {emitRoomJoin, emitLeaveRoom, emitMessage} from '../sockets/socketEmit.js';
import {getUserRooms, deleteRoom, addUserToRoom, getMessagesByRoomID} from '../services/chat.js';
import Spinner from '../components/UI/Spinner.js';

import '../sass/pages/_messages.scss';

const Messages = ({socket,connected}) =>{

    const {user} = useSelector((state) => state.auth)

    const initialState = {
        loading:true,
        rooms:[],
        roomMessages: [], //current room messages
        roomInfo:{}, //current room Info (roomID, users) AND ictureURL
        houseworkers:'',
        roomsAction:'' //for handling different state.rooms update actions
    }
    const [state, dispatch] = useReducer(MessagesReducer, initialState);
    const [showMenu, setShowMenu] = useState(false);
    const [showMoreRoomUsers, setShowMoreRoomUsers] = useState({});

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
            const data = await getUserRooms(user.username); //roomID, users{}
            console.log('DATA ROOMS : \n' + JSON.stringify(data));
            dispatch({type:"SET_ROOMS", data:data}) 

            //When user has conversations
            if(data.length > 0){
                 //display first room as active
                const roomID = data[0].roomID;
                const users = data[0].users;
                dispatch({type:"SET_ROOM_INFO", ID:roomID, usersArray:users});
                //join displayed room
                emitRoomJoin(socket, roomID);
                
                //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
                const messages = await getMessagesByRoomID(roomID)
                dispatch({type:"SET_ROOM_MESSAGES", data:messages})
                dispatch({type:"SET_LOADING", payload:false})
            }
            else{
                dispatch({type:"SET_ROOM_INFO", ID:null, usersArray:[]});
                dispatch({type:"SET_ROOM_MESSAGES", data:[]})
                dispatch({type:"SET_LOADING", payload:false})
            }
        });

        const getAllHouseworkers = async() =>{
            console.log("getAllhouseworekres")
            const houseworkerResult = await getHouseworkers();
            dispatch({type:"SET_HOUSEWORKERS", data:houseworkerResult});
        }
    


        const onRoomClickHanlder = ( async e =>{
            const roomID = e.target.value;
            //don't applie logic if is clicked on the same room
            if(roomID === state.roomInfo.roomID)
                return;

            setShowMenu(false);
    
            if(state.roomInfo.roomID !='' && state.roomInfo.roomID != roomID){
                emitLeaveRoom(socket, state.roomInfo.roomID);
                console.log("leave.room : " + state.roomInfo.roomID);
            }

            emitRoomJoin(socket, roomID);
            const messages = await getMessagesByRoomID(roomID)
            dispatch({type:"SET_ROOM_MESSAGE_WITH_ROOM_INFO", messages:messages, ID:roomID})

            // if(showMenu) //useCallback is used and this doesn't make sense to be wrttien
            //useCallback will memoize it as false value(initial) and never changed due to dependecies being empty
            //if(showMenu)    
            
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
        const MessagesAfterRoomsAction = async(roomID)=>{
            const messages = await getMessagesByRoomID(roomID)
            dispatch({type:"SET_ROOM_MESSAGE_WITH_ROOM_INFO", messages:messages, ID:roomID});
            setShowMenu(false);
        }

        useEffect(()=>{
            //onDelete function for deleting room from state.rooms (is Async)
            //deletion must be awaited before obtaining a new roomID
            if(state.roomsAction == "DELETE_ROOM")
                if (state.rooms.length > 0) {
                    const firstRoomID = state.rooms[0].roomID;
                    MessagesAfterRoomsAction(firstRoomID);
                  }
        },[state.rooms])
    
        const onAddUserToGroupHanlder = (async(roomID, username)=>{
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
            const {roomID:newRoomID, isPrivate, newUserPicturePath} = result.data;

            if(newRoomID === null){
                toast.error("The group already exists");
                return;
            }
            
            if(isPrivate){                    
                const roomUsers = state.rooms.filter(room => room.roomID == roomID);
                const currentUser = roomUsers[0].users; //users of room that we add new user
                dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, user:currentUser, newUsername:username, picturePath:newUserPicturePath})
                toast.info("A Group with "+ username + " has been created");
            }
            else{ 
                dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username, picturePath:newUserPicturePath});    
                toast.info("User is added to the room: "+  newRoomID);
            }
            
            //show messages of new created group
            MessagesAfterRoomsAction(newRoomID);
            //joining a room to se new incoming messages
            emitRoomJoin(socket, newRoomID);
        });

        const onSendMessageHandler = ({message, fromRoomID}) =>{    
            console.log("FORM ROOM ID: " + fromRoomID + "FROM: " + user.userID)
    
            if(message != ''){
                // messageRef.current.value = ''
                //emit io.socket event for sending mesasge
                //this will trigger evento on server (in index.js) and send message to room
                const messageObj = {
                    message:message,
                    //who send message()
                    from:user.userID,
                    roomID:fromRoomID,
                    fromUsername:user.username
                }
                //emit message(server listen this for sending message to user(persist in db) )
                //and also client listen this event to notify another user for receiving message
                emitMessage(socket, {messageObj});
                
                //update last message of private room
                if(fromRoomID.split(":").length <= 2)
                    dispatch({type:'SET_LAST_ROOM_MESSAGE', roomID:fromRoomID, message:message})
                
                //SOUND NOTIFICATION WHEN ON MESSAGE SENDING
            }
            else
                toast.error("Empty message cannot be sent",{
                    className:'toast-contact-message'
                })
        }

        const onShowMoreUsersFromChatHandler = ({roomID, users}) => {
            setShowMoreRoomUsers({roomID, users});
        }

        const onUsersFromChatOutHanlder = () =>{
            setShowMoreRoomUsers({});
        }
    
    return (
        <div className={`container-${user.type === "Houseworker" ? "houseworker" : "client"}`}> 
            {state.loading ? <Spinner className='profile-spinner'/> :
            <div className='messages-container'>
                <section className='rooms-container'>
                    <div className='room-chat-header'>
                        <div className='header-label'>Chat Rooms</div>
                    </div>

                    <Rooms 
                        rooms={state.rooms}
                        roomInfo={state.roomInfo}
                        showMoreRoomUsers={showMoreRoomUsers}
                        onRoomClickHanlder={onRoomClickHanlder}
                        // onRoomClickHanlder={onRoomClickHandlerWithSessionCheck}
                        onShowMoreUsersFromChatHandler={onShowMoreUsersFromChatHandler}
                        onUsersFromChatOutHanlder={onUsersFromChatOutHanlder}
                    />
                </section>

                <section className='chat-container'>
                    <Chat 
                        rooms={state.rooms}
                        roomMessages={state.roomMessages}
                        roomInfo={state.roomInfo}
                        user={user}
                        showMenu={showMenu}
                        houseworkers={state.houseworkers}
                        onSendMessageHandler={onSendMessageHandler}
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

