import ReactDom from 'react-dom';
import {useEffect, useState} from 'react';

import '../../sass/components/_modal.scss';

const ModalViewOverlay = ({HeaderContext, fadeOut, onCloseMV, BodyContext, FooterContext}) =>{
    return <div className={`modal ${fadeOut ? 'modal-out' : ''}`}>
        <div className='modal-container'>
            <div className='modal-container-header'>
                <div className='context'>{HeaderContext}</div>
                <button className='close_sign' onClick={onCloseMV}>X</button>
            </div>

            <div className='modal-container-body'>    
                {/* {props.children} */}
                {BodyContext}
            </div>

            {FooterContext && 
            <div className='modal-container-footer'>
                {FooterContext}
            </div>}
        </div>
    </div>
}

//this blackView will be showed across the 100% of widht and height 
const BackView = ({onCloseBv, fadeOut}) =>{
    return <div className={`backView ${fadeOut ? 'backView-out' : ''}`} onClick={onCloseBv}></div>
}

//element from index(location where the modal will be displayed)
const portalElement = document.getElementById('modal-portal');

//OnCloseModal is functon from Component which use This Modal
const Modal = ({onCloseModal, HeaderContext, BodyContext, FooterContext})=>{
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
    
        return () => {
          document.body.style.overflow = 'visible';
        };
      }, []);

    const onCloseModalHanlder =() => {
        setFadeOut(true);
        setTimeout(() =>{
            onCloseModal();
        },500);
    }

    return (
        <>
            {/* {ReactDom.createPortal(<BackView onCloseBv={onCloseModal}/>, portalElement)} */}
            {ReactDom.createPortal(<BackView fadeOut={fadeOut} onCloseBv={onCloseModalHanlder}/>, portalElement)}

            {ReactDom.createPortal(
                <ModalViewOverlay
                    fadeOut={fadeOut}
                    onCloseMV={onCloseModalHanlder}
                    HeaderContext={HeaderContext}
                    BodyContext={BodyContext}
                    FooterContext={FooterContext}
                />, 
                portalElement)}
        </>
    )
}

export default Modal