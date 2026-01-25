import { Bars3Icon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export default function Header({ setSidebarOpen }) {
  const { user, logout } = useAuth();
  const [ dropdownOpen, setDropdownOpen ] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6 shadow-sm">
      <button
        onClick={() => setSidebarOpen(true)}
        className="mr-4 text-gray-600 hover:text-gray-900 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <h1 className="text-lg font-semibold text-gray-800">POS Admin</h1>

      <div className="ml-auto relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 focus:outline-none"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="hidden md:block text-gray-700 font-medium">
            {user?.name || 'User'}
          </span>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-20 lg:hidden" 
              onClick={() => setDropdownOpen(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}