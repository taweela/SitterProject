/* eslint-disable no-unused-vars */
import { Heart, Search, Share2, Star } from 'react-feather';
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
  Pagination,
  PaginationItem,
  PaginationLink,
  Row
} from 'reactstrap';
import SpinnerComponent from '../../components/SpinnerComponent';
import { useGetProvidersQuery } from '../../redux/api/userAPI';
import { useState } from 'react';
import userImg from '../../assets/images/user.png';

const ClientServiceProvider = () => {
  const [searchItem, setSearchItem] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = {
    q: searchItem,
    status: 'active',
    page: page
  };
  const { data: provider, isLoading } = useGetProvidersQuery(queryParams);
  console.log(provider);

  const handleFilter = (q) => {
    setSearchItem(q);
  };

  // ** Handles pagination
  const handlePageChange = (val) => {
    console.log(val);
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
  return (
    <div className="main-view">
      <Container>
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
                      <Link to={`/client/service-providers/view/${item._id}`}>
                        <img className="img-fluid card-img-top" src={userImg} alt={item.firstName} />
                      </Link>
                    </div>
                    <CardBody>
                      <h6 className="item-name">
                        <Link className="text-body" to={`/client/service-providers/view/${item._id}`}>
                          <span className="provider-style">
                            {item.firstName} {item.lastName}
                          </span>
                        </Link>
                        <div className="provider-style my-2">{item.providerType}</div>
                      </h6>
                      <div className="item-wrapper">
                        <div className="item-rating">
                          <ul className="unstyled-list list-inline">{renderStars(item)}</ul>
                        </div>
                      </div>
                      <CardText className="item-description">
                        Finding a qualified babysitter takes time and effort. But your reward is knowing that your child is in capable hands. You will want to
                        find someone who is mature and friendly, has common sense, and is genuinely fond of children.
                      </CardText>
                    </CardBody>
                    <div className="item-options text-center">
                      <div className="item-wrapper">
                        <div className="item-cost">
                          <h4 className="item-price mb-2">${item.rate}</h4>
                          {item.hasFreeShipping && (
                            <CardText className="shipping">
                              <Badge color="light-success">Free Shipping</Badge>
                            </CardText>
                          )}
                        </div>
                      </div>
                      <Button className="btn-favourite" color="light" onClick={() => handleFavourite(item._id, item.isInFavourite)}>
                        <Heart
                          className={classnames('me-50', {
                            'text-danger': item.isInFavourite
                          })}
                          size={18}
                        />
                        <span>Favourite</span>
                      </Button>
                      <Button color="primary" className="btn-contact move-contact">
                        <Share2 className="me-50" size={18} />
                        <span>Contact</span>
                      </Button>
                    </div>
                  </Card>
                ))}
                <Pagination className="d-flex justify-content-center service-provider-pagination mt-2">
                  <PaginationItem disabled={page === 1} className="prev-item" onClick={() => (page !== 1 ? handlePageChange('prev') : null)}>
                    <PaginationLink href="/" onClick={(e) => e.preventDefault()}></PaginationLink>
                  </PaginationItem>
                  {renderPageItems()}
                  <PaginationItem className="next-item" onClick={() => handleNext()} disabled={page === Number(provider.totalCount) / provider.users.length}>
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
      </Container>
    </div>
  );
};

export default ClientServiceProvider;
