import { useState } from 'react';
import { useEmployeeContext } from '../contexts/EmployeeContext';
import { PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Avatar from './Avatar';

const EmployeeCard = ({ employee, onEdit, onDelete, onViewPerformance }) => {
  const { performanceStats } = useEmployeeContext();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-md border-indigo-100' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar name={employee.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{employee.name}</h3>
            <p className="text-sm text-gray-500">{employee.department?.name || 'No department'}</p>
            <div className="mt-2 flex items-center">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                {employee.role}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Join Date</p>
            <p className="font-medium">
              {new Date(employee.joinDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Avg. Score</p>
            <p className={`font-medium ${
              performanceStats?.averageScore >= 4 ? 'text-green-600' : 
              performanceStats?.averageScore >= 2.5 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {performanceStats?.averageScore?.toFixed(1) || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className={`bg-gray-50 px-4 py-3 flex justify-end space-x-2 transition-opacity ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <button
          onClick={() => onViewPerformance(employee._id)}
          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md"
          title="View Performance"
        >
          <ChartBarIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onEdit(employee)}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
          title="Edit"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(employee._id)}
          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
          title="Delete"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;