import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import JsBarcode from 'jsbarcode';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20, // adds spacing on all sides, including left
  },
  leftColumn: {
    flex: 2,
    paddingLeft: 50, // left spacing specifically
    paddingRight: 10,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    marginBottom:30
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 100,
    fontSize: 10,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
  },
  barcodeImage: {
    width: 100,
    height: 50,
    marginTop: 10,
  },
  mucNumber: {
    fontSize: 10,
    marginTop: 5,
  },
});

const LabelPDF = ({ labelData }) => {
  const [barcodeImage, setBarcodeImage] = useState('');

  useEffect(() => {
    const barcodeValue = labelData.mucNumber || '0000';
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcodeValue, {
      format: 'CODE128',
      width: 1.5,
      height: 30,
      displayValue: false,
    });
    setBarcodeImage(canvas.toDataURL());
  }, [labelData]);

  return (
    <Document>
      <Page size={[288, 360]} style={styles.page}>
        {/* Left Side: Details */}
        <View style={styles.leftColumn}>
          {[
            ['Seller', 'BOUJEE BALANCEE PRIVATE LIMITED'],
            ['PO No', labelData.poNumber],
            ['Bundle No', labelData.bundleNumber],
            ['Product', labelData.productName],
            ['Grade', labelData.gradeValue],
            ['Length', labelData.length],
            ['Width', labelData.width],
            ['Thickness', labelData.thickness],
            ['Sheets', labelData.sheets],
            ['Total MM', labelData.totalMM],
            ['Total Weight', labelData.weight],
            ['Date', labelData.date],
            ['Remark', labelData.remark],
          ].map(([label, value], index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{label}:</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Right Side: Barcode */}
        <View style={styles.rightColumn}>
          {barcodeImage && <Image src={barcodeImage} style={styles.barcodeImage} />}
          <Text style={styles.mucNumber}>MUC: {labelData.mucNumber}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default LabelPDF;