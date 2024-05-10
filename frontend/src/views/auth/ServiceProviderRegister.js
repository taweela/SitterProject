/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Form, FormGroup, Label, Button, Card, CardBody } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import Autocomplete from 'react-google-autocomplete';
import Select from 'react-select';
import toast from 'react-hot-toast';
import logo1Img from '../../assets/images/logo-1.png';
import { isObjEmpty } from '../../utils/Utils';
import { useEffect, useState } from 'react';
import { useRegisterUserMutation } from '../../redux/api/authAPI';

const ServiceProviderRegister = () => {
  const {
    register,
    setError,
    control,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useForm();

  const [addressObj, setAddressObj] = useState();
  const navigate = useNavigate();
  const [registerUser, { isLoading, isSuccess, error, isError }] = useRegisterUserMutation();

  const onSubmit = (data) => {
    if (!addressObj) {
      errors.address = {};
      setError('address', {
        type: 'manual',
        message: 'Please select an address using the suggested option'
      });
    }
    if (isObjEmpty(errors)) {
      data.address = addressObj;
      data.providerType = data.providerType.value;
      data.role = 'serviceProvider';
      registerUser(data);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">User registered successfully</span>
        </div>,
        {
          duration: 4000,
          position: 'top-right'
        }
      );
      navigate('/login');
    }

    if (isError) {
      toast.error(
        <div className="d-flex align-items-center">
          <span className="toast-title">{error.data}</span>
        </div>,
        {
          duration: 4000,
          position: 'top-right'
        }
      );
    }
  }, [isLoading]);

  const providerTypeOptions = [
    { value: 'babysitter', label: 'Babysitter' },
    { value: 'dogsitter', label: 'Dogsitter' },
    { value: 'housekeeper', label: 'Housekeeper' }
  ];

  return (
    <div className="auth-wrapper auth-v1 px-2 auth-background">
      <div className="register-inner py-2">
        <Card className="mb-0">
          <CardBody>
            <div className="mb-4 d-flex justify-content-center">
              <img className="logo" src={logo1Img} alt="SmartSitter" />
            </div>
            <div className="row">
              <div className="col-12">
                <p className="body-meta">
                  Looking for care?{' '}
                  <Link to="/client-register" className="primary-link">
                    <span className="fw-bold">Sign up as a Client →</span>
                  </Link>
                </p>
                <h1 className="heading-3 form-title">Service Providers, create your account</h1>
                <p className="body-2 md-vertical-spacing">
                  Already have an account?{' '}
                  <a href="/login" className="primary-link">
                    Log in
                  </a>
                </p>
              </div>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-sm-6">
                  <FormGroup>
                    <Label>First Name</Label>
                    <input
                      className={`form-control ${classnames({ 'is-invalid': errors.firstName })}`}
                      type="text"
                      id="firstName"
                      {...register('firstName', { required: true })}
                    />
                    {errors.email && <span className="text-danger">First Name is required.</span>}
                  </FormGroup>
                </div>
                <div className="col-sm-6">
                  <FormGroup>
                    <Label>Last Name</Label>
                    <input
                      className={`form-control ${classnames({ 'is-invalid': errors.lastName })}`}
                      type="text"
                      id="lastName"
                      {...register('lastName', { required: true })}
                    />
                    {errors.email && <span className="text-danger">Last Name is required.</span>}
                  </FormGroup>
                </div>
              </div>

              <FormGroup>
                <Label>Email</Label>
                <input
                  className={`form-control ${classnames({ 'is-invalid': errors.email })}`}
                  type="email"
                  id="email"
                  {...register('email', { required: true })}
                />
                {errors.email && <span className="text-danger">Email is required.</span>}
              </FormGroup>
              <FormGroup>
                <Label>Password</Label>
                <input
                  className={`form-control ${classnames({ 'is-invalid': errors.password })}`}
                  type="password"
                  id="password"
                  {...register('password', { required: true })}
                />
                {errors.password && <span className="text-danger">Password is required.</span>}
              </FormGroup>
              <FormGroup>
                <Label>Address</Label>
                <Autocomplete
                  className="form-control"
                  apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                  onChange={(e) => setAddressObj()}
                  onPlaceSelected={(place) => {
                    clearErrors('address');
                    setAddressObj(place);
                  }}
                  options={{
                    types: ['address']
                  }}
                />
                {Object.keys(errors).length && errors.address ? (
                  <small className="text-danger mt-1">{errors.address.message}</small>
                ) : null}
              </FormGroup>
              <FormGroup>
                <Label>I consider myself a...</Label>
                <Controller
                  name="providerType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Select {...field} options={providerTypeOptions} />}
                />
                {errors.providerType && <p className="text-danger mt-1">ProviderType is required.</p>}
              </FormGroup>
              <div className="mt-4">
                <Button color="danger" className="btn-block w-100" type="submit">
                  SIGN UP
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ServiceProviderRegister;
