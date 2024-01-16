import { city_options } from '../../../../utils/options';
import HouseworkerProfessions from './HouseworkerProfessions';
import HouseworkerInputs from './HouseworkerInputs.js';
import Spinner from '../../../UI/Spinner';

import '../../../../sass/pages/_houseworkerProfile.scss'

const HouseworkerProfileForm = ({loading, houseworkerData, setHouseworkerData, cityField, register, errors, watch, handleSubmit, getNotOwnedProfessions, onSubmitUpdate, onChangeCityHandler}) =>{
    console.log("GOYUSEL ", houseworkerData);
    return(
        <div className='profile-container'>
                {loading ? <Spinner className={'profile-spinner'}/> :
                <>
                    {/* <div id='title'>{`Houseworker ${ houseworkerData.first_name} ${houseworkerData.last_name} Profile`}</div> */}
                    <form className='hs-profile-form' onSubmit={handleSubmit(onSubmitUpdate)}>
                    <div id='title'>{`Houseworker ${ houseworkerData.first_name} ${houseworkerData.last_name} Profile`}</div>
                        <div className ='professions'>
                            <div id='professions-label'>Professions</div>
                            <HouseworkerProfessions
                                houseworkerData={houseworkerData}
                                setHouseworkerData={setHouseworkerData}
                                getNotOwnedProfessions={getNotOwnedProfessions}
                            />
                        </div>
                        <div className='input-label-form'>
                            <div id='personalInfo-label'>Personal Info</div>
                            <HouseworkerInputs
                                houseworkerData={houseworkerData}
                                register={register}
                                errors={errors}
                                watch={watch}
                                cityField={cityField}
                                city_options={city_options}
                                onChangeCityHandler={onChangeCityHandler}
                            />
                            <br></br>
                            <button type='submit'  className='profile-submit'>Update</button>
                        </div>

                    </form>
                </>
                }
            </div>
    )

}

export default HouseworkerProfileForm;