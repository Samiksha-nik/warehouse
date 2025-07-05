import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Label.css';
import { FaFilePdf, FaTrash } from 'react-icons/fa';

const columns = [
  'Product Name',
  'Label Number',
  'Length',
  'Width',
  'Grade',
  'Number of PCS',
  'Total MM',
  'Weight',
  'Remark',
];

const Label = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [activeTab, setActiveTab] = useState('extract');
    const [savedTables, setSavedTables] = useState([]);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [outwardInfo, setOutwardInfo] = useState({ outwardNo: '', date: '' });
    const [showMucs, setShowMucs] = useState({ open: false, mucs: [], title: '' });
    const [mucStatus, setMucStatus] = useState({});

    useEffect(() => {
        if (activeTab === 'list') {
            fetchSavedTables();
        }
    }, [activeTab]);

    useEffect(() => {
        const fetchAllMucStatus = async () => {
            if (!savedTables.length) return;
            const statusObj = {};
            for (const set of savedTables) {
                const mucs = set.rows.map(row => row["Label Number"]);
                try {
                    const res = await axios.post('/pdf-labels/muc-status', { mucs });
                    statusObj[set._id] = {
                        inward: res.data.inward || [],
                        outward: res.data.outward || [],
                        returned: res.data.returned || []
                    };
                } catch (e) {
                    statusObj[set._id] = { inward: [], outward: [], returned: [] };
                }
            }
            setMucStatus(statusObj);
        };
        fetchAllMucStatus();
    }, [savedTables]);

    const fetchSavedTables = async () => {
        try {
            const res = await axios.get('/pdf-labels/list');
            setSavedTables(res.data || []);
        } catch (err) {
            setError('Failed to fetch saved tables.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are allowed.');
                setSelectedFile(null);
            } else {
                setSelectedFile(file);
                setError('');
            }
        } else {
            setSelectedFile(null);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a PDF file to upload.');
            return;
        }
        setLoading(true);
        setError('');
        setTableData([]);
        setOutwardInfo({ outwardNo: '', date: '' });
        try {
            const formData = new FormData();
            formData.append('pdf', selectedFile);
            const response = await axios.post('/pdf-labels/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setTableData(response.data.data || []);
            const outwardRes = await axios.post('/pdf-labels/extract-outward-info', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setOutwardInfo({
                outwardNo: outwardRes.data.outwardNo || '',
                date: outwardRes.data.date || ''
            });
        } catch (err) {
            setError('Failed to extract data or outward info from PDF.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!tableData.length) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await axios.post('/pdf-labels/save', {
                rows: tableData,
                outwardNo: outwardInfo.outwardNo,
                date: outwardInfo.date
            });
            setSuccess('Table saved successfully!');
            setTableData([]);
            setSelectedFile(null);
            setOutwardInfo({ outwardNo: '', date: '' });
        } catch (err) {
            setError('Failed to save table.');
        } finally {
            setSaving(false);
        }
    };

    const handleExportPDF = (rows) => {
        const doc = new jsPDF();
        doc.text('Extracted Label Data', 14, 16);
        const body = rows.map(row => columns.map(col => row[col] || ''));
        // Add the total count row
        body.push(Array(columns.length - 1).fill('')); // Fill all but last cell with empty
        body[body.length - 1][columns.length - 1] = `Total count: ${rows.length}`;
        doc.autoTable({
            head: [columns],
            body,
            startY: 22,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [37, 99, 235] },
        });
        doc.save('label-data.pdf');
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are allowed.');
                setSelectedFile(null);
            } else {
                setSelectedFile(file);
                setError('');
            }
        }
    };
    const fileInputRef = React.useRef();
    const handleBoxClick = () => {
        fileInputRef.current.click();
    };

    // Delete a saved table
    const handleDeleteTable = async (id) => {
        if (!window.confirm('Are you sure you want to delete this table?')) return;
        try {
            await axios.delete(`/pdf-labels/${id}`);
            setSavedTables((prev) => prev.filter((set) => set._id !== id));
        } catch (err) {
            setError('Failed to delete table.');
        }
    };

    // Helper to fetch counts for a set of MUCs (label numbers)
    const fetchCounts = async (mucs) => {
        // You may want to implement API endpoints for these counts. For now, return dummy data.
        // Replace this with real API calls as needed.
        return {
            inward: 0,
            outward: 0,
            returned: 0
        };
    };

    return (
        <div className="label-container">
            <h1>Label Management</h1>
            <div className="label-tabs-row">
                <button
                    className={`btn-primary tab-btn${activeTab === 'extract' ? ' active' : ''}`}
                    onClick={() => setActiveTab('extract')}
                >
                    Upload & Extract
                </button>
                <button
                    className={`btn-primary tab-btn${activeTab === 'list' ? ' active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    List
                </button>
            </div>
            {activeTab === 'extract' && (
                <>
                    <div
                        className={`pdf-drag-upload${dragActive ? ' drag-active' : ''}`}
                        onClick={handleBoxClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="pdf-upload"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                        <FaFilePdf size={48} color="#a78bfa" style={{ marginBottom: 12 }} />
                        <div className="drag-upload-text">Click to select a PDF</div>
                        <div className="drag-upload-note">Max size: 10MB</div>
                        {selectedFile && !error && (
                            <div className="selected-file-info">Selected file: {selectedFile.name}</div>
                        )}
                    </div>
                    <button
                        className="btn-primary upload-btn"
                        onClick={handleUpload}
                        disabled={!selectedFile || loading}
                        style={{ marginTop: 18 }}
                    >
                        {loading ? 'Uploading...' : 'Upload & Extract'}
                    </button>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    {outwardInfo.outwardNo && outwardInfo.date && (
                        <div style={{ margin: '16px 0', color: '#2563eb', fontWeight: 500 }}>
                            Outward No: {outwardInfo.outwardNo} &nbsp; | &nbsp; Date: {outwardInfo.date}
                        </div>
                    )}
                    {tableData.length > 0 && (
                        <>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {columns.map((col) => (
                                                <th key={col}>{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((row, idx) => (
                                            <tr key={idx}>
                                                {columns.map((col, cidx) => (
                                                    <td key={cidx}>{row[col] || ''}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={columns.length} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                                Total: {tableData.length}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <button
                                className="btn-primary"
                                style={{ marginTop: 16 }}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Table'}
                            </button>
                        </>
                    )}
                </>
            )}
            {activeTab === 'list' && (
                <div className="table-container">
                    {savedTables.length === 0 ? (
                        <div style={{ color: '#888', padding: 24 }}>No saved tables found.</div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Outward Number</th>
                                    <th>Total Quantity</th>
                                    <th>Inward Count</th>
                                    <th>Outward Count</th>
                                    <th>Return Count</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedTables.map((set, idx) => {
                                    const mucs = set.rows.map(row => row["Label Number"]);
                                    const totalQty = mucs.length;
                                    const status = mucStatus[set._id] || { inward: [], outward: [], returned: [] };
                                    const inwardCount = status.inward.length;
                                    const outwardCount = status.outward.length;
                                    const returnCount = status.returned.length;
                                    return (
                                        <React.Fragment key={set._id || idx}>
                                            <tr>
                                                <td>{set.date ? new Date(set.date).toLocaleDateString() : ''}</td>
                                                <td>{set.outwardNo || ''}</td>
                                                <td style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                                                    onClick={() => setShowMucs({ open: true, mucs: set.rows, title: 'All Product Details in this set' })}>
                                                    {totalQty}
                                                </td>
                                                <td style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                                                    onClick={() => setShowMucs({ open: true, mucs: status.inward, title: 'Inwarded Product Details' })}>
                                                    {inwardCount}
                                                </td>
                                                <td style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                                                    onClick={() => setShowMucs({ open: true, mucs: status.outward, title: 'Outwarded Product Details' })}>
                                                    {outwardCount}
                                                </td>
                                                <td style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                                                    onClick={() => setShowMucs({ open: true, mucs: status.returned, title: 'Returned Product Details' })}>
                                                    {returnCount}
                                                </td>
                                                <td>
                                                    <button className="btn-danger list-action-btn" title="Delete Table" onClick={() => handleDeleteTable(set._id)}>
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {showMucs.open && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                            onClick={() => setShowMucs({ open: false, mucs: [], title: '' })}>
                            <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 900 }} onClick={e => e.stopPropagation()}>
                                <h3 style={{ marginBottom: 16 }}>{showMucs.title || 'Product Details in this set'}</h3>
                                <div className="table-container" style={{ maxHeight: 400, overflowY: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th>Label Number</th>
                                                <th>Length</th>
                                                <th>Width</th>
                                                <th>Grade</th>
                                                <th>Number of PCS</th>
                                                <th>Total MM</th>
                                                <th>Weight</th>
                                                <th>Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {showMucs.mucs.map((row, i) => (
                                                <tr key={i}>
                                                    <td>{row["productName"] || row["Product Name"]}</td>
                                                    <td>{row["mucNumber"] || row["Label Number"]}</td>
                                                    <td>{row["length"] || row["Length"]}</td>
                                                    <td>{row["width"] || row["Width"]}</td>
                                                    <td>{row["grade"] || row["Grade"]}</td>
                                                    <td>{row["quantity"] || row["Number of PCS"]}</td>
                                                    <td>{row["totalMm"] || row["Total MM"]}</td>
                                                    <td>{row["weight"] || row["Weight"]}</td>
                                                    <td>{row["remark"] || row["Remark"]}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={9} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                                    Total: {showMucs.mucs.length}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowMucs({ open: false, mucs: [], title: '' })}>Close</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Label;