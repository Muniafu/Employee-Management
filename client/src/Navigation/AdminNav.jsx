// Navigation/AdminNav.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navbar, 
  Container, 
  Nav, 
  NavDropdown, 
  Button, 
  Image,
  Offcanvas
} from 'react-bootstrap';
import { 
  BoxArrowRight,
  Gear,
  Person,
  Speedometer2,
  People,
  Calendar,
  ListCheck,
  PersonWorkspace
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from "../Context/useAuth";

const AdminNav = () => {
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
    { path: '/admin/dashboard', icon: <Speedometer2 className="me-2" />, label: 'Dashboard' },
    { path: '/admin/employees', icon: <People className="me-2" />, label: 'Employees' },
    { path: '/admin/leave-requests', icon: <Calendar className="me-2" />, label: 'Leave Requests' },
    { path: '/admin/attendance', icon: <ListCheck className="me-2" />, label: 'Attendance' }
  ];

  return (
    <>
      <Navbar expand="lg" bg="primary" variant="dark" className="shadow-sm">
        <Container fluid>
          {/* Brand/Logo */}
          <Navbar.Brand 
            href="/admin/dashboard" 
            className="d-flex align-items-center"
          >
            <PersonWorkspace size={28} className="me-2" />
            <span className="fw-bold">Admin Portal</span>
          </Navbar.Brand>

          {/* Mobile Toggle Button */}
          <Button
            variant="outline-light"
            className="d-lg-none"
            onClick={() => setShowMobileMenu(true)}
          >
            <span className="navbar-toggler-icon"></span>
          </Button>

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
                  <small className="text-muted">Administrator</small>
                </div>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/admin/profile">
                  <Person className="me-2" /> Profile
                </NavDropdown.Item>
                <NavDropdown.Item href="/admin/settings">
                  <Gear className="me-2" /> Settings
                </NavDropdown.Item>
                <NavDropdown.Item href="/employee/dashboard">
                  <PersonWorkspace className="me-2" /> Switch to Employee View
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

export default AdminNav;