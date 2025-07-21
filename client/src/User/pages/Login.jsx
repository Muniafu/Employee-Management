// User/Pages/Login.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Spinner,
  Alert,
  Row,
  Col,
  Image
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import companyLogo from '../../assets/logo.png';
import useAuth from '../../Context/useAuth';
import { API } from '../../api/axios';

// Zod schema for form validation
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(32, { message: "Password must be less than 32 characters" })
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {        
      setLoading(true);
      await login(data);
      const response = await API.auth.login({
        email: data.email,
        password: data.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100 py-4">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        {/* Logo/Header */}
        <div className="text-center mb-4">
          <Image 
            src={companyLogo} 
            alt="Company Logo" 
            height="80"
            className="mb-3"
          />
          <h2 className="mb-1">Employee Portal</h2>
          <p className="text-muted">Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-sm">
          <Card.Body>
            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  isInvalid={!!errors.email}
                  {...register('email')}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password Field */}
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  isInvalid={!!errors.password}
                  {...register('password')}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Remember Me & Forgot Password */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Check 
                  type="checkbox" 
                  label="Remember me" 
                />
                <Link to="/forgot-password" className="text-decoration-none">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Signing In...
                  </>
                ) : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="d-flex align-items-center mb-3">
                <hr className="flex-grow-1" />
                <span className="px-2 text-muted">or</span>
                <hr className="flex-grow-1" />
              </div>

              {/* Social Login (optional) */}
              <Button 
                variant="outline-primary" 
                className="w-100 mb-2"
                disabled
              >
                <i className="bi bi-google me-2"></i>
                Sign in with Google
              </Button>
              <Button 
                variant="outline-dark" 
                className="w-100"
                disabled
              >
                <i className="bi bi-microsoft me-2"></i>
                Sign in with Microsoft
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Sign Up Link */}
        <Card className="shadow-sm mt-3">
          <Card.Body className="text-center">
            New to the platform?{' '}
            <Link to="/register" className="text-decoration-none">
              Create an account
            </Link>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}