import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../Context/AuthContext";

const FormGroup = ({ register, errors, type, placeholder, label, id, required, pattern, message }) => {
  const getAutoComplete = () => {
    if (type === "password") {
      return id === "password" ? "current-password" : "new-password";
    }
    return "off";
  };
  return (
    <Form.Group className="mb-4" controlId={id}>
      <Form.Label className="fw-bold text-primary">{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        className="py-2 px-3 border-2"
        autoComplete={getAutoComplete()}
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
        <Form.Text className="text-danger mt-1 d-block">
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
        navigate("/dashboard");
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
    <Container fluid className="bg-gradient-primary-to-secondary min-vh-100 py-5">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Row className="justify-content-center align-items-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 my-5">
            <h2 className="text-center text-primary fw-bold mb-4">Login</h2>
            
            <Form onSubmit={handleSubmit(onSubmit)}>
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
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Check 
                  type="checkbox" 
                  label="Remember me" 
                  className="text-muted"
                />
                <Link 
                  to="/forgot-password" 
                  className="text-decoration-none text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-2 fw-bold rounded-pill shadow-sm"
              >
                Login
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-muted mb-2">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-decoration-none text-primary fw-bold"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;