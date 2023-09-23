
import './Room.css'
const Room = ({roomInfo, user, houseworkers, roomRef, onRoomClickHanlder, onChangeSelectHandler, onAddUserToGroupHanlder, onDeleteRoomHandler}) =>{
    return(
        <>
            <div className='users'>{roomInfo.users.map((user)=> (<div className='roomUsers'> -{user}- <span/></div>))}</div>
            <div className='room_buttons'>
                <button value={roomInfo.roomID} ref={roomRef} onClick={onRoomClickHanlder}>Show messages</button>
                {/* client can delete The chat room */}
                {user.type=="Client" &&
                    <>
                        <select onChange={onChangeSelectHandler}>
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
                        </select>
                        <button onClick={onAddUserToGroupHanlder} value={roomInfo.roomID}>Add user</button>
                        <button onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
                    </>
                }
            </div>
        </>
    )
}

export default Room;