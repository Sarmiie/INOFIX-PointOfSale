import { 
  HomeIcon, 
  CubeIcon, 
  UserGroupIcon, 
  CreditCardIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/' },
  { name: 'Products', icon: CubeIcon, path: '/products' },
  { name: 'Customers', icon: UserGroupIcon, path: '/customers' },
  { name: 'Transactions', icon: CreditCardIcon, path: '/transactions' },
  { name: 'POS', icon: ComputerDesktopIcon, path: '/pos' },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  return (
    <aside 
      className={`fixed left-0 top-0 z-50 h-screen w-64 bg-gray-800 text-white transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h2 className="text-lg font-bold">POS Admin</h2>
      </div>

      {/* Menu Navigasi */}
      <nav className="mt-4 px-3 flex-1">
        {menuItems.map((item, index) => (
          <div key={item.name}>
            {index === 1 && <hr className="my-3 border-gray-700" />}
            <Link
              to={item.path}
              className={`flex items-center w-full p-3 font-semibold rounded-lg transition-colors mb-2 ${
                location.pathname === item.path
                  ? 'bg-gray-50 text-black'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
}