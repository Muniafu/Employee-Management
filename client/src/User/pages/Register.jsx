// User/Pages/Register.jsx
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
  Image,
  InputGroup,
  FloatingLabel
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { API } from '../../api/axios';
import { Eye, EyeSlash, Upload } from 'react-bootstrap-icons';
import companyLogo from '../../assets/logo.png';

// Zod validation schema
const registerSchema = z.object({
  name: z.string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  email: z.string()
    .email({ message: "Invalid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(32, { message: "Password must be less than 32 characters" }),
  confirmPassword: z.string(),
  position: z.string()
    .min(1, { message: "Position is required" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      position: 'Developer'
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.warning('Image size should be less than 2MB', {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }
      setImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('position', data.position);
      formData.append('dateOBirth', '1990-01-01'); // Default date of birth
      formData.append('phone', ''); // Default phone number

      if (image) {
        formData.append('image', image);
      }

      await API.auth.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100 py-4">
      <div className="w-100" style={{ maxWidth: '500px' }}>
        {/* Logo/Header */}
        <div className="text-center mb-4">
          <Image 
            src={companyLogo} 
            alt="Company Logo" 
            height="80"
            className="mb-3"
          />
          <h2 className="mb-1">Create Your Account</h2>
          <p className="text-muted">Join our employee management system</p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-sm">
          <Card.Body>
            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}

            {/* Profile Image Upload */}
            <div className="text-center mb-4">
              <Image
                src={imagePreview || '/default-avatar.png'}
                roundedCircle
                width={120}
                height={120}
                className="border mb-2"
                alt="Profile Preview"
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="profileImage"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <Button
                  as="label"
                  htmlFor="profileImage"
                  variant="outline-primary"
                  className="mb-3"
                >
                  <Upload className="me-2" />
                  {image ? 'Change Image' : 'Upload Profile Image'}
                </Button>
                {image && (
                  <p className="small text-muted mb-0">
                    {image.name} ({(image.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Name Field */}
              <FloatingLabel controlId="name" label="Full Name" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Full Name"
                  isInvalid={!!errors.name}
                  {...register('name')}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </FloatingLabel>

              {/* Email Field */}
              <FloatingLabel controlId="email" label="Email Address" className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Email Address"
                  isInvalid={!!errors.email}
                  {...register('email')}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </FloatingLabel>

              {/* Password Field */}
              <FloatingLabel controlId="password" label="Password" className="mb-3">
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    isInvalid={!!errors.password}
                    {...register('password')}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash /> : <Eye />}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </FloatingLabel>

              {/* Confirm Password Field */}
              <FloatingLabel controlId="confirmPassword" label="Confirm Password" className="mb-3">
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    isInvalid={!!errors.confirmPassword}
                    {...register('confirmPassword')}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash /> : <Eye />}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </FloatingLabel>

              {/* Position Field */}
              <FloatingLabel controlId="position" label="Position" className="mb-4">
                <Form.Select
                  isInvalid={!!errors.position}
                  {...register('position')}
                >
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="Other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.position?.message}
                </Form.Control.Feedback>
              </FloatingLabel>

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
                    Registering...
                  </>
                ) : 'Register'}
              </Button>

              {/* Divider */}
              <div className="d-flex align-items-center mb-3">
                <hr className="flex-grow-1" />
                <span className="px-2 text-muted">or</span>
                <hr className="flex-grow-1" />
              </div>

              {/* Already have account */}
              <div className="text-center">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Sign In
                  </Link>
                </p>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Terms and Conditions */}
        <p className="small text-muted text-center mt-3">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </Container>
  );
}