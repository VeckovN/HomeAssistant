import {useRef} from 'react';
import Select from 'react-select';
import {toast} from 'react-toastify';
import {handlerError} from '../../utils/ErrorUtils.js';
import useUser from '../../hooks/useUser.js';
import {profession_options} from '../../utils/options';
import {addProfession, deleteProfession, updateProfessionWorkingHour} from '../../services/houseworker.js';
import HouseworkerProfessionsForm from './HouseworkerProfessionsForm.js';

import '../../sass/components/_houseworkerProfessions.scss';

const HouseworkerProfessions = ({houseworkerData, setHouseworkerData, getNotOwnedProfessions}) =>{
    const initialProfessionsState = {
        profession:'', //selected profession from select
        working_hour:'',
        professions:[], //fetched houseowrker professions
        not_owned_professions:[],
        houseworker_professions:[] //adding new profession
    }

    const changeProfessionRef = useRef();
    const addProffesionRef = useRef();

    const {data:updatedData, onChangeWorkingHour, resetProfessions, resetWorkingHour, onChangeProfession, onChangeHouseworkerProfessions, onChangeProffesions} = useUser(initialProfessionsState)

    const format_houseworker_label = (value, working_hour) =>{
        return {value:value, label: `${value} ${working_hour}€`}
    }

    const onChangeProfessionHandler = async(e) =>{
        e.preventDefault(); //without it, func will re-trigger from onSubmit
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
                        professions:newProfessionOptions,
                    }))
                    toast.success("Successfully profession updated")
                    resetWorkingHour();
                }
                else
                    toast.error("Enter working hour ")
                
                return;
            }
        }
        catch(err){
            handlerError(err);
        }
    }

    const onAddProfessionHandler = async(e) =>{
        e.preventDefault();
        try{
            if(updatedData.houseworker_professions.length > 1){
                let new_houseworker_professions = [];

                //We need array of promise because we have loop there fucntion should call as async
                const addProfessionPromises = updatedData.houseworker_professions.map(async (profession) => {
                    await addProfession(profession.label, profession.working_hour);
                    const new_profession = format_houseworker_label(profession.label, profession.working_hour);
                    new_houseworker_professions.push(new_profession);
                })
                //Wait for all promises to resolve using Promise.all
                await Promise.all(addProfessionPromises);

                //current users selection profeesions
                const merged_houseworkers = [...houseworkerData.professions, ...new_houseworker_professions];

                const remained_professions = profession_options.filter((option) =>{
                    //different object only
                    return !merged_houseworkers.some((mine) => mine.value === option.value)
                })
                
                setHouseworkerData(prev => (
                    {
                        ...prev,
                        professions:merged_houseworkers,
                        not_owned_professions:remained_professions
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
                    }
                ))
                toast.success("Profession successfully added");
            }     
            resetProfessions();
            addProffesionRef.current.clearValue();
        }
        catch(err){
            handlerError(err);
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
                not_owned_professions:not_owned_professions //change Add Profession optiosn(add deleted profession)
            }))
 
            toast.success("Profession Successfuly deleted")
            changeProfessionRef.current.clearValue();
        }
        catch(err){
            handlerError(err);
        } 
    }

    return (
        <HouseworkerProfessionsForm
            updatedData = {updatedData}
            houseworkerData ={houseworkerData}

            changeProfessionRef={changeProfessionRef}
            onChangeProfession={onChangeProfession}
            onChangeWorkingHour ={onChangeWorkingHour}
            onChangeProfessionHandler={onChangeProfessionHandler}
            onDeleteProfessionHandler={onDeleteProfessionHandler}
            onChangeProffesions={onChangeProffesions}
            addProffesionRef={addProffesionRef}
            onChangeHouseworkerProfessions={onChangeHouseworkerProfessions}
            onAddProfessionHandler={onAddProfessionHandler}

            HouseworkerProfessions = {houseworkerData.professions}
            updatedProfession = {updatedData.profession}
            updatedWorkingHour ={updatedData.working_hour}
            houseworkerNotOwnedProfessions ={houseworkerData.not_owned_professions}
            updatedHouseworkerProfessions= {updatedData.houseworker_professions}
        />
    )
}

export default HouseworkerProfessions