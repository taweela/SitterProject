/* eslint-disable no-unused-vars */
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { useGetClientDashboardsQuery } from '../../redux/api/dashboardAPI';
import { paymentSum } from '../../utils/Utils';

const ClientDashboard = () => {
  const { data: dashData, isLoading } = useGetClientDashboardsQuery();
  return (
    <div className="main-view">
      {!isLoading && (
        <Container>
          <Row className="my-3">
            <Col>
              <h4 className="main-title">Dashboard</h4>
            </Col>
          </Row>
          <Row className="my-3">
            <Col md="3">
              <Card>
                <CardBody>
                  <h4 className="main-title">Earning</h4>
                  <div className="mt-3 d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
                    <h4>{paymentSum(dashData.payments)}$</h4>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="3">
              <Card>
                <CardBody>
                  <h4 className="main-title">Accept Order</h4>
                  <div className="mt-3 d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
                    <h4>{dashData.acceptedOrders}</h4>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="3">
              <Card>
                <CardBody>
                  <h4 className="main-title">Pending Order</h4>
                  <div className="mt-3 d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
                    <h4>{dashData.pendingOrders}</h4>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="3">
              <Card>
                <CardBody>
                  <h4 className="main-title">Complete Order</h4>
                  <div className="mt-3 d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
                    <h4>{dashData.completedOrders}</h4>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default ClientDashboard;
