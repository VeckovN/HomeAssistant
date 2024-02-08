import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home.js';
// import Register from './components/Page/Register/Register.js'
import Register from './pages/Register/Register.js'
// import ClientRegister from './components/Page/Register/Client/ClientRegister';
import ClientRegister from './pages/Register/Client/ClientRegister.js';
// import HouseworkerRegister from './components/Page/Register/Houseworker/HouseworkerRegister';
import HouseworkerRegister from './pages/Register/Houseworker/HouseworkerRegister.js';
// import Login from './components/Page/Login/Login.js'
import Login from './pages/Login.js';
// import Comments from './components/Page/Houseworker/CommentsList/CommentsList.js';
import Comments from './pages/CommentsList.js';

//
import Profile from './pages/Profile.js';

// import ClientProfile from './components/Page/Client/ClientProfile/ClientProfile.js';
import ClientProfile from './pages/ClientProfile/ClientProfile.js';
// import HouseworkerProfile from './components/Page/Houseworker/Profile/HouseworkerProfile.js';
import HouseworkerProfile from './pages/HouseworkerProfile/HouseworkerProfile.js';
// import Messages from './components/Page/Messages/Messages'
import Messages from './pages/Messages.js';
// import NotFound from './components/Page/NotFound.js';
import NotFound from './pages/NotFound.js';
// import HouseworkerHome from './components/Page/Houseworker/HouseworkerHome.js';
import HouseworkerHome from './pages/HouseworkerHome.js';
// import ClientHome from './components/Page/Client/Home/ClientHome.js';
import ClientHome from './pages/ClientHome.js';
import Sidebar from './components/Layout/Sidebar.js';
import ClientLayout from './components/Layout/ClientLayout.js';

import PrivateRoute from './utils/Route/PrivateRoute.js';
import NotAuthRoute from './utils/Route/NotAuthRoute.js';
import ScrollToTopWrapper from './utils/ScrollToTopWrapper.js';

import {ToastContainer} from 'react-toastify';
import './toastify.css'

import useSocket from './hooks/useSocket';
import { useSelector, useDispatch } from 'react-redux';
import 'react-toastify/dist/ReactToastify.min.css';

import { requestInterceptor } from './utils/AxiosInterceptors.js';

// const socketIO = io("http://127.0.0.1:5000", {
//   withCredentials: true,
// });

