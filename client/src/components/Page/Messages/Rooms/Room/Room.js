
import './Room.css'
const Room = ({roomInfo, user, houseworkers, selectedUsername, searchTerm, roomRef, onSearchHandler, onRoomClickHanlder, onChangeSearchInputHandler, onAddUserToGroupHanlder, onDeleteRoomHandler}) =>{
    
    console.log("SEARCHTERM: " + searchTerm);
    console.log("")
    
    return(
        <>
            <div className='users'>{roomInfo.users.map((user)=> (<div className='roomUsers'> -{user}- <span/></div>))}</div>
            <div className='room_buttons'>
                <button value={roomInfo.roomID} ref={roomRef} onClick={onRoomClickHanlder}>Show messages</button>
                {/* client can delete The chat room, add houseworker to group */}
                {user.type=="Client" &&
                    <>
                        {/* <select onChange={onChangeSelectHandler}>
                            {houseworkers && 
                                <>
                                    <option value="">Chose the user</option>
                                {
                                    houseworkers.map(el =>(
                                        <option value={el.username}>{el.username}</option>
                                    ))
                                }
                                </>
                            }
                        </select> */}
                        
                        <div> 
                            {roomInfo.roomID == roomRef.current ?
                            <>
                                <input  
                                        placeholder='Enter houseworker username'
                                        type='text'
                                        onChange={(e)=> onChangeSearchInputHandler(e, roomInfo.roomID)}                        
                                    />

                                <div className='dropdown-list'>
                                    {
                                    houseworkers.filter(item => {
                                        const searchInput = searchTerm.toLowerCase();
                                        const usernameMatch = item.username.toLowerCase();

                                        console.log("usernameMath:  " + usernameMatch + 'and searchInpt: ' + selectedUsername.toLowerCase())

                                        //this should unshowned list when is username selected
                                        return searchInput && usernameMatch.startsWith(searchInput)
                                    })
                                    .map((item) =>(
                                        <div
                                            key={item.id} 
                                            onClick={() => onSearchHandler(item.username)} 
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
                        <button onClick={onAddUserToGroupHanlder} value={roomInfo.roomID}>Add user</button>
                        <button onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
                    </>
                }
            </div>
        </>
    )
}

export default Room;