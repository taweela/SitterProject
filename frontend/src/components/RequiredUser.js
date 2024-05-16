/* eslint-disable react/prop-types */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import SpinnerComponent from './SpinnerComponent';
import { getToken } from '../utils/Utils';
import { getMeAPI } from '../redux/api/getMeAPI';

const RequiredUser = ({ allowedRoles }) => {
  const accessToken = getToken();

  const { data: user } = getMeAPI.endpoints.getMe.useQuery(null);
  const location = useLocation();

  if (accessToken && !user) {
    return <SpinnerComponent />;
  }
  console.log(accessToken, user);

  return accessToken && allowedRoles.includes(user?.role) ? (
    <Outlet />
  ) : accessToken && user ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequiredUser;
