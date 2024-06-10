/* eslint-disable react/prop-types */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import SpinnerComponent from './SpinnerComponent';
import { getToken, getUserData } from '../utils/Utils';

const RequiredUser = ({ allowedRoles }) => {
  const accessToken = getToken();

  const user = getUserData() ? JSON.parse(getUserData()) : null;
  const location = useLocation();

  if (accessToken && !user) {
    return <SpinnerComponent />;
  }

  return accessToken && allowedRoles.includes(user?.role) ? (
    <Outlet />
  ) : accessToken ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequiredUser;
