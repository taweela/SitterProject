/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  Label,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import userImg from '../../assets/images/user.png';
import { useForm } from 'react-hook-form';
import SpinnerComponent from '../../components/SpinnerComponent';
import { getDateFormat } from '../../utils/Utils';
import { getMeAPI, useUploadProfileAvatarMutation } from '../../redux/api/getMeAPI';
import classnames from 'classnames';
import { Fragment, useEffect, useState } from 'react';
import { ChevronDown, Edit2 } from 'react-feather';
import { useUpdateUserMutation } from '../../redux/api/userAPI';
import toast from 'react-hot-toast';
import { useCreateEntityMutation, useGetProfileEntitiesQuery } from '../../redux/api/entityAPI';
import DataTable from 'react-data-table-component';
import { babyColumns } from './BabyColumn';
import { dogColumns } from './DogColumn';
import { houseColumns } from './HouseColumn';

const ClientProfile = () => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [etype, setEtype] = useState('baby');
  const paginationRowsPerPageOptions = [15, 30, 50, 100];
  const [active, setActive] = useState('1');

  const toggle = (tab) => {
    if (active !== tab) {
      setActive(tab);
    }
  };
  const {
    register: profileRegister,
    handleSubmit: profileHandleSubmit,
    setValue: profileSetValue,
    formState: { errors: profileErrors }
  } = useForm();

  const {
    register: entityRegister,
    handleSubmit: entityHandleSubmit,
    setValue: entitySetValue,
    formState: { errors: entityErrors }
  } = useForm();
  const { data: user, isLoading } = getMeAPI.endpoints.getMe.useQuery(null);
  const [uploadProfileAvatar] = useUploadProfileAvatarMutation();
  const [updateUser, { isLoading: userLoading, isSuccess, error, isError }] = useUpdateUserMutation();
  const [createEntity] = useCreateEntityMutation();
  const [avatarFile, setAvatarFile] = useState(null);
  const { data: entityData, refetch } = useGetProfileEntitiesQuery();

  useEffect(() => {
    if (user) {
      const fields = ['firstName', 'lastName', 'email', 'address'];
      fields.forEach((field) => profileSetValue(field, user[field]));
      if (user.avatar) {
        setAvatarFile(user.avatar);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">Profile updated successfully</span>
        </div>,
        {
          duration: 2000,
          position: 'top-right'
        }
      );
    }

    if (isError) {
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
  }, [userLoading]);

  const onSubmitProfile = (data) => {
    if (avatarFile) {
      data.avatar = avatarFile;
    }
    updateUser({ id: user._id, user: data });
  };
  const handleAvatar = () => {
    const fileInput = document.getElementById('updateAvatar');
    fileInput.click();
  };

  const onSubmitEntity = async (data) => {
    await createEntity(data);
    setModalVisibility(!modalVisibility);
    refetch();
  };

  const manageAvatar = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarFile(event.target.result);
      };
      reader.readAsDataURL(file);

      const result = await uploadProfileAvatar(file);
      const avatarData = result.data.updateAvatar.avatar;
      setAvatarFile(avatarData);
    }
  };

  const handleAddEntity = () => {
    setModalVisibility(true);
  };

  const handleClose = () => {
    setModalVisibility(!modalVisibility);
  };

  const handleEntityClick = () => {
    entityHandleSubmit(onSubmitEntity)();
  };

  const handleType = (e) => {
    setEtype(e.target.value);
  };

  const validatePositiveNumber = (value) => {
    if (value <= 0 || isNaN(value)) {
      return 'Age must be a positive number.';
    }
    return true;
  };

  return (
    <div className="main-view">
      <Container>
        <Card>
          <CardBody>
            {!isLoading ? (
              <Form onSubmit={profileHandleSubmit(onSubmitProfile)}>
                <Row>
                  <Col md="12" className="d-flex justify-content-end">
                    <Button color="danger" className="btn-block mx-2" size="sm" type="button" onClick={handleAddEntity}>
                      Add Entity
                    </Button>
                    <Button color="primary" className="btn-block mx-2" size="sm" type="submit">
                      Update Profile
                    </Button>
                  </Col>
                </Row>
                <Row className="m-3">
                  <Col md="3" sm="12">
                    <div>
                      <div className="mb-3">
                        <div className="position-relative">
                          <img src={avatarFile ? avatarFile : userImg} alt="Profile" className="profile-img" />
                          <label htmlFor="updateAvatar" className="position-absolute avatar-style">
                            <button type="button" className="avatar-button" onClick={handleAvatar}>
                              <Edit2 size={14} />
                            </button>
                          </label>
                          <input type="file" id="updateAvatar" className="visually-hidden" onChange={manageAvatar} />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md="9" sm="12">
                    <div>
                      <FormGroup>
                        <Label className="mb-0">First Name:</Label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className={`form-control ${classnames({ 'is-invalid': profileErrors.firstName })}`}
                          {...profileRegister('firstName', { required: true })}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label className="mb-0">Last Name:</Label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className={`form-control ${classnames({ 'is-invalid': profileErrors.lastName })}`}
                          {...profileRegister('lastName', { required: true })}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label className="mb-0">Email:</Label>
                        <input
                          type="text"
                          id="email"
                          name="email"
                          className={`form-control ${classnames({ 'is-invalid': profileErrors.email })}`}
                          {...profileRegister('email', { required: true })}
                        />
                      </FormGroup>
                      <FormGroup>
                        <h5 className="mb-0">Lives:</h5>
                        <p className="card-text">{user.address}</p>
                      </FormGroup>
                      <div className="mt-3">
                        <h5 className="mb-0">Joined:</h5>
                        <p className="card-text">{getDateFormat(user.createdAt)}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Form>
            ) : (
              <SpinnerComponent />
            )}
            <hr />
            <Fragment>
              <Nav tabs justified>
                <NavItem>
                  <NavLink
                    active={active === '1'}
                    onClick={() => {
                      toggle('1');
                    }}>
                    Baby
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={active === '2'}
                    onClick={() => {
                      toggle('2');
                    }}>
                    Dog
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={active === '3'}
                    onClick={() => {
                      toggle('3');
                    }}>
                    House
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent className="py-50" activeTab={active}>
                <TabPane tabId="1">
                  <DataTable
                    data={entityData?.babies}
                    responsive
                    className="react-dataTable"
                    noHeader
                    pagination
                    paginationRowsPerPageOptions={paginationRowsPerPageOptions}
                    columns={babyColumns(refetch)}
                    sortIcon={<ChevronDown />}
                  />
                </TabPane>
                <TabPane tabId="2">
                  <DataTable
                    data={entityData?.dogs}
                    responsive
                    className="react-dataTable"
                    noHeader
                    pagination
                    paginationRowsPerPageOptions={paginationRowsPerPageOptions}
                    columns={dogColumns(refetch)}
                    sortIcon={<ChevronDown />}
                  />
                </TabPane>
                <TabPane tabId="3">
                  <DataTable
                    data={entityData?.houses}
                    responsive
                    className="react-dataTable"
                    noHeader
                    pagination
                    paginationRowsPerPageOptions={paginationRowsPerPageOptions}
                    columns={houseColumns(refetch)}
                    sortIcon={<ChevronDown />}
                  />
                </TabPane>
              </TabContent>
            </Fragment>
          </CardBody>
        </Card>
        <Modal isOpen={modalVisibility} toggle={() => setModalVisibility(!modalVisibility)}>
          <ModalHeader toggle={() => setModalVisibility(!modalVisibility)}>Entity Manage</ModalHeader>
          <ModalBody>
            <Form onSubmit={entityHandleSubmit(onSubmitEntity)}>
              <Row>
                <Col sm="6">
                  <FormGroup>
                    <Label className="mb-0">Type:</Label>
                    <select
                      type="text"
                      name="entype"
                      id="entype"
                      className={`form-control ${classnames({ 'is-invalid': entityErrors.entype })}`}
                      {...entityRegister('entype', { required: true })}
                      onChange={(e) => handleType(e)}>
                      <option value="baby">Baby</option>
                      <option value="dog">Dog</option>
                      <option value="house">House</option>
                    </select>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col sm="6">
                  <FormGroup>
                    <Label className="mb-0">Name</Label>
                    <input
                      className={`form-control ${entityErrors.entityName ? 'is-invalid' : ''}`}
                      type="text"
                      id="entityName"
                      placeholder="Name"
                      {...entityRegister('entityName', {
                        required: 'Name is required.'
                      })}
                    />
                    {entityErrors.entityName && <span className="text-danger">{entityErrors.entityName.message}</span>}
                  </FormGroup>
                </Col>
                {(etype == 'baby' || etype == 'dog') && (
                  <>
                    <Col sm="6">
                      <FormGroup>
                        <Label className="mb-0">Age</Label>
                        <input
                          className={`form-control ${entityErrors.entityAge ? 'is-invalid' : ''}`}
                          type="text"
                          id="entityAge"
                          placeholder="Age"
                          {...entityRegister('entityAge', {
                            required: 'Age is required.',
                            validate: validatePositiveNumber // Custom validation rule
                          })}
                        />
                        {entityErrors.entityAge && <span className="text-danger">{entityErrors.entityAge.message}</span>}
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label className="mb-0">Gender</Label>
                        <select
                          type="text"
                          name="entityGender"
                          id="entityGender"
                          className={`form-control ${classnames({ 'is-invalid': entityErrors.entityGender })}`}
                          {...entityRegister('entityGender', { required: true })}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormGroup>
                    </Col>
                  </>
                )}
                {etype == 'baby' && (
                  <Col sm="6">
                    <FormGroup>
                      <Label className="mb-0">Allergy</Label>
                      <input
                        className={`form-control ${entityErrors.entityAllergy ? 'is-invalid' : ''}`}
                        type="text"
                        id="entityAllergy"
                        placeholder="Allergy"
                        {...entityRegister('entityAllergy', {
                          required: 'Allergy is required.'
                        })}
                      />
                      {entityErrors.entityAllergy && <span className="text-danger">{entityErrors.entityAllergy.message}</span>}
                    </FormGroup>
                  </Col>
                )}
                {etype == 'dog' && (
                  <Col sm="6">
                    <FormGroup>
                      <Label className="mb-0">Type</Label>
                      <input
                        className={`form-control ${entityErrors.entityType ? 'is-invalid' : ''}`}
                        type="text"
                        id="entityType"
                        placeholder="Type"
                        {...entityRegister('entityType', {
                          required: 'Type is required.'
                        })}
                      />
                      {entityErrors.entityType && <span className="text-danger">{entityErrors.entityType.message}</span>}
                    </FormGroup>
                  </Col>
                )}
                {etype == 'house' && (
                  <>
                    <Col sm="6">
                      <FormGroup>
                        <Label className="mb-0">Address</Label>
                        <input
                          className={`form-control ${entityErrors.entityAddress ? 'is-invalid' : ''}`}
                          type="text"
                          id="entityAddress"
                          placeholder="Address"
                          {...entityRegister('entityAddress', {
                            required: 'Address is required.'
                          })}
                        />
                        {entityErrors.entityAddress && <span className="text-danger">{entityErrors.entityAddress.message}</span>}
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label className="mb-0">Rooms</Label>
                        <input
                          className={`form-control ${entityErrors.entityRooms ? 'is-invalid' : ''}`}
                          type="text"
                          id="entityRooms"
                          placeholder="Rooms"
                          {...entityRegister('entityRooms', {
                            required: 'Room is required.',
                            validate: validatePositiveNumber
                          })}
                        />
                        {entityErrors.entityRooms && <span className="text-danger">{entityErrors.entityRooms.message}</span>}
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label className="mb-0">Floors</Label>
                        <input
                          className={`form-control ${entityErrors.entityFloors ? 'is-invalid' : ''}`}
                          type="text"
                          id="entityFloors"
                          placeholder="Floors"
                          {...entityRegister('entityFloors', {
                            required: 'Floor is required.',
                            validate: validatePositiveNumber
                          })}
                        />
                        {entityErrors.entityFloors && <span className="text-danger">{entityErrors.entityFloors.message}</span>}
                      </FormGroup>
                    </Col>
                  </>
                )}
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" size="sm" type="button" onClick={handleEntityClick}>
              Save
            </Button>
            <Button color="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default ClientProfile;
