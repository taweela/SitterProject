/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Label, Row } from 'reactstrap';
import userImg from '../../assets/images/user.png';
import { useForm } from 'react-hook-form';
import SpinnerComponent from '../../components/SpinnerComponent';
import { getDateFormat } from '../../utils/Utils';
import { getMeAPI, useUploadProfileAvatarMutation } from '../../redux/api/getMeAPI';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { Edit, Edit2 } from 'react-feather';

const ClientProfile = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();
  const { data: user, isLoading } = getMeAPI.endpoints.getMe.useQuery(null);
  const [uploadProfileAvatar, { isLoading: avatarIsLoading, isError, error, isSuccess }] = useUploadProfileAvatarMutation();
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user) {
      const fields = ['firstName', 'lastName', 'email', 'address'];
      fields.forEach((field) => setValue(field, user[field]));
      if (user.avatar) {
        setAvatarFile(user.avatar);
      }
    }
  }, [user]);

  const onSubmit = (data) => {};
  const handleAvatar = () => {
    const fileInput = document.getElementById('updateAvatar');
    fileInput.click();
  };

  const manageAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarFile(event.target.result);
      };
      reader.readAsDataURL(file);

      uploadProfileAvatar(file);
    }
  };

  return (
    <div className="main-view">
      <Container>
        <Card>
          <CardBody>
            {!isLoading ? (
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md="12" className="d-flex justify-content-end">
                    <Button color="primary" className="btn-block btn-sm" type="submit">
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
                          className={`form-control ${classnames({ 'is-invalid': errors.firstName })}`}
                          {...register('firstName', { required: true })}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label className="mb-0">Last Name:</Label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className={`form-control ${classnames({ 'is-invalid': errors.lastName })}`}
                          {...register('lastName', { required: true })}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label className="mb-0">Email:</Label>
                        <input
                          type="text"
                          id="email"
                          name="email"
                          className={`form-control ${classnames({ 'is-invalid': errors.email })}`}
                          {...register('email', { required: true })}
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
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default ClientProfile;
