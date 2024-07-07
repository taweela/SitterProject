/* eslint-disable no-unused-vars */
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { DisplayStatus } from '../../components/DisplayStatus';
import SpinnerComponent from '../../components/SpinnerComponent';
import { useGetOrderNumberQuery } from '../../redux/api/orderAPI';
import { useNavigate, useParams } from 'react-router-dom';
import { getDateFormat, paymentSum } from '../../utils/Utils';
import { useForm } from 'react-hook-form';
import classnames from 'classnames';
import { useCreatePaymentMutation } from '../../redux/api/paymentAPI';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateReviewMutation } from '../../redux/api/reviewAPI';
import { Star } from 'react-feather';

const ClientOrderDetail = () => {
  const navigate = useNavigate();
  const { orderNumber } = useParams();
  const { data: order, isLoading, refetch } = useGetOrderNumberQuery(orderNumber);
  const [createPayment, { isLoading: payLoading, isSuccess, isError, error }] = useCreatePaymentMutation();
  const [createReview] = useCreateReviewMutation();
  const [modalVisibility, setModalVisibility] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [totalStars, setTotalStars] = useState(5);
  const {
    register: registerForm1,
    handleSubmit: handleSubmit1,
    formState: { errors: errorsForm1 }
  } = useForm();

  const {
    register: registerForm2,
    handleSubmit: handleSubmit2,
    formState: { errors: errorsForm2 }
  } = useForm();

  const onSubmitPayment = (data) => {
    console.log(data);
    if (data.type == 'hourly') {
      data.amount = parseFloat(data.amount) * order.provider?.rate;
    }
    data.provider = order.provider?._id;
    data.order = order._id;
    createPayment(data);
  };
  useEffect(() => {
    if (isSuccess) {
      navigate('/client/orders');
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
  }, [payLoading]);

  useEffect(() => {
    refetch();
  }, []);

  const onSubmitReview = async (data) => {
    data.client = order.client._id;
    data.provider = order.provider._id;
    data.marks = hoveredStars || selectedStars;
    await createReview(data);
    navigate(`/client/profile-review/${order.provider?._id}`);
  };
  const handleSaveButtonClick = () => {
    handleSubmit2(onSubmitReview)();
  };

  const handleClose = async () => {
    setModalVisibility(!modalVisibility);
  };

  const handleStarHover = (star) => {
    setHoveredStars(star);
  };

  const handleStarClick = (star) => {
    setSelectedStars(star);
  };

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <li key={i} className="ratings-list-item me-25">
          <Star
            key={i}
            onClick={() => handleStarClick(i)}
            onMouseEnter={() => handleStarHover(i)}
            className={i <= (hoveredStars || selectedStars) ? 'filled-star' : 'unfilled-star'}
            style={{ cursor: 'pointer' }}
          />
        </li>
      );
    }
    return stars;
  };

  const handleSubmitOnClick = () => {
    handleSubmit1(onSubmitPayment)();
  };
  return (
    <div className="main-view">
      <Container>
        <Row className="m-3">
          <Col md="10" sm="12">
            <Card>
              {!isLoading ? (
                <>
                  <CardBody className="mt-3 p-3">
                    <Row>
                      <Col className="" lg="8">
                        <h2 className="mb-2">Order #{order.orderNumber}</h2>
                        <div className="card-text mb-2">
                          {order.client?.firstName} {order.client?.lastName}
                        </div>
                        <div className="card-text mb-2">
                          <a href={`/client/profile-review/${order.provider?._id}`}>{order.client?.email}</a>
                        </div>
                      </Col>
                      <Col className=" mt-xl-0 mt-2" lg="4">
                        <div className="invoice-number-date mt-md-0 mt-2">
                          <div className="d-flex align-items-center mb-1">
                            <span className="title">Status: &nbsp;</span>
                            <DisplayStatus status={order.status} />
                          </div>
                          <div className="d-flex align-items-center mb-1">
                            <span className="title">Requested Time: &nbsp;</span>
                            {getDateFormat(order.createdAt)}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <hr className="order-spacing" />
                  <CardBody className="mt-3 p-3">
                    <Row className="d-flex justify-content-between">
                      <Col className="" lg="4">
                        <h5 className="mb-2">Order For:</h5>
                        <div className="mb-0">
                          <strong>{order.provider.firstName ? `${order.provider.firstName} ${order.provider.lastName}` : 'Loading...'}</strong>
                        </div>
                        <small className="mb-1 d-block">{order.provider.address}</small>
                        <div className="mb-0">
                          <strong>Email: {order.provider.email}</strong>
                          {order.status == 'completed' && (
                            <div className="my-2">
                              <Button color="success" className="btn-block btn-sm" type="button" onClick={() => setModalVisibility(!modalVisibility)}>
                                Provide Review
                              </Button>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <hr className="order-spacing" />
                  <CardBody className="p-3 mb-3">
                    {(order.status == 'accepted' || order.status == 'completed') && (
                      <Row className="d-flex justify-content-between">
                        <Col className="" lg="4">
                          <h5 className="mb-2">Payment:</h5>
                          <div className="mb-0">
                            <strong>{order.payments && order.payments.length ? paymentSum(order.payments) : 0}$</strong>
                          </div>
                        </Col>
                      </Row>
                    )}
                    {order.status == 'accepted' && (
                      <Form id="paymentForm" onSubmit={handleSubmit1(onSubmitPayment)}>
                        <Row className="d-flex justify-content-between">
                          <Col className="" md="6">
                            <FormGroup>
                              <Label className="mb-0">Type:</Label>
                              <select
                                type="text"
                                name="type"
                                id="type"
                                className={`form-control ${classnames({ 'is-invalid': errorsForm1.type })}`}
                                {...registerForm1('type', { required: true })}>
                                <option value="fixed">Fixed</option>
                                <option value="hourly">Hourly</option>
                              </select>
                            </FormGroup>
                          </Col>
                          <Col className="" md="6">
                            <FormGroup>
                              <Label className="mb-0">Amount:</Label>
                              <input
                                type="text"
                                id="amount"
                                name="amount"
                                className={`form-control ${classnames({ 'is-invalid': errorsForm1.amount })}`}
                                {...registerForm1('amount', { required: true })}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="12">
                            <Button color="success" className="btn-block btn-sm" type="button" onClick={handleSubmitOnClick}>
                              Pay
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    )}
                  </CardBody>
                </>
              ) : (
                <SpinnerComponent />
              )}
            </Card>
          </Col>
        </Row>
        <Modal isOpen={modalVisibility} toggle={() => setModalVisibility(!modalVisibility)}>
          <ModalHeader toggle={() => setModalVisibility(!modalVisibility)}>Review</ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit2(onSubmitReview)} id="review">
              <FormGroup>
                <Label>Marks</Label>
                <div className="item-rating">
                  <ul className="unstyled-list list-inline">{renderStars()}</ul>
                </div>
              </FormGroup>
              <FormGroup>
                <Label>Review</Label>
                <textarea
                  className={`form-control ${errorsForm2.description ? 'is-invalid' : ''}`}
                  type="text"
                  id="description"
                  rows={6}
                  placeholder="Please input here..."
                  {...registerForm2('description', {
                    required: 'Review is required.'
                  })}></textarea>
                {errorsForm2.description && <span className="text-danger">{errorsForm2.description.message}</span>}
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleSaveButtonClick}>
              Post
            </Button>
            <Button color="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default ClientOrderDetail;
