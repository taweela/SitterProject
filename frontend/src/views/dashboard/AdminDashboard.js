/* eslint-disable no-unused-vars */
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { useGetDashboardsQuery } from '../../redux/api/dashboardAPI';

const AdminDashboard = () => {
  const { data: dashData, isLoading } = useGetDashboardsQuery();
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
            <Col md="4">
              <Card>
                <CardBody>
                  <h4 className="main-title">Orders</h4>
                  <div className="mt-3 d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
                    <h3>{dashData.orders}</h3>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card>
                <CardBody>
                  <h4 className="main-title">Users</h4>
                  <div className="mt-3 d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
                    <h3>{dashData.users}</h3>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card>
                <CardBody>
                  <h4 className="main-title">Reviews</h4>
                  <div className="mt-3 d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
                    <h3>{dashData.reviews}</h3>
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

export default AdminDashboard;
