import { lazy } from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { requestInterceptor } from './utils/AxiosConfig.js';
import useSocket from './hooks/useSocket';

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import './toastify.css'

import PrivateRoute from './utils/Route/PrivateRoute.js';
import NotAuthRoute from './utils/Route/NotAuthRoute.js';
import ScrollToTopWrapper from './utils/ScrollToTopWrapper.js';
import NotificationWrapper from './utils/NotificationWrapper.js';
import RouteSuspense from './utils/Route/RouteSuspense.js';

import Sidebar from './components/Layout/Sidebar.js';
import ClientLayout from './components/Layout/ClientLayout.js';

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

function App() {
  const {user} = useSelector((state) => state.auth) 
  const [socket, connected] = useSocket(user);
  const dispatch = useDispatch();
  requestInterceptor(dispatch);

  return (
    <BrowserRouter>
      <NotificationWrapper>
        <ScrollToTopWrapper>
          <Routes>
            {(user?.type === "Client" || user == null) && (
              <Route 
                 element={
                  <ClientLayout />
              }>
                <Route index path="/" element={
                  <RouteSuspense client={true}>
                    <ClientHome socket={socket} />
                  </RouteSuspense>
                }/>
                <Route path="/login" element={
                  <RouteSuspense client={true}>
                    <NotAuthRoute>
                      <Login/>
                    </NotAuthRoute>
                  </RouteSuspense>
                }/>
                <Route path="/register" element={
                  <RouteSuspense client={true}>
                    <NotAuthRoute>
                      <Register/>
                    </NotAuthRoute>
                  </RouteSuspense>
                }/>
                <Route path="/clientRegister" element={
                  <RouteSuspense client={true}>
                    <NotAuthRoute>
                      <ClientRegister />
                    </NotAuthRoute>
                  </RouteSuspense>
                } />
                <Route path="/HouseworkerRegister" element={
                  <RouteSuspense client={true}>
                    <NotAuthRoute>
                      <HouseworkerRegister/>
                    </NotAuthRoute>
                  </RouteSuspense>
                }/>
                <Route path="/profile" element={
                  <RouteSuspense client={true}>
                    <PrivateRoute>
                      <ClientProfile/>
                    </PrivateRoute>
                  </RouteSuspense>
                }/>
                <Route path="/messages" element={
                  <RouteSuspense client={true}>
                    <PrivateRoute>
                      <Messages socket={socket} connected={connected}/>
                    </PrivateRoute>
                  </RouteSuspense>
                }/>
                <Route path="*" element={
                    <NotFound/>
                } />
              </Route>
            )}
             
            {user?.type === "Houseworker" && (
              <Route element={<Sidebar/>}>
                <Route index path="/" element={
                  <RouteSuspense>
                    <PrivateRoute>
                      <HouseworkerHome/>
                    </PrivateRoute>
                  </RouteSuspense>
                }/>
                <Route path="/messages" element={
                  <RouteSuspense>
                    <PrivateRoute>
                      <Messages socket={socket} connected={connected}/>
                    </PrivateRoute>
                  </RouteSuspense>
                }/>
                <Route path="/comments" element={
                  <RouteSuspense>
                    <PrivateRoute privacy='houseworker'>
                      <Comments socket={socket} user={user}/>
                    </PrivateRoute>
                  </RouteSuspense>
                }/>
                <Route path="/profile" element={
                  <RouteSuspense>
                    <PrivateRoute>
                      <HouseworkerProfile/>
                    </PrivateRoute>
                  </RouteSuspense>
                }/>
                <Route path="*" element={
                  <RouteSuspense>
                    <NotFound/>
                  </RouteSuspense>
                } />
              </Route>
            )}
          </Routes>

          <ToastContainer/>
        </ScrollToTopWrapper>
      </NotificationWrapper>
    </BrowserRouter>
  )
}

export default App;