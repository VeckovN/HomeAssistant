
export const MessagesReducer = (state, action) =>{

    switch (action.type){
        case "SET_ROOMS":
            return{
                ...state,
                rooms:action.data
            };
        case "SET_ROOM_MESSAGES":
            return{
                ...state,
                roomMessages: action.data
            };
        case "CREATE_NEW_GROUP":
            return{
                ...state,
                rooms: [...state.rooms, {roomID:action.newRoomID, users:[...action.currentMember, {username:action.newUsername, picturePath:action.picturePath}]}],
            }
        case "SET_ROOM_INFO": //RoomInfo
            return{
                ...state,
                roomInfo:{
                    roomID: action.ID,
                    users: [...action.usersArray]
                }
            }
        case "SET_ROOM_INFO_BY_ID":
            return{
                ...state,
                roomInfo:{
                    roomID: action.ID,
                    users: state.rooms.find(el => el.roomID === action.ID)?.users || []
                }
            }
        case "SET_LAST_ROOM_MESSAGE":
            return{
                ...state,
                rooms: state.rooms.map(room =>{
                    if(room.roomID === action.roomID){
                        return { //return updated object in room
                            ...room,
                            lastMessage: {
                                message: action.message,
                                dateDiff: "just now"
                            }
                        }
                    }
                    return room; //return every room again(new state);
                })
            }
        case "SET_ROOM_MESSAGE_WITH_ROOM_INFO":
            return{
                ...state,
                roomMessages: action.messages,
                roomInfo:{
                    roomID: action.ID,
                    users: state.rooms.find(el => el.roomID === action.ID)?.users || []
                },
                typingUsers:[]
            }
        case "ADD_MORE_ROOM_MESSAGES":
            return{
                ...state,
                roomMessages: [...state.roomMessages, ...action.data]
            };
        case "ADD_USER_TO_GROUP":
            return{
                ...state,
                // roomMessages:[],
                rooms: state.rooms.map(room =>{
                    if(room.roomID === action.roomID){ //action-data = roomID
                        return{
                            ...room,
                            roomID:action.newRoomID,
                            users: [...room.users, {username:action.newUsername, picturePath:action.picturePath}],
                        }
                    }
                    return room;
                })
            };
        case "KICK_USER_FROM_GROUP":
            return{
                ...state,
                rooms: state.rooms.map(room =>{
                    if(room.roomID === action.roomID){
                        return{
                            ...room,
                            roomID:action.newRoomID, //updated roomID - removed user from chat 
                            users: room.users.filter(el => el.username != action.username)
                        }
                    }
                    return room;
                })
            };
        case "SET_HOUSEWORKERS":
            return{
                ...state,
                houseworkers:action.data
            }
        case "SEND_MESSAGE":
            return{
                ...state, //return other states
                roomMessages: [ 
                    action.data,
                    ...state.roomMessages
                ] 
            }
        case "DELETE_ROOM":
            return{
                ...state, 
                rooms: state.rooms.filter(el => el.roomID !== action.data), //action.data = roomID
                roomsAction:'DELETE_ROOM'
            }
        case "SET_LOADING":
            return{
                ...state,
                loading:action.payload
            }
        case "SET_TYPING_USER":
            return{
                ...state,
                typingUsers: [
                    ...state.typingUsers,
                    action.data //{userID, username}
                ]
            }
        case "REMOVE_TYPING_USER":
            return{
                ...state,
                typingUsers: state.typingUsers.filter(el => el.userID != action.data.userID)
            }
        case "REMOVE_ALL_TYPE_USERS":
            return{
                ...state,
                typingUsers:[]
            }
        case "SET_ONLINE_USER":
            return{
                ...state,
                onlineUsers: action.data
            }
        case "ADD_ONLINE_USER":
            return{
                ...state,
                onlineUsers: [
                    ...state.onlineUsers,
                    action.data
                ]
            }
        case "REMOVE_ONLINE_USER":
            return{
                ...state,
                onlineUsers: state.onlineUsers.filter(el => el != action.data)
            }

        default:
            return state;
    }


    
}