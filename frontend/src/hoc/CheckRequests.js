import { useEffect } from 'react';
import axios from 'axios';
import { useLogoutUserMutation } from '../redux/api/getMeAPI';

const checkRequests = (Wrapped) => {
  function CheckRequests(props) {
    const [logoutUser] = useLogoutUserMutation();
    useEffect(() => {
      axios.defaults.withCredentials = true;
      axios.interceptors.response.use(
        (response) => {
          console.log(response, '------------------------------');
          return response;
        },
        (error) => {
          if (error.response) {
            console.log(error.response, '------------------------------');
            switch (error.response.status) {
              case 503:
                logoutUser();
                window.location.href = '/misc/server-deploy';
                break;
              case 401:
                logoutUser();
                window.location.href = '/login';
                break;
              default:
                break;
            }
          } else if (error.request) {
            window.location.href = '/misc/not-connected';
          } else {
            // Something happened in setting up the request that triggered an Error
          }

          return Promise.reject(error);
        }
      );
    });

    return <Wrapped {...props} />;
  }
  return CheckRequests;
};

export default checkRequests;
