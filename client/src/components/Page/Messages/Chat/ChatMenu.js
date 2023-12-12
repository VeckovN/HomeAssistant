import {memo, useState, useEffect } from 'react';

import '../../../../sass/components/_chatMenu.scss';

const ChatMenu = ({houseworkers, rooms, roomInfo, onAddUserToGroupHanlder, onDeleteRoomHandler}) =>{
    
    const [selectedUsername, setSelectedUsernam] = useState(''); //clicked username form list
    const [searchTerm, setSearchTerm] = useState(''); // entered houseworker username(not selected)

    const SelectedHandler = (username) =>{
        setSelectedUsernam(username);
        console.log("houseworeks", houseworkers);
        console.log("ROOM INFO: ", roomInfo);
        console.log("ROOM_ID: " + roomInfo.roomID + " SELECTED_USERNAME: " + username)    
    }

    const ChangeSearchInputHandler = (e, roomID) =>{
        if(selectedUsername!='')
            setSelectedUsernam('')
        setSearchTerm(e.target.value);
    }

    const AddUserToGroupHandler = (roomID, selectedUsername) =>{
        setSelectedUsernam('');
        setSearchTerm('');
        onAddUserToGroupHanlder(roomID, selectedUsername);
    }
    
    // useEffect(()=>{
    //     //cats users array from room obj
    //     const room = rooms.find(el => el.roomID === roomRef.current.value)
    //     setRoomInfo(room);
    //     console.log("ROOMINFO EFFECT, " , roomInfo);
    // },[roomRef]); 
    
    return (
    <div className='chat-menu-container'>
        <div className='menu-option'> 
            <div className='add-user-container'> 
                <p className="menu-option-title">Add User </p>
                <div className="searchbar">
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <input  
                        className='menu-search-input'
                        placeholder='Enter houseworker username'
                        type='text'
                        onChange={(e)=> ChangeSearchInputHandler(e, roomInfo.roomID)}  
                        value={selectedUsername!='' ? selectedUsername : searchTerm}                  
                    />
                </div>
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
                        <div className='dropdown-row'>
                            <div
                                key={item.id} 
                                onClick={() => SelectedHandler(item.username)}
                                className='dropdown-row-item'>{item.username}
                            </div>
                        </div>
                    ))
                    .slice(0,10)//render 10 items in list
                    }
                </div>
                <div className='user-button'>
                    <button 
                        className='add-user-to-group-btn'
                        onClick={()=> AddUserToGroupHandler(roomInfo.roomID, selectedUsername)}
                        disabled={!selectedUsername}
                        >Add user
                    </button>
                </div>
            </div>
        </div>

        {roomInfo.users.length > 1 &&
            <div className='menu-option'> 
                <div className='kick-user-container'>
                    <p className='menu-option-title'>Kick User </p>
                    <div className="searchbar">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input  
                            className='menu-search-input'
                            placeholder='Enter houseworker username'
                            type='text'
                            // onChange={}  
                            // value={}                  
                        />
                    </div>
                    <div className='dropdown-list'>
                        {
                            <div>
                            </div>
                        // houseworkers.filter(item => {
                        //     const searchInput = searchTerm.toLowerCase();
                        //     const usernameMatch = item.username.toLowerCase();

                        //     const usernameStartsWithSerachInput = searchInput && usernameMatch.startsWith(searchInput);
                        //     const isNotInRoomUsers =!roomInfo.users.includes(item.username)

                        //     return usernameStartsWithSerachInput && isNotInRoomUsers && selectedUsername==''
                        // })
                        // .map((item) =>(
                        //     <div
                        //         key={item.id} 
                        //         onClick={() => SelectedHandler(item.username)}
                        //         className='dropdown-row'>{item.username}
                        //     </div>
                        // ))
                        // .slice(0,5)//render 5 items in list
                        }
                    </div>
                    <div className='user-button'>
                        <button 
                            className='kick-user-from-group-btn'
                            onClick={()=> AddUserToGroupHandler(roomInfo.roomID, selectedUsername)}
                            disabled={true}
                            >Kick user
                        </button>
                </div>
            </div>
        </div>
        }
        <div className='menu-option'>
            <div className='delete-container'>
                <p className='menu-option-title'>Delete Chat </p>
                <button className='delete-room-btn' onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
            </div>
        </div>
        {/* <div className='delete-container'>
            <button className='delete-room-btn' onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
        </div> */}
    </div>
    )
}
export default ChatMenu;