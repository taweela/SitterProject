/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Label, Row, Spinner } from 'reactstrap';
import { Controller, useForm } from 'react-hook-form';
import classnames from 'classnames';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { isObjEmpty } from '../../utils/Utils';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import moment from 'moment';
import { useGetServiceQuery, useUpdateServiceMutation } from '../../redux/api/serviceAPI';
import { useNavigate, useParams } from 'react-router-dom';

const EditProviderService = () => {
  const { id } = useParams();
  const [isProcessing, setProcessing] = useState(false);
  const [addressObj, setAddressObj] = useState();
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [fromTime, setFromTime] = useState();
  const [toTime, setToTime] = useState('');
  const [providerAddress, setProviderAddress] = useState();
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const [updateService, { isLoading, isError, error, isSuccess }] = useUpdateServiceMutation();
  const { data: service } = useGetServiceQuery(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
    setError,
    control
  } = useForm();

  const serviceTypeOptions = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'hourly', label: 'Hourly' }
  ];

  useEffect(() => {
    if (service && service.type) {
      const selectedOption = serviceTypeOptions.find((option) => option.value == service.type);
      setSelectedType(selectedOption);
    }
  }, [service]);

  useEffect(() => {
    if (service) {
      const fields = ['title', 'description', 'price', 'fromDate', 'toDate', 'fromTime', 'toTime'];
      fields.forEach((field) => setValue(field, service[field]));
      setValue('serviceType', selectedType);
      setProviderAddress(service.address);
    }
  }, [setValue, service, selectedType]);
  const onSubmit = (data) => {
    if (isObjEmpty(errors)) {
      setProcessing(true);
      data.serviceType = data.serviceType.value;
      if (addressObj) {
        if (addressObj.geometry) {
          const { lat, lng } = addressObj.geometry.location;
          const latitude = lat();
          const longitude = lng();
          data.latitude = latitude;
          data.longitude = longitude;
          data.address = addressObj.formatted_address;
        } else {
          data.address = addressObj;
        }
      }
      updateService({ id: id, service: data });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setProcessing(false);
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">Service updated successfully!</span>
        </div>,
        {
          duration: 4000,
          position: 'top-right'
        }
      );
      navigate('/service-provider/services');
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
  }, [isLoading]);
  return (
    <div className="main-view">
      <Container>
        <Row className="my-3">
          <Col>
            <h4 className="main-title">Edit Service</h4>
          </Col>
        </Row>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <Row className="p-2">
                    <Col md="12" sm="12">
                      <FormGroup>
                        <Label className="form-label" for="title">
                          Title*
                        </Label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          className={`form-control ${classnames({ 'is-invalid': errors.title })}`}
                          {...register('title', { required: true })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="12" sm="12">
                      <FormGroup>
                        <Label className="form-label" for="description">
                          Description*
                        </Label>
                        <textarea
                          type="text"
                          id="description"
                          name="description"
                          rows={6}
                          className={`form-control ${classnames({ 'is-invalid': errors.description })}`}
                          {...register('description', { required: true })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup>
                        <Label>Service Type</Label>
                        <Controller
                          name="serviceType"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={serviceTypeOptions}
                              onChange={(value) => {
                                setSelectedType(value);
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        {errors.serviceType && <p className="text-danger mt-1">ServiceType is required.</p>}
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup>
                        <Label className="form-label" for="price">
                          Price*
                        </Label>
                        <input
                          type="text"
                          id="price"
                          name="price"
                          className={`form-control ${classnames({ 'is-invalid': errors.price })}`}
                          {...register('price', {
                            required: true,
                            pattern: {
                              value: /^\d*\.?\d*$/,
                              message: 'Price should be numeric'
                            }
                          })}
                        />
                        {Object.keys(errors).length && errors.price ? <small className="text-danger mt-1">{errors.price.message}</small> : null}
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup>
                        <Label className="form-label" for="fromDate">
                          From Date
                        </Label>
                        <Controller
                          control={control}
                          name="fromDate"
                          rules={{ required: true }}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <Flatpickr
                              {...fieldProps}
                              className={`form-control ${classnames({ 'is-invalid': errors.fromDate })}`}
                              onChange={(date, currentdateString) => {
                                setFromDate(date);
                                onChange(currentdateString);
                              }}
                            />
                          )}
                        />
                        {errors.fromDate && <small className="text-danger mt-1">From Date is required</small>}
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup>
                        <Label className="form-label" for="toDate">
                          To Date
                        </Label>
                        <Controller
                          control={control}
                          name="toDate"
                          rules={{ required: true }}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <Flatpickr
                              {...fieldProps}
                              className={`form-control ${classnames({ 'is-invalid': errors.toDate })}`}
                              onChange={(date, currentdateString) => {
                                setToDate(date);
                                onChange(currentdateString);
                              }}
                            />
                          )}
                        />
                        {errors.toDate && <small className="text-danger mt-1">To Date is required</small>}
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup>
                        <Label className="form-label" for="fromTime">
                          From Time
                        </Label>
                        <Controller
                          control={control}
                          name="fromTime"
                          rules={{ required: true }}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <Flatpickr
                              {...fieldProps}
                              className={`form-control ${classnames({ 'is-invalid': errors.fromTime })}`}
                              onChange={(time) => {
                                const momentDate = moment(time[0]).toDate();
                                setFromTime(moment(momentDate).format('hh:mm A'));
                                onChange(moment(momentDate).format('hh:mm A'));
                              }}
                              options={{
                                enableTime: true,
                                noCalendar: true,
                                dateFormat: 'h:i K'
                              }}
                            />
                          )}
                        />
                        {errors.fromTime && <small className="text-danger mt-1">From Time is required</small>}
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup>
                        <Label className="form-label" for="toTime">
                          To Time
                        </Label>
                        <Controller
                          control={control}
                          name="toTime"
                          rules={{ required: true }}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <Flatpickr
                              {...fieldProps}
                              className={`form-control ${classnames({ 'is-invalid': errors.toTime })}`}
                              onChange={(time) => {
                                const momentDate = moment(time[0]).toDate();
                                setToTime(moment(momentDate).format('hh:mm A'));
                                onChange(moment(momentDate).format('hh:mm A'));
                              }}
                              options={{
                                enableTime: true,
                                noCalendar: true,
                                dateFormat: 'h:i K'
                              }}
                            />
                          )}
                        />
                        {errors.toTime && <small className="text-danger mt-1">To Time is required</small>}
                      </FormGroup>
                    </Col>
                    <Col md="6" sm="12">
                      <FormGroup>
                        <Label className="form-label" for="address">
                          Area
                        </Label>
                        <Autocomplete
                          defaultValue={providerAddress}
                          className={`form-control ${classnames({ 'is-invalid': errors.address })}`}
                          apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                          onChange={(e) => setAddressObj()}
                          onPlaceSelected={(place) => {
                            clearErrors('address');
                            setAddressObj(place);
                          }}
                          options={{
                            types: ['(cities)']
                          }}
                        />
                        {Object.keys(errors).length && errors.address ? <small className="text-danger mt-1">{errors.address.message}</small> : null}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row className="p-2 my-2">
                    <Col sm="12">
                      <FormGroup className="d-flex justify-content-center">
                        <Button type="submit" className="w-25 d-flex align-items-center justify-content-center" color="danger" disabled={isProcessing}>
                          {isProcessing && (
                            <div className="me-1">
                              <Spinner color="light" size="sm" />
                            </div>
                          )}
                          <span>Update Service</span>
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default EditProviderService;
