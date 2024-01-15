
//LAZY LOAD ON IMAGES
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import RedditIcon from '@mui/icons-material/Reddit';

import '../../sass/layout/_footer.scss';


const Footer = () =>{

    return(
        <div className='footer-container'>
            <footer>
                <div className="social">
                    <a href="#"><InstagramIcon fontSize='inherit'/></a>
                    <a href="#"><TwitterIcon fontSize='inherit'/></a>
                    <a href="#"><FacebookIcon fontSize='inherit'/></a>
                    <a href="#"><RedditIcon fontSize='inherit'/></a>
                </div>
                <ul className="links">
                    <li className='link'><a href="#">Home</a></li>
                    <li className='link'><a href="#">About</a></li>
                    <li className='link'><a href="#">Terms</a></li>
                    <li className='link'><a href="#">Privacy Policy</a></li>
                </ul>
                <p className='copyright-label'>HomeAssistant @ 2023</p>
            </footer>
        </div>
    )
}

export default Footer;