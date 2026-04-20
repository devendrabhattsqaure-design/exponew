import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';

import { AdminAuthProvider } from 'contexts/AdminAuthContext';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <AdminAuthProvider>
        <ScrollTop>
          <RouterProvider router={router} />
        </ScrollTop>
      </AdminAuthProvider>
    </ThemeCustomization>
  );
}
