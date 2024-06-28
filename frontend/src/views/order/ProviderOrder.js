/* eslint-disable no-unused-vars */
import { Badge, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { AlertCircle, CheckSquare, ChevronDown, MoreVertical } from 'react-feather';
import { useDeleteOrderMutation, useGetOrdersQuery, useManageStatusOrderMutation } from '../../redux/api/orderAPI';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { Link } from 'react-router-dom';

const renderStatus = (row) => {
  const status = row.status;
  let color = 'warning';
  switch (status) {
    case 'pending':
      color = 'warning';
      break;
    case 'accepted':
      color = 'info';
      break;
    case 'completed':
      color = 'success';
      break;
    case 'declined':
      color = 'danger';
      break;
    case 'canceled':
      color = 'dark';
      break;
    default:
      break;
  }
  return (
    <span className="text-truncate text-capitalize align-middle">
      <Badge color={color} className="px-2 py-1" pill>
        {row.status}
      </Badge>
    </span>
  );
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
  { value: 'canceled', label: 'Canceled' }
];

const ProviderOrder = () => {
  const [currentStatus, setCurrentStatus] = useState({ value: '', label: 'Status...' });
  const queryParams = {
    status: currentStatus.value
  };
  const paginationRowsPerPageOptions = [15, 30, 50, 100];
  const [manageStatus, { isLoading, isError, error, isSuccess }] = useManageStatusOrderMutation();

  const handleStatusChange = (data) => {
    setCurrentStatus(data || { value: '', label: 'Status...' });
  };
  const { data: orders } = useGetOrdersQuery(queryParams);

  const [deleteOrder] = useDeleteOrderMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">Order Status Changed successfully!</span>
        </div>,
        {
          duration: 4000,
          position: 'top-right'
        }
      );
    }
    if (isError) {
      toast.error(error.data.message, {
        position: 'top-right'
      });
    }
  }, [isLoading]);
  const columns = () => [
    {
      name: 'Order Number',
      cell: (row) => <Link to={`/service-provider/orders/detail/${row.orderNumber}`}>{`#${row.orderNumber}`}</Link>,
      sortable: true,
      maxwidth: '100px'
    },
    {
      name: 'Client',
      maxwidth: '100px',
      selector: (row) => `${row.client.firstName} ${row.client.lastName}`,
      sortable: true
    },
    {
      name: 'Service Provider',
      maxwidth: '100px',
      selector: (row) => `${row.provider.firstName} ${row.provider.lastName}`,
      sortable: true
    },
    {
      name: 'Status',
      cell: (row) => renderStatus(row)
    },
    {
      name: 'Actions',
      width: '120px',
      cell: (row) => {
        const handleStatus = (id, status) => {
          manageStatus({ id: id, status: { status: status } });
        };
        return (
          <>
            {row.status === 'pending' && (
              <>
                <UncontrolledDropdown>
                  <DropdownToggle tag="div" className="btn btn-sm">
                    <MoreVertical size={14} className="cursor-pointer action-btn" />
                  </DropdownToggle>
                  <DropdownMenu end container="body">
                    <DropdownItem className="w-100" onClick={() => handleStatus(row._id, 'accepted')}>
                      <CheckSquare size={14} className="mr-50" />
                      <span className="align-middle mx-2">Accept</span>
                    </DropdownItem>
                    <DropdownItem className="w-100" onClick={() => handleStatus(row._id, 'declined')}>
                      <AlertCircle size={14} className="mr-50" />
                      <span className="align-middle mx-2">Decline</span>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </>
            )}
          </>
        );
      }
    }
  ];

  return (
    <div className="main-view">
      <Container>
        <Row className="my-3">
          <Col>
            <h4 className="main-title">Orders</h4>
          </Col>
        </Row>
        <Card>
          <CardBody>
            <Row className="justify-content-end">
              <Col md="3" className="d-flex align-items-center">
                <Select
                  isClearable
                  placeholder="Status..."
                  className="react-select w-100"
                  classNamePrefix="select"
                  options={statusOptions}
                  value={currentStatus}
                  onChange={(data) => {
                    handleStatusChange(data);
                  }}
                />
              </Col>
            </Row>
          </CardBody>
          <DataTable
            title="Users"
            data={orders}
            responsive
            className="react-dataTable"
            noHeader
            pagination
            paginationRowsPerPageOptions={paginationRowsPerPageOptions}
            columns={columns()}
            sortIcon={<ChevronDown />}
          />
        </Card>
      </Container>
    </div>
  );
};

export default ProviderOrder;
