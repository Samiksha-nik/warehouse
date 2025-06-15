import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Label.css';

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
        doc.autoTable({
            head: [columns],
            body: rows.map(row => columns.map(col => row[col] || '')),
            startY: 22,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [37, 99, 235] },
        });
        doc.save('label-data.pdf');
    };

    return (
        <div className="label-container">
            <h1>Label Management</h1>
            <div style={{ marginBottom: 24 }}>
                <button
                    className={`btn-primary${activeTab === 'extract' ? ' active' : ''}`}
                    style={{ marginRight: 12 }}
                    onClick={() => setActiveTab('extract')}
                >
                    Upload & Extract
                </button>
                <button
                    className={`btn-primary${activeTab === 'list' ? ' active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    List
                </button>
            </div>
            {activeTab === 'extract' && (
                <>
                    <div className="pdf-upload-section" style={{ marginBottom: 24 }}>
                        <label htmlFor="pdf-upload" className="pdf-upload-label" style={{ fontWeight: 500, color: '#333', marginRight: 12 }}>Upload PDF:</label>
                        <input
                            type="file"
                            id="pdf-upload"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="form-control"
                            style={{ maxWidth: 300, display: 'inline-block' }}
                        />
                        <button
                            className="btn-primary"
                            style={{ marginLeft: 16 }}
                            onClick={handleUpload}
                            disabled={!selectedFile || loading}
                        >
                            {loading ? 'Uploading...' : 'Upload & Extract'}
                        </button>
                        {selectedFile && !error && (
                            <div className="selected-file" style={{ marginTop: 8, color: '#2563eb', fontWeight: 500 }}>
                                Selected file: {selectedFile.name}
                            </div>
                        )}
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                    </div>
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
                                    <button className="btn-primary" onClick={() => handleExportPDF(set.rows)}>
                                        Export PDF
                                    </button>
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