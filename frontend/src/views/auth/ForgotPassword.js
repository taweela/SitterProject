/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Card, CardBody, Form, FormGroup, Label, Button } from 'reactstrap';
import { useForm } from 'react-hook-form';
import classnames from 'classnames';
import logo1Img from '../../assets/images/logo-1.png';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../../redux/api/authAPI';
import { useEffect } from 'react';

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [forgotPassword, { isLoading, isError, error, isSuccess }] = useForgotPasswordMutation();

  const onSubmit = (data) => {
    forgotPassword(data);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">Password reset link sent to your email.</span>
        </div>,
        {
          duration: 2000,
          position: 'top-right'
        }
      );
    }

    if (isError) {
      toast.error(
        <div className="d-flex align-items-center">
          <span className="toast-title">{error.data}</span>
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

            <div className="row">
              <div className="col-12">
                <h1 className="heading-3 form-title text-center">Forgot Password</h1>
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

              <div className="mt-2">
                <Button color="danger" className="btn-block w-100" type="submit">
                  Send Reset Link
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
