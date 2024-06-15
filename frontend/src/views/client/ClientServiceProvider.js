/* eslint-disable no-unused-vars */
import { Aperture, Heart, Search, Share2, Star } from 'react-feather';
import { Link } from 'react-router-dom';
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
import { useGetProvidersQuery } from '../../redux/api/userAPI';
import { useEffect, useState } from 'react';
import userImg from '../../assets/images/user.png';
import { useCreateOrderMutation } from '../../redux/api/orderAPI';
import toast from 'react-hot-toast';

const ClientServiceProvider = () => {
  const [searchItem, setSearchItem] = useState('');
  const [distance, setDistance] = useState();
  const [price, setPrice] = useState();
  const [page, setPage] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [createOrder, { isLoading: orderLoading, isError, error, isSuccess }] = useCreateOrderMutation();

  const queryParams = {
    q: searchItem,
    status: 'active',
    page: page,
    distance: distance,
    price: price,
    selectedTypes: selectedTypes
  };
  const { data: provider, isLoading } = useGetProvidersQuery(queryParams);

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
          duration: 4000,
          position: 'top-right'
        }
      );
    }
    if (isError) {
      toast.error(
        <div className="d-flex align-items-center">
          <span className="toast-title">{error.data.message}</span>
        </div>,
        {
          duration: 4000,
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

  const handleFavourite = (id, val) => {
    console.log(id, val);
  };

  const handleOrder = (providerId) => {
    const orderData = {
      provider: providerId
    };
    createOrder(orderData);
  };

  const serviceTypes = [
    {
      type: 'Babysitter',
      value: 'babysitter'
    },
    {
      type: 'Dogsitter',
      value: 'dogsitter'
    },
    {
      type: 'Housekeeper',
      value: 'housekeeper'
    }
  ];

  // ** Render pages
  const renderPageItems = () => {
    const arrLength = provider && provider.users.length !== 0 ? Number(provider.totalCount) / provider.users.length : 1;

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
    if (page !== Number(provider.totalCount) / provider.users.length) {
      handlePageChange('next');
    }
  };

  const renderStars = (item) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i < 3.8) {
        stars.push(
          <li key={i} className="ratings-list-item me-25">
            <Star className="filled-star" />
          </li>
        );
      } else if (i - 3.8 < 1 && i - 3.8 > 0) {
        stars.push(
          <li key={i} className="ratings-list-item me-25">
            <svg width="512" height="512" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#ff9f43"
                d="m12 15.968l4.247 2.377l-.948-4.773l3.573-3.305l-4.833-.573l-2.038-4.419zm0 2.292l-7.053 3.948l1.575-7.928L.588 8.792l8.027-.952L12 .5l3.385 7.34l8.027.952l-5.934 5.488l1.575 7.928z"
              />
            </svg>
          </li>
        );
      } else {
        stars.push(
          <li key={i} className="ratings-list-item me-25">
            <Star className="unfilled-star" />
          </li>
        );
      }
    }
    return stars;
  };

  const handleDistanceChange = (e) => {
    const selectedDistance = e.target.id == 'allDistance' ? null : e.target.id;
    setDistance(selectedDistance);
  };

  const handlePriceChange = (e) => {
    const selectedPrice = e.target.id == 'allPrice' ? null : e.target.id;
    setPrice(selectedPrice);
  };

  const handleServiceTypeChange = (e) => {
    const checked = e.target.checked;
    const type = e.target.id;
    if (checked) {
      // Add type to selected array
      setSelectedTypes([...selectedTypes, type]);
    } else {
      // Remove type from selected array
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    }
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
                  <ul className="list-unstyled price-range" onChange={handlePriceChange}>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="allPrice" name="price-range-radio" defaultChecked />
                        <Label className="form-check-label" for="allPrice">
                          All
                        </Label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="0-10" name="price-range-radio" />
                        <Label className="form-check-label" for="0-10">{`<=$10`}</Label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="10-100" name="price-range-radio" />
                        <Label className="form-check-label" for="10-100">
                          $10-$100
                        </Label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="100-10000" name="price-range-radio" />
                        <Label className="form-check-label" for="100-10000">
                          {`>=$100`}
                        </Label>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="multi-range-distance">
                  <h6 className="filter-title mt-0">Distance Range</h6>
                  <ul className="list-unstyled distance-range" onChange={handleDistanceChange}>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="allDistance" name="distance-range-radio" defaultChecked />
                        <Label className="form-check-label" for="allDistance">
                          All
                        </Label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="0-5" name="distance-range-radio" />
                        <Label className="form-check-label" for="0-5">{`<=5Km`}</Label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="5-10" name="distance-range-radio" />
                        <Label className="form-check-label" for="5-10">
                          5Km-10Km
                        </Label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="10-20" name="distance-range-radio" />
                        <Label className="form-check-label" for="10-20">
                          10Km-20Km
                        </Label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="20-40" name="distance-range-radio" />
                        <Label className="form-check-label" for="20-40">
                          20Km-40Km
                        </Label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check">
                        <Input type="radio" id="40-10000" name="distance-range-radio" />
                        <Label className="form-check-label" for="40>=">
                          {`>=40Km`}
                        </Label>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="serviceType">
                  <h6 className="filter-title">Service Type</h6>
                  <ul className="list-unstyled serviceType-list">
                    {serviceTypes.map((serviceType, index) => {
                      return (
                        <li key={index}>
                          <div className="form-check">
                            <Input type="checkbox" id={serviceType.value} defaultChecked={serviceType.checked} onChange={handleServiceTypeChange} />
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
                  <Button color="primary" block>
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
                ) : provider && provider.users.length ? (
                  <div>
                    {provider.users.map((item, index) => (
                      <Card className="provider-service-card" key={index}>
                        <div className="item-img text-center mx-auto">
                          <Link to={`/client/service-providers/view/${item.user._id}`}>
                            <img className="img-fluid card-img-top" src={userImg} alt={item.user.firstName} />
                          </Link>
                        </div>
                        <CardBody>
                          <h6 className="item-name">
                            <Link className="text-body" to={`/client/service-providers/view/${item.user._id}`}>
                              <span className="provider-style">
                                {item.user.firstName} {item.user.lastName}
                              </span>
                            </Link>
                            <div className="provider-style my-2">{item.user.providerType}</div>
                            <div className="provider-style my-2">Distance: {item.distance} km</div>
                          </h6>
                          <div className="item-wrapper">
                            <div className="item-rating">
                              <ul className="unstyled-list list-inline">{renderStars(item)}</ul>
                            </div>
                          </div>
                          <CardText className="item-description">
                            Finding a qualified babysitter takes time and effort. But your reward is knowing that your child is in capable hands. You will want
                            to find someone who is mature and friendly, has common sense, and is genuinely fond of children.
                          </CardText>
                        </CardBody>
                        <div className="item-options text-center">
                          <div className="item-wrapper">
                            <div className="item-cost">
                              <h4 className="item-price mb-2">${item.user.rate}</h4>
                              {item.user.hasFreeShipping && (
                                <CardText className="shipping">
                                  <Badge color="light-success">Free Shipping</Badge>
                                </CardText>
                              )}
                            </div>
                          </div>
                          <Button className="btn-favourite" color="light" onClick={() => handleFavourite(item.user._id, item.user.isInFavourite)}>
                            <Heart
                              className={classnames('me-50', {
                                'text-danger': item.user.isInFavourite
                              })}
                              size={18}
                            />
                            <span>Favourite</span>
                          </Button>
                          <Button color="primary" className="btn-contact" onClick={() => handleOrder(item.user._id)}>
                            <Share2 className="me-50" size={18} />
                            <span>Contact</span>
                          </Button>
                          <Button color="danger" className="btn-order" onClick={() => handleOrder(item.user._id)}>
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
                        disabled={page === Number(provider.totalCount) / provider.users.length}>
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
