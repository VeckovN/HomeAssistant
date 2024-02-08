import {useRef, useEffect} from 'react';
import Modal from "../../components/UI/Modal.js";
import CommentItem from "../../components/UI/CommentItem";
import '../../sass/components/_houseworkerCommentModal.scss';

const HouseworkerCommentModal = ({comments, clientUsername, onCommentSubmit, postCommentRef, onCloseComment, onCommentDelete}) =>{

    const endMessageRef = useRef(null);
    
    const scrollToBottom = () =>{
        endMessageRef.current?.scrollIntoView({ behavior: "instant" });
    }

    useEffect(() =>{
        scrollToBottom();
        console.log("Comments:" , comments);
    },[comments]);

    const commentHeaderContext =
        'Comments';

    //Comment Modal context(use CommentItem)
    const commentBodyContext = 
        <>
            <div className='comment-container'>
            {comments ?
                <>
                {comments.map(comm => (
                    (clientUsername === comm.from) ? ( //delete button is only showned to clients that belongs comment
                        <CommentItem
                            onDeleteCommentHandler={onCommentDelete}
                            id={comm.commentID}
                            date={comm.date}
                            from={comm.from}
                            comment={comm.comment}
                            new={comm.new}
                        />
                        ) : (             
                            <CommentItem
                                id={comm.commentID}
                                date={comm.commentDate}
                                from={comm.from}
                                comment={comm.comment}
                                new={comm.new}
                            />
                        )
                    )
                )}
                <div ref={endMessageRef}></div>
                </>
                : <div className='no-comments-modal'>Client doesn't have comments</div>
                }
            </div>
            <div className='comment-input'>
                <input type='text' name="postComment"  ref={postCommentRef} placeholder='Post comment'/>
                <button type="submit" onClick={onCommentSubmit}>Send</button>
            </div>
        </>

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