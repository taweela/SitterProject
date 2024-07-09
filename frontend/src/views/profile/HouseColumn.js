import { MoreVertical, Trash2 } from 'react-feather';
import { Button, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledDropdown } from 'reactstrap';
import { useDeleteEntityMutation } from '../../redux/api/entityAPI';
import toast from 'react-hot-toast';
import { useState } from 'react';

export const houseColumns = (refetch) => [
  {
    name: 'Name',
    cell: (row) => `${row.name}`,
    sortable: true,
    maxwidth: '100px'
  },
  {
    name: 'Address',
    maxwidth: '100px',
    sortable: true,
    selector: (row) => `${row.address}`
  },
  {
    name: 'Rooms',
    maxwidth: '100px',
    sortable: true,
    selector: (row) => `${row.rooms}`
  },
  {
    name: 'Floors',
    maxwidth: '100px',
    sortable: true,
    selector: (row) => `${row.floors}`
  },
  {
    name: 'Actions',
    width: '120px',
    cell: (row) => {
      const [modalVisibility, setModalVisibility] = useState(false);
      const [deleteEntity] = useDeleteEntityMutation();
      const handleDeleteBaby = async (babyId) => {
        try {
          const response = await deleteEntity({ id: babyId, bodyData: { type: 'house' } });
          await refetch();
          toast.success(
            <div className="d-flex align-items-center">
              <span className="toast-title">{response.data.message}</span>
            </div>,
            {
              duration: 2000,
              position: 'top-right'
            }
          );
          setModalVisibility(!modalVisibility);
        } catch (error) {
          toast.error(
            <div className="d-flex align-items-center">
              <span className="toast-title">{error.data}</span>
            </div>,
            {
              duration: 2000,
              position: 'top-right'
            }
          );
        }
      };
      return (
        <>
          <UncontrolledDropdown>
            <DropdownToggle tag="div" className="btn btn-sm">
              <MoreVertical size={14} className="cursor-pointer action-btn" />
            </DropdownToggle>
            <DropdownMenu end container="body">
              <DropdownItem className="w-100" onClick={() => setModalVisibility(!modalVisibility)}>
                <Trash2 size={14} className="mr-50" />
                <span className="align-middle mx-2">Delete</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <Modal isOpen={modalVisibility} toggle={() => setModalVisibility(!modalVisibility)}>
            <ModalHeader toggle={() => setModalVisibility(!modalVisibility)}>Confirm Delete?</ModalHeader>
            <ModalBody>Are you sure you want to delete?</ModalBody>
            <ModalFooter className="justify-content-start">
              <Button color="primary" onClick={() => handleDeleteBaby(row._id)}>
                Delete
              </Button>
              <Button color="secondary" onClick={() => setModalVisibility(!modalVisibility)} outline>
                No
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
  }
];
