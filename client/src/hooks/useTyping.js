import {useState, useEffect, useRef, useCallback} from 'react';

const useTyping = (startTypingMessageSendEmit, stopTypingMessageEmit) =>{
    const [isTyping, setIsTyping] = useState(false);
    const [isKeyPressed, setIsKeyPressed] = useState(false);
    const cooldownRef = useRef(0);
    
    useEffect(() =>{
        let interval;
        if(isTyping){
            interval = setInterval(() =>{
                if(cooldownRef.current == 0){
                    clearInterval(interval);
                    setIsTyping(false);
                    setIsKeyPressed(false);
                    stopTypingMessageEmit();
                }
                const newValue = cooldownRef.current - 1;
                cooldownRef.current = newValue;
            },600)

        }
        else if(!isTyping && cooldownRef.current!= 0){
            //triggered on sendMessage
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isTyping, stopTypingMessageEmit])

    const startTypingHandler = useCallback(() =>{
        //inovoked on every key press
        if(!isKeyPressed && !isTyping){
            setIsKeyPressed(true);
            cooldownRef.current = 5;
            setIsTyping(true);
            startTypingMessageSendEmit();
        }
    },[isKeyPressed, isTyping, startTypingMessageSendEmit])

    const stopTyping = useCallback(() =>{
        setIsTyping(false);
        setIsKeyPressed(false);
        cooldownRef.current = 0;
        stopTypingMessageEmit();
    },[stopTypingMessageEmit])


    return {isTyping, isKeyPressed, cooldownRef, startTypingHandler, stopTyping}
}


export default useTyping;