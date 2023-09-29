
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
        case "SET_ENTERED_ROOM_ID":
            return{
                ...state,
                enteredRoomID:action.data
            }
        case "CREATE_NEW_GRUOP":
            return{
                ...state,
                roomMessages:[],
                //find room with added (houseworker user (action.user, ) new added houseworker (state.selectedUsername))
                rooms: [...state.rooms, {roomID:action.newRoomID, users:[action.user, action.newUsername]}]
            }

        case "ADD_USER_TO_GROUP":
            return{
                ...state,
                roomMessages:[],
                rooms: state.rooms.map(room =>{
                    if(room.roomID === action.roomID){ //action-data = roomID
                        console.log("ROOM " + room);
                        return{
                            ...room,
                            roomID:action.newRoomID,
                            users: [...room.users, action.newUsername]
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
                ...state, ///other states
                rooms: state.rooms.filter(el => el.roomID != action.data), //action.data = roomID
                roomMessages:[]
            };
        
        default:
            return state;
    }


    
}