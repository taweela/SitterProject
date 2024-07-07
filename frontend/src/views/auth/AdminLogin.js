/* eslint-disable no-unused-vars */
import { useEffect } from 'react';
import { Form, FormGroup, Label, Button, Card, CardBody } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import toast from 'react-hot-toast';
import logo1Img from '../../assets/images/logo-1.png';
import { useAdminLoginUserMutation } from '../../redux/api/authAPI';

const AdminLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [adminLoginUser, { isLoading, isError, error, isSuccess }] = useAdminLoginUserMutation();

  const navigate = useNavigate();

  const onSubmit = (data) => {
    adminLoginUser(data);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">Welcome, Success Admin Login!</span>
        </div>,
        {
          duration: 2000,
          position: 'top-right'
        }
      );
      navigate('/admin/clients');
    }

    if (isError) {
      console.log(error.data);
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
  }, [isLoading]);

  return (
    <div className="auth-wrapper auth-v1 px-2 auth-background">
      <div className="auth-inner py-2">
        <Card className="mb-0">
          <CardBody>
            <div className="mb-4 d-flex justify-content-center">
              <img className="logo" src={logo1Img} alt="SmartSitter" />
            </div>

            <div className="row mb-3">
              <div className="col-12">
                <h1 className="heading-3 form-title text-center">Admin Login</h1>
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
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
