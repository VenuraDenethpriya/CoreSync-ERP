import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import JsBarcode from "jsbarcode";
import converter from 'number-to-words';

const CoreSyncLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1751611906/logo-long_q8epm3.png';
const CoreSyncEnergyLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1753696463/Renewa_Energy_tyin8p.png';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc',
    color: '#334155',
  },
  header: {
    fontSize: 30,
    marginBottom: 25,
    textAlign: 'center',
    color: '#1e40af',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 12,
    letterSpacing: 1.5,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 5,
  },
  value: {
    fontSize: 11,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  addressValue: {
    fontSize: 11,
    color: '#1e293b',
    marginLeft: 0,
    lineHeight: 1.4,
  },

  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  halfWidth: {
    width: '48%',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    width: '45%',
  },
  detailValue: {
    fontSize: 10,
    color: '#1f2937',
    width: '55%',
    lineHeight: 1.3,
  },
  invoiceHighlightBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableColProduct: {
    width: '40%',
    textAlign: 'left',
    paddingLeft: 5,
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
  },
  productTable: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    backgroundColor: '#eef2ff',
    paddingVertical: 8,
  },
  tableCol: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  tableColReference: { width: '20%', paddingLeft: 8 },
  tableColDescription: { width: '35%', paddingLeft: 8 },
  tableColQty: { width: '10%', textAlign: 'center' },
  tableColUnitPrice: { width: '15%', textAlign: 'right' },
  tableColTotal: { width: '20%', textAlign: 'right', paddingRight: 8 },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCellText: {
    fontSize: 10,
    color: '#334155',
  },
  serialText: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 1.2,
  },
  productNote: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    width: '80%',
    textAlign: 'right',
    paddingRight: 10,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    width: '20%',
    textAlign: 'right',
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    width: '80%',
    textAlign: 'right',
    paddingRight: 10,
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    width: '20%',
    textAlign: 'right',
  },
  termsValue: {
    fontSize: 10,
    color: '#334155',
    marginBottom: 5,
    lineHeight: 1.5,
  },
  paymentInfoSection: {
    marginTop: 20,
  },
  paymentDetail: {
    fontSize: 10,
    color: '#334155',
    marginLeft: 15,
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 9,
    textAlign: 'center',
    color: '#64748b',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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

const generateBarcodeBase64 = (value) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    displayValue: true,
  });
  return canvas.toDataURL("image/png").split(",")[1];
};

const formatCurrentYearMonth = () => {
  const date = new Date();

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const year = date.getFullYear().toString().slice(-2);
  const month = months[date.getMonth()];

  return `${year}${month} `;
};

const formatAmountToWords = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "";

  const [whole, fraction] = Number(amount).toFixed(2).split('.');

  const wholeWords = converter.toWords(whole);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  if (!fraction || fraction === '00') {
    return `${capitalize(wholeWords)} Rupees only`;
  }

  const fractionWords = converter.toWords(fraction);

  return `${capitalize(wholeWords)} Rupees and ${fractionWords} cents only`;
};





