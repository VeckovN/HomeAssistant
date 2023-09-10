import { Fragment } from 'react';
import ReactDom from 'react-dom';

import './Modal.css'

//onCloseBV(click in background to close Modal)
//const ModalViewOverlay = props =>{
const ModalViewOverlay = ({HeaderContext, onCloseMV, BodyContext, FooterContext}) =>{
    return <div className='modal'>
        <div className='modal-container'>
            <div className='modal-header'>
                <div>{HeaderContext}</div>
                <button className='close_sign' onClick={onCloseMV}>X</button>
            </div>

            <div className='modal-body'>    
                {/* {props.children} */}
                {BodyContext}
            </div>

            {FooterContext && 
            <div className='modal-footer'>
                {FooterContext}
            </div>}
        </div>
    </div>
}

//this blackView will be showed across the 100% of widht and height 
// const BackView = props =>{
const BackView = ({onCloseBv}) =>{
    return <div className='backView' onClick={onCloseBv}></div>
}

//element from index(location where the modal will be displayed)
const portalElement = document.getElementById('modal-portal');



//OnCloseModal is functon from Component which use This Modal
//const Modal = props=>{
const Modal = ({onCloseModal, HeaderContext, BodyContext, FooterContext})=>{
    return (
        <>
            {ReactDom.createPortal(<BackView onCloseBv={onCloseModal}/>, portalElement)}

            {ReactDom.createPortal(
                <ModalViewOverlay
                    onCloseMV={onCloseModal}
                    HeaderContext={HeaderContext}
                    BodyContext={BodyContext}
                    FooterContext={FooterContext}
                />, 
                portalElement)}
        </>
    )
}

export default Modal