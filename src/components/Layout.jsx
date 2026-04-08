import SideNavBar from './SideNavBar';
import TopAppBar from './TopAppBar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  // Map paths to titles
  const titleMap = {
    '/': 'Dashboard Overview',
    '/stations': 'Station Infrastructure',
    '/my-stations': 'My Stations',
    '/stations/new': 'Configure Station',
    '/admins': 'User Management',
  };

  // For dynamic paths like /stations/:id
  const getTitle = (path) => {
    if (titleMap[path]) return titleMap[path];
    if (path.startsWith('/stations/') && path.endsWith('/edit')) return 'Configure Station';
    if (path.startsWith('/stations/')) return 'Station Deep Dive';
    return 'Plug Me';
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <SideNavBar />
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <TopAppBar title={getTitle(location.pathname)} />
        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
