import {useState} from 'react';

const PhotoWithHover = ({url, user}) => {

    const [isHovering , setIsHovering] = useState(false);

    const handlerMouseOver = ()=>{
        setIsHovering(true);
    }
    const handleMouseOut = () =>{
        setIsHovering(false);
    }

    return (
        <div className="photo" onMouseOver={handlerMouseOver} onMouseOut={handleMouseOut} style={{backgroundImage: url}}>
            <div className="online"></div>
            {isHovering && <div className='user-label'>{user}</div>}
            {/* <div className="online"></div> */}
        </div>
    )
}

export default PhotoWithHover;