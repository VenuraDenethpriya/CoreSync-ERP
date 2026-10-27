import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const CoreSyncLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1751611906/logo-long_q8epm3.png';

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
  headerLogo: { width: 150, height: 'auto', marginRight: 10 },
  headerTitle: { fontSize: 25, color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5 },
  section: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#1f2937', borderBottomWidth: 1, borderBottomColor: '#f0f4f8', paddingBottom: 8 },
  detailRow: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', paddingBottom: 5 },
  footer: { fontSize: 9, textAlign: 'center', color: '#64748b', borderTopWidth: 0.5, borderTopColor: '#cbd5e1', paddingTop: 10, marginTop: 20, flexDirection: 'column', alignItems: 'center' },
  footerLogo: { width: 100, height: 'auto', marginBottom: 10 },
  footerTextLine: { fontSize: 9, color: '#64748b', marginBottom: 3, textAlign: 'center' },
  footerContactInfo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 5 },
  footerAddressEmail: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' },
  footerContactLabel: { fontWeight: 'bold', marginRight: 5 },
  footerInfoItem: { marginHorizontal: 10 },
  // Signatures
  signatureWrapper: { marginBottom: 20 },
  signatureSection: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20 },
  signatureBlock: { width: '40%' },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: '#334155', marginBottom: 5, marginTop: 20 },
  signatureLabel: { fontSize: 10, color: '#334155', textAlign: 'center' },
  disclaimer: { fontSize: 9, color: '#64748b', marginTop: 10, fontStyle: 'italic', textAlign: 'center' },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    width: '48%',
  },
  detailLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', width: '40%' },
  detailValue: { fontSize: 10, color: '#1e293b', width: '60%', textAlign: 'left' },
  fullWidthRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  }
});

const RepairTemplate = ({ repairData }) => {
  const isCompleted = repairData.status === 'Completed';

  const title = isCompleted ? 'Job Completion Note' : 'Job Intake Note';
  const rightLabel = isCompleted ? 'Released by ..............................................' : 'Received by ..............................................';

  const disclaimerText = isCompleted
    ? 'I acknowledge that the repair/service is completed and I have received the item in good working condition.'
    : 'I acknowledge that I have handed over the item for the requested repair/service.';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <View style={styles.headerContent}>
            <Image src={CoreSyncLogo} style={styles.headerLogo} />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.gridContainer}>
              <View style={styles.column}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Job No:</Text>
                  <Text style={styles.detailValue}>{repairData.job_no}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Order No:</Text>
                  <Text style={styles.detailValue}>{repairData.order_no}</Text>
                </View>
                {!isCompleted && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Due Date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(repairData.due_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {isCompleted && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Assignee:</Text>
                    <Text style={styles.detailValue}>{repairData.assignee}</Text>
                  </View>
                )}
              </View>
              <View style={styles.column}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer:</Text>
                  <Text style={styles.detailValue}>{repairData.customer_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{repairData.customer_phone}</Text>
                </View>
              </View>
            </View>

            <View style={styles.fullWidthRow}>
              <Text style={[styles.detailLabel, { width: '100%', marginBottom: 5 }]}>Description / Comments:</Text>
              <Text style={{ fontSize: 10, color: '#1e293b' }}>{repairData.description}</Text>
            </View>
          </View>
        </View>

        <View style={styles.signatureWrapper}>
          <Text style={styles.disclaimer}>{disclaimerText}</Text>
          <View style={styles.signatureSection}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Customer Signature</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{rightLabel}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image src={CoreSyncLogo} style={styles.footerLogo} />
          <Text style={styles.footerTextLine}>Thank You for your business!</Text>
          <View style={styles.footerContactInfo}>
            <Text style={styles.footerTextLine}><Text style={styles.footerContactLabel}>CoreSync Private Limited</Text></Text>
            <Text style={[styles.footerTextLine, styles.footerInfoItem]}><Text style={styles.footerContactLabel}>Contact :</Text> (+94) 743020154</Text>
          </View>
          <View style={styles.footerAddressEmail}>
            <Text style={styles.footerTextLine}><Text style={styles.footerContactLabel}>Address :</Text> No 11, __________, Sril Lanka</Text>
            <Text style={[styles.footerTextLine, styles.footerInfoItem]}><Text style={styles.footerContactLabel}>Email :</Text> CoreSync.energy@gmail.com</Text>
          </View>
          <Text style={styles.footerTextLine}>Generated by CoreSync • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default RepairTemplate;