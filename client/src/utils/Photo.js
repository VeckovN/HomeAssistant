
// const Photo = ({url, user}) => {
const Photo = ({username, picturePath}) => {

    return (
        // Check does picturePatch exist , if doesn't then set default picture
        <div className="photo" style={{ backgroundImage: `url(assets/userImages/${user?.picturePath})` }}>
            <div className="online"></div>
            <div className='user-label'>{user.username}</div>
        </div>
    )
}

export default Photo;