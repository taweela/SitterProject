import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import error404Img from '../assets/images/not-authorized-dark.svg';
import { getToken, getUserData } from '../utils/Utils';
import logo1Img from '../assets/images/logo-1.png';

const Error404 = () => {
  const accessToken = getToken();
  const userData = JSON.parse(getUserData());
  const dashboarURL = accessToken
    ? userData?.role === 'admin'
      ? '/admin/dashboard'
      : userData?.role === 'client'
        ? '/client/dashboard'
        : '/service-provider/dashboard'
    : '/';
  return (
    <div className="misc-wrapper">
      <a className="brand-logo" href={dashboarURL}>
        <img src={logo1Img} alt="SmartSitter" className="mb-2 " />
      </a>
      <div className="misc-inner p-2 p-sm-3">
        <div className="w-100 text-center">
          <h2 className="mb-1">Page Not Found 🕵🏻‍♀️</h2>
          <p className="mb-4">Oops! 😖 The requested URL was not found on this server.</p>
          <Button tag={Link} to={dashboarURL} color="primary" className="btn-sm-block mb-1">
            Back to home
          </Button>
          <div className="py-4">
            <img className="img-fluid" src={error404Img} alt="Not authorized page" style={{ maxHeight: '300px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;
