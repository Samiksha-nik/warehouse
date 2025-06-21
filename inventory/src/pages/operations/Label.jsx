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

    useEffect(() => {
        if (activeTab === 'list') {
            fetchSavedTables();
        }
    }, [activeTab]);

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
        try {
            const formData = new FormData();
            formData.append('pdf', selectedFile);
            const response = await axios.post('/pdf-labels/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setTableData(response.data.data || []);
        } catch (err) {
            setError('Failed to extract data from PDF.');
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
            await axios.post('/pdf-labels/save', { rows: tableData });
            setSuccess('Table saved successfully!');
            setTableData([]);
            setSelectedFile(null);
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
                        savedTables.map((set, idx) => (
                            <div key={set._id || idx} style={{ marginBottom: 32, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fafbfc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ fontWeight: 600, color: '#2563eb' }}>Saved Table {savedTables.length - idx}</div>
                                    <div className="saved-table-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-primary list-action-btn" onClick={() => handleExportPDF(set.rows)}>
                                            Export PDF
                                        </button>
                                        <button className="btn-danger list-action-btn" title="Delete Table" onClick={() => handleDeleteTable(set._id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {columns.map((col) => (
                                                <th key={col}>{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {set.rows.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                {columns.map((col, cidx) => (
                                                    <td key={cidx}>{row[col] || ''}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={columns.length} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                                Total: {set.rows.length}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Label;