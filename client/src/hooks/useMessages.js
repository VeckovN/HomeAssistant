import { useReducer, useState, useRef, useEffect } from "react";
import {useDispatch} from 'react-redux';
import {toast} from 'react-toastify';
import {getErrorMessage} from '../utils/ThrowError.js';
import {MessagesReducer} from '../components/MessagesReducer.js';
import {getHouseworkers} from '../services/houseworker.js';
import {listenOnMessageInRoom, listenOnAddUserToGroup, listenOnCreateUserGroup, listenOnKickUserFromGroup, listenOnDeleteUserFromGroup, listenNewOnlineUser, listenOnMessageReceive} from '../sockets/socketListen.js';
import {emitRoomJoin, emitLeaveRoom, emitMessage, emitCreteUserGroup, emitUserAddedToChat, emitKickUserFromChat, emitUserDeleteRoom} from '../sockets/socketEmit.js';
import {getUserRooms, deleteRoom, addUserToRoom, removeUserFromGroup, getMessagesByRoomID, sendMessageToUser, getMoreMessagesByRoomID, getOnlineUsers} from '../services/chat.js';
import {resetUserUnreadMessagesCount} from '../store/unreadMessagesSlice.js';
import {sendMessage} from "../utils/MessageUtils/handleMessage.js";


