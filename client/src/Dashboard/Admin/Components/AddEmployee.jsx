// Dashboard/Admin/Components/AddEmployee.jsx
import React, { useState } from 'react';
import { Button, Form, Card, Spinner, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { API } from '../../../api/axios';
import PropTypes from 'prop-types';

// Zod schema definition
const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  role: z.enum(['employee', 'admin']),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function AddEmployee({ show, onHide, onEmployeeAdded }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: 'employee',
      position: 'Developer'
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image') formData.append(key, value);
      });

      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('position', data.position);
      formData.append('role', data.role);
      formData.append('dateOfBirth', '1990-01-01'); // Default date, can be changed later
      formData.append('phone', ''); // Optional, can be added later
      formData.append('password', data.password);

      if (image) {
        formData.append('image', image);
      }

      await API.admin.createEmployee(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Employee added successfully!');
      onEmployeeAdded();
      onHide();
    } catch (err) {
      toast.error(err.message || 'Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setImage(null);
    setImagePreview(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={resetForm} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Employee</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            {/* Left Column - Image Upload */}
            <div className="col-md-4 mb-3">
              <Form.Group controlId="formImage">
                <Form.Label>Profile Image</Form.Label>
                <div className="d-flex flex-column align-items-center">
                  <div className="mb-3" style={{ width: '150px', height: '150px' }}>
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="img-thumbnail w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <div className="d-flex justify-content-center align-items-center bg-light w-100 h-100">
                        <i className="bi bi-person-bounding-box fs-1 text-muted"></i>
                      </div>
                    )}
                  </div>
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    isInvalid={!!errors.image}
                  />
                  <Form.Text className="text-muted">
                    Optional. JPG, PNG up to 2MB
                  </Form.Text>
                </div>
              </Form.Group>
            </div>

            {/* Right Column - Form Fields */}
            <div className="col-md-8">
              <div className="row">
                {/* Name */}
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="formName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="John Doe"
                      isInvalid={!!errors.name}
                      {...register('name')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Email */}
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="john@example.com"
                      isInvalid={!!errors.email}
                      {...register('email')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Position */}
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="formPosition">
                    <Form.Label>Position</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Software Engineer"
                      isInvalid={!!errors.position}
                      {...register('position')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.position?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Role */}
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="formRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      isInvalid={!!errors.role}
                      {...register('role')}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.role?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Password */}
                <div className="col-12 mb-3">
                  <Form.Group controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••"
                      isInvalid={!!errors.password}
                      {...register('password')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      At least 6 characters
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={resetForm} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
              <span className="ms-2">Adding...</span>
            </>
          ) : (
            'Add Employee'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

AddEmployee.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onEmployeeAdded: PropTypes.func.isRequired
};