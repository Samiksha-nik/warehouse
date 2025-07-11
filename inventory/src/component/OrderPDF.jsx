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

// 1. Header
const PDFHeader = ({ company = {} }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: 4, marginBottom: 4 }}>
    <Image style={{ width: 80, height: 40 }} src={company.logoUrl || '/logo.png'} />
    <View style={{ flex: 1, textAlign: 'center' }}>
      <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{company.name || ''}</Text>
      <Text>{company.address || ''}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 2 }}>
        <Text style={{ marginRight: 8 }}>CIN NO: {company.cin || ''}</Text>
        <Text style={{ marginRight: 8 }}>GSTIN: {company.gstin || ''}</Text>
        <Text>PAN No: {company.pan || ''}</Text>
      </View>
    </View>
  </View>
);

// 2. Order Info Row
const PDFOrderInfoRow = ({ order = {} }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
    <Text>Order No.: {order.orderNo}</Text>
    <Text>Po No.: {order.poNo}</Text>
    <Text>Delivery Date: {order.deliveryDate}</Text>
    <Text>Date: {order.date}</Text>
  </View>
);

// 3. Address Block
const PDFAddressBlock = ({ billedTo = {}, shippedTo = {} }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
    <View style={{ width: '49%', border: '1px solid #000', padding: 4 }}>
      <Text style={{ fontWeight: 'bold' }}>Name and Address of Customer (Billed to) :</Text>
      <Text>{billedTo.name || ''}</Text>
      <Text>{billedTo.address || ''}</Text>
      <Text>GSTIN: {billedTo.gstin || ''}</Text>
      <Text>PAN No: {billedTo.pan || ''}</Text>
      <Text>State Name: {billedTo.stateName || ''}</Text>
    </View>
    <View style={{ width: '49%', border: '1px solid #000', padding: 4 }}>
      <Text style={{ fontWeight: 'bold' }}>Name & Address of Consignee (Shipped to) :</Text>
      <Text>{shippedTo.name || ''}</Text>
      <Text>{shippedTo.address || ''}</Text>
      <Text>GSTIN: {shippedTo.gstin || ''}</Text>
      <Text>PAN No: {shippedTo.pan || ''}</Text>
      <Text>State Name: {shippedTo.stateName || ''}</Text>
    </View>
  </View>
);

// 4. Product Table
const PDFProductTable = ({ products = [], userName = '' }) => {
  const totalQty = products.reduce((sum, prod) => sum + (Number(prod.qty) || 0), 0);
  const totalTaxableValue = products.reduce((sum, prod) => sum + (Number(prod.taxableValue) || 0), 0);
  return (
    <View style={{ display: 'table', width: 'auto', border: '1px solid #000', marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', backgroundColor: '#eee', fontWeight: 'bold' }}>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 0.5, textAlign: 'center' }}>Sr. No</Text>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 2, textAlign: 'center' }}>Description of Goods</Text>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>HSN Code</Text>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>Grade</Text>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>length</Text>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>Width</Text>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>thickness</Text>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>Qty.</Text>
        <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>Basic Rate</Text>
        <Text style={{ borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>Taxable Value</Text>
      </View>
      {products.map((prod = {}, idx) => (
        <View style={{ flexDirection: 'row' }} key={idx}>
          <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 0.5, textAlign: 'center' }}>{idx + 1}</Text>
          <View style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 2, textAlign: 'left' }}>
            <Text>{prod.description || ''}</Text>
            {prod.subDescription ? <Text>{prod.subDescription}</Text> : null}
            {userName && <Text>{userName}</Text>}
          </View>
          <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>{prod.hsn || ''}</Text>
          <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>{prod.grade || ''}</Text>
          <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>{prod.length || ''}</Text>
          <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>{prod.width || ''}</Text>
          <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>{prod.thickness || ''}</Text>
          <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>{prod.qty || ''}</Text>
          <Text style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>{prod.basic || ''}</Text>
          <Text style={{ borderBottom: '1px solid #000', padding: 2, flex: 1, textAlign: 'center' }}>{prod.taxableValue || ''}</Text>
        </View>
      ))}
      {/* Total Row */}
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ borderRight: '1px solid #000', padding: 2, flex: 0.5 }}></Text>
        <Text style={{ borderRight: '1px solid #000', fontWeight: 'bold', padding: 2, flex: 2 }}>Total</Text>
        <Text style={{ borderRight: '1px solid #000', padding: 2, flex: 1 }}></Text>
        <Text style={{ borderRight: '1px solid #000', padding: 2, flex: 1 }}></Text>
        <Text style={{ borderRight: '1px solid #000', padding: 2, flex: 1 }}></Text>
        <Text style={{ borderRight: '1px solid #000', padding: 2, flex: 1 }}></Text>
        <Text style={{ borderRight: '1px solid #000', padding: 2, flex: 1 }}></Text>
        <Text style={{ borderRight: '1px solid #000', fontWeight: 'bold', padding: 2, flex: 1 }}>{totalQty}</Text>
        <Text style={{ borderRight: '1px solid #000', padding: 2, flex: 1 }}></Text>
        <Text style={{ fontWeight: 'bold', padding: 2, flex: 1 }}>{totalTaxableValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
      </View>
    </View>
  );
};

