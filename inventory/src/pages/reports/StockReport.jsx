import React, { useState, useEffect } from 'react';
import '../../styles/shared.css';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StockReport = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
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
        length: filters.length,
        width: filters.width
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

  const handleExportExcel = () => {
    if (!stockReportData.length) return;
    const worksheet = XLSX.utils.json_to_sheet(stockReportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StockReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "StockReport.xlsx");
  };

  const handleExportPDF = () => {
    if (!stockReportData.length) return;
    const doc = new jsPDF();
    doc.text('Stock Report', 14, 16);
    const tableColumn = [
      'MUC Number',
      'Product Name',
      'Grade',
      'Unit',
      'Length',
      'Width',
      'Bundle Number',
      'Remaining Quantity',
    ];
    const tableRows = stockReportData.map(item => [
      item.mucNumber,
      item.productName,
      item.grade,
      item.unit,
      item.length,
      item.width,
      item.bundleNumber,
      item.remainingQuantity,
    ]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] },
    });
    doc.save('StockReport.pdf');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Stock Report</h2>
        <p className="page-description">View remaining stock quantities</p>
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

            {/* Length */}
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

            {/* Width */}
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
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px', gap: '10px' }}>
              <button onClick={handleExportExcel} className="btn-secondary">
                Export Excel
              </button>
              <button onClick={handleExportPDF} className="btn-secondary">
                Export PDF
              </button>
            </div>
            <div className="data-table-container">
              <h3>Stock Report Results</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MUC Number</th>
                    <th>Product Name</th>
                    <th>Grade</th>
                    <th>Unit</th>
                    <th>Length</th>
                    <th>Width</th>
                    <th>Bundle Number</th>
                    <th>Remaining Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReportData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.mucNumber}</td>
                      <td>{item.productName}</td>
                      <td>{item.grade}</td>
                      <td>{item.unit}</td>
                      <td>{item.length}</td>
                      <td>{item.width}</td>
                      <td>{item.bundleNumber}</td>
                      <td>{item.remainingQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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