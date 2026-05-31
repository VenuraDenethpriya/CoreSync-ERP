import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const RenewaaLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1751611906/logo-long_q8epm3.png';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc',
    color: '#334155',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    flexGrow: 1,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#cbd5e1',
  },
  headerLogo: {
    width: 150,
    height: 'auto',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 30,
    color: '#1e40af',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  section: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    width: '35%',
  },
  detailValue: {
    fontSize: 11,
    color: '#1e293b',
    width: '60%',
    textAlign: 'right',
  },
  subSection: {
    marginTop: 15,
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 15,
  },
  quoteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e3a8a',
  },
  footer: {
    fontSize: 9,
    textAlign: 'center',
    color: '#64748b',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 10,
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  footerLogo: {
    width: 100,
    height: 'auto',
    marginBottom: 10,
  },
  footerTextLine: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 3,
    textAlign: 'center',
  },
  footerContactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  footerAddressEmail: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  footerContactLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  footerInfoItem: {
    marginHorizontal: 10,
  },
});

const RepairTemplate = ({ repairData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Main content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContent}>
          <Image src={RenewaaLogo} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>Job Note</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Job No</Text>
            <Text style={styles.detailValue}>
              {repairData.job_no}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order No</Text>
            <Text style={styles.detailValue}>{repairData.order_no}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{new Date(repairData.due_date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long', 
                                day: 'numeric',
                                timeZone: 'Asia/Colombo'
                            })}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer Name</Text>
            <Text style={styles.detailValue}>{repairData.customer_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer Phone No.</Text>
            <Text style={styles.detailValue}>{repairData.customer_phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{repairData.description}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Image src={RenewaaLogo} style={styles.footerLogo} />
        <Text style={styles.footerTextLine}>Thank You for your business!</Text>
        <View style={styles.footerContactInfo}>
          <Text style={styles.footerTextLine}>
            <Text style={styles.footerContactLabel}>Renewaa Private Limited</Text>
          </Text>
          <Text style={[styles.footerTextLine, styles.footerInfoItem]}>
            <Text style={styles.footerContactLabel}>Contact :</Text> (+94) 743020154
          </Text>
        </View>
        <View style={styles.footerAddressEmail}>
          <Text style={styles.footerTextLine}>
            <Text style={styles.footerContactLabel}>Address :</Text> L2-14, Reality Plaza, Ja-ela
          </Text>
          <Text style={[styles.footerTextLine, styles.footerInfoItem]}>
            <Text style={styles.footerContactLabel}>Email :</Text> renewaa.energy@gmail.com
          </Text>
        </View>
        <Text style={styles.footerTextLine}>
          Generated by RIMS •{' '}
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </Text>
      </View>
    </Page>
  </Document>
);

export default RepairTemplate;
