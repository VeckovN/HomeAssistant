

//*TODO - LAZY LOAD(only when is needed, used)
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import CountertopsOutlinedIcon from '@mui/icons-material/CountertopsOutlined';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import LocalDrinkOutlinedIcon from '@mui/icons-material/LocalDrinkOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElderlyOutlinedIcon from '@mui/icons-material/ElderlyOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import '../sass/components/_houseworkerProfessionItem.scss';

const HouseworkerProfessionItem = ({professionTitle}) =>{

    const professionsContentList= [
        { id:0, title:"Housekeeper", description:"Responsible for cleaning and maintaining the cleanliness of the house", icon:<CleaningServicesOutlinedIcon fontSize='inherit'/>},
        { id:1, title:"Nanny", description:"Provides childcare services, including caring for children, preparing meals, and helping with homework", icon:<ChildCareOutlinedIcon fontSize='inherit'/>},
        { id:2, title:"Personal Chef", description:"Prepares meals for the household, including planning menus and accommodating dietary restrictions", icon:<CountertopsOutlinedIcon fontSize='inherit'/>},
        { id:3, title:"Gardener", description:"Takes care of the garden, lawn, and outdoor landscaping", icon:<LocalFloristIcon fontSize='inherit'/>},
        { id:4, title:"Butler", description:"Manages various aspects of the household, such as scheduling, organizing, and supervising other staff", icon:<LocalDrinkOutlinedIcon fontSize='inherit'/>},
        { id:5, title:"Personal Driver", description:"Provides transportation services, particularly for families with multiple members", icon:<DirectionsCarIcon fontSize='inherit'/>},
        { id:6,title:"Elderly Caregiver", description:"Offers assistance and companionship to elderly family members", icon: <ElderlyOutlinedIcon fontSize='inherit' />},
        { id:7, title:"Pet Sitter", description:"akes care of pets, including walking dogs, feeding, and grooming", icon: <PetsOutlinedIcon fontSize='inherit'/>},
        { id:8, title:"Home Health Aide", description:"Provides medical and personal care to individuals with health needs", icon:<HealthAndSafetyIcon fontSize='inherit'/>},
        { id:9, title:"Personal Shopper", description:"Assists with shopping for groceries, clothing, and other household needs", icon:<ShoppingCartIcon fontSize='inherit'/>}
    ]

    let profession = professionsContentList.find(el => el.title === professionTitle);
    if(!profession)
        profession = {title:"No-Profession", description:"Profession not found"}

    return(
        <div className='profile-profession-card'>
            <div className="profile-profession-card-title">
                <div className='icon'>{profession.icon}</div>
                <div className='profession-name'>{profession.title}</div>
            </div>
            <div className='profile-profession-card-desc'>
                {profession.description}
            </div>
        </div>
    )
}

export default HouseworkerProfessionItem;