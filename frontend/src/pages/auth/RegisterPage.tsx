import { Button } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toastMessage from '../../lib/toastMessage';
import { useRegisterMutation } from '../../redux/features/authApi';
import { useAppDispatch } from '../../redux/hooks';
import { loginUser } from '../../redux/services/authSlice';
import decodeToken from '../../utils/decodeToken';
import { toast } from 'sonner';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userRegistration] = useRegisterMutation();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    if (data.password !== data.confirmPassword) {
      toastMessage({ icon: 'error', text: 'Password and confirm password must be the same!' });
      return;
    }

    const toastId = toast.loading('Registering your account...');
    try {
      const res = await userRegistration(data).unwrap();
      if (res.statusCode === 201) {
        const user = decodeToken(res.data.token);
        dispatch(loginUser({ token: res.data.token, user }));
        navigate('/');
        toast.success(res.message, { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Registration failed.', { id: toastId });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>⚡</span>
          <h1 className="auth-title">STOCKFLOW</h1>
          <p className="auth-subtitle">Create your manager account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="label">Full Name</label>
            <input
              type="text"
              {...register('name', { required: true })}
              placeholder="Enter your name"
              className={`input-field ${errors['name'] ? 'input-field-error' : ''}`}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className="label">Email Address</label>
            <input
              type="text"
              {...register('email', { required: true })}
              placeholder="Enter email address"
              className={`input-field ${errors['email'] ? 'input-field-error' : ''}`}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="Create password"
              {...register('password', { required: true })}
              className={`input-field ${errors['password'] ? 'input-field-error' : ''}`}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              placeholder="Verify password"
              {...register('confirmPassword', { required: true })}
              className={`input-field ${errors['confirmPassword'] ? 'input-field-error' : ''}`}
              style={{ marginBottom: 0 }}
            />
          </div>

          <Button
            htmlType="submit"
            type="primary"
            style={{
              width: '100%',
              height: '42px',
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: '6px',
            }}
          >
            Register Account
          </Button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
