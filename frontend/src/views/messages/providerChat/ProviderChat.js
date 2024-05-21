/* eslint-disable no-unused-vars */
import classNames from 'classnames';
import { MessageSquare, Menu, PhoneCall, Video, Search, MoreVertical, Mic, Image, Send } from 'react-feather';

/* eslint-disable no-unused-vars */
const ProviderChat = (props) => {
  return (
    <div className="chat-app-window">
      <div className={classNames('start-chat-area')}>
        <div className="start-chat-icon mb-1">
          <MessageSquare />
        </div>
        <h4 className="sidebar-toggle start-chat-text">Start Conversation</h4>
      </div>
    </div>
  );
};

export default ProviderChat;
