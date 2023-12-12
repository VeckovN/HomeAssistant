
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
            const newUserInfo ={
                username:action.newUsername,
                picturePath:action.picturePath
            }
            return{
                ...state,
                roomMessages:[],
                // rooms: [...state.rooms, {roomID:action.newRoomID, users:[...action.user, {username:action.newUsername, picturePath:action.picturePath}]}],
                rooms: [...state.rooms, {roomID:action.newRoomID, users:[...action.user, ...newUserInfo]}],
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
        case "SET_ROOM_MESSAGE_WITH_ROOM_INFO":
            return{
                ...state,
                roomMessages: action.messages,
                roomInfo:{
                    roomID: action.ID,
                    users: state.rooms.find(el => el.roomID === action.ID)?.users || []
                }
            }
        case "ADD_USER_TO_GROUP":
            return{
                ...state,
                roomMessages:[],
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
        case "SET_HOUSEWORKERS":
            return{
                ...state,
                houseworkers:action.data
            }
        case "SEND_MESSAGE":
            return{
                ...state, //return other states
                roomMessages: [ 
                    ...state.roomMessages,
                    action.data
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