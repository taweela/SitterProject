/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Card, CardBody, Form, FormGroup, Label, Button } from 'reactstrap';
import { useForm } from 'react-hook-form';
import classnames from 'classnames';
import logo1Img from '../../assets/images/logo-1.png';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../../redux/api/authAPI';
import { useEffect } from 'react';

const ResetPassword = () => {
  const { token } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const [resetPassword, { isLoading, isError, error, isSuccess }] = useResetPasswordMutation();

  const password = watch('password');

  const onSubmit = (data) => {
    if (data.password !== data.confPassword) {
      toast.error('Passwords do not match');
      return;
    }

    resetPassword({ token: token, payload: data });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <div className="d-flex align-items-center">
          <span className="toast-title">Password has been successfully reset.</span>
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
                <h1 className="heading-3 form-title text-center">Reset Password</h1>
              </div>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>New Password</Label>
                <input
                  className={`form-control ${classnames({ 'is-invalid': errors.password })}`}
                  type="password"
                  id="password"
                  {...register('password', {
                    required: 'New Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long'
                    }
                  })}
                />
                {errors.password && <small className="text-danger">{errors.password.message}</small>}
              </FormGroup>
              <FormGroup>
                <Label>Confirm Password</Label>
                <input
                  className={`form-control ${classnames({ 'is-invalid': errors.confPassword })}`}
                  type="password"
                  id="confPassword"
                  {...register('confPassword', {
                    required: 'Confirm Password is required',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confPassword && <small className="text-danger">{errors.confPassword.message}</small>}
              </FormGroup>
              <div className="mt-2">
                <Button color="danger" className="btn-block w-100" type="submit">
                  Reset Password
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
