import { Button } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoginMutation } from '../../redux/features/authApi';
import { useAppDispatch } from '../../redux/hooks';
import { loginUser } from '../../redux/services/authSlice';
import decodeToken from '../../utils/decodeToken';

const LoginPage = () => {
  const [userLogin] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'admin@stockflow.in',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: FieldValues) => {
    const toastId = toast.loading('Authenticating user...');
    try {
      const res = await userLogin(data).unwrap();

      if (res.statusCode === 200) {
        const user = decodeToken(res.data.token);
        dispatch(loginUser({ token: res.data.token, user }));
        navigate('/');
        toast.success('Welcome to Stockflow!', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Login failed. Please check credentials.', { id: toastId });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>⚡</span>
          <h1 className="auth-title">STOCKFLOW</h1>
          <p className="auth-subtitle">Enterprise Inventory Management</p>
        </div>



        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Username / Email</label>
            <input
              type="text"
              {...register('email', { required: true })}
              placeholder="Enter email address"
              className={`input-field ${errors['email'] ? 'input-field-error' : ''}`}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className={`input-field ${errors['password'] ? 'input-field-error' : ''}`}
              {...register('password', { required: true })}
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
            Login to System
          </Button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
