/* eslint-disable no-unused-vars */
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import userImg from '../../assets/images/user.png';
import { useParams } from 'react-router-dom';
import { useGetUserQuery } from '../../redux/api/userAPI';
import SpinnerComponent from '../../components/SpinnerComponent';
import { getDateFormat } from '../../utils/Utils';
import { useGetReviewsQuery } from '../../redux/api/reviewAPI';

const Profile = () => {
  const { id } = useParams();
  const { data: user, isLoading } = useGetUserQuery(id);
  const { data: reviews } = useGetReviewsQuery(id);

  return (
    <div className="main-view">
      <Container>
        <Card>
          <CardBody>
            {!isLoading ? (
              <Row className="m-3">
                <Col md="4" sm="12">
                  <div>
                    <div className="my-3">
                      <img src={userImg} alt="Profile" className="profile-img" />
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
