import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './views/auth/Login';
import ClientRegister from './views/auth/ClientReigister';
import Layout from './components/Layout';
import ServiceProviderRegister from './views/auth/ServiceProviderRegister';
import Register from './views/auth/Register';
import AdminLogin from './views/auth/AdminLogin';
import Home from './views/Home';

const App = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="client-register" element={<ClientRegister />} />
        <Route path="client-register" element={<ClientRegister />} />
        <Route path="service-provider-register" element={<ServiceProviderRegister />} />
      </Routes>
    </Suspense>
  );
};

export default App;
