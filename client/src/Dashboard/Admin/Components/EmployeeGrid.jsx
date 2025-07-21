// Dashboard/Admin/Components/EmployeeGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Form, 
  InputGroup, 
  Spinner, 
  Pagination,
  Badge,
  Dropdown
} from 'react-bootstrap';
import { 
  Search, 
  Pencil, 
  Trash, 
  ArrowClockwise,
  ThreeDotsVertical
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API } from '../../../api/axios';
import PropTypes from 'prop-types';

const EmployeeGrid = ({ refreshTrigger, onEmployeeEdit, onEmployeeDelete }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0
  });

  // Fetch employees with pagination and filters
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.admin.getEmployees({
        params: {
        page: pagination.page,
        limit: pagination.pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(positionFilter !== 'all' && { position: positionFilter })
        }
      });

      setEmployees(response.data.employees);
      setPagination(prev => ({
        ...prev,
        totalItems: response.data.totalCount
      }));

    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(error.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, positionFilter, pagination.page, pagination.pageSize]);

  // Delete employee handler
  const handleDelete = async (id) => {
    try {
      await API.admin.deleteEmployee(id);
      toast.success('Employee deleted successfully');
      if (onEmployeeDelete) onEmployeeDelete(id);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPagination(prev => ({
      ...prev,
      pageSize: Number(e.target.value),
      page: 1 // Reset to first page when changing page size
    }));
  };

  // Effect for fetching data
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, refreshTrigger]);

  // Generate pagination items
  const paginationItems = [];
  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);
  
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item
        key={i}
        active={i === pagination.page}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </Pagination.Item>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Employee Directory</h5>
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={fetchEmployees}
            className="me-2"
          >
            <ArrowClockwise size={16} className="me-1" />
            Refresh
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Filters Section */}
        <div className="row mb-3 g-3">
          <div className="col-md-4">
            <InputGroup>
              <InputGroup.Text>
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          <div className="col-md-3">
            <Form.Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </div>
          
          <div className="col-md-3">
            <Form.Select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="all">All Positions</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Manager">Manager</option>
            </Form.Select>
          </div>
          
          <div className="col-md-2">
            <Form.Select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </Form.Select>
          </div>
        </div>

        {/* Employee Table */}
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No employees found
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={employee.image || '/default-avatar.png'}
                            alt={employee.name}
                            className="rounded-circle me-2"
                            width="32"
                            height="32"
                          />
                          {employee.name}
                        </div>
                      </td>
                      <td>{employee.email}</td>
                      <td>{employee.position}</td>
                      <td>
                        <Badge bg={employee.role === 'admin' ? 'primary' : 'secondary'}>
                          {employee.role}
                        </Badge>
                      </td>
                      <td>
                        {new Date(employee.joined).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onEmployeeEdit(employee._id)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this employee?')) {
                                handleDelete(employee._id);
                              }
                            }}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{' '}
                  {pagination.totalItems} employees
                </div>
                <Pagination className="mb-0">
                  <Pagination.First 
                    disabled={pagination.page === 1} 
                    onClick={() => handlePageChange(1)} 
                  />
                  <Pagination.Prev 
                    disabled={pagination.page === 1} 
                    onClick={() => handlePageChange(pagination.page - 1)} 
                  />
                  {paginationItems}
                  <Pagination.Next 
                    disabled={pagination.page === totalPages} 
                    onClick={() => handlePageChange(pagination.page + 1)} 
                  />
                  <Pagination.Last 
                    disabled={pagination.page === totalPages} 
                    onClick={() => handlePageChange(totalPages)} 
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

EmployeeGrid.propTypes = {
  refreshTrigger: PropTypes.any,
  onEmployeeEdit: PropTypes.func.isRequired,
  onEmployeeDelete: PropTypes.func
};

export default EmployeeGrid;