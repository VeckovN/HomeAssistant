
const Rooms = ({rooms, roomRef, user, houseworkers, onAddUserToGroupHanlder, onDeleteRoomHandler, onRoomClickHanlder, onChangeSelectHandler }) =>{

    return (
        <div className='room_conainter'>
                {rooms &&
                    rooms.map((el, index)=>(
                    <div className='rooms'><span className='roomLabel'>Soba {index +1}</span>
                        <div className='users'>{el.users.map((user,index)=> (<div className='roomUsers'> -{user}- <span/></div>))}</div>
                        <div className='room_buttons'>
                            <button value={el.roomID} ref={roomRef} onClick={onRoomClickHanlder}>Prikazi poruke </button>
                            {/* client can delete The chat room */}
                            {user.type=="Client" &&
                                <>
                                    <select onChange={onChangeSelectHandler}>
                                        {houseworkers && 
                                            <>
                                                <option value="">Izaberi korisnika</option>
                                            {
                                                houseworkers.map(el =>(
                                                    <option value={el.username}>{el.first_name}</option>
                                                ))
                                            }
                                            </>
                                        }
                                    </select>
                                    <button onClick={onAddUserToGroupHanlder} value={el.roomID}>Dodaj korisnika</button>
                                    <button onClick={onDeleteRoomHandler} value={el.roomID}>Izbrisi sobu</button>
                                </>
                            }
                        </div>
                    </div>
                    ))
                }
                    
                {rooms.length==0 && <div className='no_rooms'>Nemate poruke</div>}
                
            </div>
    )
}

export default Rooms;
