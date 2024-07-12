/* eslint-disable react/prop-types */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import SpinnerComponent from './SpinnerComponent';
import { getToken } from '../utils/Utils';
import { getMeAPI } from '../redux/api/getMeAPI';

const RequiredUser = ({ allowedRoles }) => {
  const accessToken = getToken();

  const location = useLocation();
  const { isLoading, isFetching } = getMeAPI.endpoints.getMe.useQuery(null, {
    skip: false,
    refetchOnMountOrArgChange: true
  });
  const loading = isLoading || isFetching;

  const userResult = getMeAPI.endpoints.getMe.useQueryState(null, {
    selectFromResult: ({ data }) => data
  });
  const user = userResult ? userResult : null; // Handling potential undefined user result

  if (loading) {
    return <SpinnerComponent />;
  }

  return (accessToken || user) && allowedRoles.includes(user?.role) ? (
    <Outlet />
  ) : accessToken ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequiredUser;
