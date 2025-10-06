import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentRoomID: null,
    users: []
}

const currentRoomSlice = createSlice({
    name: 'currentRoom',
    initialState,
    reducers: {
        setCurrentRoom: (state, action) => {
            state.currentRoomID = action.payload.currentRoomID;
            state.users = action.payload.users || [];
        },
        clearCurrentRoom: (state) => {
            state.currentRoomID = null;
            state.users = [];
        }
    }
});

export const { setCurrentRoom, clearCurrentRoom } = currentRoomSlice.actions;
export default currentRoomSlice;