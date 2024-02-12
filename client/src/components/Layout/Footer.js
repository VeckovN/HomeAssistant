import {lazy, Suspense} from 'react';
const  InstagramIcon = lazy( () => import('@mui/icons-material/Instagram'));
const  TwitterIcon = lazy( () => import('@mui/icons-material/Twitter'));
const  FacebookIcon = lazy( () => import('@mui/icons-material/Facebook'));
const  RedditIcon = lazy( () => import('@mui/icons-material/Reddit'));

import '../../sass/layout/_footer.scss';
const Footer = () =>{
    return(
        <div className='footer-container'>
            <footer>
                <Suspense fallback={<div>Loading ...</div>}>
                    <div className="social">
                        <a href="#"><InstagramIcon fontSize='inherit'/></a>
                        <a href="#"><TwitterIcon fontSize='inherit'/></a>
                        <a href="#"><FacebookIcon fontSize='inherit'/></a>
                        <a href="#"><RedditIcon fontSize='inherit'/></a>
                    </div>
                </Suspense>
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