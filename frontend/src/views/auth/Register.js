/* eslint-disable no-unused-vars */
import { Card, CardBody, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import logo1Img from '../../assets/images/logo-1.png';

const Register = () => {
  const onSubmit = (data) => {
    // loginUser(data);
  };

  return (
    <div className="auth-wrapper auth-v1 px-2 auth-background">
      <div className="auth-inner py-2">
        <Card className="mb-0">
          <CardBody>
            <div className="mb-4 d-flex justify-content-center">
              <img className="logo" src={logo1Img} alt="SmartSitter" />
            </div>

            <div className="row">
              <div className="col-12">
                <h1 className="heading-3 form-title">I am going to a ...</h1>
              </div>
            </div>
            <Row className="my-3">
              <Col md="6" sm="12">
                <a href="/client-register">
                  <div className="register-type">Client</div>
                </a>
              </Col>
              <Col md="6" sm="12">
                <a href="/service-provider-register">
                  <div className="register-type">Service Provider</div>
                </a>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Register;
