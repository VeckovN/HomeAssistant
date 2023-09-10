import './CommentItem.css'

const CommentItem = (props) =>{

    return(
        <div className='comment_container' key={props.id} >
            {props.onDeleteCommentHandler && 
                <button className='btn_comment_delete' onClick={(e) => props.onDeleteCommentHandler(e, props.id, props.from)}>X</button>
            }
            <div className='info'>
                <div className='commented'>Commented: {props.from}</div>
            </div>
            <div className='context'>{props.comment}</div>
        </div>
    )
}

export default CommentItem;