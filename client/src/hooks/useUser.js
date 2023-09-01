import {useState, useEffect} from 'react'

//This handlers are repated in differt components
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

    const onImageChange = (event)=>{
        const file = event.target.files[0];
        setData(prev =>(
            {
                ...prev,
                ["picture"]:file
            }
        ))
        console.log(file.name);
    }


    const onChangeCity = (e) =>{
        let city = e.value;
        setData(prev=>(
            {
                ...prev,
                ["city"]:city
            }
        ))
    }

    //update profession on houseowrker 
    const onChangeHouseworkerProfession = (e) =>{
        //x button is clicked
        if(e !== null){
            setData(prev =>(
                {
                    ...prev,
                    ["profession"]:e.value
                }
            ))
        }
        else{
            setData(prev =>(
                {
                    ...prev,
                    ["profession"]:" "
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
                ["professions"]:professionsArray
            }
        ))
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
                [name]:value // example first_name:"Novak"
            }
        ))
    }

    const onChangeInterest = (e) =>{
        let professionsArray;
        professionsArray = Array.isArray(e) ? e.map(p => p.value): [];        
        setData(prev =>(
            {
                ...prev,
                ["interests"]:professionsArray
            }
        ))
    }


    return {data, onChange, onChangeHouseworker, onImageChange, onChangeHouseworkerProfession, onChangeCity, onChangeProffesions, onChangeInterest}

}

export default useUser