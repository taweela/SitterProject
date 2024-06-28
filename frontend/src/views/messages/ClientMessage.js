/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from 'react';
import ClientSidebarLeft from './clientChat/ClientSidebarLeft';
import ClientChat from './clientChat/ClientChat';
import classnames from 'classnames';
import { useGetContactsQuery } from '../../redux/api/contactAPI';

const ClientMessage = () => {
  const [user, setUser] = useState({});
  const [sidebar, setSidebar] = useState(false);
  const [userSidebarLeft, setUserSidebarLeft] = useState(false);
  const [userSidebarRight, setUserSidebarRight] = useState(false);
  const { data: chats, refetch } = useGetContactsQuery();
  const [selectedContact, setSelectedContact] = useState({
    contactId: null
  });
  const [selectedUser, setSelectedUser] = useState({
    provider: null
  });

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

  // Update the chats state when data is available
  useEffect(() => {
    refetch();
  }, []);

  return (
    <div className="main-view">
      <div className="content-area-wrapper container-xxl p-0">
        <Fragment>
          <ClientSidebarLeft
            sidebar={sidebar}
            handleSidebar={handleSidebar}
            selectedContact={selectedContact}
            userSidebarLeft={userSidebarLeft}
            setSelectedContact={setSelectedContact}
            handleUserSidebarLeft={handleUserSidebarLeft}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            chats={chats}
          />
          <div className="content-right">
            <div className="content-wrapper">
              <div className="content-body">
                <div
                  className={classnames('body-content-overlay', {
                    show: userSidebarRight === true || sidebar === true || userSidebarLeft === true
                  })}
                  onClick={handleOverlayClick}></div>
                <ClientChat
                  handleUser={handleUser}
                  handleSidebar={handleSidebar}
                  userSidebarLeft={userSidebarLeft}
                  selectedContact={selectedContact}
                  setSelectedContact={setSelectedContact}
                  handleUserSidebarRight={handleUserSidebarRight}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
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
