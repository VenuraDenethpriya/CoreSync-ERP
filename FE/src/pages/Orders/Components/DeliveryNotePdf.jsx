import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const RenewaaLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1751611906/logo-long_q8epm3.png';
const RenewaaEnergyLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1753696463/Renewa_Energy_tyin8p.png';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 4,
    borderBottomColor: '#e5e7eb',
  },
  headerLogo: {
    width: 150,
  },
  headerTitle: {
    fontSize: 24,
    color: '#1e3a8a',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaInfo: {
    marginBottom: 20,
  },
  companyDetails: {
    marginBottom: 20,
  },
  customerDetails: {
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  subject: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
  },
  paragraph: {
    marginBottom: 12,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  tableCol1: { width: '10%', borderRightWidth: 1, borderRightColor: '#e5e7eb', padding: 5 },
  tableCol2: { width: '50%', borderRightWidth: 1, borderRightColor: '#e5e7eb', padding: 5 },
  tableCol3: { width: '15%', borderRightWidth: 1, borderRightColor: '#e5e7eb', padding: 5 },
  tableCol4: { width: '25%', padding: 5 },
  tableCell: { fontSize: 10, color: '#4b5563' },
  tableCellHeader: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  sincere: {
    marginTop: 10,
    fontSize: 11,
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: 'column',
  },
  companySignature: {
    marginBottom: 30,
  },
  signature: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 10,
  },
  receiverGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  receiverBlock: {
    width: '30%',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 5,
    alignItems: 'center',
  },
  receiverText: {
    fontSize: 10,
    color: '#4b5563',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerTextLine: {
    fontSize: 9,
    marginBottom: 3,
  },
  footerContactLabel: {
    fontWeight: 'bold',
  },
  receiverTableVertical: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 30,
  },
  receiverTableRowVertical: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 25,
  },
  receiverTableRowVerticalLast: {
    flexDirection: 'row',
    minHeight: 25,
  },
  receiverTableLabelCol: {
    width: '40%',
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 10,
    justifyContent: 'center',
  },
  receiverTableValueCol: {
    width: '60%',
    padding: 10,
  },
  receiverTableCellHeaderLeft: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
});

const DeliveryNotePdf = ({ orderData }) => {
  const formattedCreationDate = orderData?.created_at
    ? new Date(orderData.created_at).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB'); // Fallback to current date

  const companyName = orderData?.vat ? "Renewaa Private Limited" : "Renewaa Energy";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContent}>
          <Image src={orderData?.vat ? RenewaaLogo : RenewaaEnergyLogo} style={styles.headerLogo} />
          {/* <Text style={styles.headerTitle}>Delivery Note</Text> */}
        </View>

        {/* Company and Customer Details */}
        <View style={styles.metaInfo}>
          {/* <View style={styles.companyDetails}>
            <Text style={styles.metaValue}>{companyName}</Text>
            <Text style={styles.metaValue}>L2-14, Reality Plaza, Ja-Ela</Text>
            <Text style={styles.metaValue}>+94 74 3020 154</Text>
            <Text style={styles.metaValue}>{new Date().toLocaleDateString('en-GB')}</Text>
          </View> */}

          <View style={styles.customerDetails}>
            {/* <Text style={styles.metaLabel}>To:</Text> */}
            {/* {orderData?.company_name && <Text style={styles.metaValue}>{orderData.company_name}</Text>} */}
            <Text style={styles.metaValue}>
              {new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}
            </Text>
            <Text style={styles.metaValue}>{orderData?.title} {orderData?.first_name} {orderData?.last_name}</Text>
            <Text style={styles.metaValue}>{orderData?.address}</Text>
            <Text style={styles.metaValue}>Mobile: {orderData?.phone_no1}</Text>
          </View>
        </View>

        {/* Body of the letter */}
        <View style={styles.body}>
          <Text style={styles.metaLabel}>Delivery Note</Text>
          <Text style={styles.paragraph}>
            We are pleased to inform you that your order has been successfully delivered to the below mentioned person.
          </Text>

          <Text style={styles.paragraph}>
            Please find the details of the delivery below:
          </Text>

          {/* Delivery Table */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol1}><Text style={styles.tableCellHeader}>No</Text></View>
              <View style={styles.tableCol2}><Text style={styles.tableCellHeader}>Item(s) Delivered</Text></View>
              <View style={styles.tableCol3}><Text style={styles.tableCellHeader}>Quantity</Text></View>
              <View style={styles.tableCol4}><Text style={styles.tableCellHeader}>Delivery Date</Text></View>
            </View>

            {orderData?.order_items?.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol1}><Text style={styles.tableCell}>{(index + 1).toString().padStart(2, '0')}</Text></View>
                <View style={styles.tableCol2}><Text style={styles.tableCell}>{item.product_name}</Text></View>
                <View style={styles.tableCol3}><Text style={styles.tableCell}>{(item.quantity || 1).toString().padStart(2, '0')}</Text></View>
                <View style={styles.tableCol4}><Text style={styles.tableCell}>{formattedCreationDate}</Text></View>
              </View>
            ))}

            {(!orderData?.order_items || orderData.order_items.length === 0) && (
              <View style={styles.tableRow}>
                <View style={styles.tableCol1}><Text style={styles.tableCell}>01</Text></View>
                <View style={styles.tableCol2}><Text style={styles.tableCell}>[Product Name]</Text></View>
                <View style={styles.tableCol3}><Text style={styles.tableCell}>01</Text></View>
                <View style={styles.tableCol4}><Text style={styles.tableCell}>{formattedCreationDate}</Text></View>
              </View>
            )}
          </View>

          <Text style={styles.paragraph}>
            If there are any discrepancies or issues with the delivery, please do not hesitate to contact us immediately.
          </Text>

          <Text style={styles.paragraph}>
            Thank you for choosing {companyName}. We look forward to serving you again in the future.
          </Text>
        </View>

        {/* Closing and Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.companySignature}>
            <Text style={styles.sincere}>Thanking you,</Text>
            <Text style={styles.sincere}>Yours faithfully</Text>
            <Text style={styles.signature}>{companyName}</Text>
          </View>

          {/* Receiver Table (Y-Axis Headers) */}
          <View style={styles.receiverTableVertical}>
            {/* Name Row */}
            <View style={styles.receiverTableRowVertical}>
              <View style={styles.receiverTableLabelCol}>
                <Text style={styles.receiverTableCellHeaderLeft}>Name of the Receiver</Text>
              </View>
              <View style={styles.receiverTableValueCol}></View>
            </View>

            {/* Signature Row */}
            <View style={styles.receiverTableRowVertical}>
              <View style={styles.receiverTableLabelCol}>
                <Text style={styles.receiverTableCellHeaderLeft}>Receiver's Signature</Text>
              </View>
              <View style={styles.receiverTableValueCol}></View>
            </View>

            {/* Date Row */}
            <View style={styles.receiverTableRowVerticalLast}>
              <View style={styles.receiverTableLabelCol}>
                <Text style={styles.receiverTableCellHeaderLeft}>Date</Text>
              </View>
              <View style={styles.receiverTableValueCol}></View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTextLine}>
            <Text style={styles.footerContactLabel}>{companyName} |</Text>
            <Text> Address:</Text> L2-14, Reality Plaza, Ja-ela |
            <Text style={styles.footerContactLabel}> Contact:</Text> (+94) 743020154 |
            <Text style={styles.footerContactLabel}> Email:</Text> renewaa.energy@gmail.com
          </Text>
          <Text style={styles.footerTextLine}>Generated by RIMS • {new Date().toLocaleDateString('en-GB')}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default DeliveryNotePdf;