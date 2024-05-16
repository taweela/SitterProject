import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './views/auth/Login';
import ClientRegister from './views/auth/ClientReigister';
import Layout from './components/Layout';
import ServiceProviderRegister from './views/auth/ServiceProviderRegister';
import Register from './views/auth/Register';
import AdminLogin from './views/auth/AdminLogin';
import Home from './views/Home';
import RequiredUser from './components/RequiredUser';
import Client from './views/admin/Client';
import ServiceProvider from './views/admin/ServiceProvider';
import Profile from './views/profile/Profile';
import ServiceProviderDashboard from './views/dashboard/ServiceProviderDashboard';
import ProviderService from './views/service/ProviderService';
import Error404 from './views/Error404';

const App = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Private Route */}
          <Route element={<RequiredUser allowedRoles={['admin']} />}>
            <Route path="admin/clients" element={<Client />} />
            <Route path="admin/service-providers" element={<ServiceProvider />} />
          </Route>
          <Route element={<RequiredUser allowedRoles={['admin', 'client']} />}>
            <Route path="admin/profile-review/:id" element={<Profile />} />
          </Route>
          <Route element={<RequiredUser allowedRoles={['serviceProvider']} />}>
            <Route path="service-provider/dashboard" element={<ServiceProviderDashboard />} />
            <Route path="service-provider/services" element={<ProviderService />} />
          </Route>
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="client-register" element={<ClientRegister />} />
        <Route path="client-register" element={<ClientRegister />} />
        <Route path="service-provider-register" element={<ServiceProviderRegister />} />

        {/* NotFound Error page */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
};

export default App;