const PDFTotalsAndBank = ({ totals = {}, bank = {} }) => (
  <View style={{
    flexDirection: 'row',
    border: '1px solid #000',
    marginTop: 8,
    marginBottom: 0,
    minHeight: 80,
  }}>
    {/* Bank Details (left) */}
    <View style={{ flex: 1, borderRight: '1px solid #000', padding: 6, justifyContent: 'flex-start' }}>
      <Text style={{ fontWeight: 'bold' }}>Bank Name : {bank.name || ''}</Text>
      <Text style={{ fontWeight: 'bold' }}>Beneficiary Name : {bank.beneficiary || ''}</Text>
      <Text style={{ fontWeight: 'bold' }}>A/C No : {bank.accountNo || ''}</Text>
      <Text style={{ fontWeight: 'bold' }}>IFSC Code : {bank.ifsc || ''}</Text>
      <Text style={{ fontWeight: 'bold' }}>Branch : {bank.branch || ''}</Text>
    </View>
    {/* Totals (right, as a single-column table with only row borders) */}
    <View style={{ flex: 1, padding: 0, justifyContent: 'flex-start' }}>
      {[
        ['Taxable Value', totals.taxableValue],
        ['CGST', totals.cgst],
        ['SGST', totals.sgst],
        ['IGST', totals.igst],
        ['Total GST Amount', totals.totalGst],
        [`TCS @ ${totals.tcsRate || ''}%`, totals.tcs],
        ['Invoice Total', totals.invoiceTotal, true]
      ].map(([label, value, isBold], idx, arr) => (
        <View
          key={label}
          style={{
            flexDirection: 'row',
            borderBottom: idx < arr.length - 1 ? '1px solid #000' : 'none',
            backgroundColor: isBold ? '#eee' : 'transparent',
            minHeight: 18,
            alignItems: 'center'
          }}
        >
          <Text style={{
            flex: 1,
            padding: 4,
            fontWeight: isBold ? 'bold' : 'normal',
            textAlign: 'left',
            fontSize: 10
          }}>{label}</Text>
          <Text style={{
            flex: 1,
            padding: 4,
            fontWeight: isBold ? 'bold' : 'normal',
            textAlign: 'right',
            fontSize: 10
          }}>{value}</Text>
        </View>
      ))}
    </View>
  </View>
);

const PDFPaymentAndRemarks = ({ paymentTerms = '', invoiceTotal = '', amountInWords = '', remarks = '' }) => (
  <View style={{ border: '1px solid #000', borderTop: 0, marginBottom: 8 }}>
    <View style={{ flexDirection: 'row', borderBottom: '1px solid #000' }}>
      <Text style={{ flex: 1, padding: 4, fontWeight: 'bold' }}>Payment Terms:</Text>
      <Text style={{ flex: 3, padding: 4 }}>{paymentTerms}</Text>
    </View>
    <View style={{ flexDirection: 'row', borderBottom: '1px solid #000' }}>
      <Text style={{ flex: 1, padding: 4, fontWeight: 'bold' }}>Invoice Total</Text>
      <Text style={{ flex: 3, padding: 4 }}>{invoiceTotal}</Text>
    </View>
    <View style={{ flexDirection: 'row', borderBottom: '1px solid #000' }}>
      <Text style={{ flex: 1, padding: 4, fontWeight: 'bold' }}>Amount (in words):</Text>
      <Text style={{ flex: 3, padding: 4 }}>{amountInWords}</Text>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ flex: 1, padding: 4, fontWeight: 'bold' }}>Remark:</Text>
      <Text style={{ flex: 3, padding: 4 }}>{remarks}</Text>
    </View>
  </View>
);

