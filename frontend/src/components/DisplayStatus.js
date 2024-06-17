/* eslint-disable react/prop-types */
import { Badge } from 'reactstrap';

export const DisplayStatus = (props) => {
  let color;
  switch (props.status) {
    case 'accepted':
      color = 'light-success';
      break;

    case 'completed':
      color = 'light-success';
      break;

    case 'pending':
      color = 'light-warning';
      break;

    case 'declined':
      color = 'light-info';
      break;

    case 'deleted':
      color = 'light-secondary';
      break;
    case 'canceled':
      color = 'light-dark';
      break;

    default:
      color = 'light-primary';
      break;
  }

  return (
    <Badge color={color} pill>
      {props.status}
    </Badge>
  );
};
