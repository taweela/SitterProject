/* eslint-disable no-unused-vars */
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Label, Row } from 'reactstrap';
import userImg from '../../assets/images/user.png';
import SpinnerComponent from '../../components/SpinnerComponent';
import { getDateFormat, getUserData } from '../../utils/Utils';
import { getMeAPI, useUploadProfileAvatarMutation } from '../../redux/api/getMeAPI';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useUpdateUserMutation } from '../../redux/api/userAPI';
import toast from 'react-hot-toast';
import { Edit2 } from 'react-feather';
import classnames from 'classnames';
import { useGetReviewsQuery } from '../../redux/api/reviewAPI';

const ProviderProfile = () => {
  const { data: user, isLoading } = getMeAPI.endpoints.getMe.useQuery(null);
  const myData = getUserData() ? JSON.parse(getUserData()) : null;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();
  const [uploadProfileAvatar] = useUploadProfileAvatarMutation();
  const [updateUser, { isLoading: userLoading, isSuccess, error, isError }] = useUpdateUserMutation();
  const [avatarFile, setAvatarFile] = useState(null);
  const { data: reviews } = useGetReviewsQuery(myData?._id);

  useEffect(() => {
    if (user) {
      const fields = ['firstName', 'lastName', 'email', 'address', 'description', 'experience', 'rate'];
      fields.forEach((field) => setValue(field, user[field]));
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

  const onSubmit = (data) => {
    if (avatarFile) {
      data.avatar = avatarFile;
    }
    updateUser({ id: user._id, user: data });
  };
  const handleAvatar = () => {
    const fileInput = document.getElementById('updateAvatar');
    fileInput.click();
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
                  <Col md="4" sm="12">
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
                      <div className="mt-2">
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
                      </div>
                      <div className="mt-2">
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
                      </div>
                      <div className="mt-2">
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
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Joined:</h5>
                        <p className="card-text">{getDateFormat(user.createdAt)}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Lives:</h5>
                        <p className="card-text">{user.address}</p>
                      </div>
                    </div>
                  </Col>
                  <Col md="8" sm="12">
                    <div>
                      <div className="mt-2">
                        <FormGroup>
                          <Label className="mb-0">About:</Label>
                          <textarea
                            type="text"
                            id="description"
                            name="description"
                            rows={6}
                            className={`form-control ${classnames({ 'is-invalid': errors.description })}`}
                            {...register('description', { required: true })}></textarea>
                        </FormGroup>
                      </div>
                      <hr />
                      <div className="mt-3">
                        <FormGroup>
                          <Label className="mb-0">Experience(years):</Label>
                          <input
                            type="text"
                            id="experience"
                            name="experience"
                            className={`form-control ${classnames({ 'is-invalid': errors.experience })}`}
                            {...register('experience', { required: true })}
                          />
                        </FormGroup>
                      </div>
                      <div className="mt-3">
                        <FormGroup>
                          <Label className="mb-0">Hourly Rate:</Label>
                          <input
                            type="text"
                            id="rate"
                            name="rate"
                            className={`form-control ${classnames({ 'is-invalid': errors.rate })}`}
                            {...register('rate', { required: true })}
                          />
                        </FormGroup>
                      </div>
                      <hr />
                      <div className="mt-3">
                        <h5 className="mb-3">Reviews:</h5>
                        {reviews &&
                          reviews.map((review, index) => {
                            return (
                              <div key={index} className="my-2">
                                <div className="d-flex justify-content-start align-items-center mb-1">
                                  <div className="avatar me-2">
                                    <img src={review.client?.avatar ? review.client?.avatar : userImg} alt="avatar img" height="50" width="50" />
                                  </div>
                                  <div className="profile-user-info">
                                    <h6 className="mb-0">
                                      {review.client?.firstName} {review.client?.lastName}
                                    </h6>
                                    <small className="text-muted">{getDateFormat(review.createdAt)}</small>
                                  </div>
                                </div>
                                <p className="card-text">{review.description}</p>
                              </div>
                            );
                          })}
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

export default ProviderProfile;
