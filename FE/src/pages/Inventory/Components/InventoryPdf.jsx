import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#f9fafb',
    },
    header: {
        fontSize: 22,
        marginBottom: 20,
        textAlign: 'center',
        color: '#1e40af',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: '#ffffff',
        border: '1pt solid #d1d5db',
        borderRadius: 6,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1f2937',
        borderBottom: '1pt solid #d1d5db',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottom: '1pt solid #e5e7eb',
    },
    lastRow: {
        borderBottom: 0,
    },
    label: {
        fontSize: 11,
        fontWeight: 'semibold',
        color: '#4b5563',
        width: '40%',
    },
    value: {
        fontSize: 11,
        color: '#111827',
        width: '58%',
        textAlign: 'right',
    },
    footer: {
        marginTop: 30,
        fontSize: 10,
        textAlign: 'center',
        color: '#9ca3af',
    }
});

const InventoryTemplate = ({ inventoryData, itemUsageData, restockData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Inventory Item Report</Text>

            {/* Inventory Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Inventory Details</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Item Code</Text>
                    <Text style={styles.value}>{inventoryData?.item_code}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Item Name</Text>
                    <Text style={styles.value}>{inventoryData?.item_name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Unit Cost</Text>
                    <Text style={styles.value}>LKR {inventoryData?.unit_cost}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Quantity</Text>
                    <Text style={styles.value}>{inventoryData?.quantity}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Threshold</Text>
                    <Text style={styles.value}>{inventoryData?.threshold}</Text>
                </View>
            </View>

            {/* Item Usage */}
            {itemUsageData?.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Item Usage</Text>
                    {itemUsageData.map((item, i) => (
                        <View key={i} style={{ marginBottom: 12 }}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Order No.</Text>
                                <Text style={styles.value}>{item.order_type}{item.order_no}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Usage Count</Text>
                                <Text style={styles.value}>{item.usage_count}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>User Name</Text>
                                <Text style={styles.value}>{item.user_name}</Text>
                            </View>
                            <View style={[styles.row, styles.lastRow]}>
                                <Text style={styles.label}>Created At</Text>
                                <Text style={styles.value}>{new Date(item.created_at).toLocaleString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Item Restock */}
            {restockData?.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Item Restock</Text>
                    {restockData.map((item, i) => (
                        <View key={i} style={{ marginBottom: 12 }}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Unit Price</Text>
                                <Text style={styles.value}>{item.unit_price}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Quantity</Text>
                                <Text style={styles.value}>{item.quantity}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Amount</Text>
                                <Text style={styles.value}>{item.amount}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>User Name</Text>
                                <Text style={styles.value}>{item.user_name}</Text>
                            </View>
                            <View style={[styles.row, styles.lastRow]}>
                                <Text style={styles.label}>Created At</Text>
                                <Text style={styles.value}>{new Date(item.created_at).toLocaleString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Footer */}
            <View style={styles.row}>
                <Text style={styles.label}>Report Generated At:</Text>
                <Text style={styles.value}>{new Date().toLocaleString()}</Text>
            </View>
            <Text style={styles.footer}>Generated by RIMS</Text>
        </Page>
    </Document>
);

export default InventoryTemplate;
