import {useState, useEffect, useRef} from 'react';

const useTyping = (startTypingMessageSendEmit, stopTypingMessageEmit) =>{
    
    const [isTyping, setIsTyping] = useState(false);
    const [isKeyPressed, setIsKeyPressed] = useState(false);
    const cooldownRef = useRef(0);
    
    useEffect(() =>{
        let interval;
        if(isTyping){
            interval = setInterval(() =>{
                console.log("CURRENT COLLDOWN: " + cooldownRef.current);
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
            // stopTypingMessageEmit();
        }

        return () => clearInterval(interval);
    }, [isTyping, stopTypingMessageEmit])

    const startTypingHandler = () =>{
        //inovoked on every key press
        if(!isKeyPressed && !isTyping){
            console.log("IS PRESSED NOW");
            setIsKeyPressed(true);
            cooldownRef.current = 5;
            setIsTyping(true);
            startTypingMessageSendEmit();
        }
    }

    const stopTypingOnSendMessage = () =>{
        setIsTyping(false);
        setIsKeyPressed(false);
        cooldownRef.current = 0;
    }

    return {isTyping, isKeyPressed, cooldownRef, startTypingHandler, stopTypingOnSendMessage}
}


export default useTyping;