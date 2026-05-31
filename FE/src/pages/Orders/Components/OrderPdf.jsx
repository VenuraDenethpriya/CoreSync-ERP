import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import JsBarcode from "jsbarcode";

const RenewaaLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1751611906/logo-long_q8epm3.png';
const RenewaaEnergyLogo = 'https://res.cloudinary.com/dgw1roazt/image/upload/v1753696463/Renewa_Energy_tyin8p.png';

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
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfWidth: {
    width: '48%',
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
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    width: '30%',
  },
  detailValue: {
    fontSize: 11,
    color: '#1e293b',
    width: '70%',
  },
  productTable: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#a0aec0',
    paddingBottom: 10,
    marginBottom: 8,
    backgroundColor: '#eef2ff',
    borderRadius: 4,
  },
  tableCol: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingVertical: 5,
  },
  tableColProduct: {
    width: '40%',
    textAlign: 'left',
    paddingLeft: 5,
  },
  tableColQty: {
    width: '15%',
    textAlign: 'center',
  },
  tableColUnitPrice: {
    width: '20%',
    textAlign: 'right',
  },
  tableColTotal: {
    width: '25%',
    textAlign: 'right',
    paddingRight: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 5,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    width: '75%',
    textAlign: 'left',
    paddingLeft: 5,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    width: '25%',
    textAlign: 'right',
    paddingRight: 5,
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
    paddingTop: 10,
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    width: '75%',
    textAlign: 'left',
    paddingLeft: 5,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    width: '25%',
    textAlign: 'right',
    paddingRight: 5,
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



const OrderTemplate = ({ checked, orderData, discountPercentage, totalPaid, otherTerms, terms, vatAmount, netTotal }) => {
  const barcodeValue = orderData?.type + orderData?.order_no || "";
  const barcodeBase64 = barcodeValue ? generateBarcodeBase64(barcodeValue) : null;
  const totalLoanAmount = orderData?.payments?.reduce((acc, payment) => acc + (payment.loan_amount || 0), 0) || 0;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.headerContent}>
          {
            orderData?.vat === true ? <Image src={RenewaaLogo} style={styles.headerLogo} /> : <Image src={RenewaaEnergyLogo} style={styles.headerLogo} />
          }

          {/* {
            orderData?.vat === true ? <View>
              <Text style={styles.headerTitle}>
                {orderData?.PaymentStatus === "Paid" ? "TAX INVOICE" : "PROFORMA TAX INVOICE"}
              </Text>
              {orderData?.vat && (
                <Text style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
                  VAT Registered No: 103466954 - 7000
                </Text>
              )}

            </View> : <View>
              <Text style={styles.headerTitle}>
                {orderData?.PaymentStatus === "Paid" ? "INVOICE" : "PROFORMA INVOICE"}
              </Text>
              {orderData?.vat && (
                <Text style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
                  VAT Registered No: 103466954 - 7000
                </Text>
              )}

            </View>
          } */}

          {/* {checked === true && orderData?.vat === true ? (
            <View>
              <Text style={styles.headerTitle}>TAX INVOICE</Text>
              <Text style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
                VAT Registered No: 103466954 - 7000
              </Text>
            </View>
          ) : checked === true && orderData?.vat === false ? (
            <View>
              <Text style={styles.headerTitle}>INVOICE</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.headerTitle}>
                {orderData?.PaymentStatus === "Paid" ? "INVOICE" : "PROFORMA INVOICE"}
              </Text>
              {
                orderData?.vat === true ? (
                  <Text style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
                    VAT Registered No: 103466954 - 7000
                  </Text>
                ) : null
              }
            </View>
          )} */}

          {orderData?.vat === true &&
            (orderData?.PaymentStatus === "Paid" || checked === true) ? (
            // VAT true + Paid OR Checked → TAX INVOICE
            <View>
              <Text style={styles.headerTitle}>TAX INVOICE</Text>
              <Text style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>
                VAT Registered No: 103466954 - 7000
              </Text>
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
            <View style={styles.halfWidth}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>
                  {orderData?.title} {orderData?.first_name} {orderData?.last_name}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{orderData?.address || ""}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{orderData?.phone_no1}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{orderData?.email || ""}</Text>
              </View>
              {
                orderData?.vat === true ? <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>VAT No.:</Text>
                  <Text style={styles.detailValue}>
                    {orderData?.vat_no}
                  </Text>
                </View> : null
              }
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ref No.:</Text>
                <Text style={styles.detailValue}>
                  {orderData?.PaymentStatus === 'Paid' || checked ? null : "Proforma "}
                  {orderData?.type}
                  {orderData?.order_no}
                </Text>
              </View>
              {
                orderData?.po_no ? <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PO No.:</Text>
                  <Text style={styles.detailValue}>
                    {orderData?.po_no}
                  </Text>
                </View> : null
              }

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order Date:</Text>
                <Text style={styles.detailValue}>
                  {orderData?.created_at ? new Date(orderData?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issued Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </Text>
              </View>
              {
                orderData?.salesperson ? <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Salesperson:</Text>
                  <Text style={styles.detailValue}>
                    {orderData.salesperson.trim().split(' ')[0]}
                  </Text>
                </View> : null
              }
              <Image src={`data:image/png;base64,${barcodeBase64}`} style={{ width: 200, height: 60 }} />
            </View>
          </View>
        </View>

        {/* Product Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Summary</Text>
          <View style={styles.productTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, styles.tableColProduct]}>Product</Text>
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
                  { backgroundColor: index % 2 === 0 ? '#fcfcfc' : '#ffffff' },
                ]}
              >
                {/* <View style={[styles.tableCell, styles.tableColProduct]}>
                  <Text style={{ fontWeight: 'bold' }}>{item.product_name}</Text>
                  {item.dynamic_serial_no ? (
                    <Text style={{ marginTop: 2, fontSize: 9, color: '#4b5563' }}>
                      (S/N: {item.dynamic_serial_no})
                    </Text>
                  ) : null}
                  {item.note && (
                    <Text style={{ marginTop: 2 }}>{item.note}</Text>
                  )}
                </View> */}
                <View style={[styles.tableCell, styles.tableColProduct]}>
                  <Text style={{ fontWeight: 'bold' }}>{item.product_name}</Text>

                  {(item.generated_serials?.length > 0 || item.dynamic_serial_no) && (
                    <Text style={{ marginTop: 2, fontSize: 9, color: '#4b5563' }}>
                      (S/N: {item.generated_serials?.length > 0
                        ? item.generated_serials.join(', ')
                        : item.dynamic_serial_no})
                    </Text>
                  )}

                  {item.note && (
                    <Text style={{ marginTop: 2 }}>{item.note}</Text>
                  )}
                </View>
                <Text style={[styles.tableCell, styles.tableColQty]}>{item.quantity ?? '-'}</Text>
                <Text style={[styles.tableCell, styles.tableColUnitPrice]}>
                  {item.unit_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '-'}
                </Text>
                <Text style={[styles.tableCell, styles.tableColTotal]}>
                  {item.subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            ))}

            {/* Subtotal Row */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {orderData?.subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Additional Charges */}
            {orderData?.additional_charges?.length > 0 && orderData.additional_charges.map((charge, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#1f2937',
                    width: '75%',
                    textAlign: 'left',
                    paddingLeft: 5,
                    fontWeight: 'normal',
                  }}
                >
                  {charge.type}:
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#1f2937',
                    width: '25%',
                    textAlign: 'right',
                    paddingRight: 5,
                    fontWeight: 'normal',
                  }}
                >
                  + {parseFloat(charge.value || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))}


            {/* Discount Row */}
            {orderData?.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{
                  fontSize: 11,
                  color: '#1f2937',
                  width: '75%',
                  textAlign: 'left',
                  paddingLeft: 5,
                  fontWeight: 'normal',
                }}>
                  Discount ({discountPercentage != null ? discountPercentage.toFixed(2) : '0.00'}%)
                </Text>

                <Text style={{
                  fontSize: 11,
                  color: '#1f2937',
                  width: '25%',
                  textAlign: 'right',
                  paddingRight: 5,
                  fontWeight: 'normal',
                }}>
                  -{' '}
                  {(
                    ((orderData.discount) || 0)
                  ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            {
              vatAmount > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={{
                    fontSize: 11,
                    color: '#1f2937',
                    width: '75%',
                    textAlign: 'left',
                    paddingLeft: 5,
                    fontWeight: 'normal',
                  }}>VAT (18%)</Text>
                  <Text style={{
                    fontSize: 11,
                    color: '#1f2937',
                    width: '25%',
                    textAlign: 'right',
                    paddingRight: 5,
                    fontWeight: 'normal',
                  }}>
                    + {vatAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              ) : null
            }

            {/* Grand Total Row */}
            <View style={[styles.summaryRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Net Total:</Text>
              <Text style={styles.grandTotalValue}>
                {netTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            {
              orderData?.PaymentStatus === "Paid" ? null : (
                <View>
                  {totalLoanAmount > 0 ? (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Loan Amount:</Text>
                      <Text style={styles.summaryValue}>
                        {totalLoanAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )

            }

            {
              orderData?.PaymentStatus === "Advanced" ? (
                <View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Advanced Paid Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {
                        orderData?.payments?.some(payment => payment.payment_type === "Advance")
                          ? Number(orderData.payments.find(p => p.payment_type === "Advance")?.amount || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })
                          : "-"
                      }
                    </Text>
                  </View>

                  {/* {
                  orderData?.payments?.some(payment => payment.payment_type === "Partial") ? (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Partial Paid Amount:</Text>
                      <Text style={styles.summaryValue}>
                        {
                          orderData?.payments?.some(payment => payment.payment_type === "Partial")
                            ? Number(orderData.payments.find(p => p.payment_type === "Partial")?.amount || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                            : null
                        }
                      </Text>
                    </View>
                  ) : null
                } */}

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Paid Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {
                        orderData?.payments?.map(payment => payment.amount).reduce((acc, amount) => acc + amount + totalLoanAmount, 0)
                          .toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })
                      }
                    </Text>
                  </View>


                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Remaining Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {(netTotal - totalPaid - totalLoanAmount)?.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Text>
                  </View>
                </View>
              ) : null
            }

            {/* <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Paid Amount:</Text>
            <Text style={styles.summaryValue}>
              {
                orderData?.payments?.map(payment => payment.amount).reduce((acc, amount) => acc + amount, 0)
                  .toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
              }
            </Text>
          </View> */}


          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section} break> {/* Add break prop here */}
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          {/* <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by Renewaa Private Limited. If a manufacturing defect occurs, the cell will be replaced free of charge.</Text>
        <Text style={styles.termsValue}>• Warranty does not apply for physical damage or force majeure events.</Text>
        <Text style={styles.termsValue}>• Warranty void if battery pack is used without the BMS.</Text>
        <Text style={styles.termsValue}>• Damages from lightning or natural disasters are excluded.</Text>
        <Text style={styles.termsValue}>• Mention the Quotation or Invoice Number when making payments.</Text> */}
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
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years.</Text>
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
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years.</Text>
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
              <Text style={styles.termsValue}>• Lithium batteries have 2 years of company local replacement warranty provided by Renewaa Private Limited. (Applied to the first two years from the date of purchase.)</Text>
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
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years. </Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control.</Text>
              <Text style={styles.termsValue}>• For the Battery lead time will be within two weeks from the PO date. There will be an additional 100,000 of payment if the company does not provide us with the used forklift battery tray. </Text>
              <Text style={styles.termsValue}>• No Any prior advance needed. </Text>
            </View>
          }
          {
            terms.includes(4) &&
            <View>
              <Text style={styles.termsValue}>• 3 years or 100,000km driving warranty will be provided for the Battery pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 3 years.  </Text>
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
              <Text style={styles.termsValue}>• Upon installation of the new battery in the Nissan Leaf, the old battery will become the property of Renewaa Private Limited. By proceeding with the battery upgrade, the customer agrees to transfer ownership of the removed battery to Renewaa Private Limited. This transfer is a condition of the upgrade service and does not affect the warranty coverage on the newly installed battery.</Text>
            </View>
          }
          {
            terms.includes(6) &&
            <View>
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years.  </Text>
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
              <Text style={styles.termsValue}>• 10 Year warranty will be provided for the Battery Pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 10 years.  </Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events. </Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS.</Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control. </Text>
            </View>
          }
          {
            terms.includes(11) &&
            <View>
              <Text style={styles.termsValue}>• 5 Year warranty will be provided for the Battery Pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 5 years.  </Text>
              <Text style={styles.termsValue}>• 2 Years of Repair warranty will be provided for the inverter for manufacture defects only. </Text>
              <Text style={styles.termsValue}>• 10 Years of product warranty + 25 years of performance warranty will be provided for the panels installed.</Text>
              <Text style={styles.termsValue}>• Warranty does not apply for physical damage (Includes burn marks, corrosion, pin damage, scratches, split liquids etc) or force majeure events. </Text>
              <Text style={styles.termsValue}>• Warranty void if the battery pack is used without the BMS. </Text>
              <Text style={styles.termsValue}>• The warranty specifically excludes damages caused by lightning strikes or other natural phenomena beyond our control. </Text>
              <Text style={styles.termsValue}>• Please mention the Quotation Number/ Invoice Number as a reference when depositing funds to the account. </Text>
            </View>
          }
          {
            terms.includes(12) &&
            <View>
              <Text style={styles.termsValue}>• 10 Year warranty will be provided for the Battery Pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 10 years.  </Text>
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
              <Text style={styles.termsValue}>• 10 Year warranty will be provided for the Battery Pack by Renewaa Private Limited and if any type of manufacturing defect occurs in a battery cell, a brand new cell will be replaced for the defective cell free of charge for the first 10 years.  </Text>
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
              <Text style={styles.paymentDetail}>• Account Name: Renewaa Private Limited</Text>
              <Text style={styles.paymentDetail}>• Account Number: 1000712948</Text>
              <Text style={styles.paymentDetail}>• Bank Name: Commercial Bank PLC</Text>
              <Text style={styles.paymentDetail}>• Branch Name: Borella Branch</Text>
            </View>
          ) : (
            <View View style={[styles.section, styles.paymentInfoSection]}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <Text style={styles.value}>Cash payment or cheques preferred. Bank transfer details below:</Text>
              <Text style={styles.paymentDetail}>• Account Name: Renewaa Energy Private Limited</Text>
              <Text style={styles.paymentDetail}>• Account Number: 1000962329</Text>
              <Text style={styles.paymentDetail}>• Bank Name: Commercial Bank PLC</Text>
              <Text style={styles.paymentDetail}>• Branch Name: Ja Ela Branch</Text>
            </View>
          )
        }

        <View style={styles.footerContactInfo}>
          <Text style={styles.footerTextLine}>
            <Text style={styles.footerContactLabel}>This is a computer generated invoice hence no signature required.</Text>
          </Text>
        </View>


        {/* Footer with Logo and Contact Details */}
        <View style={styles.footer}>
          <Image src={RenewaaLogo} style={styles.footerLogo} />
          <Text style={styles.footerTextLine}> Thank You for Your Business!</Text>
          <View style={styles.footerContactInfo}>
            <Text style={styles.footerTextLine}>
              <Text style={styles.footerContactLabel}>{orderData?.vat === true ? "Renewaa Private Limited" : "Renewaa Energy"}</Text>
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
          <Text style={styles.footerTextLine}>Generated by RIMS • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
        </View>
      </Page>
    </Document >
  )

};

export default OrderTemplate;