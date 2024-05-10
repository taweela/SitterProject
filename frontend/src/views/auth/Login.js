/* eslint-disable no-unused-vars */
import { Form, FormGroup, Label, Button, Card, CardBody } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import logo1Img from '../../assets/images/logo-1.png';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = (data) => {
    // loginUser(data);
  };

  return (
    <div className="auth-wrapper auth-v1 px-2 auth-background">
      <div className="auth-inner py-2">
        <Card className="mb-0">
          <CardBody>
            <div className="mb-4 d-flex justify-content-center">
              <img className="logo" src={logo1Img} alt="BabySitter" />
            </div>

            <div className="row">
              <div className="col-12">
                <h1 className="heading-3 form-title">Login your account</h1>
              </div>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
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
              <div className="mt-4">
                <Button color="danger" className="btn-block w-100" type="submit">
                  LOGIN
                </Button>
              </div>
              <div className="mt-4 d-flex justify-content-center">
                <p>
                  Not a member? Sign up as a{' '}
                  <Link to="/client-register" className="primary-link">
                    <span>Client</span>
                  </Link>{' '}
                  or{' '}
                  <Link to="/service-provider-register" className="primary-link">
                    <span>Service Provider</span>
                  </Link>
                </p>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