const useMessages = (socket, user) =>{
    const initialState = {
        loading:true,
        rooms:[],
        roomMessages: [], //current room messages
        roomInfo:{}, //current room Info (roomID, users) AND ictureURL
        houseworkers:'',
        roomsAction:'', //for handling different state.rooms update actions
        typingUsers:[],
        onlineUsers:[], //only importants users() that is necessary for Online flag 
    }
    const [state, dispatch] = useReducer(MessagesReducer, initialState);
    const [showMenu, setShowMenu] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [showChatView, setShowChatView] = useState(false);
    const [showMoreRoomUsers, setShowMoreRoomUsers] = useState({});
    const pageNumberRef = useRef(0); 

    const reduxDispatch = useDispatch();

    const onShowMenuToggleHandler = () =>  setShowMenu(prev => !prev);
    const onUsersFromChatOutHanlder = () => setShowMoreRoomUsers({});

    const onAddTypingUserHandler = (userInfo) =>{
        dispatch({type:"SET_TYPING_USER", data:userInfo});
    }

    const onRemoveTypingUserHandler = (userInfo) =>{
        dispatch({type:"REMOVE_TYPING_USER", data:userInfo});
    }

    useEffect(() => {
        if(socket && user){
            listenOnMessageInRoom(socket, dispatch);
            listenOnMessageReceive(socket, dispatch);
            listenOnCreateUserGroup(socket, dispatch);
            listenOnAddUserToGroup(socket, dispatch, user.userID);
            listenOnDeleteUserFromGroup(socket, dispatch);
            listenOnKickUserFromGroup(socket, dispatch, user.userID);
            // listenOnStartTypingInGroup(socket, user.userID, user.username);
            //LISTEN ON ONLINE USERS TO ADD IT IN ROOM INFO -> OnlineUsers
            // listenOnUserOnline(socket, dispatch);
            listenNewOnlineUser(socket, dispatch, user.userID);
        }
    },[socket])

    const fetchMoreMessages  = (async (roomID, pageNumber) =>{
        const messages = await getMoreMessagesByRoomID(roomID, pageNumber);

        if(messages.length > 0){
            dispatch({type:"ADD_MORE_ROOM_MESSAGES", data:messages});
        }
    })

    const fetchAllRooms = ( async () =>{   
        const data = await getUserRooms(user.username); //roomID, users{}
        // dispatch({type:"SET_ROOMS", data:data}) 
        dispatch({type:"SET_ROOMS", data:data.rooms}) 

        //When user has conversations
        // if(data.length > 0){
        if(data.rooms.length > 0){
                //display first room as active
            // const roomID = data[0].roomID;
            // const users = data[0].users;
            const roomID = data.rooms[0].roomID;
            const users = data.rooms[0].users;
            dispatch({type:"SET_ROOM_INFO", ID:roomID, usersArray:users});

            //COMMENTED (emit event before socket initialization(connection))
            // emitRoomJoin(socket, roomID);
            
            const messages = await getMessagesByRoomID(roomID)
            console.log("MESSSSSSS:" , messages);
            
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
        const houseworkerResult = await getHouseworkers();
        dispatch({type:"SET_HOUSEWORKERS", data:houseworkerResult});
    }

    const getOnlineChatUsers = async() =>{
        const onlineUsers = await getOnlineUsers(user.userID);
        dispatch({type:"SET_ONLINE_USER", data:onlineUsers});
    }

    const enterRoomAfterAction = async(roomID) =>{
        //don't applie logic if is clicked on the same room
        if(roomID === state.roomInfo.roomID)
            return;

        pageNumberRef.current = 0; //reset page number on entering new room

        if(state.roomInfo.roomID !='' && state.roomInfo.roomID != roomID){
            emitLeaveRoom(socket, state.roomInfo.roomID);;
        }

        emitRoomJoin(socket, roomID);

        setIsLoadingMessages(true);
        const messages = await getMessagesByRoomID(roomID);
        dispatch({type:"SET_ROOM_MESSAGE_WITH_ROOM_INFO", messages:messages, ID:roomID})

        //!!!!
        //this is trigger afther the room is deleted
        reduxDispatch(resetUserUnreadMessagesCount({roomID, userID:user.userID}))
        setIsLoadingMessages(false);

        if(showMenu)
            setShowMenu(false);
    }

    const onRoomClickHanlder = ( async e =>{
        const roomID = e.target.value;
        await enterRoomAfterAction(roomID);
        setShowChatView(true);  
    })


    const onDeleteRoomHandler = async(e) => {   
        const roomID = e.target.value;

        //take firsr roomID(if exist) to display it after removing targeted room
        const someRoom = state.rooms[0].roomID;
        try{
            const notifications = await deleteRoom(roomID);
            dispatch({type:"DELETE_ROOM", data:roomID});

            const data = {
                roomID,
                clientID:user.userID,
                clientUsername:user.username,
                notifications
            };
            emitUserDeleteRoom(socket, data);
            
            toast.success("You have successfully deleted the room",{
                className:"toast-contact-message"
            });

            if(someRoom){
                enterRoomAfterAction(someRoom);
                //scroll to top ()
            }  

            if(showChatView)
                showRoomsHandler();
        }
        catch(err){
            const error = getErrorMessage(err);
            const errorMessage = error.messageError || "Please try again later";
            toast.error(`The room can't be deleted. ${errorMessage}`, {
                className: 'toast-contact-message'
            });
            console.error(error);
        }
    }

    useEffect(() =>{
        fetchAllRooms();
        getAllHouseworkers();
        getOnlineChatUsers();
    },[])


    //all user rooms re-rendering //not efficient
    //IMPROVE:fetch and re-render only rooms that the newOnline user is member 
    const showNewOnlineUsers = async() =>{
        const data = await getUserRooms(user.username); //roomID, users{}
        // dispatch({type:"SET_ROOMS", data:data}) 
        dispatch({type:"SET_ROOMS", data:data.rooms}) 
    }
    //roomID, lastMessage, users:roomObjectArray
    // users:
    //     username:user.username, 
    //     picturePath:user.picturePath,
    //     online: onlineUsersSet.has(id) --- CHANGE THIS 

    useEffect(() =>{
        //triger re-rendering the rooms (only when the new online user exist) and chat view but   
        //don't override roomInfo: current visited chat
        showNewOnlineUsers()
    },[state.onlineUsers]) //has changed in socketListener


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
            const {newAddedUserID:newUserID, roomID:newRoomID, isPrivate, newUserPicturePath, notifications} = result.data;

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
                //Scroll to bottom(new added room)
            }
            else{ 
                const groupData = {newUserID, newUsername:username, roomID, newRoomID, currentMember:currentUser, clientID:user.userID ,clientUsername:user.username, newUserPicturePath, notifications};
                emitUserAddedToChat(socket, {data:groupData});
                dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username, picturePath:newUserPicturePath});
                toast.info("User is added to the room: "+  newRoomID);
            }

            enterRoomAfterAction(newRoomID);
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
            const {newRoomID, kickedUserID, notifications} = result.data;
            
            if(newRoomID == null){
                toast.error("The user "+ username + " cannot be kicked, as it will create the conversation with the same members");
                return;
            }

            dispatch({type:"KICK_USER_FROM_GROUP", roomID, newRoomID, username})
            const data = {newRoomID, roomID, kickedUserID, kickedUsername:username, clientID:user.userID, clientUsername:user.username, notifications:notifications}
            emitKickUserFromChat(socket, data);
            enterRoomAfterAction(newRoomID);

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
            const messageObj = {
                message:message,
                from:user.userID,
                roomID:fromRoomID,
                fromUsername:user.username
            }
            try{
                sendMessage(socket, messageObj);
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
    const onShowRoomsButtonHandler = () => {setShowChatView(false)}


    return {
        state, 
        dispatch, 
        showMenu,
        isLoadingMessages,
        showChatView,
        showMoreRoomUsers,
        pageNumberRef,
        onShowMenuToggleHandler,
        onUsersFromChatOutHanlder,
        onAddTypingUserHandler, 
        onRemoveTypingUserHandler,
        fetchMoreMessages,
        onRoomClickHanlder,
        onDeleteRoomHandler,
        onAddUserToGroupHanlder,
        onKickUserFromGroupHandler,
        onSendMessageHandler,
        onShowMoreUsersFromChatHandler,
        onShowRoomsButtonHandler
    }
}

export default useMessages;