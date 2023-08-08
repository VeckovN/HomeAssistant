import Modal from "../../../../UI/Modal";
import CommentItem from "../../../../UI/CommentItem";

const HouseworkerCommentModal = ({comments, onCommentSubmit, postCommentRef, onCloseComment}) =>{

    const commentHeaderContext =
        'Comments';

    //Comment Modal context(use CommentItem)
    const commentBodyContext = 
        <form onSubmit={onCommentSubmit}>
            {comments ?
                comments.map(comm => (
                    <CommentItem
                        from={comm.from}
                        comment={comm.comment}
                    />
                ))
                : <div className='no_commentsModal'>Client doesn't have comments</div>
            }
            <div className='comment_input'>
                <input type='text' name="postComment" ref={postCommentRef} placeholder='Post comment'/>
                <button type="submit">Send</button>
            </div>
        </form>

    //Comments
    const commentFooterContext = 
        <div>Footer</div>
    
    return(
        <Modal
            HeaderContext = {commentHeaderContext}
            BodyContext = {commentBodyContext}
            FooterContext = {commentFooterContext}
            onCloseModal={onCloseComment}
        />
    )
}

export default HouseworkerCommentModal;