function App() {

  const {user} = useSelector((state) => state.auth) 
  const [socket, connected] = useSocket(user);
  const dispatch = useDispatch();
  requestInterceptor(dispatch);

  return (
  <BrowserRouter>
    <ScrollToTopWrapper>
      <Routes>

      {console.log("User", user)}

      {(user?.type === "Client" || user == null) && (
        <Route element={<ClientLayout/>}>
          <Route index path="/" element={<ClientHome socket={socket} />} />
          <Route path="/login" element={<NotAuthRoute><Login/></NotAuthRoute>} />
          <Route path="/register" element={<NotAuthRoute><Register/></NotAuthRoute>} />
          <Route path="/clientRegister" element={<NotAuthRoute><ClientRegister /></NotAuthRoute>} />
          <Route path="/HouseworkerRegister" element={<NotAuthRoute><HouseworkerRegister/></NotAuthRoute>} />
          {/* <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} /> */}
          <Route path="/profile" element={<PrivateRoute><ClientProfile/></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages socket={socket} connected={connected}/></PrivateRoute>} />
          <Route path="*" element={<NotFound/>} />
        </Route>
      )}

      {user?.type === "Houseworker" && (
        <Route element={<Sidebar />} >
          <Route index path="/" element={<PrivateRoute><HouseworkerHome/></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages socket={socket} connected={connected}/></PrivateRoute>} />
          <Route path="/comments" element={<PrivateRoute privacy='houseworker'><Comments/></PrivateRoute>} />
          {/* <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} /> */}
          <Route path="/profile" element={<PrivateRoute><HouseworkerProfile/></PrivateRoute>} />
          <Route path="/login" element={<NotAuthRoute><Login/></NotAuthRoute>} />
          <Route path="*" element={<NotFound/>} />
        </Route>
      )}

      </Routes>
    
    <ToastContainer/>
    </ScrollToTopWrapper>

  </BrowserRouter>
  )


  // return (
  //   <BrowserRouter>
  //     <ScrollToTopWrapper>
  //       {user?.type === 'Houseworker' ? "": <Header/>}

  //       <Routes>

  //       <Route element={user?.type === "Houseworker" && <Sidebar/>}>
  //         <Route path='/' element={
  //           <PrivateRoute >
  //             <HouseworkerHome/>
  //           </PrivateRoute>
  //         }/>

  //         <Route path='/messages' element={
  //           <PrivateRoute >
  //             <Messages socket={socket} connected={connected}/>
  //           </PrivateRoute>
  //           }
  //         />
  //         <Route path='/comments' element={
  //           <PrivateRoute privacy='houseworker'>
  //             <Comments/>
  //           </PrivateRoute>
  //           }
  //         />
  //         <Route path='/profile' element={
  //           <PrivateRoute >
  //             <Profile/> 
  //           </PrivateRoute>
  //           }
  //         />
  //         </Route>

  //         {/* Client and Guest(Not Authenitacted user) Routes */}
  //         {/* <Route element={user?.type!= 'Houseworker' && <ClientHome socket={socket} user={user}/>}> */}
  //         <Route path='/' element={user?.type === "Client" || user ==  null && <ClientHome socket={socket}/>}>
  //           <Route path='/login' element={
  //             <NotAuthRoute>
  //               <Login/>
  //             </NotAuthRoute>
  //           }
  //           />

  //           <Route path='/register' element={
  //             <NotAuthRoute>
  //               <Register/>
  //             </NotAuthRoute>
  //           }
  //           />

  //           <Route path='/clientRegister' element={
  //             <NotAuthRoute>
  //               <ClientRegister />
  //             </NotAuthRoute>
  //           }
  //           />

  //           <Route path='/HouseworkerRegister' element={
  //             <NotAuthRoute>
  //               <HouseworkerRegister/>
  //             </NotAuthRoute>
  //           }
  //           />

  //           {/* <Route path='/comments' element={
  //               <PrivateRoute privacy='houseworker'>
  //                 <Comments/>
  //               </PrivateRoute>
  //             }
  //           /> */}
  //           <Route path='/profile' element={
  //               <PrivateRoute >
  //                 <Profile/> 
  //               </PrivateRoute>
  //             }
  //           />

  //           <Route path='/messages' element={
  //               <PrivateRoute >
  //                 <Messages socket={socket} connected={connected}/>
  //               </PrivateRoute>
  //             }
  //           />
  //       </Route>

        


  //         {/* Houseworker routes */}



  //         {/* SHared routes (accessible to both user type) */}
  //         <Route path="*" element ={<NotFound/>}></Route> 

  //       </Routes>

  //       <ToastContainer/>
  //     </ScrollToTopWrapper>
  //     {/* Footer conditionaly rendered in the ScrollToTopWrapper */}
  //     {/* <Footer></Footer>  */}
  //   </BrowserRouter>

  // );


///////////////////////////////////////////




  // return (
  //   <BrowserRouter>
  //     <ScrollToTopWrapper>

  //       {/* Houseworker will have a SideMenu (not Header) */}
  //       {user?.type === 'Houseworker' ? "Show in Slide MEnu": <Header/>}
        

  //       <Routes>
  //         <Route path='/' element={<Home socket={socket} connected={connected} user={user}/>}> </Route>

  //         <Route path='/login' element={
  //             <NotAuthRoute>
  //               <Login/>
  //             </NotAuthRoute>
  //           }
  //         />

  //         <Route path='/register' element={
  //             <NotAuthRoute>
  //               <Register/>
  //             </NotAuthRoute>
  //           }
  //         />

  //         <Route path='/clientRegister' element={
  //             <NotAuthRoute>
  //               <ClientRegister />
  //             </NotAuthRoute>
  //           }
  //         />

  //         <Route path='/HouseworkerRegister' element={
  //             <NotAuthRoute>
  //               <HouseworkerRegister/>
  //             </NotAuthRoute>
  //           }
  //         />


  //         <Route path='/comments' element={
  //             <PrivateRoute privacy='houseworker'>
  //               <Comments/>
  //             </PrivateRoute>
  //           }
  //         />
  //        <Route path='/profile' element={
  //             <PrivateRoute >
  //               <Profile/> 
  //             </PrivateRoute>
  //           }
  //         />

  //         <Route path='/messages' element={
  //             <PrivateRoute >
  //               <Messages socket={socket} connected={connected}/>
  //             </PrivateRoute>
  //           }
  //         />

  //         <Route path="*" element ={<NotFound/>}></Route> 

  //       </Routes>

  //       <ToastContainer/>
  //     </ScrollToTopWrapper>
  //     {/* Footer conditionaly rendered in the ScrollToTopWrapper */}
  //     {/* <Footer></Footer>  */}
  //   </BrowserRouter>

  // );
}

export default App;
