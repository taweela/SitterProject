/* eslint-disable no-unused-vars */
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
import Error404 from './views/Error404';
import ProviderMessage from './views/messages/ProviderMessage';
import ProviderOrder from './views/order/ProviderOrder';
import ClientServiceProvider from './views/client/ClientServiceProvider';
import ClientDashboard from './views/dashboard/ClientDashboard';
import ClientProfile from './views/profile/ClientProfile';
import ProviderProfile from './views/profile/ProviderProfile';
import ClientMessage from './views/messages/ClientMessage';
import ClientOrder from './views/order/ClientOrder';
import ClientOrderDetail from './views/order/ClientOrderDetail';
import ProviderOrderDetail from './views/order/ProviderOrderDetail';
import AdminDashboard from './views/dashboard/AdminDashboard';
import ForgotPassword from './views/auth/ForgotPassword';
import ResetPassword from './views/auth/ResetPassword';
import Reports from './views/admin/Reports';
import ReportView from './views/admin/ReportView';
import AdminOrder from './views/order/AdminOrder';
import AdminOrderDetail from './views/order/AdminOrderDetail';

const App = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Private Route */}
          <Route element={<RequiredUser allowedRoles={['admin']} />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/clients" element={<Client />} />
            <Route path="admin/service-providers" element={<ServiceProvider />} />
            <Route path="admin/profile-review/:id" element={<Profile />} />
            <Route path="admin/reports" element={<Reports />} />
            <Route path="admin/reports/report-review/:id" element={<ReportView />} />
            <Route path="admin/orders" element={<AdminOrder />} />
            <Route path="admin/orders/detail/:orderNumber" element={<AdminOrderDetail />} />
          </Route>
          <Route element={<RequiredUser allowedRoles={['client']} />}>
            <Route path="client/dashboard" element={<ClientDashboard />} />
            <Route path="client/service-providers" element={<ClientServiceProvider />} />
            <Route path="client/profile-review/:id" element={<Profile />} />
            <Route path="client/orders" element={<ClientOrder />} />
            <Route path="client/orders/detail/:orderNumber" element={<ClientOrderDetail />} />
            <Route path="client/profile" element={<ClientProfile />} />
            <Route path="client/message" element={<ClientMessage />} />
            <Route path="client/profile-review/:id" element={<Profile />} />
          </Route>
          <Route element={<RequiredUser allowedRoles={['serviceProvider']} />}>
            <Route path="service-provider/dashboard" element={<ServiceProviderDashboard />} />
            <Route path="service-provider/orders" element={<ProviderOrder />} />
            <Route path="service-provider/messages" element={<ProviderMessage />} />
            <Route path="service-provider/profile" element={<ProviderProfile />} />
            <Route path="service-provider/orders/detail/:orderNumber" element={<ProviderOrderDetail />} />
          </Route>
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="client-register" element={<ClientRegister />} />
        <Route path="service-provider-register" element={<ServiceProviderRegister />} />

        {/* NotFound Error page */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
};

export default App;
