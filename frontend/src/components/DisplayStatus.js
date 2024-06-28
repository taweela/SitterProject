/* eslint-disable react/prop-types */
import { Badge } from 'reactstrap';

export const DisplayStatus = (props) => {
  let color;
  switch (props.status) {
    case 'accepted':
      color = 'success';
      break;

    case 'completed':
      color = 'success';
      break;

    case 'pending':
      color = 'warning';
      break;

    case 'declined':
      color = 'info';
      break;

    case 'deleted':
      color = 'secondary';
      break;
    case 'canceled':
      color = 'dark';
      break;

    default:
      color = 'primary';
      break;
  }

  return (
    <Badge color={color} pill>
      {props.status}
    </Badge>
  );
};
