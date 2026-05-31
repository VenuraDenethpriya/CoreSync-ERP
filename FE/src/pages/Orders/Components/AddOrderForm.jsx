import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdDelete, MdOutlineRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { use, useEffect, useState } from "react";
import { getAllQuotesDetails } from "@/api/quoteApi";
import { fetchProductsList } from "@/api/productApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createOrder, featchLatestOrderNoType } from "@/api/orderApi";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, MinusCircleIcon, PlusCircle, PlusCircleIcon, Search, SearchXIcon, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { add, addDays, addMonths, format } from "date-fns";
import { uploadImageToCloudinary } from "@/api/cloudinaryApi";
import { Separator } from "@/components/ui/separator";
import { useFieldArray } from "react-hook-form";
import { createInventoryUsage } from "@/api/inventoryApi";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getCuestomerByPhoneNo } from "@/api/customerApi";
import { createSale, fetchSalesNoList, updateSale } from "@/api/saleApi";
import { isValidPhoneNumber } from "libphonenumber-js";
import { fethchSalespersonNames } from "@/api/salespersonApi";


// const productSchema = z.object({
//     id: z.number().min(1, { message: "Product is required" }),
//     product_name: z.string().min(1, { message: "Product name is required" }),
//     unitprice: z.number({ required_error: "Unit price is required" }).min(0, { message: "Unit price must be non-negative" }),
//     qty: z.number({ required_error: "Qty is required" }).min(1, { message: "Qty must be non-negative" }),
//     subtotal: z
//         .number({ required_error: "Subtotal is required" })
//         .min(0, { message: "Subtotal must be non-negative" }),
//     note: z.string().optional()
// });

// const additionalChargeSchema = z.object({
//     type: z.string().min(1, { message: "Charge type is required" }),
//     value: z.union([z.string(), z.number()]).transform((val) => Number(val)),
// });


const getNoteFromSpecification = (spec) => {
    switch (spec) {
        case '6.2kW Solar Ongrid System Complete Installation':
            return `Inverter Capacity : 5kW 
Inverter Model : Solax X1-BOOST G4 
Panels Capacity : 6.2kW 
Panel Model : 620W -JA N-Type Solar 
DC Switchgear - Zbeny 
DC Cable - LAPP (German) 
AC Switchgear - Kripal 
AC Cable - ACL/Kelani`;

        case '5kW Solar Ongrid System Complete Installation':
            return `Inverter Capacity : 5kW
Inverter Model : Solax X1-BOOST G4
Panels Capacity : 5kW
Panel Model : 620W -JA N-Type Solar
DC Switchgear - Zbeny
DC Cable - LAPP (German)
AC Switchgear - Kripal
AC Cable - ACL/Kelani `;
        default:
            return '';
    }
};

const formSchema = z.object({
    Type: z.string().min(1, { message: "Order type is required" }),
    OrderNo: z.string().min(2, { message: "Order number is required" }),

    //  addProduct: z
    //     .array(productSchema)
    //     .min(1, { message: "Please add at least one product" }),

    SubTotal: z.number({ required_error: "Sub total is required" }),
    // additionalCharges: z.array(additionalChargeSchema).optional(),
    Discount: z.number().optional(),
    Total: z.number({ required_error: "Total is required" }),

    Title: z.string().min(2, { message: "Title is required" }),
    PhoneNo1: z
        .string()
        .transform((val) => val.startsWith('+') ? val : `+${val}`)
        .refine((val) => isValidPhoneNumber(val), {
            message: "Invalid international phone number",
        }),

    PhoneNo2: z
        .string()
        .transform((val) => val.startsWith('+') ? val : `+${val}`)
        .refine((val) => isValidPhoneNumber(val), {
            message: "Invalid  phone number",
        })
        .or(z.literal(""))
        .optional(),

    FirstName: z.string().min(2, { message: "First name is required" }),
    LastName: z.string().optional(),
    Email: z.string().optional(),
    Address: z.string().optional(),

    Note: z.string().optional(),

    PaidDate: z.date().optional().nullable(),
    PaidAmount: z.number().optional(),
    PaidRecipt: z.any().optional(),

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
    // CustomerName: z.string().optional(),
    // CustomerPhone: z
    //     .string()
    //     .regex(/^94\d{9}$/, {
    //         message: "Phone number must be in the format 94XXXXXXXXX (e.g., 94771234567)",
    //     }),
    // Description: z.string().optional(),
    // Recording: za
    //     .any()
    //     .refine((file) => file instanceof File || !file, "Invalid file")
    //     .optional(),
});

