/* eslint-disable no-unused-vars */
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import userImg from '../../assets/images/user.png';
import { useParams } from 'react-router-dom';
import { useGetUserQuery } from '../../redux/api/userAPI';
import SpinnerComponent from '../../components/SpinnerComponent';
import { getDateFormat } from '../../utils/Utils';
import { useDeleteReviewMutation, useGetReviewsQuery } from '../../redux/api/reviewAPI';
import { useEffect } from 'react';
import { Star, Trash2 } from 'react-feather';
import { useAppSelector } from '../../redux/store';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const { data: user, isLoading, refetch: refetchUser } = useGetUserQuery(id);
  const { data: reviews, refetch: refetchReviews } = useGetReviewsQuery(id);
  const curUser = useAppSelector((state) => state.userState.user);
  const [deleteReview, { isLoading: reviewLoading, isError, error, isSuccess }] = useDeleteReviewMutation();

  useEffect(() => {
    refetchUser();
    refetchReviews();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">Review deleted successfully</span>
        </div>,
        {
          duration: 2000,
          position: 'top-right'
        }
      );
    }
    if (isError) {
      toast.error(error.data.message, {
        position: 'top-right'
      });
    }
  }, [reviewLoading]);

  const renderStars = (marks) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <li key={i} className="ratings-list-item me-25">
          <Star key={i} className={i <= parseFloat(marks) ? 'filled-star' : 'unfilled-star'} style={{ cursor: 'pointer' }} />
        </li>
      );
    }
    return stars;
  };

  const handleDeleteReview = (id) => {
    return async () => {
      await deleteReview(id);
      refetchReviews();
    };
  };

  return (
    <div className="main-view">
      <Container className="profile-view">
        <Card>
          <CardBody>
            {!isLoading ? (
              user.role === 'serviceProvider' ? (
                <Row className="m-3">
                  <Col md="4" sm="12">
                    <div>
                      <div className="my-3">
                        <img src={user.avatar ? user.avatar : userImg} alt="Profile" className="profile-img" />
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">First Name:</h5>
                        <p className="card-text">{user.firstName}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Last Name:</h5>
                        <p className="card-text">{user.lastName}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Joined:</h5>
                        <p className="card-text">{getDateFormat(user.createdAt)}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Lives:</h5>
                        <p className="card-text">{user.address}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Email:</h5>
                        <p className="card-text">{user.email}</p>
                      </div>
                    </div>
                  </Col>
                  <Col md="8" sm="12">
                    <div>
                      <div className="mt-2">
                        <h5 className="mb-2">About:</h5>
                        <p className="card-text">{user.description}</p>
                      </div>
                      <hr />
                      <div className="mt-3">
                        <h5 className="mb-2">Experience:</h5>
                        <p className="card-text">{user.experience} years</p>
                      </div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="mt-3">
                            <h5 className="mb-2">From Date:</h5>
                            <p className="card-text">{getDateFormat(user.fromDate)}</p>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="mt-3">
                            <h5 className="mb-2">To Date:</h5>
                            <p className="card-text">{getDateFormat(user.toDate)}</p>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="mt-3">
                        <h5 className="mb-3">Reviews:</h5>
                        {reviews &&
                          reviews.map((review, index) => (
                            <div key={index} className="my-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <div className="d-flex align-items-center">
                                  <div className="avatar me-2">
                                    <img src={review.client?.avatar ? review.client?.avatar : userImg} alt="avatar img" height="50" width="50" />
                                  </div>
                                  <div className="profile-user-info">
                                    <h6 className="mb-0">
                                      {review.client?.firstName} {review.client?.lastName}
                                    </h6>
                                    <small className="text-muted">{getDateFormat(review.createdAt)}</small>
                                    <div className="item-rating">
                                      <ul className="unstyled-list list-inline">{renderStars(review.marks)}</ul>
                                    </div>
                                  </div>
                                </div>

                                {(review.client?._id == curUser._id || curUser.role == 'admin') && (
                                  <div className="d-flex align-items-center">
                                    <Trash2 size={20} className="mr-50 text-danger" onClick={handleDeleteReview(review._id)} />
                                  </div>
                                )}
                              </div>
                              <p className="card-text">{review.description}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </Col>
                </Row>
              ) : (
                <Row className="m-3">
                  <Col md="4" sm="12">
                    <div>
                      <div className="my-3">
                        <img src={user.avatar ? user.avatar : userImg} alt="Profile" className="profile-img" />
                      </div>
                    </div>
                  </Col>
                  <Col md="8" sm="12">
                    <div>
                      <div className="mt-2">
                        <h5 className="mb-0">First Name:</h5>
                        <p className="card-text">{user.firstName}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Last Name:</h5>
                        <p className="card-text">{user.lastName}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Joined:</h5>
                        <p className="card-text">{getDateFormat(user.createdAt)}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Lives:</h5>
                        <p className="card-text">{user.address}</p>
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">Email:</h5>
                        <p className="card-text">{user.email}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              )
            ) : (
              <SpinnerComponent />
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Profile;
