/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import classnames from 'classnames';
import { X, Search } from 'react-feather';
import Avatar from '../../../components/Avatar';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { CardText, InputGroup, InputGroupText, Badge, Input } from 'reactstrap';
import userImg from '../../../assets/images/user.png';
import { useState } from 'react';
import { useAppSelector } from '../../../redux/store';
import { formatDate } from '../../../utils/Utils';
import io from 'socket.io-client';
import { useReadMessageMutation } from '../../../redux/api/contactAPI';

const socket = io('http://localhost:3008');

const ClientSidebarLeft = (props) => {
  // ** Props & Store
  const { chats } = props;
  const user = useAppSelector((state) => state.userState.user);
  const [readMessage] = useReadMessageMutation();
  // ** State
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState('online');
  const [filteredChat, setFilteredChat] = useState([]);

  const handleUserClick = async (id, provider) => {
    socket.emit('joinRoom', id);
    props.setSelectedContact({
      contactId: id
    });
    props.setSelectedUser({
      provider: provider
    });
    setActive(id);
    await readMessage({ contactId: id, data: provider._id });
  };

  // ** Handles Filter
  const handleFilter = (e) => {
    setQuery(e.target.value);
    const searchFilterFunction = (contact) =>
      user.role == 'client'
        ? contact.provider.firstName.toLowerCase().includes(e.target.value.toLowerCase())
        : contact.client.firstName.toLowerCase().includes(e.target.value.toLowerCase());
    const filteredChatsArr = chats.filter(searchFilterFunction);
    setFilteredChat([...filteredChatsArr]);
  };

  // ** Renders Chat
  const renderChats = () => {
    if (chats && chats.length) {
      if (query.length && !filteredChat.length) {
        return (
          <li className="no-results show">
            <h6 className="mb-0">No Chats Found</h6>
          </li>
        );
      } else {
        const arrToMap = query.length && filteredChat.length ? filteredChat : chats;

        return arrToMap.map((item) => {
          const time = item.lastMessage ? item.lastMessage.createdAt : new Date();
          return (
            <li
              key={item._id}
              onClick={() => handleUserClick(item._id, item.provider)}
              className={classnames({
                active: active === item._id
              })}>
              <Avatar
                img={user.role === 'client' ? item.provider.avatar || userImg : item.client.avatar || userImg}
                imgHeight="42"
                imgWidth="42"
                status={item.status}
              />
              <div className="chat-info flex-grow-1">
                <h5 className="mb-0">
                  {user.role === 'client' ? `${item.provider.firstName} ${item.provider.lastName}` : `${item.client.firstName} ${item.client.lastName}`}
                </h5>
                <CardText className="text-truncate">{item.lastMessage ? item.lastMessage.content : ''}</CardText>
              </div>
              <div className="chat-meta text-nowrap">
                <small className="float-end mb-25 chat-time ms-25">{formatDate(time)}</small>

                {item.unreadCount >= 1 ? (
                  <Badge className="float-end" color="danger" pill>
                    {item.unreadCount}
                  </Badge>
                ) : null}
              </div>
            </li>
          );
        });
      }
    } else {
      return null;
    }
  };

  return (
    <div className="sidebar-left">
      <div className="sidebar">
        <div className={classnames('sidebar-content')}>
          <div className="sidebar-close-icon">
            <X size={14} />
          </div>
          <div className="chat-fixed-search">
            <div className="d-flex align-items-center w-100">
              <div className="sidebar-profile-toggle">
                {Object.keys(user).length ? (
                  <Avatar className="avatar-border" img={user.avatar ? user.avatar : userImg} status={status} imgHeight="42" imgWidth="42" />
                ) : null}
              </div>
              <InputGroup className="input-group-merge ms-1 w-100">
                <InputGroupText className="round">
                  <Search className="text-muted" size={14} />
                </InputGroupText>
                <Input value={query} className="round" placeholder="Search or start a new chat" onChange={handleFilter} />
              </InputGroup>
            </div>
          </div>
          <PerfectScrollbar className="chat-user-list-wrapper list-group" options={{ wheelPropagation: false }}>
            <h4 className="chat-list-title">Chats</h4>
            <ul className="chat-users-list chat-list media-list">{renderChats()}</ul>
          </PerfectScrollbar>
        </div>
      </div>
    </div>
  );
};

export default ClientSidebarLeft;
