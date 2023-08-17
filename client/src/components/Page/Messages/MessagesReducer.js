
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
        case "ADD_USER_TO_GROUP":
            return{
                ...state,
                rooms: state.rooms.map(room =>{
                    if(room.roomID === action.data){ //action-data = roomID
                        return{
                            ...room,
                            users: [...room.users, state.selectedUsername]
                        }
                    }
                    return room; //return object
                })
            };
        case "SET_SELECTED_USERNAME":
            return{
                ...state,
                selectedUsername:action.data
            }
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