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
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row
} from 'reactstrap';
import SpinnerComponent from '../../components/SpinnerComponent';
import { useEffect, useState } from 'react';
import userImg from '../../assets/images/user.png';
import { useCreateOrderMutation, useDeleteOrderMutation } from '../../redux/api/orderAPI';
import toast from 'react-hot-toast';
import { useCreateContactMutation } from '../../redux/api/contactAPI';
import { calendarFormateDate, checkFavourite, getDateFormat, getFilterData, removeFilterData, setFilterData } from '../../utils/Utils';
import { useAppSelector } from '../../redux/store';
import Nouislider from 'nouislider-react';
import wNumb from 'wnumb';
import Calendar from './Calendar';
import { useGetProvidersQuery, useManageFavouriteUserMutation } from '../../redux/api/userAPI';
import AddEditEventSidebar from './AddEditEventSidebar';
import { useGetEntitiesQuery } from '../../redux/api/entityAPI';

const ClientServiceProvider = () => {
  const [searchItem, setSearchItem] = useState('');
  const user = useAppSelector((state) => state.userState.user);
  const navigate = useNavigate();
  const [distance, setDistance] = useState(getFilterData('distance') ? JSON.parse(getFilterData('distance')) : [0, 1000]);
  const [price, setPrice] = useState(getFilterData('price') ? JSON.parse(getFilterData('price')) : [0, 100]);
  const [favourite, setFavourite] = useState(getFilterData('favourite') ? JSON.parse(getFilterData('favourite')) : false);
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
  const { data: entities, refetch: entityRefetch } = useGetEntitiesQuery();
  const [manageFavouriteUser] = useManageFavouriteUserMutation();
  const [modalVisibility, setModalVisibility] = useState(false);
  const [calendarApi, setCalendarApi] = useState(null);
  const [events, setEvents] = useState([]);
  const [addSidebarOpen, setAddSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [providerData, setProviderData] = useState();
  const [selectedProviderType, setSelectedProviderType] = useState('');
  const [deleteOrder] = useDeleteOrderMutation();
  const [selectedProvider, setSelectedProvider] = useState({});

  const handleAddEventSidebar = () => setAddSidebarOpen(!addSidebarOpen);

  const queryParams = {
    q: searchItem,
    status: 'active',
    page: page,
    distance: distance,
    price: price,
    selectedTypes: selectedTypes,
    favourite: favourite
  };

  const { data: services, isLoading, refetch } = useGetProvidersQuery(queryParams);
  const handleFilter = (q) => {
    setSearchItem(q);
  };

  useEffect(() => {
    refetch();
    entityRefetch();
  }, [refetch, entityRefetch]);
  const calendarsColor = {
    baby: 'primary',
    house: 'warning',
    dog: 'danger',
    schedule: 'success'
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

  const handleOrder = async (providerId, serviceProvider) => {
    try {
      // Refetch necessary data
      await refetch();

      // Set the selected provider details
      setSelectedProvider(serviceProvider);

      // Initialize an empty list of events
      let eventList = [];

      // Find orders related to the current user and iterate through them
      const userOrders = serviceProvider.order.filter((o) => o.client === user._id);
      userOrders.forEach((order) => {
        eventList.push({
          allDay: false,
          end: calendarFormateDate(order.endDate),
          extendedProps: { calendar: order.type },
          _id: order._id,
          start: calendarFormateDate(order.startDate),
          title: order.title,
          provider: order.provider,
          client: order.client,
          description: order.description,
          entity: order.entity
        });
      });

      // Update state with the new list of events
      setEvents(eventList);

      // Update other relevant states
      setProviderData(providerId);
      setSelectedProviderType(serviceProvider.providerType);

      // Toggle modal visibility
      setModalVisibility(true);

      // Refetch events if applicable
      refetchEvents();
    } catch (error) {
      console.error('Failed to handle order:', error);
    }
  };

  // ** Render pages
  const renderPageItems = () => {
    const arrLength = services && services.serviceProviders.length !== 0 ? Number(services.totalCount) / services.serviceProviders.length : 1;

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
    if (page !== Number(services.totalCount) / services.serviceProviders.length) {
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

  // const handleOrderClick = () => {};

  const handleClose = () => {
    setModalVisibility(!modalVisibility);
  };

  const refetchEvents = () => {
    if (calendarApi !== null) {
      calendarApi.refetchEvents();
    }
  };

  // ** Blank Event Object
  const blankEvent = {
    title: '',
    start: '',
    end: '',
    allDay: false,
    entity: { value: '', label: '', color: 'primary', entype: '' },
    extendedProps: {
      calendar: '',
      description: ''
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
                <div className="my-1">
                  <h6 className="filter-title">Favourite Filter</h6>
                  <ul className="list-unstyled price-range">
                    <li>
                      <div className="form-check">
                        <Input
                          type="checkbox"
                          id="favourite"
                          checked={favourite}
                          onChange={() => {
                            setFilterData('favourite', !favourite);
                            setFavourite(!favourite);
                          }}
                        />
                        <Label className="form-check-label" for="favourite">
                          Favourite
                        </Label>
                      </div>
                    </li>
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
                ) : services && services.serviceProviders.length ? (
                  <div>
                    {services.serviceProviders.map((item, index) => (
                      <Card className="provider-service-card" key={index}>
                        <div className="item-img text-center mx-auto">
                          <Link to={`/client/profile-review/${item.serviceProvider?._id}`}>
                            <img
                              className="img-fluid card-img-top"
                              src={item.serviceProvider?.avatar ? item.serviceProvider?.avatar : userImg}
                              alt={item.serviceProvider?.firstName}
                            />
                          </Link>
                        </div>
                        <CardBody>
                          <h6 className="item-name">
                            <span className="provider-style">
                              {item.serviceProvider?.firstName} {item.serviceProvider?.lastName}
                            </span>
                            {/* </Link> */}
                            <div className="provider-style my-2">{item.serviceProvider?.providerType}</div>
                            <div className="provider-style my-2">Distance: {item.distance} km</div>
                          </h6>
                          <div className="item-wrapper">
                            <div className="item-rating">
                              <ul className="unstyled-list list-inline">{renderStars(item.serviceProvider)}</ul>
                            </div>
                          </div>
                          <CardText className="item-description">{item.serviceProvider.description}</CardText>
                        </CardBody>
                        <div className="item-options text-center">
                          <div className="item-wrapper">
                            <div className="item-cost">
                              <h4 className="item-price mb-2">${item.serviceProvider?.rate}</h4>
                            </div>
                          </div>
                          <Button className="btn-favourite" color="light" onClick={() => handleFavourite(item.serviceProvider?._id)}>
                            <Heart
                              className={classnames('me-50', {
                                'text-danger': checkFavourite(item.serviceProvider?.favourite, user._id)
                              })}
                              size={18}
                              fill={checkFavourite(item.serviceProvider.favourite, user._id) ? 'red' : 'none'}
                            />
                            <span>Favourite</span>
                          </Button>
                          <Button color="primary" className="btn-contact" onClick={() => handleContact(item.serviceProvider?._id)}>
                            <MessageSquare className="me-50" size={18} />
                            <span>Start Chat</span>
                          </Button>
                          <Button color="danger" className="btn-order" onClick={() => handleOrder(item.serviceProvider?._id, item.serviceProvider)}>
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
                        disabled={page === Number(services.totalCount) / services.serviceProviders.length}>
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
        <AddEditEventSidebar
          open={addSidebarOpen}
          calendarApi={calendarApi}
          refetchEvents={refetchEvents}
          calendarsColor={calendarsColor}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          handleAddEventSidebar={handleAddEventSidebar}
          entities={entities}
          events={events}
          setEvents={setEvents}
          createOrder={createOrder}
          providerData={providerData}
          selectedProviderType={selectedProviderType}
          deleteOrder={deleteOrder}
        />
        <Modal className="modal-dialog-centered modal-lg" isOpen={modalVisibility} toggle={() => setModalVisibility(!modalVisibility)}>
          <ModalHeader toggle={() => setModalVisibility(!modalVisibility)}>Order Manage</ModalHeader>
          <ModalBody>
            <Row>
              <Col>
                <div className="mt-0">
                  <span style={{ color: 'red', fontWeight: '600' }}>Working Schedule: </span>
                  {selectedProvider.fromDate ? (
                    <>
                      {getDateFormat(selectedProvider.fromDate)} ~ {getDateFormat(selectedProvider.toDate)}
                    </>
                  ) : (
                    'No Schedule'
                  )}
                </div>
              </Col>
            </Row>
            <Row>
              <Col className="position-relative">
                <Calendar
                  events={events}
                  blankEvent={blankEvent}
                  calendarApi={calendarApi}
                  selectedEvent={selectedEvent}
                  setSelectedEvent={setSelectedEvent}
                  calendarsColor={calendarsColor}
                  setCalendarApi={setCalendarApi}
                  handleAddEventSidebar={handleAddEventSidebar}
                />
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </Container>
    </div>
  );
};

export default ClientServiceProvider;
