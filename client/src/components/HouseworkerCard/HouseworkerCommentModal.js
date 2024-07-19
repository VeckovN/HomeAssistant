import { useEffect, useRef } from "react";
import Modal from "../../components/UI/Modal.js";
import CommentItem from "../../components/UI/CommentItem";
import '../../sass/components/_houseworkerCommentModal.scss';

const HouseworkerCommentModal = ({comments, clientUsername, onCommentSubmit, postCommentRef, allCommentsLoadedRef, onCloseComment, onCommentDelete, onLoadMoreComments}) =>{
    const observerTarget = useRef(null);

    const options = {
        threshold: 0.3,
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
              if (entries[0] && entries[0].isIntersecting && !allCommentsLoadedRef.current) {
                  onLoadMoreComments();
            }
          }, options)

        if (observerTarget.current) {
          observer.observe(observerTarget.current)
        }
    
        return () => {
          if (observerTarget.current) {
            observer.unobserve(observerTarget.current)
          }
        }
      }, [observerTarget.current, comments]);

    const commentHeaderContext =
        'Comments';

    const commentBodyContext = 
        <>
            <div className='comment-container'>
            {comments.length > 0 ?
                <>
                {comments.map(comm => {
                    const isClientComment = clientUsername === comm.from;
                    return(
                        <CommentItem
                            onDeleteCommentHandler={isClientComment ? onCommentDelete : undefined}
                            id={comm.commentID}
                            date={comm.date}
                            from={comm.from}
                            comment={comm.comment}
                            new={comm.new}
                        />
                    )}
                )}
                </>
                : <div className='no-comments-modal'>Client doesn't have comments</div>
                }
                <div className='comment-targetOb' ref={observerTarget}>Target</div>
            </div>
            <div className='comment-input'>
                <input type='text' name="postComment"  ref={postCommentRef} placeholder='Post comment'/>
                <button type="submit" onClick={onCommentSubmit}>Send</button>
            </div>
        </>

    return(
        <>

        <Modal
            HeaderContext = {commentHeaderContext}
            BodyContext = {commentBodyContext}
            FooterContext = {null}
            onCloseModal={onCloseComment}
        />
        
        </>
    )
}

export default HouseworkerCommentModal;