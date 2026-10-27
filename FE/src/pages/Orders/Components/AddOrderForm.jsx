"use client";

import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdOutlineRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getAllQuotesDetails } from "@/api/quoteApi";
import { fetchProductsList } from "@/api/productApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createOrder, featchLatestOrderNoType } from "@/api/orderApi";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, MinusCircleIcon, PlusCircle, PlusCircleIcon, Search, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { uploadImageToCloudinary } from "@/api/cloudinaryApi";
import { Separator } from "@/components/ui/separator";
import { createInventoryUsage } from "@/api/inventoryApi";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getCuestomerByPhoneNo } from "@/api/customerApi";
import { createSale, fetchSalesNoList, updateSale } from "@/api/saleApi";
import { isValidPhoneNumber } from "libphonenumber-js";
import { fethchSalespersonNames } from "@/api/salespersonApi";

const generateLocalId = () => Math.random().toString(36).substring(7);

const getNoteFromSpecification = (spec) => {
    switch (spec) {
        case '6.2kW Solar Ongrid System Complete Installation':
            return `Inverter Capacity : 5kW \nInverter Model : Solax X1-BOOST G4 \nPanels Capacity : 6.2kW \nPanel Model : 620W -JA N-Type Solar \nDC Switchgear - Zbeny \nDC Cable - LAPP (German) \nAC Switchgear - Kripal \nAC Cable - ACL/Kelani`;
        case '5kW Solar Ongrid System Complete Installation':
            return `Inverter Capacity : 5kW\nInverter Model : Solax X1-BOOST G4\nPanels Capacity : 5kW\nPanel Model : 620W -JA N-Type Solar\nDC Switchgear - Zbeny\nDC Cable - LAPP (German)\nAC Switchgear - Kripal\nAC Cable - ACL/Kelani `;
        default:
            return '';
    }
};

const formSchema = z.object({
    Type: z.string().min(1, { message: "Order type is required" }),
    OrderNo: z.string().min(2, { message: "Order number is required" }),
    SubTotal: z.number({ required_error: "Sub total is required" }),
    Discount: z.number().optional(),
    Total: z.number({ required_error: "Total is required" }),
    Title: z.string().min(2, { message: "Title is required" }),
    PhoneNo1: z.string().transform((val) => val.startsWith('+') ? val : `+${val}`).refine((val) => isValidPhoneNumber(val), { message: "Invalid international phone number" }),
    PhoneNo2: z.string().transform((val) => val.startsWith('+') ? val : `+${val}`).refine((val) => isValidPhoneNumber(val), { message: "Invalid phone number" }).or(z.literal("")).optional(),
    FirstName: z.string().min(2, { message: "First name is required" }),
    LastName: z.string().optional(),
    Email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
    Address: z.string().optional(),
    Note: z.string().optional(),
    PaidDate: z.date().optional().nullable(),
    PaidAmount: z.number().optional(),
    PaidRecipt: z.any().optional(),
    PaymentMode: z.string().optional(),
    Expected_Delivery_Date: z.date().optional().nullable(),
    vat: z.number().optional(),
    netTotal: z.number().optional(),
    includeVat: z.boolean().optional(),
    poNo: z.string().optional(),
    vatNo: z.string().optional(),
    Loan: z.number().optional(),
    includeLoan: z.boolean().optional(),
    SalesPerson: z.string().optional(),
    SalesType: z.string().optional(),
    Commission: z.coerce.number().optional(),
    Date: z.date().optional(),
});

const existingOrderNumbers = ["INV/EHP/1028", "INV/EHP/1067", "INV/EHP/1068", "INV/EHP/1077", "INV/EHP/1082", "INV/EHP/1083", "INV/EHP/R/1084", "INV/EHP/R/1085", "INV/EHP/R/1086", "INV/EHP/R/1087", "INV/EHP/R/1089", "INV/EHP/R/1090", "INV/EHP/R/1142", "INV/EHP/R/1091", "INV/EHP/R/1092", "INV/EHP/R/1093", "INV/EHP/R/1094", "INV/EHP/R/1095"];

