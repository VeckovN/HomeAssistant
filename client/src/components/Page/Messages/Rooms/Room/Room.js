import {useState} from 'react';

import '../../../../../sass/components/_room.scss';

const Room = ({roomInfo, user, houseworkers, roomRef, onRoomClickHanlder, onAddUserToGroupHanlder, onDeleteRoomHandler}) =>{

    console.log("searchTerm : " )

    //Every room has our own selectedUsername - we cann add user to group in multiple room
    const [selectedUsername, setSelectedUsernam] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); 

    const onSelectedHandler = (username) =>{
        setSelectedUsernam(username);
        console.log("ROOM_ID: " + roomInfo.roomID + " SELECTED_USERNAME: " + username)    
    }

    const ChangeSearchInputHandler = (e, roomID) =>{
        if(selectedUsername!='')
            setSelectedUsernam('')
        roomRef.current = roomID; 
        setSearchTerm(e.target.value);
    }

    const AddUserToGroupHandler = (roomID, selectedUsername) =>{
        setSelectedUsernam('');
        setSearchTerm('');
        onAddUserToGroupHanlder(roomID, selectedUsername)
    }


    return(
        <>
            <div className='users'>{roomInfo.users.map((user)=>  (<div className='roomUsers'> -{user}:{}- <span/></div>))}</div>
            <div className='room-buttons'>
                <button className='show-room-btn' value={roomInfo.roomID} ref={roomRef} onClick={onRoomClickHanlder}>Show messages</button>
                {/* client can delete The chat room, add houseworker to group */}
                {user.type=="Client" &&
                    <>                        
                        <div className='search-container'> 
                                {roomInfo.roomID == roomRef.current ?
                                <>
                                    <input  
                                        placeholder='Enter houseworker username'
                                        type='text' 
                                        onChange={(e)=> ChangeSearchInputHandler(e, roomInfo.roomID)}
                                        value={selectedUsername!='' ? selectedUsername : searchTerm} 
                                    />

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
                                                onClick={() => onSelectedHandler(item.username)}
                                                className='dropdown-row'>{item.username}
                                            </div>
                                        ))
                                        .slice(0,10)//render 10 items in list
                                        }
                                    </div>
                                </>
                                :
                                    <input  
                                        placeholder='Enter houseworker username'
                                        type='text'
                                        onChange={(e)=> ChangeSearchInputHandler(e, roomInfo.roomID)}  
                                        value={searchTerm}                    
                                    />
                                }
                        </div>
                        <button 
                            onClass='add-user-to-group-btn'
                            onClick={()=> AddUserToGroupHandler(roomInfo.roomID, selectedUsername)}
                            disabled={!selectedUsername}
                            >Add user
                        </button>
                        <button onClass='delete-room-btn' onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
                    </>
                }
            </div>
        </>
    )
}

export default Room;