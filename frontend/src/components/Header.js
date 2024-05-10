/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import userImg from '../assets/images/user.png';
import logo1Img from '../assets/images/logo-1.png';
import { getToken, getUserData } from '../utils/Utils';
// import { useLogoutUserMutation } from '../redux/api/getMeApi';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const [logoutUser, { isLoading, isSuccess, error, isError }] = useLogoutUserMutation();
  const accessToken = getToken();
  const userData = JSON.parse(getUserData());
  const navigate = useNavigate();
  const toggle = () => setIsOpen(!isOpen);

  // useEffect(() => {
  //   if (isSuccess) {
  //     window.location.href = '/login';
  //   }

  //   if (isError) {
  //     toast.error(error.data.message, {
  //       position: 'top-right'
  //     });
  //   }
  // }, [isLoading]);

  // const onLogoutHandler = async () => {
  //   logoutUser();
  // };

  return (
    <header>
      <div className="container">
        <Navbar full="true" expand="md">
          <NavbarBrand
            href={
              accessToken ? (userData?.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'
            }>
            <img src={logo1Img} alt="beautySN" style={{ height: '55px', width: 'auto' }} />
          </NavbarBrand>
          <NavbarToggler onClick={toggle} className="ms-auto" />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="ms-auto" navbar>
              {!accessToken && (
                <>
                  <NavItem className="nav-item-responsive">
                    <NavLink onClick={() => navigate('/login')}>Login</NavLink>
                  </NavItem>
                  <NavItem className="nav-item-responsive">
                    <NavLink onClick={() => navigate('/register')}>Register</NavLink>
                  </NavItem>
                </>
              )}
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    </header>
  );
};

export default Header;
