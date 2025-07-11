import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottom: '1px solid #000',
    paddingBottom: 4,
  },
  logo: {
    width: 80,
    height: 40,
  },
  companyInfo: {
    flex: 1,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 2,
  },
  addressBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  address: {
    width: '48%',
    border: '1px solid #000',
    padding: 4,
  },
  table: {
    display: 'table',
    width: 'auto',
    border: '1px solid #000',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#eee',
    fontWeight: 'bold',
  },
  tableCell: {
    borderRight: '1px solid #000',
    borderBottom: '1px solid #000',
    padding: 2,
    flexGrow: 1,
    textAlign: 'center',
  },
  totals: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bankDetails: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 9,
  },
  footer: {
    marginTop: 12,
    fontSize: 8,
    textAlign: 'center',
    color: '#888',
  },
});

// Header
const PDFHeader = ({ company = {} }) => (
  <View style={styles.header}>
    <Image style={styles.logo} src={company.logoUrl || '/logo.png'} />
    <View style={styles.companyInfo}>
      <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{company.name || ''}</Text>
      <Text>{company.address || ''}</Text>
      <Text>CIN NO: {company.cin || ''}</Text>
      <Text>GSTIN: {company.gstin || ''}</Text>
      <Text>PAN No: {company.pan || ''}</Text>
    </View>
  </View>
);

// Address Block
const PDFAddressBlock = ({ billedTo = {}, shippedTo = {} }) => (
  <View style={styles.addressBlock}>
    <View style={styles.address}>
      <Text style={styles.sectionTitle}>Name and Address of Customer (Billed to):</Text>
      <Text>{billedTo.name || ''}</Text>
      <Text>{billedTo.address || ''}</Text>
      <Text>GSTIN: {billedTo.gstin || ''}</Text>
      <Text>PAN No: {billedTo.pan || ''}</Text>
      <Text>State Name: {billedTo.stateName || ''}</Text>
    </View>
    <View style={styles.address}>
      <Text style={styles.sectionTitle}>Name & Address of Consignee (Shipped to):</Text>
      <Text>{shippedTo.name || ''}</Text>
      <Text>{shippedTo.address || ''}</Text>
      <Text>GSTIN: {shippedTo.gstin || ''}</Text>
      <Text>PAN No: {shippedTo.pan || ''}</Text>
      <Text>State Name: {shippedTo.stateName || ''}</Text>
    </View>
  </View>
);

// Product Table
const PDFProductTable = ({ products = [], userName = '' }) => {
  // Calculate totals
  const totalQty = products.reduce((sum, prod) => sum + (Number(prod.qty) || 0), 0);
  const totalTaxableValue = products.reduce((sum, prod) => sum + (Number(prod.taxableValue) || 0), 0);
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>Sr. No</Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>Description of Goods</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>HSN Code</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Grade</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Length</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Width</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Thickness</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Qty</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Basic</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Taxable Value</Text>
      </View>
      {products.map((prod = {}, idx) => (
        <View style={styles.tableRow} key={idx}>
          <Text style={[styles.tableCell, { flex: 0.5 }]}>{idx + 1}</Text>
          <View style={[styles.tableCell, { flex: 2, textAlign: 'left' }]}> 
            <Text>{prod.description || ''}</Text>
            {prod.subDescription ? <Text>{prod.subDescription}</Text> : null}
            {userName && <Text>{userName}</Text>}
          </View>
          <Text style={[styles.tableCell, { flex: 1 }]}>{prod.hsn || ''}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{prod.grade || ''}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{prod.length || ''}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{prod.width || ''}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{prod.thickness || ''}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{prod.qty || ''}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{prod.basic || ''}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{prod.taxableValue || ''}</Text>
        </View>
      ))}
      {/* Total Row */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { flex: 0.5 }]}></Text>
        <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Total</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
        <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{totalQty}</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
        <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{totalTaxableValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
      </View>
    </View>
  );
};

const PDFTotalsAndBank = ({ totals = {}, bank = {} }) => (
  <View style={{ flexDirection: 'row', marginTop: 8 }}>
    {/* Bank Details (left) */}
    <View style={{ flex: 1 }}>
      <Text>Bank Name : {bank.name || ''}</Text>
      <Text>Beneficiary Name : {bank.beneficiary || ''}</Text>
      <Text>A/C No : {bank.accountNo || ''}</Text>
      <Text>IFSC Code : {bank.ifsc || ''}</Text>
      <Text>Branch : {bank.branch || ''}</Text>
    </View>
    {/* Totals (right) */}
    <View style={{ flex: 1 }}>
      <Text>Taxable Value         {totals.taxableValue || ''}</Text>
      <Text>CGST                 {totals.cgst || ''}</Text>
      <Text>SGST                 {totals.sgst || ''}</Text>
      <Text>IGST                 {totals.igst || ''}</Text>
      <Text>Total GST Amount     {totals.totalGst || ''}</Text>
      <Text>TCS @ {totals.tcsRate || ''}%         {totals.tcs || ''}</Text>
      <Text>Invoice Total        {totals.invoiceTotal || ''}</Text>
    </View>
  </View>
);

const PDFPaymentAndRemarks = ({ paymentTerms = '', invoiceTotal = '', amountInWords = '', remarks = '' }) => (
  <View style={{ marginTop: 8, border: '1px solid #000', borderTop: 0 }}>
    <View style={{ flexDirection: 'row', borderBottom: '1px solid #000' }}>
      <Text style={{ flex: 1, padding: 4, fontWeight: 'bold' }}>Payment Terms:</Text>
      <Text style={{ flex: 1, padding: 4 }}>{paymentTerms}</Text>
    </View>
    <View style={{ flexDirection: 'row', borderBottom: '1px solid #000' }}>
      <Text style={{ flex: 1, padding: 4, fontWeight: 'bold' }}>Invoice Total</Text>
      <Text style={{ flex: 1, padding: 4 }}>{invoiceTotal}</Text>
    </View>
    <View style={{ flexDirection: 'row', borderBottom: '1px solid #000' }}>
      <Text style={{ flex: 1, padding: 4, fontWeight: 'bold' }}>Amount (in words):</Text>
      <Text style={{ flex: 2, padding: 4 }}>{amountInWords}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1, padding: 4, fontWeight: 'bold' }}>Remark:</Text>
      <Text style={{ flex: 2, padding: 4 }}>{remarks}</Text>
    </View>
  </View>
);

// Footer
const PDFFooter = ({ company = {} }) => (
  <View style={styles.footer}>
    <Text>{company.corporateAddress || ''}</Text>
  </View>
);

// Main PDF Component
const OrderPDF = ({ order, userName = '' }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFHeader company={order.company} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text>Order No.: {order.orderNo}</Text>
        <Text>Delivery Date: {order.deliveryDate}</Text>
        <Text>Date: {order.date}</Text>
      </View>
      <PDFAddressBlock billedTo={order.billedTo} shippedTo={order.shippedTo} />
      <PDFProductTable products={order.products} userName={userName} />
      <PDFTotalsAndBank totals={order.totals} bank={order.bank} />
      <PDFPaymentAndRemarks
        paymentTerms={order.paymentTerms}
        invoiceTotal={order.totals?.invoiceTotal}
        amountInWords={order.amountInWords}
        remarks={order.remarks}
      />
      <PDFFooter company={order.company} />
    </Page>
  </Document>
);

export default OrderPDF; 