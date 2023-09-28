import {useState} from 'react';
import './Room.css'
const Room = ({roomInfo, user, houseworkers, selectedUsername, searchTerm, roomRef, onSearchHandler, onRoomClickHanlder, onChangeSearchInputHandler, onAddUserToGroupHanlder, onDeleteRoomHandler}) =>{
    
    //Every room has our own selectedUsername - we cann add user to group in multiple room
    const [selectedUsername2, setSelectedUsernam2] = useState('');
    const selectedHandler = (username) =>{
        setSelectedUsernam2(username);
        console.log("ROOM_ID: " + roomInfo.roomID + " SELECTED_USERNAME: " + username)    
    }

    // const onSelectInputHandler = (username) =>{
    //     selectedHandler
    // }
    
    return(
        <>
            <div className='users'>{roomInfo.users.map((user)=> (<div className='roomUsers'> -{user}- <span/></div>))}</div>
            <div className='room_buttons'>
                <button value={roomInfo.roomID} ref={roomRef} onClick={onRoomClickHanlder}>Show messages</button>
                {/* client can delete The chat room, add houseworker to group */}
                {user.type=="Client" &&
                    <>                        
                        <div> 
                            {roomInfo.roomID == roomRef.current ?
                            <>
                                <input  
                                    // placeholder={selectedUsername2 ? selectedUsername2 : 'Enter username'}
                                    placeholder={selectedUsername2}
                                    type='text'
                                    onChange={(e)=> onChangeSearchInputHandler(e, roomInfo.roomID)}    
                                />

                                <div className='dropdown-list'>
                                    {
                                    houseworkers.filter(item => {
                                        const searchInput = searchTerm.toLowerCase();
                                        const usernameMatch = item.username.toLowerCase();

                                        const usernameStartsWithSerachInput = searchInput && usernameMatch.startsWith(searchInput);
                                        const isNotInRoomUsers =!roomInfo.users.includes(item.username)

                                        //return searchInput && usernameMatch.startsWith(searchInput) && isNotInRoomUsers
                                        return usernameStartsWithSerachInput && isNotInRoomUsers
                                    })
                                    .map((item) =>(
                                        <div
                                            key={item.id} 
                                            // onClick={() => onSearchHandler(item.username)} 
                                            onClick={() => selectedHandler(item.username)}
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
                                    onChange={(e)=> onChangeSearchInputHandler(e, roomInfo.roomID)}                        
                                 />
                            }
                        </div>
                        <button 
                            onClick={()=> onAddUserToGroupHanlder(roomInfo.roomID, selectedUsername2)} 
                            disabled={!selectedUsername2}
                            >Add user
                        </button>
                        <button onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
                    </>
                }
            </div>
        </>
    )
}

export default Room;