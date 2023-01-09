import { Fragment } from 'react';
import ReactDom from 'react-dom';

//onCloseBV(click in background to close Modal)
const ModalViewOverlay = props =>{
    return <div className='modal'>
        <div className='modal-container'>
            <div className='modal-header'>
                <div>{props.HeaderContext}</div>
                <button className='close_sign' onClick={props.onCloseMV}>X</button>
            </div>

            <div className='modal-body'>    
                {/* {props.children} */}
                {props.BodyContext}
            </div>

            <div className='modal-footer'>
                {props.FooterContext}
            </div>

        </div>
    </div>
}

//this blackView will be showed across the 100% of widht and height 
const BackView = props =>{
    return <div className='backView' onClick={props.onCloseBV}></div>
}

//element from index(location where the modal will be displayed)
const portalElement = document.getElementById('modal-portal');



//OnCloseModal is functon from Component which use This Modal
const Modal = props=>{
    return (
        <>
            {ReactDom.createPortal(<BackView onCloseBv={props.onCloseModal}/>, portalElement)}

            {ReactDom.createPortal(<ModalViewOverlay
                onCloseMV={props.onCloseModal}
                HeaderContext={props.HeaderContext}
                BodyContext={props.BodyContext}
                FooterContext={props.FooterContext}
            />, portalElement)}
        </>
    )
}

export default Modal