/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// ** React Imports
import { Fragment } from 'react';

// ** Custom Components
import Avatar from './Avatar';
// ** Third Party Components
import classnames from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Bell } from 'react-feather';

// ** Reactstrap Imports
import { Badge, DropdownMenu, DropdownItem, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { useGetNotificationsQuery, useReadNotifictionMutation } from '../redux/api/notificationAPI';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';

const NotificationDropdown = () => {
  const user = useAppSelector((state) => state.userState.user);
  const notificationData = useAppSelector((state) => state.notificationState.notifications);
  const [readNotifiction] = useReadNotifictionMutation();
  const navigate = useNavigate();
  const handleNotificate = (id, type) => {
    if (type == 'order') {
      navigate(user.role == 'client' ? '/client/orders' : '/service-provider/orders');
    } else if (type == 'message') {
      navigate(user.role == 'client' ? '/client/messages' : 'service-provider/messages');
    }
    readNotifiction({ notificationId: id });
  };

  const renderNotificationItems = () => {
    return (
      <PerfectScrollbar
        component="li"
        className="media-list scrollable-container p-3"
        options={{
          wheelPropagation: false
        }}>
        {notificationData && notificationData.length > 0 ? (
          notificationData.map((item, index) => {
            return (
              <a key={index} className="d-flex" onClick={() => handleNotificate(item._id, item.type)}>
                <div className={classnames('list-item d-flex')}>
                  <Fragment>
                    <div className="me-1">
                      <Avatar
                        {...(item.sender?.avatar
                          ? { img: item.sender?.avatar, imgHeight: 32, imgWidth: 32 }
                          : {
                              icon: item.sender.firstName.charAt(0).toUpperCase() + item.sender.lastName.charAt(0).toUpperCase(),
                              color: item.color
                            })}
                      />
                    </div>
                    <div className="list-item-body flex-grow-1" style={{ cursor: 'pointer' }}>
                      {item.content}
                    </div>
                  </Fragment>
                </div>
              </a>
            );
          })
        ) : (
          <div className="no-data-message text-center">There is no data</div>
        )}
      </PerfectScrollbar>
    );
  };
  /*eslint-enable */

  return (
    <UncontrolledDropdown tag="li" className="dropdown-notification nav-item me-25 d-flex align-items-center">
      {notificationData && (
        <>
          <DropdownToggle tag="a" className="nav-link" href="/" onClick={(e) => e.preventDefault()}>
            <Bell size={21} />
            {notificationData && notificationData.length > 0 && (
              <Badge pill color="danger" className="badge-up">
                {notificationData.length}
              </Badge>
            )}
          </DropdownToggle>
          <DropdownMenu end tag="ul" className="dropdown-menu-media mt-0">
            <li className="dropdown-menu-header">
              <DropdownItem className="d-flex" tag="div" header>
                <h4 className="notification-title mb-0 me-auto">Notifications</h4>
                <Badge tag="div" color="light-primary" pill>
                  {notificationData.length} New
                </Badge>
              </DropdownItem>
            </li>
            {renderNotificationItems()}
          </DropdownMenu>
        </>
      )}
    </UncontrolledDropdown>
  );
};

export default NotificationDropdown;
