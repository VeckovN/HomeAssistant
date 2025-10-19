const Photo = ({username, picturePath, online}) => {
    return (
        <div className="photo" style={{ backgroundImage: `url(${picturePath})` }}>
            {online && <div className="online"></div>}
            <div className='user-label'>{username}</div>
        </div>
    )
}

export default Photo;