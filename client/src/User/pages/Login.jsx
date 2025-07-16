import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../Context/AuthContext";

const FormGroup = ({ register, errors, type, placeholder, label, id, required, pattern, message }) => {
  return (
    <Form.Group className="mb-3" controlId={id}>
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
            message: message,
          },
        })}
      />
      {errors[id] && (
        <Form.Text className="text-danger">
          {errors[id].message}
        </Form.Text>
      )}
    </Form.Group>
  );
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Try logging in as superuser first
      let response = await axios.post("/api/superuser/login", {
        email: data.email,
        password: data.password,
      });

      // If superuser login succeeds
      if (response.data.success) {
        login(
          response.data.token,
          response.data.userId,
          response.data.userName,
          true // isSuperUser
        );
        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
        return;
      }
    } catch (superUserError) {
      // If superuser login fails, try regular user login
      try {
        const userResponse = await axios.post("/api/users/login", {
          email: data.email,
          password: data.password,
        });

        if (userResponse.data.success) {
          login(
            userResponse.data.token,
            userResponse.data.userId,
            userResponse.data.userName,
            false // isSuperUser
          );
          toast.success("Login successful!");
          navigate("/dashboard");
          return;
        }
      } catch (userError) {
        // Handle login failure for both types
        const errorMessage = 
          userError.response?.data?.message || 
          superUserError.response?.data?.message || 
          "Login failed. Please check your credentials.";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-center profile-detail-heading">Login</h2>
      
      <div className="d-flex justify-content-center my-4">
        <Form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4">
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
            placeholder="Enter password"
            label="Password"
            id="password"
            required={true}
            pattern={/^([a-zA-Z0-9@*#$%^&*!]{6,})$/}
            message="Password must be at least 6 characters"
          />
          
            <p className="text-center mt-5">
                Already registered?
                <Link to="/register" className="text-decoration-none">
                  Register...
                </Link>
            </p>
          
          <Button variant="primary" type="submit" className="w-100 p-2 mt-3">
            Login
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;