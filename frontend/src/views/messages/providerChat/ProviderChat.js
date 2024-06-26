/* eslint-disable react/no-find-dom-node */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { MessageSquare, Menu, Mic, Image, Send } from 'react-feather';
import { useSelectChatQuery } from '../../../redux/api/contactAPI';
import Avatar from '../../../components/Avatar';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, InputGroup, InputGroupText, Label } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAppSelector } from '../../../redux/store';
import userImg from '../../../assets/images/user.png';
import io from 'socket.io-client';

/* eslint-disable no-unused-vars */
const ProviderChat = (props) => {
  const { handleUser, handleUserSidebarRight, handleSidebar, userSidebarLeft, selectedContact, selectedUser } = props;
  const [msg, setMsg] = useState('');
  const user = useAppSelector((state) => state.userState.user);
  const chatArea = useRef(null);
  const queryParams = selectedContact;

  const { data: selectedUserChats } = useSelectChatQuery(queryParams);
  console.log(selectedUserChats, '-d-d-d-d-', selectedUser);

  // ** Scroll to chat bottom
  const scrollToBottom = () => {
    const chatContainer = ReactDOM.findDOMNode(chatArea.current);
    chatContainer.scrollTop = Number.MAX_SAFE_INTEGER;
  };

  useEffect(() => {
    const selectedUserLen = selectedUserChats ? Object.keys(selectedUserChats).length : 0;

    if (selectedUserLen) {
      scrollToBottom();
    }
  }, [selectedUserChats]);

  // ** Sends New Msg
  const handleSendMsg = (e) => {
    e.preventDefault();
    console.log(msg, 'ddddddddddddddddddd');
    if (msg.trim().length) {
      setMsg('');
    }
  };

  // ** Formats chat data based on sender
  const formattedChatData = () => {
    let chatLog = [];
    if (selectedUserChats.chats) {
      chatLog = selectedUserChats.chats.chat;
    }

    const formattedChatLog = [];
    let chatMessageSenderId = chatLog[0] ? chatLog[0].senderId : undefined;
    let msgGroup = {
      senderId: chatMessageSenderId,
      messages: []
    };
    chatLog.forEach((msg, index) => {
      if (chatMessageSenderId === msg.senderId) {
        msgGroup.messages.push({
          msg: msg.message,
          time: msg.time
        });
      } else {
        chatMessageSenderId = msg.senderId;
        formattedChatLog.push(msgGroup);
        msgGroup = {
          senderId: msg.senderId,
          messages: [
            {
              msg: msg.message,
              time: msg.time
            }
          ]
        };
      }
      if (index === chatLog.length - 1) formattedChatLog.push(msgGroup);
    });
    return formattedChatLog;
  };

  // ** On mobile screen open left sidebar on Start Conversation Click
  const handleStartConversation = () => {
    if (!selectedUserChats && !Object.keys(selectedUserChats).length && !userSidebarLeft && window.innerWidth < 992) {
      handleSidebar();
    }
  };

  // ** Renders user chat
  const renderChats = () => {
    return formattedChatData().map((item, index) => {
      return (
        <div
          key={index}
          className={classnames('chat', {
            'chat-left': item.senderId !== 11
          })}>
          {/* <div className="chat-avatar">
            <Avatar imgWidth={36} imgHeight={36} className="box-shadow-1 cursor-pointer" img={item.senderId === 11 ? user.avatar : selectedUserChats.avatar} />
          </div> */}

          <div className="chat-body">
            {item.messages.map((chat) => (
              <div key={chat.msg} className="chat-content">
                <p>{chat.msg}</p>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  // ** ChatWrapper tag based on chat's length
  const ChatWrapper = selectedUserChats && Object.keys(selectedUserChats).length && selectedUserChats.chats ? PerfectScrollbar : 'div';
  return (
    <div className="chat-app-window">
      <div className={classnames('start-chat-area', { 'd-none': (selectedUserChats && selectedUserChats.chats.length > 0) || selectedUser.client })}>
        <div className="start-chat-icon mb-1">
          <MessageSquare />
        </div>
        <h4 className="sidebar-toggle start-chat-text" onClick={handleStartConversation}>
          Start Conversation
        </h4>
      </div>
      {selectedUser && Object.keys(selectedUser).length ? (
        <div className={classnames('active-chat', { 'd-none': selectedUser.client === null })}>
          <div className="chat-navbar">
            <div className="chat-header">
              <div className="d-flex align-items-center">
                <div className="sidebar-toggle d-block d-lg-none me-3" onClick={handleSidebar}>
                  <Menu size={21} />
                </div>
                <Avatar
                  imgHeight="36"
                  imgWidth="36"
                  img={selectedUser.client?.avatar ? selectedUser.client.avatar : userImg}
                  // status={selectedUser?.provider?.status}
                  className="avatar-border user-profile-toggle m-0 me-3"
                />
                <h6 className="mb-0">
                  {selectedUser.client?.firstName} {selectedUser.client?.lastName}
                </h6>
              </div>
            </div>
          </div>

          <ChatWrapper ref={chatArea} className="user-chats" options={{ wheelPropagation: false }}>
            {selectedUserChats && selectedUserChats.chat ? <div className="chats">{renderChats()}</div> : null}
          </ChatWrapper>

          <Form className="chat-app-form" onSubmit={(e) => handleSendMsg(e)}>
            <InputGroup className="input-group-merge me-3 form-send-message">
              <InputGroupText>
                <Mic className="cursor-pointer" size={14} />
              </InputGroupText>
              <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message or use speech to text" />
              <InputGroupText>
                <Label className="attachment-icon mb-0" for="attach-doc">
                  <Image className="cursor-pointer text-secondary" size={14} />
                  <input type="file" id="attach-doc" hidden />
                </Label>
              </InputGroupText>
            </InputGroup>
            <Button className="send" color="primary">
              <Send size={14} className="d-lg-none" />
              <span className="d-none d-lg-block">Send</span>
            </Button>
          </Form>
        </div>
      ) : null}
    </div>
  );
};

export default ProviderChat;
