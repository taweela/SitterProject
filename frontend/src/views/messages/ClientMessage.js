/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from 'react';
import ClientSidebarLeft from './clientChat/ClientSidebarLeft';
import ClientChat from './clientChat/ClientChat';
import { useGetContactsQuery } from '../../redux/api/contactAPI';

const ClientMessage = () => {
  const { data: chats, refetch } = useGetContactsQuery();
  const [messages, setMessages] = useState({});
  const [selectedContact, setSelectedContact] = useState({
    contactId: null
  });
  const [selectedUser, setSelectedUser] = useState({
    provider: null
  });

  useEffect(() => {
    refetch();
  }, [messages]);

  return (
    <div className="main-view">
      <div className="content-area-wrapper container-xxl p-0">
        <Fragment>
          <ClientSidebarLeft
            setSelectedContact={setSelectedContact}
            setSelectedUser={setSelectedUser}
            selectedUser={selectedUser}
            messages={messages}
            setMessages={setMessages}
            chats={chats}
          />
          <div className="content-right">
            <div className="content-wrapper">
              <div className="content-body">
                <div className="body-content-overlay"></div>
                <ClientChat
                  selectedContact={selectedContact}
                  setSelectedContact={setSelectedContact}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  messages={messages}
                  setMessages={setMessages}
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
