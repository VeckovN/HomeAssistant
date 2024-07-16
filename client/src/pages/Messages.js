import {useEffect, useReducer, useState, useCallback, useRef} from 'react'; 
import {useSelector} from 'react-redux';
import Chat from '../components/Chat/Chat.js';
import Rooms from '../components/Chat/Rooms.js';
import {toast} from 'react-toastify';
import {MessagesReducer} from '../components/MessagesReducer.js';
import {getHouseworkers} from '../services/houseworker.js';
import {listenOnMessageInRoom, listenOnAddUserToGroup, listenOnCreateUserGroup, listenOnKickUserFromGroup, listenOnDeleteUserFromGroup} from '../sockets/socketListen.js';
import {emitRoomJoin, emitLeaveRoom, emitMessage, emitCreteUserGroup, emitUserAddedToChat, emitKickUserFromChat, emitUserDeleteRoom} from '../sockets/socketEmit.js';
import {getUserRooms, deleteRoom, addUserToRoom, removeUserFromGroup, getMessagesByRoomID, sendMessageToUser, getMoreMessagesByRoomID} from '../services/chat.js';
import {getErrorMessage} from '../utils/ThrowError.js';
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
    const pageNumberRef = useRef(0); 

    const onShowMenuToggleHandler = () =>  setShowMenu(prev => !prev);
    const onUsersFromChatOutHanlder = () => setShowMoreRoomUsers({});

    console.log("ROOOSLQWE QW ", state.roomInfo);
    useEffect(() => {
            if(socket && user){
                console.log("HEEEEEEEEE");
                listenOnMessageInRoom(socket, dispatch);
                listenOnCreateUserGroup(socket, dispatch);
                listenOnAddUserToGroup(socket, dispatch, user.userID);
                listenOnDeleteUserFromGroup(socket, dispatch);
                listenOnKickUserFromGroup(socket, dispatch, user.userID);
    
                //when is created new room show it with others
                socket.on('show.room', (room) =>{
                    
                })
            }
        },[socket]) //on socket change (SOCKET WILL CHANGE WHEN IS MESSAGE SEND --- socket.emit)
            

        console.log("CURRENT ROOM MESSAGES: ", state.roomMessages);
        const fetchMoreMessages  = (async (roomID, pageNumber) =>{
            const messages = await getMoreMessagesByRoomID(roomID, pageNumber);
            console.log("messages.lenght: " , messages.length);

            if(messages.length > 0){
                console.log("MESS FETCH MORE MESSAGES: " , messages);
                dispatch({type:"ADD_MORE_ROOM_MESSAGES", data:messages});
                // dispatch({type:"SET_ROOM_MESSAGES", data:messages})
                // dispatch({type:"SET_LOADING", payload:false})
            }
        })

        const fetchAllRooms = ( async () =>{   
            const data = await getUserRooms(user.username); //roomID, users{}
            // console.log('DATA ROOMS : \n' + JSON.stringify(data));
            dispatch({type:"SET_ROOMS", data:data}) 

            //When user has conversations
            if(data.length > 0){
                 //display first room as active
                const roomID = data[0].roomID;
                const users = data[0].users;
                dispatch({type:"SET_ROOM_INFO", ID:roomID, usersArray:users});
                //join displayed room

                //COMMENTED (emit event before socket initialization(connection))
                // emitRoomJoin(socket, roomID);
                
                //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
                const messages = await getMessagesByRoomID(roomID)
                // const messages = await getMoreMessagesByRoomID(roomID, 0);
                
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
            console.log("\n getAllHouseworkers \n");
            const houseworkerResult = await getHouseworkers();
            dispatch({type:"SET_HOUSEWORKERS", data:houseworkerResult});
        }


        const onRoomClickHanlder = ( async e =>{
            const roomID = e.target.value;
            //don't applie logic if is clicked on the same room
            if(roomID === state.roomInfo.roomID)
                return;

            setShowMenu(false);
            pageNumberRef.current = 0; //reset page number on entering new room

            try{
                if(state.roomInfo.roomID !='' && state.roomInfo.roomID != roomID){
                    emitLeaveRoom(socket, state.roomInfo.roomID);
                    console.log("leave.room : " + state.roomInfo.roomID);
                }
                emitRoomJoin(socket, roomID);
                const messages = await getMessagesByRoomID(roomID)
                dispatch({type:"SET_ROOM_MESSAGE_WITH_ROOM_INFO", messages:messages, ID:roomID})
            }
            catch(err){
                const error = getErrorMessage(err);
                const errorMessage = error.messageError || "Please try again later";
                toast.error(`Room messages can't be dislayed. ${errorMessage}`, {
                    className: 'toast-contact-message'
                });
                console.error(error);
            }
    
            // if(showMenu) //useCallback is used and this doesn't make sense to be wrttien
            //useCallback will memoize it as false value(initial) and never changed due to dependecies being empty
            //if(showMenu)    
            
        })

        const onDeleteRoomHandler = useCallback( async(e)=>{ 
            const roomID = e.target.value;
            try{
                await deleteRoom(roomID);
                dispatch({type:"DELETE_ROOM", data:roomID});

                const data = {roomID, clientID:user.userID, clientUsername:user.username};
                emitUserDeleteRoom(socket, data);
                
                toast.success("You have successfully deleted the room",{
                    className:"toast-contact-message"
                });
            }
            catch(err){
                const error = getErrorMessage(err);
                const errorMessage = error.messageError || "Please try again later";
                toast.error(`The room can't be deleted. ${errorMessage}`, {
                    className: 'toast-contact-message'
                });
                console.error(error);
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

            try{
                const result = await addUserToRoom(roomInfo);
                const {newAddedUserID:newUserID, roomID:newRoomID, isPrivate, newUserPicturePath} = result.data;
    
                if(newRoomID === null){
                    toast.error("The group already exists");
                    return;
                }
    
                const roomUsers = state.rooms.filter(room => room.roomID == roomID);
                const currentUser = roomUsers[0].users; 
                
                if(isPrivate){                    
                    const groupData = {newUserID, newUsername:username, roomID, newRoomID, currentMember:currentUser, clientID:user.userID ,clientUsername:user.username, newUserPicturePath};
                    emitCreteUserGroup(socket, {data:groupData});
                    //update client room view
                    dispatch({type:"CREATE_NEW_GROUP" , roomID:roomID, newRoomID:newRoomID, currentMember:currentUser, newUsername:username, picturePath:newUserPicturePath})
                    toast.info("A Group with "+ username + " has been created");
                }
                else{ 
                    const groupData = {newUserID, newUsername:username, roomID, newRoomID, currentMember:currentUser, clientID:user.userID ,clientUsername:user.username, newUserPicturePath};
                    emitUserAddedToChat(socket, {data:groupData});
                    dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username, picturePath:newUserPicturePath});
                    toast.info("User is added to the room: "+  newRoomID);
                }
            }
            catch(err){
                const error = getErrorMessage(err);
                const errorMessage = error.messageError || "Please try again later";
                toast.error(`Failed to add user to group. ${errorMessage}`, {
                    className: 'toast-contact-message'
                });
                console.error(error);
            }
        });

        const onKickUserFromGroupHandler = async(roomID, username) =>{
            if(username == ""){
                toast.error("Select user that you want to kick from room",{
                    className:"toast-contact-message"
                })
                return
            }

            const roomInfo ={roomID, username};
            try{
                const result = await removeUserFromGroup(roomInfo);
                const {newRoomID, kickedUserID} = result.data;
    
                dispatch({type:"KICK_USER_FROM_GROUP", roomID, newRoomID, username})
    
                const data = {newRoomID, roomID, kickedUserID, kickedUsername:username, clientID:user.userID, clientUsername:user.username}
                emitKickUserFromChat(socket, data);
    
                toast.info("The user "+ username + " has been kicked from the chat");
            }
            catch(err){
                const error = getErrorMessage(err);
                const errorMessage = error.messageError || "Please try again later";
                toast.error(`Failed to kick user from chat. ${errorMessage}`, {
                    className: 'toast-contact-message'
                });
                console.error(error);
            }
        }

        const onSendMessageHandler = async({message, fromRoomID}) =>{        
            if(message != ''){

                console.log("MEESSAGEGEG : " , message);
                // messageRef.current.value = ''
                //emit io.socket event for sending mesasge
                //this will trigger evento on server (in index.js) and send message to room
                const messageObj = {
                    message:message,
                    from:user.userID,
                    roomID:fromRoomID,
                    fromUsername:user.username
                }
                try{
                    const result = await sendMessageToUser(messageObj);
                    const {roomKey, dateFormat} = result;
                    const messageWithRoomKey = {...messageObj, roomKey:roomKey, date:dateFormat};

                    emitMessage(socket, {data:messageWithRoomKey});
                    
                    //update last message of private room
                    if(fromRoomID.split(":").length <= 2)
                        dispatch({type:'SET_LAST_ROOM_MESSAGE', roomID:fromRoomID, message:message})
                }
                catch(err){
                    const error = getErrorMessage(err);
                    const errorMessage = error.messageError || "Please try again later";
                    toast.error(`Failed to send message. ${errorMessage}`, {
                        className: 'toast-contact-message'
                    });
                    console.error(error); 
                }
                
            }
            else
                toast.error("Empty message cannot be sent",{
                    className:'toast-contact-message'
                })
        }

        const onShowMoreUsersFromChatHandler = ({roomID, users}) => setShowMoreRoomUsers({roomID, users});
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
                        onKickUserFromGroupHandler={onKickUserFromGroupHandler}
                        onDeleteRoomHandler={onDeleteRoomHandler}
                        onShowMenuToggleHandler={onShowMenuToggleHandler}
                        pageNumberRef={pageNumberRef}
                        fetchMoreMessages={fetchMoreMessages}
                    />
                </section>
            </div>
            }
        </div>
    )
}

export default Messages;

