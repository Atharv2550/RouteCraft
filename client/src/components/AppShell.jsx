import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar.jsx';
import Sidebar, { DRAWER_WIDTH } from './Sidebar.jsx';
import Footer from './Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppShell({ children, showSidebar = true }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleMobileNavToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const shouldShowSidebar = showSidebar && isAuthenticated;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar onMobileNavToggle={handleMobileNavToggle} />

      <Box sx={{ display: 'flex', flex: 1 }}>
        {shouldShowSidebar && (
          <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: shouldShowSidebar ? { md: `calc(100% - ${DRAWER_WIDTH}px)` } : '100%',
            overflowX: 'hidden'
          }}
        >
          {children}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