const OrderTemplate = ({ checked, orderData, discountPercentage, totalPaid, otherTerms, terms, vatAmount, netTotal, deliveryDate, place, additional, paymentMode }) => {
  const barcodeValue = orderData?.type + orderData?.order_no || "";
  const barcodeBase64 = barcodeValue ? generateBarcodeBase64(barcodeValue) : null;
  const totalLoanAmount = orderData?.payments?.reduce((acc, payment) => acc + (payment.loan_amount || 0), 0) || 0;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.headerContent}>
          {
            orderData?.vat === true ? <Image src={CoreSyncLogo} style={styles.headerLogo} /> : <Image src={CoreSyncEnergyLogo} style={styles.headerLogo} />
          }

          {orderData?.vat === true &&
            (orderData?.PaymentStatus === "Paid" || checked === true) ? (
            // VAT true + Paid OR Checked → TAX INVOICE
            <View>
              <Text style={styles.headerTitle}>TAX INVOICE</Text>
              {/* <Text style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>
                VAT Registered No: 103466954 - 7000
              </Text> */}
            </View>
          ) : checked === true ? (
            // VAT false + checked true → INVOICE
            <View>
              <Text style={styles.headerTitle}>INVOICE</Text>
            </View>
          ) : (
            // VAT false + checked false → based on payment
            <View>
              <Text style={styles.headerTitle}>
                {orderData?.PaymentStatus === "Paid"
                  ? "INVOICE"
                  : "PROFORMA INVOICE"}
              </Text>
            </View>
          )}

        </View>



        {/* Customer and Reference Information */}
        <View style={styles.section}>
          <View style={styles.flexRow}>

            {/* LEFT COLUMN - SUPPLIER INFO */}
            <View style={styles.halfWidth}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date of Invoice:</Text>
                <Text style={styles.detailValue}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </Text>
              </View>

              {
                orderData?.vat === true ? (<View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Supplier's TIN:</Text>
                  <Text style={styles.detailValue}>103466954 - 7000</Text>
                </View>) : null
              }

              {
                orderData?.vat === true ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Supplier's Name:</Text>
                    <Text style={styles.detailValue}>CoreSync Pvt. Ltd</Text>
                  </View>
                ) : <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Supplier's Name:</Text>
                  <Text style={styles.detailValue}>CoreSync Energy</Text>
                </View>
              }



              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>
                  {"L2-14,\nReality Plaza,\nJa-ela"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Telephone No:</Text>
                <Text style={styles.detailValue}>+94743020154</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date of Delivery:</Text>
                <Text style={styles.detailValue}>
                  {new Date(deliveryDate || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Additional Info:</Text>
                <Text style={styles.detailValue}>{additional || '-'}</Text>
              </View>
            </View>

            {/* RIGHT COLUMN - PURCHASER INFO */}
            <View style={styles.halfWidth}>

              {
                orderData?.vat === true ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Invoice No:</Text>
                    <Text style={styles.detailValue}>
                      {orderData?.PaymentStatus === 'Paid' || checked ? null : "Proforma "}
                      {formatCurrentYearMonth()}_
                      {orderData?.type?.replace(/\/$/, '')}_
                      {orderData?.order_no}
                    </Text>
                  </View>
                ) : <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice No:</Text>
                  <Text style={styles.detailValue}>
                    {orderData?.PaymentStatus === 'Paid' || checked ? null : "Proforma "}
                    {orderData?.type}
                    {orderData?.order_no}
                  </Text>
                </View>
              }

              {
                orderData?.vat === true ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Purchaser's TIN:</Text>
                    <Text style={styles.detailValue}>{orderData?.vat_no || "-"}</Text>
                  </View>) : null
              }



              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purchaser's Name:</Text>
                <Text style={styles.detailValue}>
                  {orderData?.title} {orderData?.first_name} {orderData?.last_name}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>
                  {orderData?.address?.replace(/,\s*/g, ',\n') || "-"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Telephone No:</Text>
                <Text style={styles.detailValue}>{orderData?.phone_no1 || "-"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Place of Supply:</Text>
                <Text style={styles.detailValue}>
                  {place?.replace(/,\s*/g, ',\n') || orderData?.address?.replace(/,\s*/g, ',\n') || "-"}
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* Product Table */}
        {/* Product Table Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Summary</Text>
          <View style={styles.productTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, styles.tableColReference]}>Reference</Text>
              <Text style={[styles.tableCol, styles.tableColDescription]}>Description</Text>
              <Text style={[styles.tableCol, styles.tableColQty]}>Qty</Text>
              <Text style={[styles.tableCol, styles.tableColUnitPrice]}>Unit Price (LKR)</Text>
              <Text style={[styles.tableCol, styles.tableColTotal]}>Total (LKR)</Text>
            </View>

            {/* Table Body - Items */}
            {orderData?.order_items?.map((item, index) => (
              <View
                key={item.id || index}
                style={[
                  styles.tableRow,
                  { backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa' },
                ]}
              >
                {/* Reference / Serials */}
                <View style={styles.tableColReference}>
                  {orderData?.PaymentStatus === 'Paid' ? (
                    item.combined_serials && item.combined_serials.length > 0 ? (
                      <Text style={styles.serialText}>
                        {item.combined_serials.map(s => s.serial || s).join(', ')}
                      </Text>
                    ) : (
                      <Text style={styles.serialText}>-</Text>
                    )
                  ) : (
                    <Text style={styles.serialText}></Text>
                  )}
                </View>


                {/* Product Description */}
                <View style={styles.tableColDescription}>
                  <Text style={[styles.tableCellText, { fontWeight: 'bold' }]}>
                    {item.product_name}
                  </Text>
                  {item.note && (
                    <Text style={styles.productNote}>{item.note}</Text>
                  )}
                </View>

                {/* Qty, Unit Price, Subtotal */}
                <Text style={[styles.tableCellText, styles.tableColQty]}>
                  {item.quantity ?? '-'}
                </Text>
                <Text style={[styles.tableCellText, styles.tableColUnitPrice]}>
                  {item.unit_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '-'}
                </Text>
                <Text style={[styles.tableCellText, styles.tableColTotal]}>
                  {item.subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            ))}

            {/* --- SUMMARY SECTION --- */}
            <View style={{ paddingTop: 10 }}>

              {/* Subtotal */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Value:</Text>
                <Text style={styles.summaryValue}>
                  {orderData?.subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Additional Charges */}
              {orderData?.additional_charges?.length > 0 && orderData.additional_charges.map((charge, index) => (
                <View key={index} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{charge.type}:</Text>
                  <Text style={styles.summaryValue}>
                    + {parseFloat(charge.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}

              {/* Discount */}
              {orderData?.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Discount ({discountPercentage != null ? discountPercentage.toFixed(2) : '0.00'}%):
                  </Text>
                  <Text style={styles.summaryValue}>
                    - {(orderData.discount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              )}

              {/* VAT */}
              {vatAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>VAT Amount (Total Value @ 18%):</Text>
                  <Text style={styles.summaryValue}>
                    + {vatAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              )}


              {
                orderData?.vat === true ? (
                  <View style={[styles.summaryRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total Amount Including VAT:</Text>
                    <Text style={styles.grandTotalValue}>
                      {netTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>) : (<View style={[styles.summaryRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total Amount</Text>
                    <Text style={styles.grandTotalValue}>
                      {netTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>)
              }

              {/* Grand Total */}

            </View>
          </View>

          {/* Text Totals & Payment Info Output Below Table */}
          {/* <View style={{ marginTop: 15, paddingHorizontal: 8 }}>
            <View style={styles.flexRow}>
              <Text style={[styles.label, { width: '30%' }]}>Total Amount in words:</Text>
              <Text style={[styles.value, { width: '70%', fontWeight: 'bold' }]}>
                {formatAmountToWords(netTotal)}
              </Text>
            </View>
            {orderData?.payments?.length > 0 ? (
              orderData.payments.map((payment, index) => {
                if (payment.payment_type === "None" || Number(payment.amount) <= 0) return null;

                return (
                  <View style={styles.flexRow} key={payment.id || index}>
                    <Text style={[styles.label, { width: '30%' }]}>
                      {index === 0 ? 'Mode of Payment:' : ''}
                    </Text>

                    <Text style={[styles.value, { width: '70%' }]}>
                      {payment.payment_mode || 'N/A'} - LKR {Number(payment.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.flexRow}>
                <Text style={[styles.label, { width: '30%' }]}>Mode of Payment:</Text>
                <Text style={[styles.value, { width: '70%' }]}>-</Text>
              </View>
            )}
          </View> */}
          <View style={{ marginTop: 15, paddingHorizontal: 8 }}>
            <View style={styles.flexRow}>
              <Text style={[styles.label, { width: '30%' }]}>Total Amount in words:</Text>
              <Text style={[styles.value, { width: '70%', fontWeight: 'bold' }]}>
                {formatAmountToWords(netTotal)}
              </Text>
            </View>

            {/* Display Payments */}
            {orderData?.payments?.length > 0 ? (
              orderData.payments.map((payment, index) => {
                if (payment.payment_type === "None" || Number(payment.amount) <= 0) return null;

                return (
                  <View style={styles.flexRow} key={payment.id || index}>
                    <Text style={[styles.label, { width: '30%' }]}>
                      {index === 0 ? 'Mode of Payment:' : ''}
                    </Text>

                    <Text style={[styles.value, { width: '70%' }]}>
                      {payment.payment_mode || 'N/A'} - LKR {Number(payment.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.flexRow}>
                <Text style={[styles.label, { width: '30%' }]}>Mode of Payment:</Text>
                <Text style={[styles.value, { width: '70%' }]}>-</Text>
              </View>
            )}

            {orderData?.PaymentStatus !== "Paid" && (
              <View style={[styles.flexRow, { marginTop: 8 }]}>
                <Text style={[styles.label, { width: '30%', color: '#ef4444' }]}>Balance to be Paid:</Text>
                <Text style={[styles.value, { width: '70%', color: '#ef4444', fontWeight: 'bold' }]}>
                  LKR {Math.max(0, netTotal - (totalPaid || 0)).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Text>
              </View>
            )}

          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          {
            !otherTerms ? null : otherTerms
              .split('\n')
              .map((line, index) =>
                line.trim() ? (
                  <Text key={index} style={styles.termsValue}>
                    • {line.trim()}
                  </Text>
                ) : null
              )
          }

          {
            terms.includes(0) &&
            <View>
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years.</Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events.</Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS.</Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.</Text>
              {
                orderData?.PaymentStatus === "Paid" ? null : <Text style={styles.termsValue}>• An advance payment is required on order confirmation and please mention the quotation no / invoice no when depositing funds to the account as a reference.</Text>
              }

            </View>
          }
          {
            terms.includes(1) &&
            <View>
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years.</Text>
              <Text style={styles.termsValue}>• 2 Years of Repair warranty will be provided for the inverter for manufacture defects only. </Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events.</Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS.</Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.</Text>
              {
                orderData?.PaymentStatus === "Paid" ? null : <Text style={styles.termsValue}>• An advance payment is required on order confirmation and please mention the quotation no / invoice no when depositing funds to the account as a reference.</Text>
              }
            </View>
          }
          {
            terms.includes(2) &&
            <View>
              <Text style={styles.termsValue}>• Lithium batteries have 2 years of company local replacement warranty provided by CoreSync Private Limited. (Applied to the first two years from the date of purchase.)</Text>
              <Text style={styles.termsValue}>• All Lithium batteries are subjected to a 5 years of China Manufacturer warranty.</Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events.</Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS.</Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.</Text>
              {
                orderData?.PaymentStatus === "Paid" ? null : <Text style={styles.termsValue}>• An advance payment is required on order confirmation and please mention the quotation no / invoice no when depositing funds to the account as a reference.</Text>
              }
            </View>
          }
          {
            terms.includes(3) &&
            <View>
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years. </Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.</Text>
              <Text style={styles.termsValue}>• For the Battery lead time will be within two weeks from the PO date. There will be an additional 100,000 of payment if the company does not provide us with the used forklift battery tray. </Text>
              <Text style={styles.termsValue}>• No Any prior advance needed. </Text>
            </View>
          }
          {
            terms.includes(4) &&
            <View>
              <Text style={styles.termsValue}>• 3 years or 100,000km driving warranty will be provided for the Battery pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 3 years.  </Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events.</Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS.</Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control</Text>
            </View>
          }
          {
            terms.includes(5) &&
            <View>
              <Text style={styles.termsValue}>• The Battery is guaranteed, and will be replaced if SOH falls below 50% endurance (SOH) within three years From installation, or 100,000km Range, whichever comes first.  </Text>
              <Text style={styles.termsValue}>• You have to provide us the container of the old battery module for replacement. </Text>
              <Text style={styles.termsValue}>• All payments should be made to the following accounts only.</Text>
              <Text style={styles.termsValue}>• Upon installation of the new battery in the Nissan Leaf, the old battery will become the property of CoreSync Private Limited. By proceeding with the battery upgrade, the customer agrees to transfer ownership of the removed battery to CoreSync Private Limited. This transfer is a condition of the upgrade service and does not affect the warranty coverage on the newly installed battery.</Text>
            </View>
          }
          {
            terms.includes(6) &&
            <View>
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years.  </Text>
              <Text style={styles.termsValue}>• 2 Years of Repair warranty will be provided for the inverter for manufacture defects only. </Text>
              <Text style={styles.termsValue}>• 10 Years of product warranty + 25 years of performance warranty will be provided for the panels installed.</Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events. </Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS. </Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.  </Text>
              <Text style={styles.termsValue}>•  Please mention the Quotation Number/ Invoice Number as a reference when depositing funds to the account. </Text>
            </View>
          }
          {
            terms.includes(7) &&
            <View>
              <View>
                <Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Solar Panels:</Text>
                </Text>
                <Text style={styles.termsValue}>• 25-year performance warranty </Text>
                <Text style={styles.termsValue}>• Guarantees power output above a specified threshold</Text>
                <Text style={styles.termsValue}>• Ensures long-term efficiency and performance</Text>
                <Text style={styles.termsValue}>• 12-year Manufacture warranty against material or workmanship defects</Text>
              </View>
              <View>
                <Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Inverter:</Text>
                </Text>
                <Text style={styles.termsValue}>• 10-year warranty </Text>
                <Text style={styles.termsValue}>• Covers manufacturing defects or malfunctions</Text>
                <Text style={styles.termsValue}>• Ensures reliable operation of the inverter </Text>
              </View>
              <View>
                <Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Free Maintenance:</Text>
                </Text>
                <Text style={styles.termsValue}>• 1-year complimentary maintenance</Text>
                <Text style={styles.termsValue}>• 1-year free insurance coverage</Text>
                <Text style={styles.termsValue}>• Regular inspections and maintenance checks</Text>
                <Text style={styles.termsValue}>• Optimizes system performance</Text>
                <Text style={styles.termsValue}>• Addresses adjustments or minor repairs as needed</Text>
              </View>
              <View>
                <Text style={styles.termsValue}>
                  Warranty coverage applies under normal operating conditions and proper installation.
                </Text>
                <Text style={styles.termsValue}>
                  <Text style={{ fontWeight: 'bold' }}>Exclusions:</Text> Damages caused by external factors or unauthorized modifications.
                </Text>
              </View>
            </View>
          }
          {
            terms.includes(9) &&
            <View>
              <Text style={styles.termsValue}>• 10 Years of warranty will be provided for the inverter for manufacture defects only.  </Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events. </Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.</Text>
              <Text style={styles.termsValue}>• An advance payment is required on order confirmation and please mention the quotation no / invoice no when depositing funds to the account as a reference. </Text>
            </View>
          }
          {
            terms.includes(10) &&
            <View>
              <Text style={styles.termsValue}>• 10 Year warranty will be provided for the Battery Pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 10 years.  </Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events. </Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS.</Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control. </Text>
            </View>
          }
          {
            terms.includes(11) &&
            <View>
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years.</Text>
              <Text style={styles.termsValue}>• 5 Years of Repair warranty will be provided for the inverter for manufacture defects only.</Text>
              <Text style={styles.termsValue}>• 10 Years of product warranty + 25 years of performance warranty will be provided for the panels installed.</Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events.</Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS.</Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.</Text>
              <Text style={styles.termsValue}>• Please mention the Quotation Number/ Invoice Number as a reference when depositing funds to the account.</Text>
            </View>
          }
          {
            terms.includes(12) &&
            <View>
              <Text style={styles.termsValue}>• 10 Year warranty will be provided for the Battery Pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 10 years.  </Text>
              <Text style={styles.termsValue}>• 10 Years of Repair warranty will be provided for the inverter for manufacture defects only. </Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events.</Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS. </Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.</Text>
              <Text style={styles.termsValue}>• Please mention the Quotation Number/ Invoice Number as a reference when depositing funds to the account. </Text>
            </View>
          }
          {
            terms.includes(13) &&
            <View>
              <Text style={styles.termsValue}>• 10 Year warranty will be provided for the Battery Pack by CoreSync Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 10 years.  </Text>
              <Text style={styles.termsValue}>• 10 Years of product warranty + 25 years of performance warranty will be provided for the panels installed. </Text>
              <Text style={styles.termsValue}>• 10 Years of Repair warranty will be provided for the inverter for manufacture defects only.</Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events. </Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS.</Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control. </Text>
              <Text style={styles.termsValue}>• Please mention the Quotation Number/ Invoice Number as a reference when depositing funds to the account. </Text>
            </View>
          }
        </View>
        {/* Payment Information */}
        {
          orderData?.vat === true ? (
            <View View style={[styles.section, styles.paymentInfoSection]}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <Text style={styles.value}>Cash payment or cheques preferred. Bank transfer details below:</Text>
              <Text style={styles.paymentDetail}>• Account Name: CoreSync Private Limited</Text>
              <Text style={styles.paymentDetail}>• Account Number: 1000712948</Text>
              <Text style={styles.paymentDetail}>• Bank Name: Commercial Bank PLC</Text>
              <Text style={styles.paymentDetail}>• Branch Name: Borella Branch</Text>
            </View>
          ) : (
            <View View style={[styles.section, styles.paymentInfoSection]}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <Text style={styles.value}>Cash payment or cheques preferred. Bank transfer details below:</Text>
              <Text style={styles.paymentDetail}>• Account Name: CoreSync Energy Private Limited</Text>
              <Text style={styles.paymentDetail}>• Account Number: 1000962329</Text>
              <Text style={styles.paymentDetail}>• Bank Name: Commercial Bank PLC</Text>
              <Text style={styles.paymentDetail}>• Branch Name: Ja Ela Branch</Text>
            </View>
          )
        }

        <View style={{ marginBottom: 5 }}>
          <Text style={styles.footerTextLine}>
            <Text style={styles.footerContactLabel}>Salesperson: </Text>
            {orderData?.salesperson}
          </Text>
          <Text style={styles.footerTextLine}>
            <Text style={styles.footerContactLabel}>Salesperson Phone No: </Text>
            +{orderData?.salesperson_phone}
          </Text>
        </View>

        <View style={styles.footerContactInfo}>
          <Text style={styles.footerTextLine}>
            <Text style={styles.footerContactLabel}>This is a computer generated invoice hence no signature required.</Text>
          </Text>
        </View>


        {/* Footer with Logo and Contact Details */}
        <View style={styles.footer}>
          <Image src={CoreSyncLogo} style={styles.footerLogo} />
          <Text style={styles.footerTextLine}> Thank You for Your Business!</Text>
          <View style={styles.footerContactInfo}>
            <Text style={styles.footerTextLine}>
              <Text style={styles.footerContactLabel}>{orderData?.vat === true ? "CoreSync Private Limited" : "CoreSync Energy"}</Text>
            </Text>
            <Text style={[styles.footerTextLine, styles.footerInfoItem]}>
              <Text style={styles.footerContactLabel}>Contact :</Text> (+94) 743020154
            </Text>
          </View>
          <View style={styles.footerAddressEmail}>
            <Text style={styles.footerTextLine}>
              <Text style={styles.footerContactLabel}>Address :</Text> No 11, __________, Sril Lanka
            </Text>
            <Text style={[styles.footerTextLine, styles.footerInfoItem]}>
              <Text style={styles.footerContactLabel}>Email :</Text> CoreSync.energy@gmail.com
            </Text>
          </View>
          <Text style={styles.footerTextLine}>Generated by CoreSync • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
        </View>
      </Page>
    </Document >
  )

};

export default OrderTemplate;