import '../../sass/components/_commnetItem.scss';

const CommentItem = (props) =>{

    return(
        <div className={`comment ${props.new ? 'new-comment' : ''}`} key={props.id} >
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