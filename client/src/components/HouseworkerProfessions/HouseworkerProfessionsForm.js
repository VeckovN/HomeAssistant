import Select from 'react-select';

const HouseworkerProfessionsForm = ({
    updatedData, 
    houseworkerData, 
    changeProfessionRef, 
    onChangeProfession, 
    onChangeWorkingHour, 
    onChangeProfessionHandler, 
    onDeleteProfessionHandler, 
    onChangeProffesions, 
    addProffesionRef, 
    onChangeHouseworkerProfessions, 
    onAddProfessionHandler
}) =>{
    return (
        <>
            <div className='profession-conatiner'>
                <div className="profession-changing">
                    <label className='sub-section-label'>Change profession</label>
                    <Select 
                        className='dropdown-select'
                        placeholder="Select a profession"
                        options={houseworkerData.professions}
                        ref={changeProfessionRef}
                        onChange={onChangeProfession}
                        isClearable={true}
                    />
                    {updatedData.profession && updatedData.profession != " " &&
                        <div className='profession-input-container'> 
                            <input 
                                type='number'
                                name='working_hour'
                                placeholder='Enter €/hr' 
                                value={updatedData.working_hour}
                                onChange={onChangeWorkingHour}
                            />
                            <br/>
                            
                            <div className='action-buttons'>
                                <div className="change-profession">
                                    <button onClick={onChangeProfessionHandler} disabled={!updatedData.working_hour}>Change</button>
                                </div>
                                
                                <div className = "delete-profession">
                                    <button onClick={(e) => onDeleteProfessionHandler(e, updatedData.profession)} >Delete</button>
                                </div>
                            </div>
                        </div>
                        }
                </div>
                <div className='profession-adding'>
                    <label className='sub-section-label'>Add Profession</label>
                    <Select 
                        className='dropdown-select'
                        placeholder="Select a profession"
                        options={houseworkerData.not_owned_professions}
                        onChange={onChangeProffesions}
                        ref={addProffesionRef}
                        isClearable
                        isMulti
                    />
                    {
                        updatedData.professions.length > 0 &&
                        <label id='enter-hs-wr'>Enter houseworker working hour </label>
                    }
                    {  //list profession
                        updatedData.professions.map((el,index) => (
                        <div className='working-hours' key={index}>
                            <label><b>{el}</b></label>
                            <input 
                                placeholder='Enter €/hr' 
                                type='number'
                                name={el} 
                                onChange={onChangeHouseworkerProfessions}
                            />
                        </div>    
                        ))
                    }
                    {
                        updatedData.houseworker_professions.length >0 && 
                            <div className='profession-add'>
                                <button onClick={onAddProfessionHandler}> Add</button>
                            </div>
                    }
                </div>
            </div>
        </>
    )
}


export default HouseworkerProfessionsForm