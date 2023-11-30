
const Photo = ({url, user}) => {

    return (
        <div className="photo" style={{backgroundImage: url}}>
            <div className="online"></div>
            <div className='user-label'>{user}</div>
        </div>
    )
}

export default Photo;