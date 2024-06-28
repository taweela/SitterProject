/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import classnames from 'classnames';
import { X, Search, CheckSquare, Bell, User, Trash } from 'react-feather';
import Avatar from '../../../components/Avatar';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { CardText, InputGroup, InputGroupText, Badge, Input, Button, Label } from 'reactstrap';
import userImg from '../../../assets/images/user.png';
import { useState } from 'react';
import { useAppSelector } from '../../../redux/store';
import { formatDate } from '../../../utils/Utils';
import io from 'socket.io-client';

const socket = io('http://localhost:3008');

const ClientSidebarLeft = (props) => {
  // ** Props & Store
  const { sidebar, handleSidebar, userSidebarLeft, handleUserSidebarLeft, chats } = props;
  const user = useAppSelector((state) => state.userState.user);

  // ** State
  const [query, setQuery] = useState('');
  const [about, setAbout] = useState('');
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState('online');
  const [filteredChat, setFilteredChat] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);

  const handleUserClick = (id, provider) => {
    socket.emit('join room', id);
    props.setSelectedContact({
      contactId: id
    });
    props.setSelectedUser({
      provider: provider
    });
    setActive(id);
    if (sidebar === true) {
      handleSidebar();
    }
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

  const renderAboutCount = () => {
    if (user && user.description && user.description.length && user.description.length === 0) {
      return user.description.length;
    } else {
      return user.description.length;
    }
  };

  return (
    <div className="sidebar-left">
      <div className="sidebar">
        <div
          className={classnames('chat-profile-sidebar', {
            show: userSidebarLeft
          })}>
          <div className="chat-profile-header">
            <div className="close-icon" onClick={handleUserSidebarLeft}>
              <X size={14} />
            </div>
            <div className="header-profile-sidebar">
              <Avatar className="box-shadow-1 avatar-border" img={user.avatar ? user.avatar : userImg} status={status} size="xl" />
              <h4 className="chat-user-name">
                {user.firstName} {user.lastName}
              </h4>
              <span className="user-post">{user.role}</span>
            </div>
          </div>
          <PerfectScrollbar className="profile-sidebar-area" options={{ wheelPropagation: false }}>
            <h6 className="section-label mb-1">About</h6>
            <div className="about-user">
              <Input
                rows="5"
                type="textarea"
                defaultValue={user.description}
                onChange={(e) => setAbout(e.target.value)}
                className={classnames('char-textarea', {
                  'text-danger': user.description && user.description.length > 120
                })}
              />
              <small className="counter-value float-end">
                <span className="char-count">{renderAboutCount()}</span> / 120
              </small>
            </div>
            <h6 className="section-label mb-1 mt-3">Status</h6>
            <ul className="list-unstyled user-status">
              <li className="pb-1">
                <div className="form-check form-check-success">
                  <Input type="radio" label="Online" id="user-online" checked={status === 'online'} onChange={() => setStatus('online')} />
                  <Label className="form-check-label" for="user-online">
                    Online
                  </Label>
                </div>
              </li>
              <li className="pb-1">
                <div className="form-check form-check-danger">
                  <Input type="radio" id="user-busy" label="Do Not Disturb" checked={status === 'busy'} onChange={() => setStatus('busy')} />
                  <Label className="form-check-label" for="user-busy">
                    Busy
                  </Label>
                </div>
              </li>
              <li className="pb-1">
                <div className="form-check form-check-warning">
                  <Input type="radio" label="Away" id="user-away" checked={status === 'away'} onChange={() => setStatus('away')} />
                  <Label className="form-check-label" for="user-away">
                    Away
                  </Label>
                </div>
              </li>
              <li className="pb-1">
                <div className="form-check form-check-secondary">
                  <Input type="radio" label="Offline" id="user-offline" checked={status === 'offline'} onChange={() => setStatus('offline')} />
                  <Label className="form-check-label" for="user-offline">
                    Offline
                  </Label>
                </div>
              </li>
            </ul>
          </PerfectScrollbar>
        </div>
        <div
          className={classnames('sidebar-content', {
            show: sidebar === true
          })}>
          <div className="sidebar-close-icon" onClick={handleSidebar}>
            <X size={14} />
          </div>
          <div className="chat-fixed-search">
            <div className="d-flex align-items-center w-100">
              <div className="sidebar-profile-toggle" onClick={handleUserSidebarLeft}>
                {Object.keys(user).length ? <Avatar className="avatar-border" img={userImg} status={status} imgHeight="42" imgWidth="42" /> : null}
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
