
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
                            ...room, //whole object
                            //THIS NOT NEEDED
                            // users:[...room.users],
                            //roomID: ...roomID
                            lastMessage: action.message
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
                }
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
        
        default:
            return state;
    }


    
}