import React from 'react';
import AdminProducts from '../admin/AdminProducts';

const EmployeeProducts = () => {
  return <AdminProducts canDelete={false} panelType="employee" />;
};

export default EmployeeProducts;
