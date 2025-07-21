// Navigation/DropdownMenu.jsx
import React from 'react';
import { Dropdown, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../Context/useAuth';
import PropTypes from 'prop-types';

const DropdownMenu = ({ isAdmin }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.info('Logging out...', {
      position: 'top-right',
      autoClose: 2000,
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
    }, 2000);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <NavDropdown 
      title={
        <span className="d-flex align-items-center">
          <i className="bi bi-person-circle me-2"></i>
          My Account
        </span>
      } 
      id="basic-nav-dropdown"
      align="end"
      className="dropdown-menu-end"
    >
      {/* Admin-specific routes */}
      {isAdmin && (
        <>
          <Dropdown.Item 
            onClick={() => handleNavigation('/admin')}
            className="d-flex align-items-center"
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Admin Dashboard
          </Dropdown.Item>
          <Dropdown.Item 
            onClick={() => handleNavigation('/admin/users')}
            className="d-flex align-items-center"
          >
            <i className="bi bi-people-fill me-2"></i>
            User Management
          </Dropdown.Item>
          <Dropdown.Divider />
        </>
      )}

      {/* Common routes */}
      <Dropdown.Item 
        onClick={() => handleNavigation('/profile')}
        className="d-flex align-items-center"
      >
        <i className="bi bi-person-lines-fill me-2"></i>
        My Profile
      </Dropdown.Item>
      <Dropdown.Item 
        onClick={() => handleNavigation('/settings')}
        className="d-flex align-items-center"
      >
        <i className="bi bi-gear-fill me-2"></i>
        Settings
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item 
        onClick={handleLogout}
        className="d-flex align-items-center text-danger"
      >
        <i className="bi bi-box-arrow-right me-2"></i>
        Logout
      </Dropdown.Item>
    </NavDropdown>
  );
};

DropdownMenu.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
};

export default DropdownMenu;