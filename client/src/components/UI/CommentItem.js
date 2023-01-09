

const CommentItem = (props) =>{

    return(
        <div className='comment_container'>
            <div className='commented'>Commented:{props.from}</div>
            <div className='context'>{props.comment}</div>
            {/* <div className=''>Date: {props.date}</div> */}
            <br/>
        </div>
    )
}

export default CommentItem;