const AddOrderForm = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const oneMonthFromToday = addDays(new Date(), 7);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Title: "Mr.",
            Type: "INV/EHP/",
            Discount: 0,
            PaidDate: new Date(),
            Expected_Delivery_Date: oneMonthFromToday,
            Date: new Date(),
            FirstName: "",
            LastName: "",
            Email: "",
            Address: "",
            PhoneNo1: "",
            PhoneNo2: "",
            poNo: "",
            vatNo: "",
            SalesPerson: "",
        }
    });

    const { user } = useUser();
    const userID = user?.id;
    const [salespersons, setSalespersons] = useState([]);

    const [latestOrderNumbers, setLatestOrderNumbers] = useState({
        "INV/EHP/": "1000",
        "INV/EHP/R/": "1000"
    });
    const [orderType, setOrderType] = useState("INV/EHP/");
    const [nextOrderNo, setNextOrderNo] = useState();

    const [productList, setProductList] = useState([]);
    const [quoteList, setQuoteList] = useState([]);
    const [salesList, setSalesList] = useState([]);

    const [paymentStatus, setPaymentStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [quoteNo, setQuoteNo] = useState("");
    const [saleNo, setSaleNo] = useState("");

    const [search, setSearch] = useState("");
    const [searchQuote, setSearchQuote] = useState("");
    const [searchSales, setSearchSales] = useState("");

    const [salespersonStatus, setSalespersonStatus] = useState("Active");

    const [limit, setLimit] = useState(15);
    const [offset, setOffset] = useState(0);
    const [paymentType, setPaymentType] = useState(null);
    const [includeVat, setIncludeVat] = useState(false);
    const [includeLoan, setIncludeLoan] = useState(false);
    const [selectedQuoteSaleID, setSelectedQuoteSaleID] = useState(null);

    const { append, replace, remove } = useFieldArray({
        control: form.control,
        name: 'addProduct',
    });

    const [addProduct, setAddProduct] = useState([{ id: 0, product_name: '', product_category: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '', localId: generateLocalId() }]);

    const handleAddProductChange = () => {
        const newItem = { id: 0, product_name: '', product_category: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '', localId: generateLocalId() };
        const updated = [...addProduct, newItem];
        setAddProduct(updated);
        append(newItem);
    };

    const handleRemoveProduct = (index) => {
        const updated = addProduct.filter((_, i) => i !== index);
        setAddProduct(updated);
        remove(index);
        setTimeout(calculateTotals, 0);
    };

    const handleIncrementQty = (index) => {
        setAddProduct((prev) => {
            const updated = [...prev];
            const newQty = updated[index].qty + 1;
            updated[index].qty = newQty;
            updated[index].subtotal = newQty * updated[index].unitprice;

            form.setValue(`addProduct.${index}.qty`, newQty);
            form.setValue(`addProduct.${index}.subtotal`, updated[index].subtotal);

            setTimeout(calculateTotals, 0);
            return updated;
        });
    };

    const handleDecrementQty = (index) => {
        setAddProduct((prev) => {
            const updated = [...prev];
            const currentQty = updated[index].qty;
            if (currentQty > 1) {
                const newQty = currentQty - 1;
                updated[index].qty = newQty;
                updated[index].subtotal = newQty * updated[index].unitprice;

                form.setValue(`addProduct.${index}.qty`, newQty);
                form.setValue(`addProduct.${index}.subtotal`, updated[index].subtotal);

                setTimeout(calculateTotals, 0);
            }
            return updated;
        });
    };

    useEffect(() => {
        const loadSalespersons = async () => {
            try {
                const token = await getToken();
                const response = await fethchSalespersonNames(token, salespersonStatus);
                const salespersonsList = response.data.salespersons;
                const formattedList = salespersonsList.map(item => ({
                    id: item.id,
                    name: item.salesperson
                }));
                setSalespersons(formattedList);
            } catch (err) {
                console.error("Error fetching salespersons:", err);
            }
        };
        loadSalespersons();
    }, [getToken]);

    useEffect(() => {
        try {
            const featchQuotesList = async () => {
                const token = await getToken();
                const response = await getAllQuotesDetails(token, searchQuote, 15, 0);
                setQuoteList(response?.data || []);
            };
            featchQuotesList();
        } catch (error) {
            console.error("Error fetching quote list:", error);
        }
    }, [getToken, searchQuote]);

    useEffect(() => {
        const fetchSalesList = async () => {
            try {
                const token = await getToken();
                const response = await fetchSalesNoList(token, searchSales, 15, 0);
                setSalesList(response?.data?.sales || []);
            } catch (error) {
                console.error("Error fetching sales list:", error);
                setSalesList([]);
            }
        };
        fetchSalesList();
    }, [getToken, searchSales]);

    useEffect(() => {
        addProduct.forEach((product, index) => {
            const note = getNoteFromSpecification(product.specifications);
            if (note && note !== product.note) {
                form.setValue(`addProduct.${index}.note`, note);
                setAddProduct((prev) => {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], note };
                    return updated;
                });
            }
        });
    }, [addProduct.map(p => p.specifications).join('|')]);

    const [additionalCharges, setAdditionalCharges] = useState([]);

    const handleAddAdditionalCharge = () => {
        setAdditionalCharges([...additionalCharges, { option: '', type: '', value: '', localId: generateLocalId() }]);
    };

    const handleRemoveCharge = (index) => {
        const updated = [...additionalCharges];
        updated.splice(index, 1);
        setAdditionalCharges(updated);
        setTimeout(calculateTotals, 0);
    };

    useEffect(() => {
        if (orderType && nextOrderNo) {
            form.setValue("OrderNo", `${orderType}${nextOrderNo}`);
        }
    }, [orderType, nextOrderNo, form]);

    useEffect(() => {
        if (quoteNo) {
            const selectedQuote = quoteList.find(q => q.id?.toString() === quoteNo?.toString());

            if (selectedQuote) {
                form.setValue('additionalCharges', []);
                setAdditionalCharges([]);

                const newAddProducts = selectedQuote.items.map(item => {
                    const product = productList.find(p => p.id?.toString() === item.product_id?.toString() || p.ProductName === item.product_name);
                    return {
                        id: item.product_id || product?.id || '',
                        product_name: product?.id || item.product_id || '',
                        display_name: product?.ProductName || item.product_name || '',
                        product_category: item.category || product?.category || '',
                        unitprice: item.unit_price || 0,
                        specifications: product?.Specifications || '',
                        qty: item.quantity,
                        subtotal: item.subtotal || (item.unit_price * item.quantity),
                        note: item.note || '',
                        localId: generateLocalId()
                    };
                });

                replace(newAddProducts.map(p => ({ ...p, product_name: p.id })));
                setAddProduct(newAddProducts);

                const newAdditionalCharges = selectedQuote.additional_charges?.map(charge => {
                    let optionType = charge.type;
                    let customType = charge.type;

                    const match = charge.type?.match(/^Others\((.*)\)$/);
                    if (match) {
                        optionType = "Others";
                        customType = match[1];
                    } else if (!["Delivery Charges", "Installation Charges", "Installation Material Charges"].includes(charge.type)) {
                        optionType = "Others";
                    }

                    return {
                        id: charge.id || null,
                        option: optionType,
                        type: customType,
                        value: charge.value,
                        localId: generateLocalId()
                    };
                }) || [];

                setAdditionalCharges(newAdditionalCharges);
                form.setValue("additionalCharges", newAdditionalCharges);

                form.setValue("SubTotal", selectedQuote.subtotal);
                form.setValue("Discount", selectedQuote.discount);
                form.setValue("Total", selectedQuote.total);
                form.setValue("Title", selectedQuote.title);
                form.setValue("PhoneNo1", selectedQuote.phone_no1);
                form.setValue("PhoneNo2", selectedQuote.phone_no2);
                form.setValue("FirstName", selectedQuote.first_name);
                form.setValue("LastName", selectedQuote.last_name);
                form.setValue("Email", selectedQuote.email);
                form.setValue("Address", selectedQuote.address);
                form.setValue("poNo", selectedQuote.po_no);
                form.setValue("vatNo", selectedQuote.vat_no);

                form.setValue("SalesPerson", selectedQuote.salesperson_id?.toString() || "");
                form.setValue("SalesType", selectedQuote.sales_type);
                form.setValue("Commission", selectedQuote.commission);

                if (selectedQuote.date) {
                    form.setValue("Date", new Date(selectedQuote.date));
                } else {
                    form.setValue("Date", new Date());
                }

                if (selectedQuote.sales_id) {
                    form.setValue("SaleNo", selectedQuote.sales_id?.toString());
                    setSaleNo(selectedQuote.sales_id?.toString());
                }
                setSelectedQuoteSaleID(selectedQuote.sales_id?.toString());

                if (selectedQuote.vat === true) {
                    setIncludeVat(true);
                    form.setValue("includeVat", true);
                    const total = parseFloat(selectedQuote.total || 0);
                    const vatAmount = total * 0.18;
                    const netTotal = total + vatAmount;
                    form.setValue("vat", vatAmount);
                    form.setValue("netTotal", netTotal);
                } else {
                    setIncludeVat(false);
                    form.setValue("includeVat", false);
                    form.setValue("vat", 0);
                    form.setValue("netTotal", selectedQuote.total);
                }
            }
        }
    }, [quoteNo, replace, form]);

    const getNextValidOrderNumber = (prefix, lastNumberFromApi, blockedNumbers) => {
        let currentNumber = lastNumberFromApi ? parseInt(lastNumberFromApi) : 999;
        let nextCandidate = currentNumber + 1;
        let foundUnique = false;

        while (!foundUnique) {
            const fullOrderString = `${prefix}${nextCandidate}`;
            if (blockedNumbers.includes(fullOrderString)) {
                nextCandidate++;
            } else {
                foundUnique = true;
            }
        }
        return nextCandidate.toString();
    };

    useEffect(() => {
        let isMounted = true;
        const fetchLatestOrderTypeNo = async () => {
            try {
                const token = await getToken();
                const response = await featchLatestOrderNoType(token);

                if (isMounted && response?.data?.order_numbers) {
                    const fetchedOrderNumbers = response.data.order_numbers;
                    setLatestOrderNumbers(fetchedOrderNumbers);

                    const defaultOrderType = "INV/EHP/";
                    const currentTypeOrderNo = fetchedOrderNumbers[defaultOrderType];
                    const nextOrderNumber = getNextValidOrderNumber(defaultOrderType, currentTypeOrderNo, existingOrderNumbers);

                    setOrderType(defaultOrderType);
                    setNextOrderNo(nextOrderNumber);

                    form.setValue("Type", defaultOrderType);
                    form.setValue("OrderNo", nextOrderNumber);
                }
            } catch (error) {
                console.error("Error fetching latest order numbers:", error);
            }
        };

        fetchLatestOrderTypeNo();
        return () => { isMounted = false; };
    }, [getToken, form]);

    useEffect(() => {
        try {
            const featchBasicProductsList = async () => {
                const token = await getToken();
                const response = await fetchProductsList(token, search, limit, offset);
                setProductList(response?.data?.products || []);
            };
            featchBasicProductsList();
        } catch (error) {
            console.error("Error fetching product data:", error);
        }
    }, [getToken, search, limit, offset]);

    useEffect(() => {
        if (Object.keys(latestOrderNumbers).length === 0) return;

        const newOrderType = includeVat ? "INV/EHP/R/" : "INV/EHP/";
        const currentTypeOrderNo = latestOrderNumbers[newOrderType];
        const newNextOrderNo = getNextValidOrderNumber(newOrderType, currentTypeOrderNo, existingOrderNumbers);

        setOrderType(newOrderType);
        setNextOrderNo(newNextOrderNo);
        form.setValue("Type", newOrderType, { shouldValidate: true });
        form.setValue("OrderNo", newNextOrderNo, { shouldValidate: true });

    }, [includeVat, latestOrderNumbers, form]);

    const { watch } = form;
    const loanAmount = watch("Loan");
    const paidAmount = watch("PaidAmount");
    const total = watch("Total") || 0;

    const vatAmount = includeVat ? total * 0.18 : 0;
    const netTotal = total + vatAmount;
    const effectiveTotal = includeVat ? netTotal : total;

    const fullPaidAmount = loanAmount ? (paidAmount + loanAmount) : paidAmount;

    useEffect(() => {
        if (!fullPaidAmount || fullPaidAmount === 0) {
            setPaymentStatus("Awaiting");
            setPaymentType("None");
        } else if (fullPaidAmount > 0 && fullPaidAmount < effectiveTotal) {
            setPaymentStatus("Advanced");
            setPaymentType("Advance");
        } else if (fullPaidAmount >= effectiveTotal) {
            setPaymentStatus("Paid");
            setPaymentType("Partial");
        }
    }, [fullPaidAmount, effectiveTotal]);

    async function handleSubmit(values) {
        const token = await getToken();
        setIsSubmitting(true);
        let receiptUrl = "";

        if (values.PaidRecipt && values.PaidRecipt.length > 0) {
            try {
                const file = values.PaidRecipt[0];
                receiptUrl = await uploadImageToCloudinary(file);
            } catch (uploadError) {
                console.error("Failed to upload receipt:", uploadError);
                toast.error("Failed to upload receipt image. Please try again.", { position: "bottom-right" });
                setIsSubmitting(false);
                return;
            }
        }

        try {
            let finalSalesID = null;
            const emptyUUID = "00000000-0000-0000-0000-000000000000";

            if (saleNo && saleNo !== emptyUUID) {
                finalSalesID = saleNo;
                const saleRes = await updateSale(token, { id: finalSalesID, status: "Confirmed" });
                if (saleRes.message !== "success") throw new Error("Failed to update existing sale record.");
            } else if (selectedQuoteSaleID && selectedQuoteSaleID !== emptyUUID) {
                finalSalesID = selectedQuoteSaleID;
                const saleRes = await updateSale(token, { id: finalSalesID, status: "Confirmed" });
                if (saleRes.message !== "success") throw new Error("Failed to update existing sale record.");
            } else if (values.SalesPerson) {
                let finalDate = new Date().toISOString();
                if (values.Date) {
                    const parsedDate = new Date(values.Date);
                    if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1899) {
                        finalDate = parsedDate.toISOString();
                    }
                }
                const salesPayload = {
                    type: values.SalesType,
                    status: "Confirmed",
                    salesperson: values.SalesPerson,
                    commission: values.Commission,
                    date: finalDate,
                    customer_name: `${values.FirstName} ${values.LastName}`,
                    customer_phone: values.PhoneNo1,
                    updated_by: userID
                };

                const saleRes = await createSale(token, salesPayload);
                if (saleRes.message === "success" && saleRes.data?.id) {
                    finalSalesID = saleRes.data.id;
                } else {
                    throw new Error("Failed to create new sale record.");
                }
            }

            const orderPayload = {
                customer: {
                    Title: values.Title,
                    PhoneNo1: values.PhoneNo1,
                    PhoneNo2: values.PhoneNo2,
                    FirstName: values.FirstName,
                    LastName: values.LastName,
                    Email: values.Email,
                    Address: values.Address,
                    vatNo: values.vatNo,
                },
                order: {
                    OrderNo: values.OrderNo.replace(values.Type, ""),
                    Type: values.Type,
                    SubTotal: values.SubTotal,
                    additional_charges: additionalCharges?.map(charge => {
                        const finalType = charge.option === "Others"
                            ? `Others(${charge.type})`
                            : (charge.option || charge.type);

                        return {
                            type: finalType,
                            value: parseFloat(charge.value) || 0,
                        };
                    }),
                    Discount: values.Discount,
                    Total: includeVat ? netTotal : values.Total,
                    Vat: includeVat,
                    CreatedBy: userID,
                    PaymentStatus: paymentStatus,
                    ExpectedDeliveryDate: values.Expected_Delivery_Date,
                    PoNo: values.poNo,
                    SalesID: finalSalesID,
                },
                order_items: {
                    items: addProduct
                        .filter(p => p.id && p.subtotal !== undefined)
                        .map(p => ({
                            product_id: p.id,
                            unit_price: p.unitprice,
                            quantity: p.qty,
                            subtotal: p.subtotal,
                            note: p.note || '',
                        })),
                },
                payments: {
                    payment_type: paymentType,
                    amount: values.PaidAmount,
                    loan_amount: values.Loan,
                    paid_date: values.PaidDate,
                    payment_mode: values.PaymentMode,
                    image: receiptUrl,
                    created_by: userID
                }
            };

            const orderRes = await createOrder(token, orderPayload);

            if (orderRes?.message === "success") {
                toast.success("Order added successfully!");
                const usageData = {
                    usages: addProduct.map(item => ({
                        item_id: item.id,
                        order_id: orderRes.data.id,
                        usage_count: item.qty,
                        user_name: user.fullName,
                    }))
                };
                await createInventoryUsage(token, usageData);
                navigate("/orders");
            } else {
                toast.error(orderRes?.message || "Error adding order!");
            }

        } catch (error) {
            toast.error(error.message || "An unexpected error occurred!");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleClose = () => {
        navigate("/orders");
    }

    const handleClearAll = () => {
        form.reset();
        setAddProduct([{ id: 0, product_name: '', product_category: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '', localId: generateLocalId() }]);
        setAdditionalCharges([]);
    };

    const calculateTotals = () => {
        const values = form.getValues();
        const subtotal = (values.addProduct || []).reduce((acc, item) => {
            const value = parseFloat(item?.subtotal || 0);
            return acc + (isNaN(value) ? 0 : value);
        }, 0);

        const discount = values.Discount || 0;
        const additionalChargesTotal = (additionalCharges ?? []).reduce((acc, charge) => {
            return acc + parseFloat(charge.value || "0");
        }, 0);

        const subTotalWithAdditionalCharges = subtotal + additionalChargesTotal;
        const total = subTotalWithAdditionalCharges - discount;
        const vatAmount = total * 0.18;
        const netTotal = total + vatAmount;

        form.setValue("SubTotal", subtotal);
        form.setValue("Total", total);
        form.setValue("vat", vatAmount);
        form.setValue("netTotal", netTotal);
    };

    const handleCustomerSearch = async (phoneNo) => {
        try {
            const token = await getToken();
            const response = await getCuestomerByPhoneNo(token, phoneNo);
            if (response.data) {
                form.setValue("Title", response.data.title);
                form.setValue("PhoneNo1", response.data.phone_no1);
                form.setValue("PhoneNo2", response.data.phone_no2);
                form.setValue("FirstName", response.data.first_name);
                form.setValue("LastName", response.data.last_name);
                form.setValue("Email", response.data.email);
                form.setValue("Address", response.data.address);
                form.setValue("vatNo", response.data.vat_no);
            }
        } catch (error) {
            toast.error("No customer found with that phone number.");
            console.error("Error fetching customer data:", error);
        }
    };

    return (
        <div className="w-full bg-transparent h-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">
                    {/* Order Number Display */}
                    <div className="flex justify-end">
                        {addProduct.length > 0 && (
                            <div className="text-sm font-semibold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl shadow-sm">
                                Order No: <span className="text-blue-600 font-extrabold">{orderType}{nextOrderNo}</span>
                            </div>
                        )}
                    </div>

                    <div className="hidden">
                        <FormField
                            control={form.control}
                            name="Type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input value={orderType} {...field} readOnly />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="OrderNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input value={nextOrderNo} {...field} readOnly />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Quote Reference Selection */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50">
                        <FormField
                            control={form.control}
                            name="QuoteNo"
                            render={({ field }) => (
                                <FormItem className="max-w-md">
                                    <FormLabel className="text-slate-700 font-semibold text-sm">Quote Reference (Optional)</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setQuoteNo(value);
                                        }}
                                        defaultValue={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                <SelectValue placeholder="Select quote no" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <div className="p-2">
                                                <Input
                                                    placeholder="Search quote…"
                                                    value={searchQuote}
                                                    onChange={(e) => setSearchQuote(e.target.value)}
                                                    className="w-full h-9 text-sm"
                                                />
                                            </div>
                                            {quoteList?.map((quote) => (
                                                <SelectItem key={quote.id} value={quote.id?.toString()}>
                                                    {quote.type}{quote.quote_no}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Product Details Section */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-800">Product Details</h2>
                            <div className="hidden md:flex gap-12 text-xs font-bold text-slate-400 uppercase tracking-wider pr-8">
                                <span>Unit Price</span>
                                <span>Qty</span>
                                <span>Total Price</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {addProduct.map((product, index) => (
                                <div key={product.localId || index} className="p-4 border border-slate-200/70 rounded-2xl bg-white shadow-sm space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                        {/* Product Select */}
                                        <div className="md:col-span-5">
                                            <FormField
                                                control={form.control}
                                                name={`addProduct.${index}.product_name`}
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                const selectedProduct = productList.find(p => p.id?.toString() === value?.toString() || p.ProductName === value);
                                                                setAddProduct(prev => {
                                                                    const updated = [...prev];
                                                                    const qty = updated[index].qty || 1;
                                                                    updated[index] = {
                                                                        ...updated[index],
                                                                        id: selectedProduct?.id || '',
                                                                        product_name: selectedProduct?.id?.toString() || value,
                                                                        product_category: selectedProduct?.category || '',
                                                                        unitprice: selectedProduct?.BasePrice || 0,
                                                                        specifications: selectedProduct?.Specifications || '',
                                                                        qty: qty,
                                                                        subtotal: (selectedProduct?.BasePrice || 0) * qty,
                                                                    };
                                                                    return updated;
                                                                });
                                                                form.setValue(`addProduct.${index}.unitprice`, selectedProduct?.BasePrice || 0);
                                                                form.setValue(`addProduct.${index}.subtotal`, (selectedProduct?.BasePrice || 0) * product.qty);
                                                                setTimeout(calculateTotals, 0);
                                                            }}
                                                            onOpenChange={(isOpen) => {
                                                                if (!isOpen) setSearch("");
                                                            }}
                                                            value={product.product_name?.toString() || field.value?.toString()}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                                                                    <SelectValue placeholder={`Select Product ${index + 1}`}>
                                                                        {productList.find(p => p.id?.toString() === product.product_name?.toString())?.ProductName || product.display_name || product.product_name || `Select Product ${index + 1}`}
                                                                    </SelectValue>
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="w-full">
                                                                <div className="p-2">
                                                                    <Input
                                                                        placeholder="Search products…"
                                                                        value={search}
                                                                        onChange={(e) => setSearch(e.target.value)}
                                                                        className="w-full h-9 text-sm"
                                                                    />
                                                                </div>
                                                                {product.product_name && !productList.some(p => p.id?.toString() === product.product_name?.toString()) && (
                                                                    <SelectItem key={`fallback-${index}`} value={product.product_name.toString()}>
                                                                        {product.display_name || product.product_name}
                                                                    </SelectItem>
                                                                )}
                                                                {productList?.map((prod) => (
                                                                    <SelectItem key={prod.id} value={prod.id?.toString()}>
                                                                        {prod.ProductName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Unit Price */}
                                        <div className="md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`addProduct.${index}.unitprice`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="Unit Price"
                                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl text-right font-medium"
                                                                value={product.unitprice}
                                                                onChange={(e) => {
                                                                    const value = Number(e.target.value) || 0;
                                                                    setAddProduct((prev) => {
                                                                        const updated = [...prev];
                                                                        const qty = updated[index].qty || 1;
                                                                        updated[index].unitprice = value;
                                                                        updated[index].subtotal = value * qty;
                                                                        return updated;
                                                                    });
                                                                    form.setValue(`addProduct.${index}.unitprice`, value);
                                                                    form.setValue(`addProduct.${index}.subtotal`, value * product.qty);
                                                                    setTimeout(calculateTotals, 0);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Qty */}
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className={`p-1.5 rounded-lg border border-slate-200 ${product.qty > 1 ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300'}`}
                                                    onClick={() => handleDecrementQty(index)}
                                                >
                                                    <MinusCircleIcon size={16} />
                                                </button>
                                                <FormField
                                                    control={form.control}
                                                    name={`addProduct.${index}.qty`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Qty"
                                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl text-center font-medium"
                                                                    value={product.qty}
                                                                    onChange={(e) => {
                                                                        let qty = Number(e.target.value) || 1;
                                                                        if (qty < 1) qty = 1;
                                                                        setAddProduct((prev) => {
                                                                            const updated = [...prev];
                                                                            updated[index].qty = qty;
                                                                            updated[index].subtotal = qty * product.unitprice;
                                                                            return updated;
                                                                        });
                                                                        form.setValue(`addProduct.${index}.qty`, qty);
                                                                        form.setValue(`addProduct.${index}.subtotal`, qty * product.unitprice);
                                                                        setTimeout(calculateTotals, 0);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                    onClick={() => handleIncrementQty(index)}
                                                >
                                                    <PlusCircleIcon size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal & Delete */}
                                        <div className="md:col-span-3 flex items-center gap-3">
                                            <FormField
                                                control={form.control}
                                                name={`addProduct.${index}.subtotal`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="Subtotal"
                                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl text-right font-bold"
                                                                value={product.subtotal}
                                                                readOnly
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            {addProduct.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 h-11 w-11 rounded-xl shrink-0"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </div>

                                    </div>

                                    {/* Note field */}
                                    <FormField
                                        control={form.control}
                                        name={`addProduct.${index}.note`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        className="bg-slate-50/50 border-slate-200 text-xs rounded-xl p-3"
                                                        placeholder={`Note for product ${index + 1}`}
                                                        {...field}
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value);
                                                            setAddProduct(prev => {
                                                                const updated = [...prev];
                                                                updated[index] = { ...updated[index], note: value };
                                                                return updated;
                                                            });
                                                        }}
                                                        rows={2}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddProductChange}
                                className="border-slate-200 text-blue-600 hover:bg-blue-50 rounded-xl h-10 px-4 w-full"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" /> Add Another Product
                            </Button>
                        </div>

                        <Separator className="my-6" />

                        {/* Totals & Calculations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200/70">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold text-sm">Additional Charges</Label>
                                    {additionalCharges?.map((charge, index) => (
                                        <div key={charge.localId || index} className="flex items-start gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`additionalCharges.${index}.type`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 flex flex-col gap-2">
                                                        <Select
                                                            onValueChange={(value) => {
                                                                const updated = [...additionalCharges];
                                                                updated[index].option = value;
                                                                updated[index].type = value === "Others" ? "" : value;
                                                                setAdditionalCharges(updated);
                                                                field.onChange(value === "Others" ? "" : value);
                                                            }}
                                                            value={charge.option || ""}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                                    <SelectValue placeholder="Charge Type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Delivery Charges">Delivery Charges</SelectItem>
                                                                <SelectItem value="Installation Charges">Installation Charges</SelectItem>
                                                                <SelectItem value="Installation Material Charges">Installation Material Charges</SelectItem>
                                                                <SelectItem value="Others">Others</SelectItem>
                                                            </SelectContent>
                                                        </Select>

                                                        {charge.option === "Others" && (
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Enter custom charge type"
                                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl mt-1"
                                                                    value={charge.type}
                                                                    onChange={(e) => {
                                                                        const updated = [...additionalCharges];
                                                                        updated[index].type = e.target.value;
                                                                        setAdditionalCharges(updated);
                                                                        field.onChange(e.target.value);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`additionalCharges.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className="w-32">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl text-right"
                                                                placeholder="0.00"
                                                                value={charge.value}
                                                                onChange={(e) => {
                                                                    const updated = [...additionalCharges];
                                                                    updated[index].value = e.target.value;
                                                                    setAdditionalCharges(updated);
                                                                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value));
                                                                    setTimeout(calculateTotals, 0);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => handleRemoveCharge(index)}
                                                className="text-rose-500 hover:text-rose-700 p-2 h-11 w-11 rounded-xl"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddAdditionalCharge}
                                        className="border-slate-200 text-blue-600 hover:bg-blue-50 rounded-xl h-9 px-3 text-xs mx-3"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Charge
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Checkbox
                                        id="vat"
                                        checked={includeVat}
                                        onCheckedChange={() => {
                                            setIncludeVat(!includeVat);
                                            setTimeout(calculateTotals, 0);
                                        }}
                                    />
                                    <Label htmlFor="vat" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                        Include VAT (18%)
                                    </Label>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-end">
                                <FormField
                                    control={form.control}
                                    name="SubTotal"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between">
                                            <FormLabel className="text-slate-600 font-semibold text-sm">Sub Total</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl w-44 text-right font-medium"
                                                    value={field.value ?? ''}
                                                    readOnly
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="Discount"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between">
                                            <FormLabel className="text-slate-600 font-semibold text-sm">Discount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl w-44 text-right font-medium"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                        field.onChange(val);
                                                        setTimeout(calculateTotals, 0);
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="Total"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between">
                                            <FormLabel className="text-slate-800 font-bold text-base">Total</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl w-44 text-right font-bold text-slate-900"
                                                    value={field.value ?? ''}
                                                    readOnly
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {includeVat && (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="vat"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between">
                                                    <FormLabel className="text-slate-600 font-semibold text-sm">VAT (18%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            className="bg-slate-50 border-slate-200 h-11 rounded-xl w-44 text-right font-medium"
                                                            value={field.value ?? ''}
                                                            readOnly
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="netTotal"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between pt-2 border-t border-slate-200">
                                                    <FormLabel className="text-blue-700 font-extrabold text-base">Net Total</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            className="bg-blue-50 border-blue-200 h-11 rounded-xl w-44 text-right font-extrabold text-blue-800"
                                                            value={field.value ?? ''}
                                                            readOnly
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer Details Section */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                        <h2 className="font-bold text-lg text-slate-800">Customer Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-5">
                                <FormField
                                    control={form.control}
                                    name="Title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Title</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                        <SelectValue placeholder="Mr." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Mr.">Mr</SelectItem>
                                                    <SelectItem value="Mrs.">Mrs</SelectItem>
                                                    <SelectItem value="Miss.">Miss</SelectItem>
                                                    <SelectItem value="M/S.">M/S</SelectItem>
                                                    <SelectItem value="Dr">Dr</SelectItem>
                                                    <SelectItem value="Rev">Rev</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="PhoneNo2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Secondary Phone No.</FormLabel>
                                            <FormControl>
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="94XXXXXXXXX" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="FirstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">First Name</FormLabel>
                                            <FormControl>
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="Address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Address</FormLabel>
                                            <FormControl>
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="123 Street Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {includeVat && (
                                    <FormField
                                        control={form.control}
                                        name="vatNo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">VAT No.</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Customer's VAT No" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-5">
                                <FormField
                                    control={form.control}
                                    name="PhoneNo1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Phone No.</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl pr-10" placeholder="94XXXXXXXXX" {...field} />
                                                    <Search
                                                        size={18}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                                                        onClick={() => handleCustomerSearch(field.value)}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="Email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Email</FormLabel>
                                            <FormControl>
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="john@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="LastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Last Name</FormLabel>
                                            <FormControl>
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="poNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">PO No.</FormLabel>
                                            <FormControl>
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Purchasing Order No" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Details Section */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-800">Payment Details</h2>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="loan"
                                    checked={includeLoan}
                                    onCheckedChange={(checked) => {
                                        setIncludeLoan(checked);
                                        if (!checked) form.setValue("Loan", undefined);
                                    }}
                                />
                                <Label htmlFor="loan" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                    Include Loan
                                </Label>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                            <div className="flex flex-col gap-5">
                                <FormField
                                    control={form.control}
                                    name="PaidDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Paid Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal bg-slate-50 border-slate-200 h-11 rounded-xl",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value || undefined}
                                                        onSelect={(date) => {
                                                            field.onChange(date === null ? undefined : date);
                                                        }}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                        classNames={{
                                                            head_cell: "w-8 font-normal text-[0.8rem]",
                                                            cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                            day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="PaidRecipt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Paid Receipt</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl cursor-pointer file:text-blue-700 file:bg-blue-50 file:border-0 file:rounded-lg file:mr-3 file:px-3 file:py-1 hover:file:bg-blue-100"
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {includeLoan && (
                                    <FormField
                                        control={form.control}
                                        name="Loan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Loan Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                        placeholder="Loan Amount"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-5">
                                <FormField
                                    control={form.control}
                                    name="PaidAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Paid Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                    placeholder="Paid Amount"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value);
                                                        const safeLoanAmount = parseFloat(loanAmount || 0);

                                                        const max = parseFloat((effectiveTotal - safeLoanAmount).toFixed(2));

                                                        if (isNaN(value) || value <= max) {
                                                            field.onChange(e.target.value === "" ? undefined : value);
                                                        } else {
                                                            field.onChange(max);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="PaymentMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Mode of Payment</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                                                        <SelectValue placeholder="Select mode of payment" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="Card">Card</SelectItem>
                                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Details Section */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                        <h2 className="font-bold text-lg text-slate-800">Order Details</h2>
                        <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                            <FormField
                                control={form.control}
                                name="Expected_Delivery_Date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Expected Delivery Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal bg-slate-50 border-slate-200 h-11 rounded-xl",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date === null ? undefined : date);
                                                    }}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    classNames={{
                                                        head_cell: "w-8 font-normal text-[0.8rem]",
                                                        cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Sales Details Section */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-800">Sales Details</h2>
                            <FormField
                                control={form.control}
                                name="SaleNo"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3">
                                        <FormLabel className="text-slate-700 font-semibold text-sm m-0">Sale No</FormLabel>
                                        <Select
                                            value={field.value?.toString() || ""}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setSaleNo(value);
                                                const selectedSale = salesList.find((s) => s.id?.toString() === value?.toString());
                                                if (selectedSale) {
                                                    form.setValue("SalesPerson", selectedSale.salesperson_id?.toString() || "");
                                                }
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white border-slate-200 h-10 rounded-xl w-48">
                                                    <SelectValue placeholder="Select sale no" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <Input
                                                        placeholder="Search sales…"
                                                        value={searchSales}
                                                        onChange={(e) => setSearchSales(e.target.value)}
                                                        className="w-full h-9 text-sm"
                                                    />
                                                </div>
                                                {salesList.map((sale) => (
                                                    <SelectItem key={sale.id} value={sale.id?.toString()}>
                                                        {sale.sale_no}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="SalesPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Salesperson</FormLabel>
                                        <Select value={field.value?.toString() || ""} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select salesperson" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {salespersons.map((p) => (
                                                    <SelectItem key={p.id} value={p.id?.toString()}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex sm:justify-between justify-center items-center pt-6 border-t border-slate-100 mt-8 pb-8">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm shadow-sm transition-all"
                            suppressHydrationWarning
                            onClick={handleClearAll}
                            title="Clear All"
                        >
                            <MdOutlineRefresh className="text-lg" />
                            {isSmallScreen ? null : "Clear All"}
                        </Button>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl px-6"
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                        </div>
                    </div>

                </form>
            </Form>
        </div>
    );
}

export default AddOrderForm;