import { Col, Container, Row } from 'reactstrap';

const ClientDashboard = () => {
  return (
    <div className="main-view">
      <Container>
        <Row className="my-3">
          <Col>
            <h4 className="main-title">Dashboard</h4>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ClientDashboard;
