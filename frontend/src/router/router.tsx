import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Dashboard from '../components/Dashboard/Dashboard';
import LumberTab from '../components/Lumber/LumberTab';
import Account from '../components/Account/Account';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Landing from '../pages/Landing';
import SharedProject from '../pages/SharedProject';
import TermsAndConditions from '../pages/TermsAndConditions';
import { FinishTab, PrivateRoute, ProjectDetails, ProjectTab, SheetGoodTab, ToolTab } from '../components';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/shared/:id',
    element: <SharedProject />,
  },
  {
    path: '/terms',
    element: <TermsAndConditions />,
  },
  {
    path: '/app',
    element: (
      <PrivateRoute>
        <App />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'lumber',
        element: <LumberTab />,
      },
      {
        path: 'finishes',
        element: <FinishTab />,
      },
      {
        path: 'sheet-goods',
        element: <SheetGoodTab />,
      },
      {
        path: 'tools',
        element: <ToolTab />,
      },
      {
        path: 'projects',
        element: <ProjectTab />,
      },
      {
        path: 'projects/:id',
        element: <ProjectDetails />,
      },
      {
        path: 'account',
        element: <Account />,
      },
    ],
  },
]);
