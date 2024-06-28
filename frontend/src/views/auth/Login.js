/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Form, FormGroup, Label, Button, Card, CardBody } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import logo1Img from '../../assets/images/logo-1.png';
import toast from 'react-hot-toast';
import { useLoginUserMutation } from '../../redux/api/authAPI';
import { useEffect } from 'react';
import { getUserData } from '../../utils/Utils';
import { Coffee, X } from 'react-feather';
import Avatar from '../../components/Avatar';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [loginUser, { isLoading, isError, error, isSuccess }] = useLoginUserMutation();

  const navigate = useNavigate();

  const onSubmit = (data) => {
    loginUser(data);
  };

  useEffect(() => {
    if (isSuccess) {
      const user = getUserData();
      const userInfo = JSON.parse(user);
      toast(
        (t) => (
          <div className="d-flex">
            <div className="me-2">
              <Avatar size="sm" color="success" icon={<Coffee size={14} />} />
            </div>
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between">
                <h6>{userInfo.firstName}</h6>
                <X size={12} className="cursor-pointer" onClick={() => toast.dismiss(t.id)} />
              </div>
              <span className="small">You have successfully logged in as an {userInfo.role} user to SmartSitter. Now you can start to explore. Enjoy!</span>
            </div>
          </div>
        ),
        {
          duration: 4000,
          position: 'top-right'
        }
      );

      if (userInfo.role == 'client') {
        navigate('/client/dashboard');
      } else if (userInfo.role == 'serviceProvider') {
        navigate('/service-provider/dashboard');
      }
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
    <div className="auth-wrapper auth-v1 px-2 auth-background">
      <div className="auth-inner py-2">
        <Card className="mb-0">
          <CardBody>
            <div className="mb-4 d-flex justify-content-center">
              <img className="logo" src={logo1Img} alt="SmartSitter" />
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
