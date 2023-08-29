import './CommentItem.css'

const CommentItem = (props) =>{

    return(
        <div className='comment_container' key={props.id} >
            <div className='info'>
                <div className='commented'>Commented: {props.from}</div>
                {/* <div className=''>Date: {props.date}</div> */}
            </div>
            <div className='context'>{props.comment}</div>
        </div>
    )
}

export default CommentItem;