import {useState} from 'react'

//These handlers are repated in different components
const useUser =(initialState)=>{
    const [data, setData] = useState(initialState);
    
    const onChange = (event) =>{
        const name = event.target.name;
        const value = event.target.value;
        setData(prev=> (
            {
                ...prev,
                [name]:value
            }
        ))
    }

    const onChangeWorkingHour = (event) =>{
        setData(prev =>(
        {
            ...prev,
            working_hour:event.target.value
        }
        ))
    }

    const onImageChange = (event)=>{
        const file = event.target.files[0];
        setData(prev =>(
            {
                ...prev,
                picture:file
            }
        ))
    }

    const onChangeCity = (e) =>{
        if(e !== null){
            let city = e.value;
            setData(prev =>(
                {
                    ...prev,
                    city:city,
                }
            ))
        }
        else{
            setData(prev=>(
                {
                    ...prev,
                    city:""
                }
            ))
        }
    }

    //update profession on houseowrker 
    const onChangeProfession = (e) =>{
        //x button is clicked
        if(e !== null){
            setData(prev =>(
                {
                    ...prev,
                    profession:e.value,
                }
            ))
        }
        else{
            setData(prev =>(
                {
                    ...prev,
                    profession:" ",
                }
            ))
        }
    }

    //Only for Client users
    const onChangeProffesions = (e) =>{  
        let professionsArray;
        professionsArray = Array.isArray(e) ? e.map(p => p.value): [];
        setData(prev =>(
            {
                ...prev,
                professions:professionsArray
            }
        ))
    }

    const onChangeHouseworkerProfessions = (e) =>{
        const { name, value } = e.target;
    
        setData((prev) =>{
            const updatedArray = [...prev.houseworker_professions]
            const existingObjectIndex = updatedArray.findIndex( item => item.label === name)

            if(value === "")
            {
                if(existingObjectIndex !== -1){
                    //remove object wiht index existingObjectIndex , for 1 element
                    updatedArray.splice(existingObjectIndex, 1); 
                }
            }
            else{
                if(existingObjectIndex !== -1)
                    updatedArray[existingObjectIndex].working_hour = value;
                else //there is new object(with new label)
                    updatedArray.push({label:name, working_hour:value});
            }

            return{
                ...prev,
                houseworker_professions: updatedArray
            }
        })


    }

    const resetProfessions = (event) =>{
        setData(prev => ( 
            {
                ...prev, 
                professions:[],
                houseworker_professions:[] 
            }
        ))
    }

    const resetWorkingHour = () =>{
        setData(prev =>({
            ...prev,
            working_hour:''
        }))
    }

    //Only for Houseworker users
    const onChangeHouseworker = (event) =>{
        const name = event.target.name;
        let value;
        if(name=="age")
            value = parseInt(event.target.value);
        
        value = event.target.value;
        setData(prev=> (
            {
                ...prev,
                [name]:value
            }
        ))
    }

    const onChangeInterest = (e) =>{
        let professionsArray;
        professionsArray = Array.isArray(e) ? e.map(p => p.value): [];        
        setData(prev =>(
            {
                ...prev,
                interests:professionsArray
            }
        ))
    }
    
    return {data, onChange, onChangeWorkingHour,onChangeHouseworker, onChangeHouseworkerProfessions, onImageChange, onChangeProfession, onChangeCity, onChangeProffesions, onChangeInterest, resetProfessions, resetWorkingHour}
}

export default useUser