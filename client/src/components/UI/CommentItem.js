import '../../sass/components/_commnetItem.scss';

const CommentItem = (props) =>{
    //unread-comment when the read prop is true or when the read doesn't exist
    const unread = props.read === false ? 'unread-comment' : '';
    const newAdded = props.new ? 'new-comment' : '';
    return(
        <div className={`comment ${unread} ${newAdded}`}>
            {props.onDeleteCommentHandler && 
                <button className='comment-delete-btn' onClick={(e) => props.onDeleteCommentHandler(e, props.id, props.from)}>X</button>
            }
            <div className='info'>
                <div className='commented'>Commented:<span>{props.from}</span></div>
            </div>
            <div className='date'>
                <div className='date-label'>{props.date}</div>
            </div>
            <div className='context-container'>
                <div className='context'>{props.comment}</div>
            </div>
        </div>
    )
}

export default CommentItem;