// Footer
const PDFFooter = ({ company = {} }) => (
  <View style={styles.footer}>
    <Text>{company.corporateAddress || ''}</Text>
  </View>
);

// Helper to blank out values if draft
const safeValue = (val, isDraft) => isDraft ? '' : val;

// Main PDF Component
const OrderPDF = ({ order, userName = '' }) => {
  const isDraft = (order.orderStatus || '').toLowerCase().trim() === 'draft';
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader company={{
          name: safeValue(order.company?.name, isDraft),
          address: safeValue(order.company?.address, isDraft),
          cin: safeValue(order.company?.cin, isDraft),
          gstin: safeValue(order.company?.gstin, isDraft),
          pan: safeValue(order.company?.pan, isDraft),
          logoUrl: safeValue(order.company?.logoUrl, isDraft),
        }} />
        <PDFOrderInfoRow order={{
          orderNo: safeValue(order.orderNo, isDraft),
          poNo: safeValue(order.poNo, isDraft),
          deliveryDate: safeValue(order.deliveryDate, isDraft),
          date: safeValue(order.date, isDraft),
        }} />
        <PDFAddressBlock
          billedTo={{
            name: safeValue(order.billedTo?.name, isDraft),
            address: safeValue(order.billedTo?.address, isDraft),
            gstin: safeValue(order.billedTo?.gstin, isDraft),
            pan: safeValue(order.billedTo?.pan, isDraft),
            stateName: safeValue(order.billedTo?.stateName, isDraft),
          }}
          shippedTo={{
            name: safeValue(order.shippedTo?.name, isDraft),
            address: safeValue(order.shippedTo?.address, isDraft),
            gstin: safeValue(order.shippedTo?.gstin, isDraft),
            pan: safeValue(order.shippedTo?.pan, isDraft),
            stateName: safeValue(order.shippedTo?.stateName, isDraft),
          }}
        />
        <PDFProductTable
          products={isDraft ? [] : order.products}
          userName={safeValue(userName, isDraft)}
        />
        <PDFTotalsAndBank
          totals={{
            taxableValue: safeValue(order.totals?.taxableValue, isDraft),
            cgst: safeValue(order.totals?.cgst, isDraft),
            sgst: safeValue(order.totals?.sgst, isDraft),
            igst: safeValue(order.totals?.igst, isDraft),
            totalGst: safeValue(order.totals?.totalGst, isDraft),
            tcs: safeValue(order.totals?.tcs, isDraft),
            tcsRate: safeValue(order.totals?.tcsRate, isDraft),
            invoiceTotal: safeValue(order.totals?.invoiceTotal, isDraft),
          }}
          bank={{
            name: safeValue(order.bank?.name, isDraft),
            beneficiary: safeValue(order.bank?.beneficiary, isDraft),
            accountNo: safeValue(order.bank?.accountNo, isDraft),
            ifsc: safeValue(order.bank?.ifsc, isDraft),
            branch: safeValue(order.bank?.branch, isDraft),
          }}
        />
        <PDFPaymentAndRemarks
          paymentTerms={safeValue(order.paymentTerms, isDraft)}
          invoiceTotal={safeValue(order.totals?.invoiceTotal, isDraft)}
          amountInWords={safeValue(order.amountInWords, isDraft)}
          remarks={safeValue(order.remarks, isDraft)}
        />
        <PDFFooter company={{
          corporateAddress: safeValue(order.company?.corporateAddress, isDraft)
        }} />
      </Page>
    </Document>
  );
};

export default OrderPDF; 