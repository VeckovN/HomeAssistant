import { Suspense, lazy } from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { requestInterceptor } from './utils/AxiosConfig.js';
import useSocket from './hooks/useSocket';
import LoadingScreen from './components/UI/LoadingScreen.js';

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import './toastify.css'

import PrivateRoute from './utils/Route/PrivateRoute.js';
import NotAuthRoute from './utils/Route/NotAuthRoute.js';
import ScrollToTopWrapper from './utils/ScrollToTopWrapper.js';
import NotificationWrapper from './utils/NotificationWrapper.js';

const Register = lazy(() => import('./pages/Register/Register.js'));
const ClientRegister = lazy(() => import('./pages/Register/Client/ClientRegister.js'));
const HouseworkerRegister = lazy(() => import('./pages/Register/Houseworker/HouseworkerRegister.js'));
const Login = lazy(() => import('./pages/Login/Login.js'));
const Comments = lazy(() => import('./pages/CommentsList.js'));

const ClientProfile = lazy(() => import('./pages/Profile/ClientProfile/ClientProfile.js'));
const HouseworkerProfile = lazy(() => import('./pages/Profile/HouseworkerProfile/HouseworkerProfile.js'));
const Messages = lazy(() => import('./pages/Messages.js'));
const NotFound = lazy(() => import('./pages/NotFound.js'));
const HouseworkerHome = lazy(() => import('./pages/Home/HouseworkerHome.js'));
const ClientHome = lazy(() => import('./pages/Home/ClientHome.js'));
const Sidebar = lazy(() => import('./components/Layout/Sidebar.js'));
const ClientLayout = lazy(() => import('./components/Layout/ClientLayout.js'));

function App() {
  const {user} = useSelector((state) => state.auth) 
  const [socket, connected] = useSocket(user);
  const dispatch = useDispatch();
  requestInterceptor(dispatch);

  return (
  <BrowserRouter>
    <NotificationWrapper>
      <ScrollToTopWrapper>
        <Suspense fallback={<LoadingScreen/>}>
          <Routes>

          {(user?.type === "Client" || user == null) && (
            <Route element={<ClientLayout/>}>
              <Route index path="/" element={
                  <ClientHome socket={socket} />
              }/>
              <Route path="/login" element={
                <NotAuthRoute>
                    <Login/>
                </NotAuthRoute>
              }/>
              <Route path="/register" element={
                <NotAuthRoute>
                    <Register/>
                </NotAuthRoute>
              }/>
              <Route path="/clientRegister" element={
                <NotAuthRoute>
                    <ClientRegister />
                </NotAuthRoute>
              } />
              <Route path="/HouseworkerRegister" element={
                <NotAuthRoute>
                    <HouseworkerRegister/>
                </NotAuthRoute>
              }/>
              {/* <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} /> */}
              <Route path="/profile" element={
                <PrivateRoute>
                    <ClientProfile/>
                </PrivateRoute>
              }/>
              <Route path="/messages" element={
                <PrivateRoute>
                    <Messages socket={socket} connected={connected}/>
                </PrivateRoute>
              }/>
              <Route path="*" element={<NotFound/>} />
            </Route>
          )}

          {user?.type === "Houseworker" && (
            <Route element={<Sidebar/>} >
              <Route index path="/" element={
                <PrivateRoute>
                    <HouseworkerHome/>
                </PrivateRoute>
              }/>
              <Route path="/messages" element={
                <PrivateRoute>
                    <Messages socket={socket} connected={connected}/>
                </PrivateRoute>
              }/>
              <Route path="/comments" element={
                <PrivateRoute privacy='houseworker'>
                    <Comments socket={socket} user={user}/>
                </PrivateRoute>
              }/>
              {/* <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} /> */}
              <Route path="/profile" element={
                <PrivateRoute>
                    <HouseworkerProfile/>
                </PrivateRoute>
              }/>
              <Route path="/login" element={
                <NotAuthRoute>
                    <Login/>
                </NotAuthRoute>
              }/>
              <Route path="*" element={<NotFound/>} />
            </Route>
          )}
          </Routes>
        </Suspense>
  
      <ToastContainer/>
      </ScrollToTopWrapper>
    </NotificationWrapper>

  </BrowserRouter>
  )

}

export default App;
