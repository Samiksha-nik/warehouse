import React, { useState } from 'react';
import StockTransferInward from './StockTransferInward';
import StockTransferOutward from './StockTransferOutward';
import '../../styles/shared.css';

const StockTransfer = () => {
  const [activeTab, setActiveTab] = useState('inward-form');

  return (
    <div className="container">
      
      <div className="tabs">
        <button
          className={`tab-button${activeTab === 'inward-form' ? ' active' : ''}`}
          onClick={() => setActiveTab('inward-form')}
        >
          Inward
        </button>
        <button
          className={`tab-button${activeTab === 'inward-list' ? ' active' : ''}`}
          onClick={() => setActiveTab('inward-list')}
        >
          Inward List
        </button>
        <button
          className={`tab-button${activeTab === 'outward-form' ? ' active' : ''}`}
          onClick={() => setActiveTab('outward-form')}
        >
          Outward
        </button>
        <button
          className={`tab-button${activeTab === 'outward-list' ? ' active' : ''}`}
          onClick={() => setActiveTab('outward-list')}
        >
          Outward List
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'inward-form' && (
          <StockTransferInward showForm={true} showList={false} />
        )}
        {activeTab === 'inward-list' && (
          <StockTransferInward showForm={false} showList={true} />
        )}
        {activeTab === 'outward-form' && (
          <StockTransferOutward showForm={true} showList={false} />
        )}
        {activeTab === 'outward-list' && (
          <StockTransferOutward showForm={false} showList={true} />
        )}
      </div>
    </div>
  );
};

export default StockTransfer; 