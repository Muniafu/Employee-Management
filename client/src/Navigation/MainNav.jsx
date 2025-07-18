import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../Context/AuthContext";

import { 
  NavDropdown,
  Nav,
  Navbar,
  Container,
  Badge
} from "react-bootstrap";

import MainHeader from "./MainHeader";
import { getIcon } from "../utils/getIcon";

const NavLinks = ({ link, navIcon, navText, badgeCount }) => {
  return (
    <Nav.Link
      as={Link}
      to={link}
      className="d-flex align-items-center text-white mx-1 mx-lg-2 px-2 px-lg-3 py-2 rounded-3 hover-bg-primary-10"
    >
      <span className="me-2">{getIcon(navIcon)}</span>
      <span className="d-none d-lg-inline">{navText}</span>
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
      <Navbar expand="lg" bg="primary" variant="dark" className="shadow-sm py-2">
        <Container fluid className="px-3 px-lg-4">
          <Navbar.Brand 
            as={Link} 
            to="/" 
            className="fw-bold d-flex align-items-center me-0 me-lg-3"
          >
            <span className="me-2">🏢</span>
            <span className="d-none d-sm-inline">Employee Portal</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="main-navbar" className="border-0" />
          
          <Navbar.Collapse id="main-navbar" className="justify-content-between">
            <Nav className="d-flex align-items-center flex-grow-1">
              {authUser.isLoggedIn && (
                <>
                  <NavLinks 
                    link="/dashboard" 
                    navIcon="dashboard" 
                    navText="Dashboard" 
                  />
                  <NavLinks
                    link="/leave-page"
                    navIcon="leave"
                    navText="Leaves"
                    badgeCount={3}
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
              <Nav className="d-flex align-items-center ms-auto ms-lg-0">
                <NavDropdown
                  title={
                    <div className="d-flex align-items-center text-white">
                      <span className="me-2">👤</span>
                      <span className="d-none d-lg-inline">
                        {authUser.currentUser?.name || 'Account'}
                      </span>
                    </div>
                  }
                  align="end"
                  menuVariant="dark"
                  className="px-2"
                >
                  <NavDropdown.Item 
                    as={Link} 
                    to={`/profile/${authUser.userId}`}
                    className="py-2"
                  >
                    <i className="bi bi-person me-2"></i>View Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item 
                    as={Link} 
                    to="/settings"
                    className="py-2"
                  >
                    <i className="bi bi-gear me-2"></i>Account Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item 
                    onClick={handleLogout}
                    className="py-2 text-danger"
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
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