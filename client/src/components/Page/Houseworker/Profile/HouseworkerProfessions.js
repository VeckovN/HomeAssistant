import {profession_options} from '../../../../utils/options';
import Select from 'react-select';
import {toast} from 'react-toastify';
import {addProfession, deleteProfession, updateProfessionWorkingHour} from '../../../../services/houseworker.js';
import useUser from '../../../../hooks/useUser';

const HouseworkerProfessions = ({houseworkerData, setHouseworkerData, getNotOwnedProfessions}) =>{
    console.log("HOUSEOWRKER PROFESSIONs");

    const initialProfessionsState = {
        profession:'', //selected profession from select
        working_hour:'',
        professions:[], //fetched houseowrker professions
        not_owned_professions:[],
        houseworker_professions:[] //adding new profession
    }

    const {data:updatedData, onChangeWorkingHour, resetProfessions, onChangeProfession, onChangeHouseworkerProfessions, onChangeProffesions} = useUser(initialProfessionsState)

    const format_houseworker_label = (value, working_hour) =>{
        return {value:value, label: `${value} ${working_hour}€`}
    }

    const onChangeProfessionHandler = async(e) =>{
        //without that this button function will re-triger form onSubmit
        e.preventDefault();
        try{
            if(updatedData.profession){
                if(updatedData.working_hour){
                    const result = await updateProfessionWorkingHour(updatedData.profession, updatedData.working_hour)
                    const newProfessionOptions = houseworkerData.professions.map(el =>{
                        if(el.value === updatedData.profession)
                            el.label = updatedData.profession + " " + updatedData.working_hour + "€"
                        return el;
                    })
                    setHouseworkerData(prev =>({
                        ...prev,
                        ['professions']:newProfessionOptions
                    }))
                    toast.success("Successfully profession updated")
                }
                else
                    toast.error("Enter working hour ")
                
                return;
            }
        }
        catch(err){
            console.log("Error: " + err);
            toast.error("ERROR: You can't change the profession")
        }
    }

    const onAddProfessionHandler = async(e) =>{
        e.preventDefault();
        try{
            if(updatedData.houseworker_professions.length > 1){
                console.log("OLD : " + JSON.stringify(houseworkerData.professions) + "\n");
                let new_houseworker_professions = [];

                //We need array of promise because we have loop there fucntion should call as async
                const addProfessionPromises = updatedData.houseworker_professions.map(async (profession) => {
                    await addProfession(profession.label, profession.working_hour);
                    const new_profession = format_houseworker_label(profession.label, profession.working_hour);
                    new_houseworker_professions.push(new_profession);
                })
                //Wait for all promises to resolve using Promise.all
                await Promise.all(addProfessionPromises);

                // for Choosing current user profeesions
                const merged_houseworkers = [...houseworkerData.professions, ...new_houseworker_professions];

                const remained_professions = profession_options.filter((option) =>{
                    //return only not same object
                    return !merged_houseworkers.some((mine) => mine.value === option.value)
                })
                
                setHouseworkerData(prev => (
                    {
                        ...prev,
                        professions:merged_houseworkers,
                        not_owned_professions:remained_professions,
                        profession:'' //reset select view
                    }
                ))

                toast.success("Successfully professions added");
            }
            else{
                const label = updatedData.houseworker_professions[0].label;
                const working_hour = updatedData.houseworker_professions[0].working_hour;
                await addProfession(label, working_hour);

                const new_houseworker_professions = [... houseworkerData.professions] 
                const new_profession = format_houseworker_label(label, working_hour);
                new_houseworker_professions.push(new_profession);

                const remained_professions = houseworkerData.not_owned_professions.filter(el => el.value != label) 
                setHouseworkerData(prev => (
                    {
                        ...prev,
                        professions:new_houseworker_professions,
                        not_owned_professions:remained_professions,
                        profession:'', //reset select view
                    }
                ))
                toast.success("Profession successfully added");
            }     
            resetProfessions();
        }
        catch(err){
            console.log("Error: " + err);
            toast.error("ERROR: You can't add the profession")
        }
    }

    const onDeleteProfessionHandler = async(e, profession) =>{
        e.preventDefault();
        try{
            const result = await deleteProfession(profession);
            const houseworker_professions = result.data;
            //returned list of remaining professions
            const {professions:not_owned_professions, profession_format } = getNotOwnedProfessions(houseworker_professions);

            setHouseworkerData(prev =>({
                ...prev,
                professions:profession_format,
                profession:" ", //resent select 
                not_owned_professions:not_owned_professions //change Add Profession optiosn(add deleted profession)
            }))

            onChangeProfession(null);         
            toast.success("Profession Successfuly deleted")
        }
        catch(err){
            console.log("Error: " + err);
            toast.error("ERROR: You can't delete the profeesion")
        }   
    }

    return (
        <>
            <div className="profession_changing">
                <label>Professions</label>
                <Select 
                    className='dropdown'
                    placeholder="Select a profession"
                    options={houseworkerData.professions}
                    // value={houseworkerData.profession}
                    value={houseworkerData.profession}
                    onChange={onChangeProfession}
                    isClearable
                />
                {updatedData.profession && updatedData.profession != " " &&
                    <div className='profile_input-container'> 
                        <input 
                            className='input_field'
                            type='number'
                            name='working_hour'
                            placeholder='Enter working hour' 
                            onChange={onChangeWorkingHour}
                        />
                        <br/>
                        
                        {
                        updatedData.working_hour != "" &&
                        <div className="add_profession_button">
                            <button onClick={onChangeProfessionHandler}>ChangeProfession</button>
                        </div>
                        }
                        
                        <div className = "delete_profession_button">
                            {/* without ()=> this function will be executed immediately , also pass the e(event) for e.preventDefault*/}
                            <button onClick={(e) => onDeleteProfessionHandler(e, updatedData.profession)} >Delete Profession</button>
                        </div>
                    </div>
                    }
            </div>
            <div className='profession_adding'>
                <label>Add Profession</label>
                <Select 
                    className='dropdown'
                    placeholder="Select a profession"
                    options={houseworkerData.not_owned_professions}
                    value={houseworkerData.profession}
                    onChange={onChangeProffesions}
                    isClearable
                    isMulti
                />
                {  //list profession
                    updatedData.professions.map((el,index) => (
                    <div key={index}>
                        <label><b>{el}</b></label>
                        <input 
                            className='input_field'
                            type='number'
                            name={el} //selected profession
                            placeholder={`Enter ${el} working hour`} 
                            onChange={onChangeHouseworkerProfessions}
                        />
                    </div>    
                    ))
                }
                {
                    updatedData.houseworker_professions.length >0 && 
                        <div className='profession_add_button'>
                            <button onClick={onAddProfessionHandler}> Add</button>
                        </div>
                }
            </div>
        </>
    )
}

export default HouseworkerProfessions