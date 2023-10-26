import Modal from "../../../../UI/Modal";
import CommentItem from "../../../../UI/CommentItem";

import '../../../../../sass/components/_houseworkerCommentModal.scss';

const HouseworkerCommentModal = ({comments, clientUsername, onCommentSubmit, postCommentRef, onCloseComment, onCommentDelete}) =>{

    const commentHeaderContext =
        'Comments';

    //Comment Modal context(use CommentItem)
    const commentBodyContext = 
        <div>
            <div className='comment-container'>
            {comments ?
                comments.map(comm => (
                    (clientUsername === comm.from) ? ( //delete button is only showned to clients that belongs comment
                        <CommentItem
                            onDeleteCommentHandler={onCommentDelete}
                            id={comm.commentID}
                            from={comm.from}
                            comment={comm.comment}
                        />
                    ) : (             
                        <CommentItem
                            id={comm.commentID}
                            from={comm.from}
                            comment={comm.comment}
                        />
                    )
                )
                )
                : <div className='no_commentsModal'>Client doesn't have comments</div>
                }
            </div>
            <div className='comment_input'>
                <input type='text' name="postComment"  ref={postCommentRef} placeholder='Post comment'/>
                <button type="submit" onClick={onCommentSubmit}>Send</button>
            </div>
        </div>

    //Comments
    const commentFooterContext = 
        <></>
    
    return(
        <Modal
            HeaderContext = {commentHeaderContext}
            BodyContext = {commentBodyContext}
            FooterContext = {null}
            onCloseModal={onCloseComment}
        />
    )
}

export default HouseworkerCommentModal;