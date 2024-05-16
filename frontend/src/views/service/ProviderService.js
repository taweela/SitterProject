/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useGetServicesQuery } from '../../redux/api/serviceAPI';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupText,
  Row,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import { ChevronDown, MoreVertical, Archive, Search, Trash2, Plus } from 'react-feather';
import toast from 'react-hot-toast';

const renderRole = (row) => (
  <span className="text-truncate text-capitalize align-middle">
    <Badge color="info" className="px-2 py-1" pill>
      {row.role}
    </Badge>
  </span>
);

const renderStatus = (row) => {
  const color = row.status === 'active' ? 'success' : 'danger';
  return (
    <span className="text-truncate text-capitalize align-middle">
      <Badge color={color} className="px-2 py-1" pill>
        {row.status}
      </Badge>
    </span>
  );
};

export const columns = () => [
  {
    name: 'Title',
    maxwidth: '100px',
    selector: (row) => `${row.title}`,
    sortable: true
  },
  {
    name: 'Description',
    maxwidth: '100px',
    selector: (row) => `${row.description}`,
    sortable: true
  },
  {
    name: 'Type',
    maxwidth: '100px',
    selector: (row) => `${row.type}`,
    sortable: true
  },
  {
    name: 'Role',
    cell: (row) => renderRole(row)
  },
  {
    name: 'Address',
    selector: (row) => `${row.address}`,
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
      const navigate = useNavigate();
      const [modalVisibility, setModalVisibility] = useState(false);
      // const [deleteUser, { isLoading, isError, error, isSuccess }] = useDeleteUserMutation();
      // useEffect(() => {
      //   if (isSuccess) {
      //     toast.success(
      //       <div className="d-flex align-items-center">
      //         <span className="toast-title">User deleted successfully</span>
      //       </div>,
      //       {
      //         duration: 4000,
      //         position: 'top-right'
      //       }
      //     );
      //     navigate('/admin/clients');
      //   }
      //   if (isError) {
      //     toast.error(error.data.message, {
      //       position: 'top-right'
      //     });
      //   }
      // }, [isLoading]);
      const handleDeleteUser = (id) => {
        // deleteUser(id);
        setModalVisibility(false);
      };
      return (
        <>
          {row.role !== 'admin' && (
            <>
              <UncontrolledDropdown>
                <DropdownToggle tag="div" className="btn btn-sm">
                  <MoreVertical size={14} className="cursor-pointer action-btn" />
                </DropdownToggle>
                <DropdownMenu end container="body">
                  <DropdownItem className="w-100" onClick={() => navigate(`/admin/profile-review/${row._id}`)}>
                    <Archive size={14} className="mr-50" />
                    <span className="align-middle mx-2">Review</span>
                  </DropdownItem>
                  <DropdownItem className="w-100" onClick={() => setModalVisibility(!modalVisibility)}>
                    <Trash2 size={14} className="mr-50" />
                    <span className="align-middle mx-2">Delete</span>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <Modal isOpen={modalVisibility} toggle={() => setModalVisibility(!modalVisibility)}>
                <ModalHeader toggle={() => setModalVisibility(!modalVisibility)}>Confirm Delete?</ModalHeader>
                <ModalBody>
                  Are you sure you want to delete?
                  <div>
                    <strong>{row.email}</strong>
                  </div>
                </ModalBody>
                <ModalFooter className="justify-content-start">
                  <Button color="primary" onClick={() => handleDeleteUser(row._id)}>
                    Yes, Please Delete
                  </Button>
                  <Button color="secondary" onClick={() => setModalVisibility(!modalVisibility)} outline>
                    No
                  </Button>
                </ModalFooter>
              </Modal>
            </>
          )}
        </>
      );
    }
  }
];

const ProviderService = () => {
  const navigate = useNavigate();
  const paginationRowsPerPageOptions = [15, 30, 50, 100];
  const { data: services } = useGetServicesQuery();
  console.log(services);
  return (
    <div className="main-view">
      <Container>
        <Row className="my-3">
          <Col>
            <h4 className="main-title">Services</h4>
          </Col>
        </Row>
        <Row className="my-3">
          <Col md="4">
            <Button size="sm" color="danger" onClick={() => navigate('/service-provider/new-service')}>
              <Plus size={14} />
              <span className="align-middle "> Post Service </span>
            </Button>
          </Col>
        </Row>
        <Card>
          <DataTable
            title="Services"
            data={services}
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

export default ProviderService;
