// Navigation/EmployeeNav.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navbar, 
  Container, 
  Nav, 
  NavDropdown, 
  Button, 
  Image,
  Offcanvas,
  Badge
} from 'react-bootstrap';
import { 
  BoxArrowRight,
  Gear,
  Person,
  Speedometer2,
  Calendar,
  PencilSquare,
  Bell
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from "../Context/useAuth";
import PropTypes from 'prop-types';

const EmployeeNav = ({ notificationCount = 0 }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    toast.info('Logging out...', {
      position: 'top-right',
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
    
    setTimeout(() => {
      logout();
      toast.success('Logged out successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
      navigate('/login');
    }, 1000);
  };

  const navItems = [
    { path: '/employee/dashboard', icon: <Speedometer2 className="me-2" />, label: 'Dashboard' },
    { path: '/employee/leave', icon: <Calendar className="me-2" />, label: 'Leave Management' },
    { path: '/employee/profile', icon: <Person className="me-2" />, label: 'My Profile' }
  ];

  return (
    <>
      <Navbar expand="lg" bg="dark" variant="dark" className="shadow-sm">
        <Container fluid>
          {/* Brand/Logo */}
          <Navbar.Brand 
            href="/employee/dashboard" 
            className="d-flex align-items-center"
          >
            <Speedometer2 size={24} className="me-2" />
            <span className="fw-bold">Employee Portal</span>
          </Navbar.Brand>

          {/* Notification and Mobile Toggle */}
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-light" 
              className="position-relative me-2"
              onClick={() => navigate('/employee/notifications')}
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <Badge 
                  pill 
                  bg="danger" 
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline-light"
              className="d-lg-none"
              onClick={() => setShowMobileMenu(true)}
            >
              <span className="navbar-toggler-icon"></span>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {navItems.map((item) => (
                <Nav.Link 
                  key={item.path} 
                  href={item.path}
                  className="mx-1"
                  active={window.location.pathname === item.path}
                >
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>

            {/* User Dropdown */}
            <Nav>
              <Button 
                variant="outline-light" 
                className="me-2 d-none d-lg-inline-flex"
                onClick={() => navigate('/profile/edit')}
              >
                <PencilSquare className="me-1" />
                Edit Profile
              </Button>

              <NavDropdown
                title={
                  <div className="d-flex align-items-center">
                    <Image
                      src={user?.image || '/default-avatar.png'}
                      roundedCircle
                      width={32}
                      height={32}
                      className="me-2"
                    />
                    <span className="d-none d-lg-inline">{user?.name}</span>
                  </div>
                }
                align="end"
                id="basic-nav-dropdown"
                className="dropdown-menu-end"
              >
                <div className="px-4 py-3 text-center">
                  <Image
                    src={user?.image || '/default-avatar.png'}
                    roundedCircle
                    width={64}
                    height={64}
                    className="mb-2"
                  />
                  <h6 className="mb-0">{user?.name}</h6>
                  <small className="text-muted">Employee</small>
                </div>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/employee/profile">
                  <Person className="me-2" /> My Profile
                </NavDropdown.Item>
                <NavDropdown.Item href="/employee/leave/apply">
                  <Calendar className="me-2" /> Apply for Leave
                </NavDropdown.Item>
                <NavDropdown.Item href="/employee/settings">
                  <Gear className="me-2" /> Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <BoxArrowRight className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        className="d-lg-none"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {navItems.map((item) => (
              <Nav.Link
                key={item.path}
                href={item.path}
                className="mb-2"
                onClick={() => setShowMobileMenu(false)}
              >
                {item.icon}
                {item.label}
              </Nav.Link>
            ))}
            <Nav.Link 
              href="/profile/edit"
              className="mb-2"
              onClick={() => setShowMobileMenu(false)}
            >
              <PencilSquare className="me-2" />
              Edit Profile
            </Nav.Link>
            <Nav.Link onClick={handleLogout} className="text-danger">
              <BoxArrowRight className="me-2" />
              Logout
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

EmployeeNav.propTypes = {
  notificationCount: PropTypes.number
};

export default EmployeeNav;