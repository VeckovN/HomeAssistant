import {memo, useState, useEffect } from 'react';

const ChatMenu = ({houseworkers, roomRef, rooms, roomInfo, onAddUserToGroupHanlder, onDeleteRoomHandler}) =>{
    
    const [selectedUsername, setSelectedUsernam] = useState(''); //clicked username form list
    const [searchTerm, setSearchTerm] = useState(''); // entered houseworker username(not selected)

    console.log("roomREFFFFF: CHATMESSAGE ", roomRef.current);
    console.log("ROOM INFO Chat MENU", roomInfo);

    const SelectedHandler = (username) =>{
        setSelectedUsernam(username);
        console.log("ROOM_ID: " + roomInfo.roomID + " SELECTED_USERNAME: " + username)    
    }

    const ChangeSearchInputHandler = (e, roomID) =>{
        if(selectedUsername!='')
            setSelectedUsernam('')
        // roomRef.current = roomID; 
        setSearchTerm(e.target.value);
    }

    const AddUserToGroupHandler = (roomID, selectedUsername) =>{
        alert("AddUserToGroupHandler");
        setSelectedUsernam('');
        setSearchTerm('');
        onAddUserToGroupHanlder(roomID, selectedUsername)
    }
    
    // useEffect(()=>{
    //     //cats users array from room obj
    //     const room = rooms.find(el => el.roomID === roomRef.current.value)
    //     setRoomInfo(room);
    //     console.log("ROOMINFO EFFECT, " , roomInfo);
    // },[roomRef]); 
    
    return (
    <>
        <div className='search-container'> 
                <div className='dropdown-list'>
                    {
                    houseworkers.filter(item => {
                        const searchInput = searchTerm.toLowerCase();
                        const usernameMatch = item.username.toLowerCase();

                        const usernameStartsWithSerachInput = searchInput && usernameMatch.startsWith(searchInput);
                        const isNotInRoomUsers =!roomInfo.users.includes(item.username)

                        return usernameStartsWithSerachInput && isNotInRoomUsers && selectedUsername==''
                    })
                    .map((item) =>(
                        <div
                            key={item.id} 
                            onClick={() => SelectedHandler(item.username)}
                            className='dropdown-row'>{item.username}
                        </div>
                    ))
                    .slice(0,10)//render 10 items in list
                    }
                </div>

                <input  
                    placeholder='Enter houseworker username'
                    type='text'
                    onChange={(e)=> ChangeSearchInputHandler(e, roomInfo.roomID)}  
                    value={selectedUsername!='' ? selectedUsername : searchTerm}                  
                />
        </div>
        <button 
            className='add-user-to-group-btn'
            onClick={()=> AddUserToGroupHandler(roomInfo.roomID, selectedUsername)}
            disabled={!selectedUsername}
            >Add user
        </button>
        <button className='delete-room-btn' onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
    </>
    )
}
export default ChatMenu;