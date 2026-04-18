/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { StockProvider } from './context/StockContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Reception from './components/Reception';
import Transfer from './components/Transfer';
import Field from './components/Field';
import Reporting from './components/Reporting';
import Settings from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'reception':
        return <Reception />;
      case 'transfer':
        return <Transfer />;
      case 'field':
        return <Field />;
      case 'reporting':
        return <Reporting />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <StockProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </StockProvider>
  );
}
