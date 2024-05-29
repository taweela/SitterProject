/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useDeleteServiceMutation, useGetServicesQuery, useManageStatusServiceMutation } from '../../redux/api/serviceAPI';
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
import { ChevronDown, MoreVertical, Archive, Search, Trash2, Plus, Edit, Activity, WifiOff } from 'react-feather';
import toast from 'react-hot-toast';

const renderRole = (row) => (
  <span className="text-truncate text-capitalize align-middle">
    <Badge color="info" className="px-2 py-1" pill>
      {row.role}
    </Badge>
  </span>
);

const renderStatus = (row) => {
  const color = row.status === 'active' ? 'light-success' : row.status === 'disabled' ? 'light-info' : 'light-danger';
  return (
    <span className="text-truncate text-capitalize align-middle">
      <Badge color={color} pill>
        {row.status}
      </Badge>
    </span>
  );
};

export const columns = () => [
  {
    name: 'Title',
    sortable: true,
    minwidth: '350px',
    sortactive: true,
    cell: ({ title }) => title,
    selector: (row) => row.title
  },
  {
    name: 'Description',
    minwidth: '350px',
    selector: (row) => `${row.description}`,
    sortable: true,
    cell: ({ description }) => description
  },
  {
    name: 'Type',
    selector: (row) => `${row.type}`,
    sortable: true,
    cell: ({ type }) => type
  },
  {
    name: 'Price',
    selector: (row) => `${row.price}`,
    sortable: true,
    cell: ({ price }) => price
  },
  {
    name: 'Address',
    selector: (row) => `${row.address}`,
    sortable: true,
    cell: ({ address }) => address
  },
  {
    name: 'Status',
    cell: (row) => renderStatus(row)
  },
  {
    name: 'Actions',
    minwidth: '120px',
    cell: (row) => {
      const navigate = useNavigate();
      const [modalVisibility, setModalVisibility] = useState(false);
      const [manageStatus, { isLoading: manageIsLoading, isError: manageIsError, isSuccess: manageIsSuccess, error: manageError }] =
        useManageStatusServiceMutation();
      const [deleteService, { isLoading, isError, error, isSuccess }] = useDeleteServiceMutation();
      useEffect(() => {
        if (isSuccess) {
          toast.success(
            <div className="d-flex align-items-center">
              <span className="toast-title">Service deleted successfully</span>
            </div>,
            {
              duration: 4000,
              position: 'top-right'
            }
          );
          navigate('/service-provider/services');
        }
        if (isError) {
          toast.error(error.data.message, {
            position: 'top-right'
          });
        }
      }, [isLoading]);
      useEffect(() => {
        if (manageIsSuccess) {
          toast.success(
            <div className="d-flex align-items-center">
              <span className="toast-title">Status changed successfully</span>
            </div>,
            {
              duration: 4000,
              position: 'top-right'
            }
          );
          navigate('/service-provider/services');
        }
        if (manageIsError) {
          toast.error(manageError.data.message, {
            position: 'top-right'
          });
        }
      }, [manageIsLoading]);
      const handleDeleteService = (id) => {
        deleteService(id);
        setModalVisibility(false);
      };

      const handleManageStatus = (id, status) => {
        manageStatus({ id: id, status: { status: status } });
      };
      console.log(row);
      return (
        <>
          {row.status !== 'deleted' && (
            <>
              <UncontrolledDropdown>
                <DropdownToggle tag="div" className="btn btn-sm">
                  <MoreVertical size={14} className="cursor-pointer action-btn" />
                </DropdownToggle>
                <DropdownMenu end container="body">
                  <DropdownItem className="w-100" onClick={() => navigate(`/service-provider/services/edit-service/${row._id}`)}>
                    <Edit size={14} className="mr-50" />
                    <span className="align-middle mx-2">Edit</span>
                  </DropdownItem>
                  {row.status == 'active' && (
                    <DropdownItem className="w-100" onClick={() => handleManageStatus(row._id, 'disabled')}>
                      <Activity size={14} className="mr-50" />
                      <span className="align-middle mx-2">Disable</span>
                    </DropdownItem>
                  )}
                  {row.status == 'disabled' && (
                    <DropdownItem className="w-100" onClick={() => handleManageStatus(row._id, 'active')}>
                      <Activity size={14} className="mr-50" />
                      <span className="align-middle mx-2">Active</span>
                    </DropdownItem>
                  )}
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
                  <Button color="danger" onClick={() => handleDeleteService(row._id)}>
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
  const { data: services } = useGetServicesQuery({ refetchOnFocus: true, refetchOnReconnect: true });

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
            <Button size="sm" color="danger" onClick={() => navigate('/service-provider/services/create-service')}>
              <Plus size={14} />
              <span className="align-middle "> Post Service </span>
            </Button>
          </Col>
        </Row>
        <Fragment>
          <div className="react-dataTable">
            <DataTable
              title="Services"
              data={services}
              responsive
              className="react-dataTable"
              noHeader
              pagination
              paginationServer
              paginationRowsPerPageOptions={paginationRowsPerPageOptions}
              columns={columns()}
              sortIcon={<ChevronDown />}
            />
          </div>
        </Fragment>
      </Container>
    </div>
  );
};

export default ProviderService;
