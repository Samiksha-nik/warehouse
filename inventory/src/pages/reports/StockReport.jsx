import React, { useState, useEffect } from 'react';
import '../../styles/shared.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StockReport = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    categoryName: '',
    productName: '',
    grade: '',
    length: '',
    width: '',
  });
  const [products, setProducts] = useState([]);
  const [grades, setGrades] = useState([]);
  const [stockReportData, setStockReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const productsRes = await axios.get('http://localhost:5000/api/products');
        setProducts(productsRes.data);

        const gradesRes = await axios.get('http://localhost:5000/api/grades');
        setGrades(gradesRes.data);

      } catch (error) {
        console.error('Error fetching master data:', error);
        setError('Error fetching master data. Please try again.');
      }
    };
    fetchMasterData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowResult = async () => {
    setLoading(true);
    setError(null);
    setStockReportData([]);
    try {
      const params = {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        productName: filters.productName,
        grade: filters.grade,
      };

      const response = await axios.get('http://localhost:5000/api/stock-report', { params });
      setStockReportData(response.data);
    } catch (err) {
      console.error('Error fetching stock report:', err);
      setError('Error fetching stock report. Please check filters and try again.');
      setStockReportData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Stock Report</h2>
        <p className="page-description">View comprehensive stock reports</p>
      </div>
      <div className="card">
        <div className="form-container">
          <div className="form-grid">
            {/* From Date */}
            <div className="form-group">
              <label htmlFor="fromDate">From Date</label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            {/* To Date */}
            <div className="form-group">
              <label htmlFor="toDate">To Date</label>
              <input
                type="date"
                id="toDate"
                name="toDate"
                value={filters.toDate}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            {/* Category Name (Optional) */}
            <div className="form-group">
              <label htmlFor="categoryName">Category Name</label>
              <input
                type="text"
                id="categoryName"
                name="categoryName"
                value={filters.categoryName}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter Category Name"
              />
            </div>

            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="productName">Product Name</label>
              <select
                id="productName"
                name="productName"
                value={filters.productName}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product._id} value={product.productName}>
                    {product.productName}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div className="form-group">
              <label htmlFor="grade">Grade</label>
              <select
                id="grade"
                name="grade"
                value={filters.grade}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade._id} value={grade.gradeName}>
                    {grade.gradeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Length (Optional) */}
            <div className="form-group">
              <label htmlFor="length">Length</label>
              <input
                type="number"
                step="0.01"
                id="length"
                name="length"
                value={filters.length}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter Length"
              />
            </div>

            {/* Width (Optional) */}
            <div className="form-group">
              <label htmlFor="width">Width</label>
              <input
                type="number"
                step="0.01"
                id="width"
                name="width"
                value={filters.width}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter Width"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleShowResult} className="btn-primary">
              Show Result
            </button>
          </div>
        </div>

        {loading && <p>Loading stock report...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && stockReportData.length > 0 && (
          <div className="data-table-container">
            <h3>Stock Report Results</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>MUC Number</th>
                  <th>Product Name</th>
                  <th>Grade</th>
                  <th>Unit</th>
                  <th>Net Quantity</th>
                  <th>Bundle Number</th>
                </tr>
              </thead>
              <tbody>
                {stockReportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.mucNumber}</td>
                    <td>{item.productName}</td>
                    <td>{item.grade}</td>
                    <td>{item.unit}</td>
                    <td>{item.netQuantity}</td>
                    <td>{item.bundleNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && stockReportData.length === 0 && (
          <p>No stock data found for the selected filters. Please adjust your criteria and try again.</p>
        )}
      </div>
    </div>
  );
};

export default StockReport;