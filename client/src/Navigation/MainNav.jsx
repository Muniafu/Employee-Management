import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {AuthContext } from "../Context/AuthContext";

import { 
  NavDropdown,
  Nav,
  Navbar,
  Container,
  Badge
} from "react-bootstrap";

import MainHeader from "./MainHeader";
import getIcon from "../utils/getIcon";

const NavLinks = ({ link, navIcon, navText, badgeCount }) => {
  return (
    <Nav.Link
      as={Link}
      to={link}
      className="d-flex align-items-center text-white mx-2 px-3 py-2 rounded-3"
      style={{
        transition: 'all 0.3s ease',
        ':hover': {
          backgroundColor: 'rgba(255,255,255,0.1)'
        }
      }}
    >
      <span className="me-2">{getIcon(navIcon)}</span>
      {navText}
      {badgeCount > 0 && (
        <Badge pill bg="danger" className="ms-2">
          {badgeCount}
        </Badge>
      )}
    </Nav.Link>
  );
};

function MainNav() {
  const authUser = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser.isLoggedIn) {
      toast.info("Please login to continue");
      navigate("/login");
    } else {
      // Show welcome toast when user logs in
      toast.dismiss();
      toast.success(`Welcome back, ${authUser.currentUser?.name || 'User'}!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-success text-white'
      });
    }
  }, [authUser, navigate]);

  const handleLogout = () => {
    authUser.logout();
    toast.info("You have been logged out", {
      position: "top-right",
      className: 'bg-info text-white'
    });
    navigate("/login");
  };

  return (
    <MainHeader>
      <Navbar expand="lg" bg="primary" variant="dark" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
            <span className="me-2">🏢</span>
            Employee Portal
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="main-navbar" />
          
          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto">
              {authUser.isLoggedIn && (
                <>
                  <NavLinks 
                    link="/" 
                    navIcon="dashboard" 
                    navText="Dashboard" 
                  />
                  <NavLinks
                    link="/leave-page"
                    navIcon="leave"
                    navText="Leaves"
                    badgeCount={3} // Example badge count
                  />
                  <NavLinks
                    link={`/profile/${authUser.userId}`}
                    navIcon="profile"
                    navText="My Profile"
                  />
                </>
              )}
            </Nav>
            
            {authUser.isLoggedIn && (
              <Nav>
                <NavDropdown
                  title={
                    <div className="d-flex align-items-center">
                      <span className="me-2">👤</span>
                      {authUser.currentUser?.name || 'Account'}
                    </div>
                  }
                  align="end"
                  className="text-white"
                >
                  <NavDropdown.Item as={Link} to={`/profile/${authUser.userId}`}>
                    View Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/settings">
                    Account Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item 
                    onClick={handleLogout}
                    className="text-danger"
                  >
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </MainHeader>
  );
}

export default MainNav;