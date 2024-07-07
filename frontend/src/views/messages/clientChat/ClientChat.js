/* eslint-disable react/no-find-dom-node */
/* eslint-disable react/prop-types */
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { MessageSquare, Menu, Send } from 'react-feather';
import { useSelectChatQuery } from '../../../redux/api/contactAPI';
import Avatar from '../../../components/Avatar';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, InputGroup } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAppSelector } from '../../../redux/store';
import userImg from '../../../assets/images/user.png';
import io from 'socket.io-client';
import { skipToken } from '@reduxjs/toolkit/query';

const socket = io('http://localhost:3008');

/* eslint-disable no-unused-vars */
const ClientChat = (props) => {
  const { messages, setMessages, selectedContact, selectedUser } = props;
  const [msg, setMsg] = useState('');
  const user = useAppSelector((state) => state.userState.user);
  const chatArea = useRef(null);
  const queryParams = selectedContact;

  const { data: selectedUserChats, refetch } = useSelectChatQuery(queryParams.contactId ? queryParams : skipToken);

  // ** Scroll to chat bottom
  const scrollToBottom = () => {
    const chatContainer = ReactDOM.findDOMNode(chatArea.current);
    chatContainer.scrollTop = Number.MAX_SAFE_INTEGER;
  };

  useEffect(() => {
    const messagesLen = messages ? Object.keys(messages).length : 0;
    if (messagesLen) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserChats) {
      setMessages(selectedUserChats);
      refetch();
    }
  }, [selectedUserChats, refetch]);

  useEffect(() => {
    const messageListener = (message) => {
      if (message.contact && message.contact[0]._id === selectedContact.contactId) {
        setMessages((prevMessages) => {
          const updatedChats = [...prevMessages.chats, message];
          return { ...prevMessages, chats: updatedChats };
        });
      }
    };

    socket.on('message', messageListener);

    return () => {
      socket.off('message', messageListener);
    };
  }, [selectedContact.contactId]);

  // ** Sends New Msg
  const handleSendMsg = (e) => {
    e.preventDefault();
    if (msg.trim().length) {
      const message = {
        room: selectedContact.contactId,
        text: msg,
        sender: user._id,
        receiver: selectedUser?.provider._id,
        contact: selectedContact.contactId
      };
      socket.emit('chatMessage', message);
      setMsg('');
    }
  };

  // ** Formats chat data based on sender
  const formattedChatData = () => {
    let chatLog = [];
    if (messages.chats) {
      chatLog = messages.chats;
    }
    const formattedChatLog = [];
    let chatMessageSenderId = chatLog.length > 0 ? chatLog[chatLog.length - 1].sender[0]._id : undefined;
    let msgGroup = {
      senderId: chatMessageSenderId,
      senderAvatar: chatLog.length > 0 ? (chatLog[chatLog.length - 1].sender[0].avatar ? chatLog[chatLog.length - 1].sender[0].avatar : userImg) : undefined,
      messages: []
    };
    chatLog.forEach((msg, index) => {
      if (chatMessageSenderId === msg.sender[0]._id) {
        msgGroup.messages.push({
          msg: msg.content,
          time: msg.createdAt
        });
      } else {
        chatMessageSenderId = msg.sender[0]._id;
        formattedChatLog.push(msgGroup);
        msgGroup = {
          senderId: msg.sender[0]._id,
          senderAvatar: msg.sender[0].avatar ? msg.sender[0].avatar : userImg,
          messages: [
            {
              msg: msg.content,
              time: msg.createdAt
            }
          ]
        };
      }
      if (index === chatLog.length - 1) formattedChatLog.push(msgGroup);
    });
    return formattedChatLog;
  };

  // ** Renders user chat
  const renderChats = () => {
    return formattedChatData().map((item, index) => {
      return (
        <div
          key={index}
          className={classnames('chat', {
            'chat-left': item.senderId !== user._id
          })}>
          <div className="chat-avatar">
            <Avatar imgWidth={36} imgHeight={36} className="box-shadow-1 cursor-pointer" img={item.senderAvatar} />
          </div>

          <div className="chat-body">
            {item.messages.map((chat, index1) => (
              <div key={index1} className="chat-content">
                <p>{chat.msg}</p>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  // ** ChatWrapper tag based on chat's length
  const ChatWrapper = messages && Object.keys(messages).length && messages.chats ? PerfectScrollbar : 'div';
  return (
    <div className="chat-app-window">
      <div className={classnames('start-chat-area', { 'd-none': (messages && messages.chats && messages.chats.length > 0) || selectedUser.provider })}>
        <div className="start-chat-icon mb-1">
          <MessageSquare />
        </div>
        <h4 className="sidebar-toggle start-chat-text">Start Conversation</h4>
      </div>
      {selectedUser && Object.keys(selectedUser).length ? (
        <div className={classnames('active-chat', { 'd-none': selectedUser.provider === null })}>
          <div className="chat-navbar">
            <div className="chat-header">
              <div className="d-flex align-items-center">
                <div className="sidebar-toggle d-block d-lg-none me-3">
                  <Menu size={21} />
                </div>
                <Avatar
                  imgHeight="36"
                  imgWidth="36"
                  img={selectedUser.provider?.avatar ? selectedUser.provider.avatar : userImg}
                  // status={selectedUser?.provider?.status}
                  className="avatar-border user-profile-toggle m-0 me-3"
                />
                <h6 className="mb-0">
                  {selectedUser.provider?.firstName} {selectedUser.provider?.lastName}
                </h6>
              </div>
            </div>
          </div>

          <ChatWrapper ref={chatArea} className="user-chats" options={{ wheelPropagation: false }}>
            {messages && messages.chats ? <div className="chats">{renderChats()}</div> : null}
          </ChatWrapper>

          <Form className="chat-app-form" onSubmit={(e) => handleSendMsg(e)}>
            <InputGroup className="input-group-merge me-3 form-send-message">
              <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message or use speech to text" />
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

export default ClientChat;
