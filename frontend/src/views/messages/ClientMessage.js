/* eslint-disable no-unused-vars */
import { Fragment, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import ProviderSidebarLeft from './providerChat/ProviderSidebarLeft';
import ProviderChat from './providerChat/ProviderChat';
import classnames from 'classnames';

const ClientMessage = () => {
  const [user, setUser] = useState({});
  const [sidebar, setSidebar] = useState(false);
  const [userSidebarLeft, setUserSidebarLeft] = useState(false);
  const [userSidebarRight, setUserSidebarRight] = useState(false);

  // ** Sidebar & overlay toggle functions
  const handleSidebar = () => setSidebar(!sidebar);
  const handleUserSidebarLeft = () => setUserSidebarLeft(!userSidebarLeft);
  const handleUserSidebarRight = () => setUserSidebarRight(!userSidebarRight);

  const handleOverlayClick = () => {
    setSidebar(false);
    setUserSidebarRight(false);
    setUserSidebarLeft(false);
  };

  // ** Set user function for Right Sidebar
  const handleUser = (obj) => setUser(obj);

  return (
    <div className="main-view">
      <div className="content-area-wrapper container-xxl p-0">
        <Fragment>
          <ProviderSidebarLeft
            sidebar={sidebar}
            handleSidebar={handleSidebar}
            userSidebarLeft={userSidebarLeft}
            handleUserSidebarLeft={handleUserSidebarLeft}
          />
          <div className="content-right">
            <div className="content-wrapper">
              <div className="content-body">
                <div
                  className={classnames('body-content-overlay', {
                    show: userSidebarRight === true || sidebar === true || userSidebarLeft === true
                  })}
                  onClick={handleOverlayClick}></div>
                <ProviderChat
                  handleUser={handleUser}
                  handleSidebar={handleSidebar}
                  userSidebarLeft={userSidebarLeft}
                  handleUserSidebarRight={handleUserSidebarRight}
                />
              </div>
            </div>
          </div>
        </Fragment>
      </div>
    </div>
  );
};

export default ClientMessage;
