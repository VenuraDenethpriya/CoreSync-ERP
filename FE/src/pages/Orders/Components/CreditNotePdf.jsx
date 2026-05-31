import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const RenewaaLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1751611906/logo-long_q8epm3.png';
const RenewaaEnergyLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1753696463/Renewa_Energy_tyin8p.png';

const styles = StyleSheet.create({
  // ... all your existing styles are correct, no changes needed here
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
    borderBottomWidth: 2,
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
  sincere: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 11,
  },
  signature: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  signatureDetails: {
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
});


const CreditNotePdf = ({ orderData }) => {
 
  const calculateTotalPayment = () => {
    if (!Array.isArray(orderData?.payments)) {
      return '0.00'; 
    }
    const total = orderData.payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };


  const formatProductNames = () => {
    if (!Array.isArray(orderData?.order_items)) {
      return '[Product Name]'; 
    }
    return orderData.order_items.map(item => item.product_name).join(', ');
  };
  

   const formattedCreationDate = orderData?.created_at 
    ? new Date(orderData.created_at).toLocaleDateString('en-GB') 
    : '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContent}>
          <Image src={orderData?.vat ? RenewaaLogo : RenewaaEnergyLogo} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>Credit Note</Text>
        </View>

        {/* Company and Customer Details */}
        <View style={styles.metaInfo}>
          <View style={styles.companyDetails}>
            <Text style={styles.metaValue}>{orderData?.vat ? "Renewaa Private Limited": "Renewaa Energy"}</Text>
            <Text style={styles.metaValue}>L2-14, Realty Plazza, Ja-Ela</Text>
            <Text style={styles.metaValue}>+94 74 3020 154</Text>
            <Text style={styles.metaValue}>{new Date().toLocaleDateString('en-GB')}</Text>
          </View>

          <View style={styles.customerDetails}>
            <Text style={styles.metaLabel}>To:</Text>
            <Text style={styles.metaValue}>{orderData?.title} {orderData?.first_name} {orderData?.last_name}</Text>
            <Text style={styles.metaValue}>{orderData?.address}</Text>
            <Text style={styles.metaValue}>Mobile: {orderData?.phone_no}</Text>
          </View>
        </View>

        {/* Subject */}
        <Text style={styles.subject}>Subject: Credit Note for Advance Payment</Text>

        {/* Body of the letter */}
        <View style={styles.body}>
          <Text style={styles.paragraph}>Dear {orderData?.title} {orderData?.first_name} {orderData?.last_name},</Text>
          
          {/* --- CORRECTED TEXT --- */}
          <Text style={styles.paragraph}>
            We acknowledge receipt of your advance payment of LKR {calculateTotalPayment()} made on {formattedCreationDate} towards the purchase of a {formatProductNames()}.
          </Text>

          <Text style={styles.paragraph}>
            Due to an unforeseen shipping delay, we regret that we were unable to supply the battery pack within the promised time frame. We understand your decision not to proceed with this purchase at this time.
          </Text>

          {/* --- CORRECTED TEXT --- */}
          <Text style={styles.paragraph}>
            Accordingly, we are issuing this credit note to confirm that your advance payment of LKR {calculateTotalPayment()} remains with {orderData?.vat ? "Renewaa Private Limited": "Renewaa Energy"}. You may utilize this amount for any future purchases or services with us at your convenience.
          </Text>

          <Text style={styles.paragraph}>
            We sincerely apologize for any inconvenience caused and appreciate your understanding. Please feel free to contact us if you need further clarification or assistance.
          </Text>
          <Text style={styles.paragraph}>
            Thank you for your continued trust in {orderData?.vat ? "Renewaa Private Limited": "Renewaa Energy"}.
          </Text>
        </View>

        {/* Closing and Signature */}
        <Text style={styles.sincere}>Yours sincerely,</Text>
        <Text style={styles.signature}>{orderData?.vat ? "Renewaa Private Limited": "Renewaa Energy"}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTextLine}>
             {/* Note: changed creditNoteData to orderData to match props */}
            <Text style={styles.footerContactLabel}>{orderData?.vat ? "Renewaa Private Limited" : "Renewaa Energy"} |</Text>
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

export default CreditNotePdf;