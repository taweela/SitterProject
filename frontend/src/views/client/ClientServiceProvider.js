/* eslint-disable no-unused-vars */
import { Aperture, Heart, MessageSquare, Search, Star } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardText,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row
} from 'reactstrap';
import SpinnerComponent from '../../components/SpinnerComponent';
import { useEffect, useState } from 'react';
import userImg from '../../assets/images/user.png';
import { useCreateOrderMutation } from '../../redux/api/orderAPI';
import toast from 'react-hot-toast';
import { useCreateContactMutation } from '../../redux/api/contactAPI';
import { checkFavourite, getFilterData, removeFilterData, setFilterData } from '../../utils/Utils';
import { useAppSelector } from '../../redux/store';
import { useGetClientServicesQuery, useManageFavouriteUserMutation } from '../../redux/api/serviceAPI';
import Nouislider from 'nouislider-react';
import wNumb from 'wnumb';

const ClientServiceProvider = () => {
  const [searchItem, setSearchItem] = useState('');
  const user = useAppSelector((state) => state.userState.user);
  const navigate = useNavigate();
  const [distance, setDistance] = useState(getFilterData('distance') ? JSON.parse(getFilterData('distance')) : [0, 1000]);
  const [price, setPrice] = useState(getFilterData('price') ? JSON.parse(getFilterData('price')) : [0, 100]);
  const [page, setPage] = useState(1);
  const serviceTypeInitial = [
    {
      type: 'Babysitter',
      value: 'babysitter',
      checked: false
    },
    {
      type: 'Dogsitter',
      value: 'dogsitter',
      checked: false
    },
    {
      type: 'Housekeeper',
      value: 'housekeeper',
      checked: false
    }
  ];
  const [serviceTypes, setServiceTypes] = useState(getFilterData('serviceTypes') ? JSON.parse(getFilterData('serviceTypes')) : serviceTypeInitial);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [createOrder, { isLoading: orderLoading, isError, error, isSuccess }] = useCreateOrderMutation();
  const [createContact] = useCreateContactMutation();
  const [manageFavouriteUser] = useManageFavouriteUserMutation();

  const queryParams = {
    q: searchItem,
    status: 'active',
    page: page,
    distance: distance,
    price: price,
    selectedTypes: selectedTypes
  };
  const { data: services, isLoading } = useGetClientServicesQuery(queryParams);

  const handleFilter = (q) => {
    setSearchItem(q);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">Order Requested successfully!</span>
        </div>,
        {
          duration: 2000,
          position: 'top-right'
        }
      );
    }
    if (isError) {
      console.log(error);
      toast.error(
        <div className="d-flex align-items-center">
          <span className="toast-title">{error.data.message}</span>
        </div>,
        {
          duration: 2000,
          position: 'top-right'
        }
      );
    }
  }, [orderLoading]);

  // ** Handles pagination
  const handlePageChange = (val) => {
    if (val === 'next') {
      setPage(page + 1);
    } else if (val === 'prev') {
      setPage(page - 1);
    } else {
      setPage(val);
    }
  };

  const handleFavourite = (id) => {
    manageFavouriteUser({ id: id });
  };

  const handleOrder = async (providerId, serviceId) => {
    const orderData = {
      provider: providerId,
      service: serviceId
    };
    await createOrder(orderData);
  };

  // ** Render pages
  const renderPageItems = () => {
    const arrLength = services && services.services.length !== 0 ? Number(services.totalCount) / services.services.length : 1;

    return new Array(Math.trunc(arrLength)).fill().map((item, index) => {
      return (
        <PaginationItem key={index} active={page === index + 1} onClick={() => handlePageChange(index + 1)}>
          <PaginationLink href="/" onClick={(e) => e.preventDefault()}>
            {index + 1}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  // ** handle next page click
  const handleNext = () => {
    if (page !== Number(services.totalCount) / services.services.length) {
      handlePageChange('next');
    }
  };

  const renderStars = (item) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <li key={i} className="ratings-list-item me-25">
          <Star key={i} className={i <= item?.averageMarks ? 'filled-star' : 'unfilled-star'} style={{ cursor: 'pointer' }} />
        </li>
      );
    }
    return stars;
  };

  const handleDistanceChange = (values, handle) => {
    setDistance(values);
    setFilterData('distance', values);
  };

  const handlePriceChange = (values, handle) => {
    setPrice(values);
    setFilterData('price', values);
  };

  const handleServiceTypeChange = (e) => {
    const checked = e.target.checked;
    const type = e.target.id;

    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    }
    console.log(type, checked);
    let updatedData = serviceTypes.map((item) => {
      if (item.value === type) {
        return { ...item, checked };
      }
      return item;
    });
    setServiceTypes(updatedData);
    setFilterData('serviceTypes', updatedData);
  };

  const handleContact = async (providerId) => {
    const contactData = {
      provider: providerId
    };
    await createContact(contactData);
    navigate('/client/message');
  };

  const handleClearFilter = () => {
    const removeKeys = ['price', 'distance', 'serviceTypes'];
    removeKeys.forEach((key) => {
      removeFilterData(key);
    });
    setPrice([0, 100]);
    setDistance([0, 1000]);
    setSearchItem('');
    setServiceTypes(serviceTypeInitial);
  };

  return (
    <div className="main-view">
      <Container>
        <Row>
          <Col md="3">
            <Row className="my-4">
              <Col sm="12">
                <h6 className="filter-heading d-none d-lg-block">Filters</h6>
              </Col>
            </Row>
            <Card>
              <CardBody>
                <div className="multi-range-price">
                  <h6 className="filter-title mt-0">Price Range</h6>
                  <div className="my-5">
                    <Nouislider
                      className="range-slider mt-2"
                      direction={'ltr'}
                      start={price}
                      connect={true}
                      tooltips={[true, true]}
                      format={wNumb({
                        decimals: 0
                      })}
                      range={{
                        min: 0,
                        max: 100
                      }}
                      onChange={handlePriceChange}
                    />
                  </div>
                </div>
                <div className="multi-range-distance">
                  <h6 className="filter-title mt-0">Distance Range</h6>
                  <div className="my-5">
                    <Nouislider
                      className="range-slider mt-2"
                      direction={'ltr'}
                      start={distance}
                      connect={true}
                      tooltips={[true, true]}
                      format={wNumb({
                        decimals: 0
                      })}
                      range={{
                        min: 0,
                        max: 1000
                      }}
                      onChange={handleDistanceChange}
                    />
                  </div>
                </div>
                <div className="serviceType">
                  <h6 className="filter-title">Service Type</h6>
                  <ul className="list-unstyled serviceType-list">
                    {serviceTypes.map((serviceType, index) => {
                      return (
                        <li key={index}>
                          <div className="form-check">
                            <Input type="checkbox" id={serviceType.value} checked={serviceType.checked} onChange={handleServiceTypeChange} />
                            <Label className="form-check-label" for={serviceType.value}>
                              {serviceType.type}
                            </Label>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div id="clear-filters">
                  <Button color="primary" block onClick={handleClearFilter}>
                    Clear All Filters
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md="9">
            <Row className="my-3">
              <Col sm="12">
                <InputGroup className="input-group-merge">
                  <Input
                    className="search-provider"
                    placeholder="Search Service Provider"
                    value={searchItem}
                    onChange={(e) => handleFilter(e.target.value ? e.target.value : '')}
                  />
                  <InputGroupText>
                    <Search className="text-muted" size={14} />
                  </InputGroupText>
                </InputGroup>
              </Col>
            </Row>
            <Row className="my-2">
              <Col sm="12">
                {isLoading ? (
                  <SpinnerComponent />
                ) : services && services.services.length ? (
                  <div>
                    {services.services.map((item, index) => (
                      <Card className="provider-service-card" key={index}>
                        <div className="item-img text-center mx-auto">
                          <Link to={`/client/services/view/${item.service?._id}`}>
                            <img className="img-fluid card-img-top" src={userImg} alt={item.service.user[0]?.firstName} />
                          </Link>
                        </div>
                        <CardBody>
                          <h6 className="item-name">
                            <Link className="text-body" to={`/client/services/view/${item.service?._id}`}>
                              <span className="provider-style">{item.service.title}</span>
                            </Link>
                            <div className="my-2">
                              Provider: {item.service.user[0]?.firstName} {item.service.user[0]?.lastName}
                            </div>
                            <div className="provider-style my-2">{item.service.user[0]?.providerType}</div>
                            <div className="provider-style my-2">Distance: {item.distance} km</div>
                          </h6>
                          <div className="item-wrapper">
                            <div className="item-rating">
                              <ul className="unstyled-list list-inline">{renderStars(item.service)}</ul>
                            </div>
                          </div>
                          <CardText className="item-description">{item.service.description}</CardText>
                        </CardBody>
                        <div className="item-options text-center">
                          <div className="item-wrapper">
                            {item.isOrdered && (
                              <div className="mb-3">
                                <Badge color="success" pill>
                                  Ordered
                                </Badge>
                              </div>
                            )}

                            <div className="item-cost">
                              <h4 className="item-price mb-2">${item.service.user[0]?.rate}</h4>
                            </div>
                          </div>
                          <Button className="btn-favourite" color="light" onClick={() => handleFavourite(item.service?._id)}>
                            <Heart
                              className={classnames('me-50', {
                                'text-danger': checkFavourite(item.service?.favourite, user._id)
                              })}
                              size={18}
                              fill={checkFavourite(item.service.favourite, user._id) ? 'red' : 'none'}
                            />
                            <span>Favourite</span>
                          </Button>
                          <Button color="primary" className="btn-contact" onClick={() => handleContact(item.service.user[0]?._id)}>
                            <MessageSquare className="me-50" size={18} />
                            <span>Start Chat</span>
                          </Button>
                          <Button color="danger" className="btn-order" onClick={() => handleOrder(item.service.user[0]?._id, item.service._id)}>
                            <Aperture className="me-50" size={18} />
                            <span>Order</span>
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <Pagination className="d-flex justify-content-center service-provider-pagination mt-2">
                      <PaginationItem disabled={page === 1} className="prev-item" onClick={() => (page !== 1 ? handlePageChange('prev') : null)}>
                        <PaginationLink href="/" onClick={(e) => e.preventDefault()}></PaginationLink>
                      </PaginationItem>
                      {renderPageItems()}
                      <PaginationItem
                        className="next-item"
                        onClick={() => handleNext()}
                        disabled={page === Number(services.totalCount) / services.services.length}>
                        <PaginationLink href="/" onClick={(e) => e.preventDefault()}></PaginationLink>
                      </PaginationItem>
                    </Pagination>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center mt-2">
                    <p>No Results</p>
                  </div>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ClientServiceProvider;
