import { Card, CardBody, CardText, Col, Container, Row } from 'reactstrap';
import { DisplayStatus } from '../../components/DisplayStatus';
import SpinnerComponent from '../../components/SpinnerComponent';
import { useGetOrderNumberQuery } from '../../redux/api/orderAPI';
import { useParams } from 'react-router-dom';
import { getDateFormat } from '../../utils/Utils';

const ClientOrderDetail = () => {
  const { orderNumber } = useParams();
  const { data: order, isLoading } = useGetOrderNumberQuery(orderNumber);
  console.log(order);
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
                        <p className="card-text mb-2">
                          {order.client?.firstName} {order.client?.lastName}
                        </p>
                        <p className="card-text mb-2">{order.client?.email}</p>
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
                        <p className="mb-0">
                          <strong>{order.provider.firstName ? `${order.provider.firstName} ${order.provider.lastName}` : 'Loading...'}</strong>
                        </p>
                        <CardText className="mb-0">
                          <div>Latitude: {order.provider.latitude}</div>
                          <div>Longitude: {order.provider.longitude}</div>
                        </CardText>
                        <small className="mb-1 d-block">{order.provider.address}</small>
                        <p className="mb-0">
                          <strong>Email: {order.provider.email}</strong>
                        </p>
                      </Col>
                    </Row>
                  </CardBody>
                </>
              ) : (
                <SpinnerComponent />
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ClientOrderDetail;
