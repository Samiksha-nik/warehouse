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
const PDFProductTable = ({ products = [] }) => (
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
        <Text style={[styles.tableCell, { flex: 2 }]}>
          {prod.description || ''}
          {prod.subDescription ? `\n${prod.subDescription}` : ''}
        </Text>
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
  </View>
);

// Totals
const PDFTotals = ({ totals = {} }) => (
  <View style={styles.totals}>
    <Text>Taxable Value: {totals.taxableValue || ''}  CGST: {totals.cgst || ''}  SGST: {totals.sgst || ''}  IGST: {totals.igst || ''}  Total GST Amount: {totals.totalGst || ''}  TCS @ {totals.tcsRate || ''}%: {totals.tcs || ''}  Invoice Total: {totals.invoiceTotal || ''}</Text>
  </View>
);

// Bank Details
const PDFBankDetails = ({ bank = {} }) => (
  <View style={styles.bankDetails}>
    <Text>Bank Name: {bank.name || ''}</Text>
    <Text>Beneficiary Name: {bank.beneficiary || ''}</Text>
    <Text>A/C No: {bank.accountNo || ''}</Text>
    <Text>IFSC Code: {bank.ifsc || ''}</Text>
    <Text>Branch: {bank.branch || ''}</Text>
  </View>
);

// Footer
const PDFFooter = ({ company = {} }) => (
  <View style={styles.footer}>
    <Text>{company.corporateAddress || ''}</Text>
  </View>
);

// Main PDF Component
const OrderPDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFHeader company={order.company} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text>Order No.: {order.orderNo}</Text>
        <Text>Delivery Date: {order.deliveryDate}</Text>
        <Text>Date: {order.date}</Text>
      </View>
      <PDFAddressBlock billedTo={order.billedTo} shippedTo={order.shippedTo} />
      <PDFProductTable products={order.products} />
      <PDFTotals totals={order.totals} />
      <PDFBankDetails bank={order.bank} />
      <PDFFooter company={order.company} />
    </Page>
  </Document>
);

export default OrderPDF; 