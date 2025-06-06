import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  mainRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  section: {
    margin: 10,
    padding: 10,
    width: '65%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  footer: {
    marginTop: 20,
    borderTop: '1 solid #000',
    paddingTop: 10,
    textAlign: 'center',
  },
  qrCode: {
    padding: 10,
    border: '1 solid #000',
    textAlign: 'center',
    alignItems: 'center',
    width: '30%',
    marginTop: 10,
  },
  qrImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  }
});

// Create Document Component
const LabelPDF = ({ labelData }) => {
  // Create QR code data string with current fields
  const qrData = JSON.stringify({
    labelNumber: labelData.labelNumber,
    inventoryType: labelData.inventoryType,
    productName: labelData.productName,
    unit: labelData.unit,
    gradeValue: labelData.gradeValue,
    length: labelData.length,
    width: labelData.width,
    thickness: labelData.thickness,
    totalMM: labelData.totalMM,
    quantity: labelData.quantity,
    bundleNumber: labelData.bundleNumber,
    remark: labelData.remark
  });

  // Generate QR code as data URL
  const [qrCodeUrl, setQrCodeUrl] = React.useState('');
  
  React.useEffect(() => {
    QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
  }, [qrData]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={{ fontSize: 20, textAlign: 'center', fontWeight: 'bold', marginBottom: 8 }}>Boujje Balancee</Text>
          <Text style={styles.title}>Product Label</Text>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Inventory Type:</Text>
              <Text style={styles.value}>{labelData.inventoryType}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Product Name:</Text>
              <Text style={styles.value}>{labelData.productName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Unit:</Text>
              <Text style={styles.value}>{labelData.unit}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Grade Value:</Text>
              <Text style={styles.value}>{labelData.gradeValue}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Length:</Text>
              <Text style={styles.value}>{labelData.length}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Width:</Text>
              <Text style={styles.value}>{labelData.width}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Thickness:</Text>
              <Text style={styles.value}>{labelData.thickness}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total MM:</Text>
              <Text style={styles.value}>{labelData.totalMM}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Quantity:</Text>
              <Text style={styles.value}>{labelData.quantity}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Bundle Number:</Text>
              <Text style={styles.value}>{labelData.bundleNumber}</Text>
            </View>
            {labelData.remark && (
              <View style={styles.row}>
                <Text style={styles.label}>Remark:</Text>
                <Text style={styles.value}>{labelData.remark}</Text>
              </View>
            )}
          </View>

          <View style={styles.qrCode}>
            {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrImage} />}
            <Text style={{ fontSize: 12, marginTop: 5, fontWeight: 'bold' }}>Label Number: {labelData.labelNumber}</Text>
            <Text style={{ fontSize: 10, marginTop: 5 }}>Scan QR code for more details</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default LabelPDF; 