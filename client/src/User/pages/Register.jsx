import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../Context/AuthContext";

// FormGroup Component - Reusable form field generator
const FormGroup = ({ 
  register, 
  errors, 
  type, 
  placeholder, 
  label, 
  id, 
  required, 
  pattern, 
  message: patternMessage 
}) => {
  return (
    <Form.Group className="mb-3" controlId={id}>
      {id === "isSuperUser" ? (
        // Checkbox for admin rights
        <Form.Check
          type="checkbox"
          label="Admin rights?"
          {...register(id)}
        />
      ) : (
        <>
          <Form.Label className="fw-bold">{label}</Form.Label>
          <Form.Control
            type={type}
            placeholder={placeholder}
            {...register(id, {
              required: {
                value: required,
                message: "This field is required",
              },
              pattern: pattern && {
                value: pattern,
                message: patternMessage,
              },
            })}
          />
        </>
      )}
      {/* Show validation error if exists */}
      {errors[id] && (
        <Form.Text className="text-danger">
          {errors[id].message}
        </Form.Text>
      )}
    </Form.Group>
  );
};

// Register Component - Main form for employee registration
const Register = () => {
  // Form handling using react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Get authentication context
  const authUser = useContext(AuthContext);

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      // Prepare data
      const formData = {
        email: data.email,
        password: data.password,
        name: data.name,
        position: data.position,
        phone: data.phone,
        isSuperUser: data.isSuperUser || false,
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      };

      // Determine API endpoint based on user type
      const url = authUser.isSuperUser
        ? "/api/superuser/users"
        : "/api/users/register";

        // Prepare headers
        const headers = {
        "Content-Type": "application/json",
        };

        // Add authorization only for superuser
        if (authUser.isSuperUser) {
          headers.Authorization = `Bearer ${authUser.token}`;
        }

        // API call
        const response = await axios.post(url, formData, { headers });

      // Show success notification
      toast.success(response.data.message);

    if (response.data.success) {
        // Redirect to login for new users
        if (!authUser.isSuperUser) {
          window.location.href = "/login";
        }else {
            // Refresh for superuser adding employees
            window.location.reload();
        }
    }
    } catch (error) {
      // Improved error handling
      let errorMessage = error.response?.data?.message || "Registration failed";
      
      if (error.response) {
        if (error.response.data?.errors) {
          errorMessage = error.response.data.errors.map(e => e.msg).join(", ");
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-center profile-detail-heading">
        {authUser.isSuperUser ? "Register New Employee" : "Create Account"}
        </h2>
      
      <div className="d-flex justify-content-center my-4">
        <Form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4">
          <div className="row">
            {/* Left Column Fields */}
            <div className="col-12 col-md-6">
              <FormGroup
                register={register}
                errors={errors}
                type="text"
                placeholder="Enter full name"
                label="Full Name"
                id="name"
                required={true}
              />
              
              <FormGroup
                register={register}
                errors={errors}
                type="email"
                placeholder="user@company.com"
                label="Email Address"
                id="email"
                required={true}
                pattern={/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/}
                message="Please enter valid email"
              />
              
              <FormGroup
                register={register}
                errors={errors}
                type="password"
                placeholder="Create password"
                label="Password"
                id="password"
                required={true}
                pattern={/^([a-zA-Z0-9@*#$%^&*!]{8,})$/}
                message="Password must contain at least 8 characters"
                autoComplete="new-password"
              />

              <FormGroup
                register={register}
                errors={errors}
                type="password"
                placeholder="Confirm password"
                label="Confirm Password"
                id="confirmPassword"
                required={true}
                validate={(value) => 
                    value === watch('password') || "Passwords don't match"
                }
                autoComplete="new-password"
                />              
              
              <FormGroup
                register={register}
                errors={errors}
                type="text"
                placeholder="Job position"
                label="Position"
                id="position"
                required={true}
              />
              
              <FormGroup
                register={register}
                errors={errors}
                type="date"
                label="Date Of Birth"
                id="dateOfBirth"
                required={true}
              />
              
              <FormGroup
                register={register}
                errors={errors}
                type="tel"
                placeholder="+91 9876543210"
                label="Phone Number"
                id="phone"
                required={true}
                pattern={/^[+][0-9]{1,3}[ ]?[0-9]{5,15}$/}
                message="Enter valid phone number with country code"
              />
              
              {authUser.isSuperUser && (
                <FormGroup
                  register={register}
                  errors={errors}
                  type="checkbox"
                  id="isSuperUser"
                />
              )}
            </div>
            <p className="text-center mt-5">
                Already registered?
                <Link to="/login" className="text-decoration-none">
                  Login...
                </Link>
            </p>
          </div>
          
          <Button variant="primary" type="submit" className="w-100 p-2 mt-3">
            {authUser.isSuperUser ? "Register Employee" : "Create Account"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Register;