const existingOrderNumbers = ["INV/EHP/1028", "INV/EHP/1067", "INV/EHP/1068", "INV/EHP/1077", "INV/EHP/1082", "INV/EHP/1083", "INV/EHP/R/1084", "INV/EHP/R/1085", "INV/EHP/R/1086", "INV/EHP/R/1087", "INV/EHP/R/1089", "INV/EHP/R/1090", "INV/EHP/R/1142", "INV/EHP/R/1091", "INV/EHP/R/1092", "INV/EHP/R/1093", "INV/EHP/R/1094", "INV/EHP/R/1095"];

// const existingOrderNumbers = ["INV/EHP/R/1001", "INV/EHP/1067", "INV/EHP/1068", "INV/EHP/1077", "INV/EHP/1082", "INV/EHP/1083", "INV/EHP/R/1084", "INV/EHP/R/1085", "INV/EHP/R/1086", "INV/EHP/R/1087", "INV/EHP/R/1089", "INV/EHP/R/1090", "INV/EHP/R/1142", "INV/EHP/R/1091", "INV/EHP/R/1092", "INV/EHP/R/1093", "INV/EHP/R/1094", "INV/EHP/R/1095"];

const AddOrderForm = () => {

    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
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

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [quoteNo, setQuoteNo] = useState("");
    const [saleNo, setSaleNo] = useState("");

    const [search, setSearch] = useState("")
    const [searchQuote, setSearchQuote] = useState("")
    const [searchSales, setSearchSales] = useState("")


    const [limit, setLimit] = useState(15)
    const [offset, setOffset] = useState(0)
    const [paymentType, setPaymentType] = useState(null);
    const [includeVat, setIncludeVat] = useState(false);
    const [includeLoan, setIncludeLoan] = useState(false);
    const [netTotal, setNetTotal] = useState(0);

    const [selectedQuoteSaleID, setSelectedQuoteSaleID] = useState(null);


    const { append } = useFieldArray({
        control: form.control,
        name: 'addProduct',
    });

    const [addProduct, setAddProduct] = useState([{ id: 0, product_name: '', product_category: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '' }]);
    console.log("Add Product:", addProduct);

    const handleAddProductChange = () => {
        setAddProduct([...addProduct, { id: 0, product_name: '', product_category: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '' }]);
    }

    const [otherProducts, setOtherProducts] = useState([{ id: 0, qty: 0 }]);

    useEffect(() => {
        const otherProducts = addProduct.filter(product => product.product_category === 'OTHER');
        setOtherProducts(otherProducts);
    }, [addProduct]);

    console.log("Other Products:", otherProducts);

    // const handleRemoveProduct = (index) => {
    //     const updated = [...addProduct];
    //     updated.splice(index, 1);
    //     setAddProduct(updated);
    // }

    const handleRemoveProduct = (index) => {
        const updated = addProduct.filter((_, i) => i !== index);
        setAddProduct(updated);
        form.setValue('addProduct', updated);
        setTimeout(calculateTotals, 0);
    }

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
                const response = await fethchSalespersonNames(token);
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
    }, []);

    useEffect(() => {
        try {
            const feachQuotesList = async () => {
                const token = await getToken();
                const response = await getAllQuotesDetails(token, searchQuote, 15, 0);
                setQuoteList(response?.data);

            };
            feachQuotesList();
        } catch (error) {
            console.error("Error fetching quote list:", error);
        }
    }, [getToken, searchQuote]);

    // useEffect(() => {
    //     try {
    //         const feachSalesList = async () => {
    //             const token = await getToken();
    //             const response = await fetchSalesNoList(token, searchSales, 15, 0);
    //             setSalesList(response?.data?.sales);
    //         };
    //         feachSalesList();
    //     } catch (error) {
    //         console.error("Error fetching sales list:", error);
    //     }
    // }, [getToken, searchSales]);
    useEffect(() => {
        const fetchSalesList = async () => {
            try {
                const token = await getToken();
                const response = await fetchSalesNoList(token, searchSales, 15, 0);

                console.log("Sales API response:", response);

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
        setAdditionalCharges([...additionalCharges, { id: 0, type: '', value: '' }]);
    };

    const handleRemoveCharge = (index) => {
        const updated = [...additionalCharges];
        updated.splice(index, 1);
        setAdditionalCharges(updated);
    };

    useEffect(() => {
        if (orderType && nextOrderNo) {
            form.setValue("OrderNo", `${orderType}${nextOrderNo}`);
        }
    }, [orderType, nextOrderNo, form]);

    useEffect(() => {
        if (quoteNo) {
            const selectedQuote = quoteList.find(q => q.id === quoteNo);

            if (selectedQuote) {
                form.setValue('addProduct', []);
                setAddProduct([]);

                form.setValue(`additionalCharges`, []);
                setAdditionalCharges([]);


                const newAddProducts = selectedQuote.items.map(item => {
                    const product = productList.find(p => p.ProductName === item.product_name);
                    return {
                        id: item.product_id || product?.id || '',
                        product_name: product?.ProductName || item.product_name,
                        product_category: item.category || '',
                        unitprice: item.unit_price || 0,
                        specifications: product?.Specifications || '',
                        qty: item.quantity,
                        subtotal: item.subtotal || (item.unit_price * item.quantity),
                        note: item.note || '',
                    };
                });


                newAddProducts.forEach(product => {
                    append({
                        ...product,
                        id: product.id,
                        product_name: product.ProductName,
                        product_category: product.category,
                        unitprice: product.unitprice,
                        qty: product.quantity,
                        subtotal: product.subtotal || (product.unit_price * product.quantity),
                        note: product.note || '',
                        specifications: product?.Specifications || '',
                    });
                });
                setAddProduct(newAddProducts);


                const newAdditionalCharges = selectedQuote.additional_charges?.map(charge => {
                    return {
                        id: charge.id || null,
                        type: charge.type,
                        value: charge.value,
                    };
                }) || [];

                newAdditionalCharges.forEach(charge => {
                    append({
                        ...charge,
                        id: charge.id,
                        type: charge.type,
                    });
                });
                setAdditionalCharges(newAdditionalCharges);


            }
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
            form.setValue("poNo", selectedQuote.po_no)
            form.setValue("vatNo", selectedQuote.vat_no)

            form.setValue("SalesPerson", selectedQuote.salesperson_id)
            form.setValue("SalesType", selectedQuote.sales_type)
            form.setValue("Commission", selectedQuote.commission)
            if (selectedQuote.date) {
                form.setValue("Date", new Date(selectedQuote.date));
            } else {
                form.setValue("Date", new Date());
            }
            // form.setValue("CustomerName", selectedQuote.salesperson)
            // form.setValue("CustomerPhone", selectedQuote.salesperson)
            form.setValue("Description", selectedQuote.description)
            form.setValue("Recording", selectedQuote.recording_url)

            if (selectedQuote.sales_id) {
                form.setValue("SaleNo", selectedQuote.sales_id);
                setSaleNo(selectedQuote.sales_id);
            }
            setSelectedQuoteSaleID(selectedQuote.sales_id);

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
    }, [quoteNo]);


    /**

 * @param {string} prefix 
 * @param {string} lastNumberFromApi 
 * @param {string[]} blockedNumbers 
 */
    const getNextValidOrderNumber = (prefix, lastNumberFromApi, blockedNumbers) => {
        let currentNumber = lastNumberFromApi ? parseInt(lastNumberFromApi) : 999;

        let nextCandidate = currentNumber + 1;
        let foundUnique = false;

        while (!foundUnique) {
            const fullOrderString = `${prefix}${nextCandidate}`;


            if (blockedNumbers.includes(fullOrderString)) {
                console.log(`Collision detected: ${fullOrderString}. Skipping...`);
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

                    const nextOrderNumber = getNextValidOrderNumber(
                        defaultOrderType,
                        currentTypeOrderNo,
                        existingOrderNumbers
                    );

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
    }, [getToken]);


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
        if (Object.keys(latestOrderNumbers).length === 0) {
            return;
        }

        const newOrderType = includeVat ? "INV/EHP/R/" : "INV/EHP/";

        const currentTypeOrderNo = latestOrderNumbers[newOrderType];

        const newNextOrderNo = getNextValidOrderNumber(
            newOrderType,
            currentTypeOrderNo,
            existingOrderNumbers
        );

        setOrderType(newOrderType);
        setNextOrderNo(newNextOrderNo);
        form.setValue("Type", newOrderType, { shouldValidate: true });
        form.setValue("OrderNo", newNextOrderNo, { shouldValidate: true });

    }, [includeVat, latestOrderNumbers, form, existingOrderNumbers]);

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);


    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { watch, control } = form;

    const loanAmount = watch("Loan");
    const paidAmount = watch("PaidAmount");
    const fullPaidAmount = loanAmount ? (paidAmount + loanAmount) : paidAmount;
    const total = watch("Total");
    console.log('paid amount', paidAmount);

    useEffect(() => {
        if (!fullPaidAmount || fullPaidAmount === 0) {
            setPaymentStatus("Awaiting");
            setPaymentType("None");
        } else if (fullPaidAmount > 0 && fullPaidAmount < total) {
            setPaymentStatus("Advanced");
            setPaymentType("Advance");
        } else if (fullPaidAmount >= total) {
            setPaymentStatus("Paid");
            setPaymentType("Partial");
        }
    }, [fullPaidAmount, total]);


    async function handleSubmit(values) {
        const token = await getToken();
        setIsSubmitting(true);

        let receiptUrl = "";

        if (values.PaidRecipt && values.PaidRecipt.length > 0) {
            try {
                const file = values.PaidRecipt[0];
                console.log("Uploading file:", file.name, file.size);
                receiptUrl = await uploadImageToCloudinary(file);
                console.log("Upload successful, URL:", receiptUrl);
            } catch (uploadError) {
                console.error("Failed to upload receipt:", uploadError);
                toast.error("Failed to upload receipt image. Please try again.", { position: "bottom-right" });
                setIsSubmitting(false);
                return;
            }
        }


        try {
            // let finalSalesID = null;


            // if (saleNo) {
            //     finalSalesID = saleNo;
            //     const salesPayload = {
            //         id: finalSalesID,
            //         status: "Confirmed",
            //     };
            //     const saleRes = await updateSale(token, salesPayload);
            //     if (saleRes.message !== "success") {
            //         throw new Error("Failed to update existing sale record.");
            //     }
            // }
            // else if (selectedQuoteSaleID) {
            //     finalSalesID = selectedQuoteSaleID;
            //     const salesPayload = {
            //         id: finalSalesID,
            //         status: "Confirmed",
            //     };
            //     const saleRes = await updateSale(token, salesPayload);
            //     if (saleRes.message !== "success") {
            //         throw new Error("Failed to update existing sale record.");
            //     }
            // }
            // else if (values.SalesPerson) {
            //     const salesPayload = {
            //         type: values.SalesType,
            //         status: "Confirmed",
            //         salesperson: values.SalesPerson,
            //         commission: values.Commission,
            //         date: values.Date,
            //         customer_name: `${values.FirstName} ${values.LastName}`,
            //         customer_phone: values.PhoneNo1,
            //         updated_by: userID
            //     };

            //     const saleRes = await createSale(token, salesPayload);
            //     if (saleRes.message === "success" && saleRes.data?.id) {
            //         finalSalesID = saleRes.data.id;
            //     } else {
            //         throw new Error("Failed to create new sale record.");
            //     }
            // }
            let finalSalesID = null;
            const emptyUUID = "00000000-0000-0000-0000-000000000000";

            if (saleNo && saleNo !== emptyUUID) {
                finalSalesID = saleNo;
                const salesPayload = {
                    id: finalSalesID,
                    status: "Confirmed",
                };
                const saleRes = await updateSale(token, salesPayload);
                if (saleRes.message !== "success") {
                    throw new Error("Failed to update existing sale record.");
                }
            }
            // Check that selectedQuoteSaleID exists AND isn't the empty UUID
            else if (selectedQuoteSaleID && selectedQuoteSaleID !== emptyUUID) {
                finalSalesID = selectedQuoteSaleID;
                const salesPayload = {
                    id: finalSalesID,
                    status: "Confirmed",
                };
                const saleRes = await updateSale(token, salesPayload);
                if (saleRes.message !== "success") {
                    throw new Error("Failed to update existing sale record.");
                }
            }
            // If it is an empty UUID or null, it falls through to create a new sale (POST)
            else if (values.SalesPerson) {
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

            // 3. Construct Unified Order Payload
            const orderPayload = {
                customer: {
                    Title: values.Title,
                    PhoneNo1: values.PhoneNo1,
                    PhoneNo2: values.PhoneNo2,
                    FirstName: values.FirstName,
                    LastName: values.LastName,
                    Email: values.Email,
                    Address: values.Address,
                    vatNo: values.vatNo
                },
                order: {
                    OrderNo: values.OrderNo.replace(values.Type, ""),
                    Type: values.Type,
                    SubTotal: values.SubTotal,
                    additional_charges: additionalCharges?.map(charge => ({
                        id: charge.id || null,
                        type: charge.type,
                        value: parseFloat(charge.value) || 0,
                    })),
                    Discount: values.Discount,
                    Total: values.Total,
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
                    image: receiptUrl,
                    created_by: userID
                }
            };
            console.log("order payload", orderPayload);

            // 4. Create Order
            const orderRes = await createOrder(token, orderPayload);

            if (orderRes?.message === "success") {
                toast.success("Order added successfully!");

                // 5. Inventory Usage
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
        // const discountAmount = subTotalWithAdditionalCharges * (discount / 100);
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
            }
        } catch (error) {
            toast.error("No customer found with that phone number.");
            console.error("Error fetching customer data:", error);
        }
    };

    return (
        //    <div className="w-full">
        <div className="w-full bg-transparent h-auto">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                        console.log("VALIDATION ERRORS BLOCKING SUBMIT:", errors);
                    })}
                    className="sm:space-y-8 space-y-4 w-full sm:px-5"
                >
                    {
                        isMobile ? (<div className="flex">
                            {addProduct.length > 0 && (
                                <div>
                                    <h1 className="">
                                        Order No: <span className="font-semibold">{orderType}{nextOrderNo}</span>
                                    </h1>
                                </div>
                            )}
                        </div>) : (<div className="flex justify-end">
                            {addProduct.length > 0 && (
                                <div>
                                    <h1 className="">
                                        Order No: <span className="font-semibold">{orderType}{nextOrderNo}</span>
                                    </h1>
                                </div>
                            )}
                        </div>)
                    }
                   
                    <div className="flex gap-x-8">
                        <div className="flex">
                            <FormField
                                control={form.control}
                                name="QuoteNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quote No</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setQuoteNo(value);
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select quote no" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <Input
                                                    placeholder="Search quote…"
                                                    value={searchQuote}
                                                    onChange={(e) => setSearchQuote(e.target.value)}
                                                    className="w-full"
                                                />
                                                {quoteList?.map((quote) => (
                                                    <SelectItem key={quote.id} value={quote.id}>
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

                        {/* <div className="flex">
                            <FormField
                                control={form.control}
                                name="SaleNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sale No</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setSaleNo(value);
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select sale no" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <Input
                                                    placeholder="Search sales…"
                                                    value={searchSales}
                                                    onChange={(e) => setSearchSales(e.target.value)}
                                                    className="w-full"
                                                />
                                                {salesList?.map((sale) => (
                                                    <SelectItem key={sale.id} value={sale.id}>
                                                        {sale.sale_no}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div> */}
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h1 className="font-semibold text-2xl mb-6 text-gray-800">Product Details</h1>
                            </div>

                            {
                                isMobile ? null : <div className="flex justify-between mt-6 mx-6">
                                    <h1 className="">Unit Price</h1>
                                    <h1 className="">Qty.</h1>
                                    <h1 className="">Total Price</h1>
                                </div>
                            }

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <div className="space-y-3">
                                {
                                    addProduct.map((product, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="">
                                                <FormField
                                                    control={form.control}
                                                    name={`addProduct.${index}.product_name`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    field.onChange(value);
                                                                    const selectedProduct = productList.find(p => p.id === value);

                                                                    setAddProduct(prev => {
                                                                        const updated = [...prev];
                                                                        const qty = 1;
                                                                        updated[index] = {
                                                                            ...updated[index],
                                                                            id: selectedProduct?.id || 0,
                                                                            product_name: selectedProduct?.ProductName || '',
                                                                            product_category: selectedProduct?.category || '',
                                                                            unitprice: selectedProduct?.BasePrice || 0,
                                                                            specifications: selectedProduct?.Specifications || '',
                                                                            qty: qty,
                                                                            subtotal: selectedProduct?.BasePrice || 0 * qty,
                                                                        };
                                                                        return updated;
                                                                    });
                                                                    form.setValue(`addProduct.${index}.subtotal`, selectedProduct?.BasePrice || 0);
                                                                    setTimeout(calculateTotals, 0);
                                                                }}
                                                                onOpenChange={(isOpen) => {
                                                                    if (!isOpen) {
                                                                        setSearch("");
                                                                    }
                                                                }}
                                                                value={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-white w-full">
                                                                        {product.product_name || `Select Product ${index + 1}`}
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="w-full">
                                                                    <div>
                                                                        <Input
                                                                            placeholder="Search products…"
                                                                            value={search}
                                                                            onChange={(e) => setSearch(e.target.value)}
                                                                            className="w-full"
                                                                        />
                                                                    </div>
                                                                    {productList?.map((product) => (
                                                                        <SelectItem key={product.id} value={product.id}>
                                                                            {product.ProductName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <FormField
                                                    control={form.control}
                                                    name={`addProduct.${index}.note`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Textarea
                                                                    className="bg-white text-xs"
                                                                    placeholder={`** Note for product ${index + 1} **`}
                                                                    {...field}
                                                                    value={field.value}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        field.onChange(value);
                                                                        setAddProduct(prev => {
                                                                            const updated = [...prev];
                                                                            updated[index] = {
                                                                                ...updated[index],
                                                                                note: value,
                                                                            };
                                                                            return updated;
                                                                        });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))
                                }

                                <div
                                    className="flex items-center text-blue-600 hover:underline cursor-pointer gap-x-2"
                                >
                                    <PlusCircle size={12} onClick={handleAddProductChange} />
                                    <span className="text-xs" onClick={handleAddProductChange}>Add</span>
                                </div>
                            </div>

                            <div className="flex  gap-6 sm:flex-row sm:justify-between">
                                <div className="flex flex-col gap-6">
                                    {addProduct.map((product, index) => (
                                        <div key={index} className="flex items-center gap-2 sm:pb-14">
                                            <FormField
                                                control={form.control}
                                                name={`addProduct.${index}.unitprice`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="Unit Price"
                                                                className="bg-white sm:w-24 w-16 text-xs text-right"
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
                                    ))}
                                </div>

                                <div className="flex flex-col gap-6">
                                    {addProduct.map((product, index) => (
                                        <div key={index} className="flex items-center gap-2 sm:pb-14">
                                            <button
                                                type="button"
                                                className={product.qty > 1 ? "text-black hover:text-black-700" : "text-slate-300"}
                                                onClick={() => handleDecrementQty(index)}
                                            >
                                                <MinusCircleIcon size={18} />
                                            </button>
                                            <FormField
                                                control={form.control}
                                                name={`addProduct.${index}.qty`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="Qty"
                                                                className="bg-white sm:w-16 w-12 text-xs text-center"
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
                                                className="text-black hover:text-black-700"
                                                onClick={() => handleIncrementQty(index)}
                                            >
                                                <PlusCircleIcon size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-6">
                                    {addProduct.map((product, index) => (
                                        <div key={index} className="flex items-center gap-2 sm:pb-14">
                                            <FormField
                                                control={form.control}
                                                name={`addProduct.${index}.subtotal`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="Subtotal"
                                                                className="bg-white w-28 text-xs text-right"
                                                                value={product.subtotal}
                                                                readOnly
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleRemoveProduct(index)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Separator className="mt-4 p-[1px]" />

                        <div className="grid grid-cols-2 gap-6" >
                            <div className="mt-8 space-y-6">
                                <div className="flex flex-col">
                                    <FormLabel className="mb-4">Sub Total</FormLabel>
                                    <FormLabel className="mb-1">Additional Charges</FormLabel>
                                    <div className={additionalCharges?.length == 0 ? "hidden" : ""}>
                                        {additionalCharges?.map((charge, index) => (
                                            <div key={index} className="flex items-center py-1 w-full">
                                                <FormField
                                                    control={form.control}
                                                    name={`additionalCharges.${index}.type`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    const updated = [...additionalCharges];
                                                                    updated[index].id = charge.id;
                                                                    updated[index].type = value;
                                                                    setAdditionalCharges(updated);
                                                                    field.onChange(value);
                                                                }}
                                                                defaultValue={charge.type}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-white sm:w-full w-[150px]">
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
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                        ))}
                                    </div>

                                    <div
                                        className="flex items-center text-blue-600 hover:underline cursor-pointer gap-x-2"
                                    >
                                        <PlusCircle size={12} onClick={handleAddAdditionalCharge} />
                                        <span className="text-xs" onClick={handleAddAdditionalCharge}>Add</span>
                                    </div>
                                    <div className="flex flex-col pt-4 gap-y-4">
                                        <div>
                                            <FormLabel>Discount</FormLabel>
                                        </div>
                                        <div>
                                            <FormLabel>Total</FormLabel>
                                        </div>

                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <Checkbox
                                            id="vat"
                                            checked={includeVat}
                                            onCheckedChange={() => setIncludeVat(!includeVat)}
                                        />
                                        <Label htmlFor="vat" className="text-xs font-normal italic">
                                            Include VAT (18%)
                                        </Label>
                                    </div>
                                    {
                                        includeVat && (
                                            <div className="flex items-center gap-3 pt-8">
                                                <Label htmlFor="NetTotal" className="">
                                                    Net Total
                                                </Label>
                                            </div>
                                        )
                                    }


                                </div>
                            </div>
                            <div className="mt-8  flex flex-col items-end">
                                <FormField
                                    control={form.control}
                                    name="SubTotal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Sub Total"
                                                    type="number"
                                                    className="bg-white sm:w-fit w-[100px] text-right mr-6 mb-4"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                    readOnly
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {additionalCharges?.map((charge, index) => (
                                    <div key={index} className="flex py-1 gap-x-2  items-center">
                                        <FormField
                                            control={form.control}
                                            name={`additionalCharges.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            className="bg-white sm:w-fit w-[100px] text-right"
                                                            placeholder="0"
                                                            value={charge.value}
                                                            onChange={(e) => {
                                                                const updated = [...additionalCharges];
                                                                updated[index].id = charge.id;
                                                                updated[index].value = e.target.value;
                                                                setAdditionalCharges(updated);
                                                                field.onChange(e.target.value === '' ? undefined : Number(e.target.value));
                                                                setTimeout(calculateTotals, 0);
                                                            }}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <button
                                            type="button"
                                            className="text-red-500 hover:text-red-700 text-sm"
                                            onClick={() => handleRemoveCharge(index)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}

                                <div className="flex flex-col pt-4 gap-y-2">
                                    <div className="">
                                        <FormField
                                            control={form.control}
                                            name="Discount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Discount"
                                                            type="number"
                                                            className="bg-white sm:w-fit w-[100px] mr-6 text-right"
                                                            value={field.value ?? ''}
                                                            onChange={(e) => {
                                                                const discountValue = e.target.value === '' ? 0 : Number(e.target.value);
                                                                field.onChange(discountValue);
                                                                setTimeout(calculateTotals, 0);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="Total"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Total"
                                                            type="number"
                                                            className="bg-white sm:w-fit w-[100px] text-right"
                                                            value={field.value ?? ''}
                                                            onChange={
                                                                (e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                                                            }
                                                            readOnly
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div>
                                        {includeVat && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="vat"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="VAT"
                                                                    type="number"
                                                                    readOnly
                                                                    className="bg-white sm:w-fit w-[100px] text-right"
                                                                    value={field.value ?? ''}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            e.target.value === '' ? undefined : Number(e.target.value)
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="netTotal"
                                                    render={({ field }) => (
                                                        <FormItem className="mt-2">
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Net Total"
                                                                    type="number"
                                                                    readOnly
                                                                    className="bg-white sm:w-fit w-[100px] text-right"
                                                                    value={field.value ?? ''}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            e.target.value === '' ? undefined : Number(e.target.value)
                                                                        )
                                                                    }
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
                        </div>

                    </div>



                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <h1 className="font-semibold text-xl mb-4">Customer Details</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-6">
                                {/* Left Column */}
                                <FormField
                                    control={form.control}
                                    name="Title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue className="bg-white" placeholder="Mr." />
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
                                            <FormLabel>Secondary Phone No.</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        className="bg-white pr-10"
                                                        placeholder="94XXXXXXXXX"
                                                        {...field}
                                                    />
                                                </div>
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
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="First Name" {...field} />
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
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {
                                    includeVat && (<FormField
                                        control={form.control}
                                        name="vatNo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>VAT No:</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white" placeholder="Customer's VAT No" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />)
                                }
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Right Column */}
                                <FormField
                                    control={form.control}
                                    name="PhoneNo1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone No.</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        className="bg-white pr-10"
                                                        placeholder="94XXXXXXXXX"
                                                        {...field}
                                                    />
                                                    <Search
                                                        size={18}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                                                        onClick={() => {
                                                            handleCustomerSearch(field.value);
                                                        }}
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
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Email" {...field} />
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
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Last Name" {...field} />
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
                                            <FormLabel>PO No:</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Purchasing Order No" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div className="flex">
                                <h1 className="font-semibold text-xl">Payment Details</h1>
                            </div>

                            <div className="flex items-center gap-3 pt-6">
                                <Checkbox
                                    id="loan"
                                    checked={includeLoan}
                                    onCheckedChange={() => setIncludeLoan(!includeLoan)}
                                />
                                <Label htmlFor="loan" className="text-xs font-normal italic">
                                    Include Loan
                                </Label>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                            <div className="flex flex-col gap-6">
                                <div className="pt-8">
                                    <FormField
                                        control={form.control}
                                        name="PaidDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Paid Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
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
                                                    <FormMessage />
                                                </Popover>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="PaidRecipt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Paid Receipt</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        className="bg-white"
                                                        placeholder="Receipt"
                                                        onChange={(e) => field.onChange(e.target.files)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                            </div>
                            <div>
                                <div className="pt-6">
                                    <FormField
                                        control={form.control}
                                        name="PaidAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Paid Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="bg-white"
                                                        placeholder="Paid Amount"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-7">
                                    {
                                        includeLoan && (<FormField
                                            control={form.control}
                                            name="Loan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Loan Amount</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="bg-white"
                                                            placeholder="Loan Amount"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />)
                                    }
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <h1 className="font-semibold text-xl">Order Details</h1>
                        <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                            <div className="flex flex-col gap-6">
                                <div className="pt-8">
                                    <FormField
                                        control={form.control}
                                        name="Expected_Delivery_Date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Expected Delivery Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
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
                                                            initialFocus
                                                            classNames={{
                                                                head_cell: "w-8 font-normal text-[0.8rem]",
                                                                cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                    <FormMessage />
                                                </Popover>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                            </div>
                            <div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <div className="flex justify-between">
                            <div className="flex">
                                <h1 className="font-semibold text-xl">Sales Details</h1>
                            </div>

                            <div className="flex">
                                <FormField
                                    control={form.control}
                                    name="SaleNo"
                                    render={({ field }) => (
                                        <FormItem className="flex">
                                            <FormLabel>Sale No</FormLabel>
                                            {/* <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setSaleNo(value);
                                                }}
                                                value={field.value}
                                            > */}
                                            <Select
                                                value={field.value || ""}
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setSaleNo(value);

                                                    const selectedSale = salesList.find(
                                                        (s) => s.id === value
                                                    );

                                                    if (selectedSale) {
                                                        form.setValue("SalesPerson", selectedSale.salesperson_id || "");
                                                    }
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Select sale no" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <Input
                                                        placeholder="Search sales…"
                                                        value={searchSales}
                                                        onChange={(e) => setSearchSales(e.target.value)}
                                                        className="w-full"
                                                    />
                                                    {/* {salesList?.map((sale) => (
                                                        // <SelectItem key={sale.id} value={sale.id}>
                                                        //     {sale.sale_no}
                                                        // </SelectItem>
                                                        <SelectItem key={sale.sales_id} value={sale.sales_id}>
                                                            {sale.sales_no}
                                                        </SelectItem>
                                                    ))} */}
                                                    {salesList.map((sale) => (
                                                        <SelectItem key={sale.id} value={sale.id}>
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
                        </div>


                        <div className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                                <div className="flex flex-col gap-6">
                                    {/* Left Column */}
                                    <FormField
                                        control={form.control}
                                        name="SalesPerson"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Salesperson</FormLabel>
                                                {/* <Select onValueChange={field.onChange} defaultValue={field.value}> */}
                                                <Select value={field.value || ""} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue className="bg-white" placeholder="Select salesperson" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {salespersons.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />


                                    {/* <FormField
                                        control={form.control}
                                        name="Commission"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Commission</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white" placeholder="Enter commission" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}

                                    {/* <FormField
                                        control={form.control}
                                        name="CustomerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Customer Name</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white" placeholder="Enter customer name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}

                                    {/* <FormField
                                        control={form.control}
                                        name="Description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Specification" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}
                                </div>

                                <div className="flex flex-col gap-6">
                                    {/* Right Column */}
                                    {/* <FormField
                                        control={form.control}
                                        name="SalesType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue className="bg-white" placeholder="Select sales type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="BatteryPack">Battery Pack</SelectItem>
                                                        <SelectItem value="Solar">Solar</SelectItem>
                                                        <SelectItem value="Repair">Repair</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}

                                    {/* <FormField
                                        control={form.control}
                                        name="Date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col pt-2">
                                                <FormLabel>Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
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
                                                            initialFocus
                                                            classNames={{
                                                                head_cell: "w-8 font-normal text-[0.8rem]",
                                                                cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                    <FormMessage />
                                                </Popover>
                                            </FormItem>
                                        )}
                                    /> */}

                                    {/* <FormField
                                        control={form.control}
                                        name="CustomerPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Customer Phone No.</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white" placeholder="Enter cusotmer phone no." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}

                                    {/* <FormField
                                        control={form.control}
                                        name="Recording"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Recording</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="audio/*"
                                                        className="bg-white"
                                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex sm:justify-between justify-end pb-12">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm shadow-sm hover:bg-slate-100 transition-all"
                            onClick={handleClearAll}
                            title="Clear All"
                        >
                            <MdOutlineRefresh className="text-lg" />
                            {isSmallScreen ? null : "Clear All"}
                        </Button>

                        <div className="flex gap-4 ml-2">
                            <Button
                                type="submit"
                                className="bg-blue-800 hover:bg-blue-900"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddOrderForm;