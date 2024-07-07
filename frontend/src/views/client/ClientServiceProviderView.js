import { Button, Card, CardBody, CardText, Col, Container, Row } from 'reactstrap';
import classnames from 'classnames';
import { Aperture, MessageSquare, Star } from 'react-feather';
import { useNavigate, useParams } from 'react-router-dom';
import SpinnerComponent from '../../components/SpinnerComponent';
import userImg from '../../assets/images/user.png';
import { useGetServiceQuery } from '../../redux/api/serviceAPI';
import { useCreateContactMutation } from '../../redux/api/contactAPI';

const ClientSeriveProviderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [createContact] = useCreateContactMutation();
  const { data: service, isLoading } = useGetServiceQuery(id);
  console.log(service, '----------');

  const handleContact = async (providerId) => {
    const contactData = {
      provider: providerId
    };
    await createContact(contactData);
    navigate('/client/message');
  };
  return (
    <div className="main-view">
      <Container>
        <Card>
          <CardBody>
            {!isLoading ? (
              <Row className="my-2">
                <Col className="d-flex align-items-start justify-content-center mb-2 mb-md-0" md="3" xs="12">
                  <div className="d-flex align-items-start justify-content-center">
                    <img className="img-fluid product-img" src={userImg} alt={service._id} />
                  </div>
                </Col>
                <Col md="9" xs="12">
                  <h4 className="provider-style">{service.title}</h4>
                  <div className="ecommerce-details-price d-flex flex-wrap mt-1">
                    <p className="item-hourly my-2 mx-1">Hourly Rate: $ {service.user.rate}</p>
                  </div>
                  <div className="my-2">
                    <ul className="unstyled-list list-inline">
                      {new Array(5).fill().map((listItem, index) => {
                        return (
                          <li key={index} className="ratings-list-item me-25">
                            <Star
                              className={classnames({
                                'filled-star': index + 1 <= service.rating,
                                'unfilled-star': index + 1 > service.rating
                              })}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <CardText>
                    Service Type -<span className="text-success ms-25 provider-style">{service.user.providerType}</span>
                  </CardText>
                  <CardText>{service.description}</CardText>
                  <hr />
                  <div className="d-flex flex-column flex-sm-row pt-1">
                    <Button className="btn-cart me-0 me-sm-1 mb-1 mb-sm-0" color="primary" onClick={() => handleContact(service.user?._id)}>
                      <MessageSquare className="me-50" size={14} />
                      Start Chat
                    </Button>
                    <Button color="danger" className="btn-contact move-contact">
                      <Aperture className="me-50" size={18} />
                      <span>Order</span>
                    </Button>
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

export default ClientSeriveProviderView;
