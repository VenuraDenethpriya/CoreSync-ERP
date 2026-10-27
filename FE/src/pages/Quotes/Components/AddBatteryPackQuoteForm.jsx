import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdOutlineRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createQuote, featchLatestQuotNoType } from "@/api/quoteApi";
import { fetchProductsList } from "@/api/productApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { MinusCircleIcon, PlusCircle, PlusCircleIcon, Search, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCuestomerByPhoneNo } from "@/api/customerApi";
import { isValidPhoneNumber } from "libphonenumber-js";
import { fethchSalespersonNames } from "@/api/salespersonApi";
import { createSale, fetchSalesNoList } from "@/api/saleApi";

// Utility to generate unique keys safely to prevent deletion bugs
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

const additionalChargeSchema = z.object({
    type: z.string().min(1, { message: "Charge type is required" }),
    value: z.union([z.string(), z.number()]).transform((val) => Number(val)),
});

const formSchema = z.object({
    Type: z.string().min(1, { message: "Quote type is required" }),
    QuoteNo: z.string().min(2, { message: "Quote number is required" }),

    SubTotal: z.number({ required_error: "Sub total is required" }),
    additionalCharges: z.array(additionalChargeSchema).optional(),
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
            message: "Invalid phone number",
        })
        .or(z.literal(""))
        .optional(),

    FirstName: z.string().min(2, { message: "First name is required" }),
    LastName: z.string().optional(),
    Email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
    Address: z.string().optional(),

    Note: z.string().optional(),

    vat: z.number().optional(),
    netTotal: z.number().optional(),
    includeVat: z.boolean().optional(),
    poNo: z.string().optional(),
    vatNo: z.string().optional(),

    SalesPerson: z.string().optional(),
    SalesType: z.string().optional(),
    Commission: z.coerce.number().optional(),
    Date: z.date().optional(),
});

const AddBatteryPackQuoteForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;
    const [salespersons, setSalespersons] = useState([]);
    const [salesList, setSalesList] = useState([]);
    const [saleNo, setSaleNo] = useState("");

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [latestQuoteNumbers, setLatestQuoteNumbers] = useState({
        "Quo/EHP/": "1000",
        "Quo/SOLAR/": "1000"
    });
    const [quoteType, setQuoteType] = useState("Quo/EHP/");
    const [nextQuoteNo, setNextQuoteNo] = useState();
    const [productList, setProductList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [searchSales, setSearchSales] = useState("");
    const [limit, setLimit] = useState(15);
    const [offset, setOffset] = useState(0);
    const [includeVat, setIncludeVat] = useState(false);
    const [netTotal, setNetTotal] = useState(0);
    const [includeCatalog, setIncludeCatalog] = useState(false);

    const [salespersonStatus, setSalespersonStatus] = useState("Active");

    // Added localId
    const [addProduct, setAddProduct] = useState([{ id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '', localId: generateLocalId() }]);

    const handleAddProductChange = () => {
        setAddProduct([...addProduct, { id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '', localId: generateLocalId() }]);
    };

    const handleRemoveProduct = (index) => {
        const updated = [...addProduct];
        updated.splice(index, 1);
        setAddProduct(updated);
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
            const feachSalesList = async () => {
                const token = await getToken();
                const response = await fetchSalesNoList(token, searchSales, 15, 0);
                setSalesList(response?.data?.sales || []);
            };
            feachSalesList();
        } catch (error) {
            console.error("Error fetching sales list:", error);
        }
    }, [getToken, searchSales]);

    // Added localId and option tracker
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

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Title: "Mr.",
            Type: "Quo/EHP/",
            Discount: 0,
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

    useEffect(() => {
        const fetchLatestQuoteNoType = async () => {
            try {
                const token = await getToken();
                const response = await featchLatestQuotNoType(token);

                if (response?.data?.quote_numbers) {
                    setLatestQuoteNumbers(response.data.quote_numbers);
                    const currentTypeQuoteNo = response.data.quote_numbers["Quo/EHP/"] || "1000";
                    const nextQuoteNumber = (parseInt(currentTypeQuoteNo) + 1).toString();
                    setNextQuoteNo(nextQuoteNumber);
                    form.setValue("QuoteNo", nextQuoteNumber);
                }
            } catch (error) {
                console.error("Error fetching latest quote numbers:", error);
            }
        };
        fetchLatestQuoteNoType();
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
        } finally {
            setIsLoading(false);
        }
    }, [getToken, search, limit, offset]);

    const updateQuoteType = (addProductIds) => {
        const validProductIds = addProductIds.filter(id => id);

        if (validProductIds.length === 0) {
            return "Quo/EHP/";
        }

        const hasSolarProduct = validProductIds.some(productId => {
            const product = productList.find(p => p.id === productId);
            return product?.category === "SOLAR";
        });

        return hasSolarProduct ? "Quo/SOLAR/" : "Quo/EHP/";
    };

    useEffect(() => {
        if (addProduct.length > 0) {
            const selectedProductIds = addProduct
                .map((product) => product.id)
                .filter((id) => !!id);

            const newQuoteType = updateQuoteType(selectedProductIds);

            if (quoteType !== newQuoteType) {
                setQuoteType(newQuoteType);

                const currentTypeQuoteNo = latestQuoteNumbers[newQuoteType] || "1000";
                const newNextQuoteNo = (parseInt(currentTypeQuoteNo) + 1).toString();

                setNextQuoteNo(newNextQuoteNo);
                form.setValue("Type", newQuoteType);
                form.setValue("QuoteNo", newNextQuoteNo);
            }
        }
    }, [addProduct, productList, latestQuoteNumbers, form, quoteType]);

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function handleSubmit(values) {
        const token = await getToken();

        const payload = {
            customer: {
                Title: values.Title,
                PhoneNo1: values.PhoneNo1,
                PhoneNo2: values.PhoneNo2,
                FirstName: values.FirstName,
                LastName: values.LastName,
                Email: values.Email,
                Address: values.Address,
                VatNo: values.vatNo,
            },
            quote: {
                QuoteNo: values.QuoteNo,
                Type: values.Type,
                SubTotal: values.SubTotal,
                additional_charges: additionalCharges.map(charge => {
                    const finalType = charge.option === "Others"
                        ? `Others(${charge.type})`
                        : charge.type;

                    return {
                        type: finalType,
                        value: parseFloat(charge.value) || 0,
                    };
                }),
                Discount: values.Discount,
                Total: values.Total,
                Vat: includeVat,
                IsCatalog: includeCatalog,
                CreatedBy: user.id,
                PoNo: values.poNo,
                SalesID: saleNo,
            },
            quote_items: {
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
        };

        const salesPayload = {
            type: values.SalesType,
            status: "Quoted",
            salesperson: values.SalesPerson,
            commission: values.Commission,
            date: values.Date,
            customer_name: values.FirstName + " " + values.LastName,
            customer_phone: values.PhoneNo1,
            updated_by: userID
        };

        try {
            if (!values.SalesPerson) {
                const response = await createQuote(token, payload);
                if (response.message === "success") {
                    toast.success("Quote added successfully!", { position: "bottom-right" });
                    navigate("/quotes");
                } else {
                    toast.error("Error adding quote!", { position: "bottom-right" });
                }
            } else {
                const response = await createSale(token, salesPayload);
                if (response.message == "success") {
                    const payloadWithSalesID = {
                        ...payload,
                        quote: {
                            ...payload.quote,
                            SalesID: response.data.id,
                        }
                    };
                    const qResponse = await createQuote(token, payloadWithSalesID);
                    if (qResponse.message === "success") {
                        toast.success("Quote added successfully!", { position: "bottom-right" });
                        navigate("/quotes");
                    } else {
                        toast.error("Error adding quote!", { position: "bottom-right" });
                    }
                }
            }
        } catch (error) {
            toast.error("Error adding quote!", { position: "bottom-right" });
        }
    }

    const handleClose = () => {
        navigate("/quotes");
    }

    const handleClearAll = () => {
        form.reset();
        setAddProduct([{ id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '', localId: generateLocalId() }]);
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
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    {/* Quote Number Display */}
                    <div className="flex justify-end">
                        {addProduct.length > 0 && (
                            <div className="text-sm font-semibold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
                                Quote No: <span className="text-blue-600 font-extrabold">{quoteType}{nextQuoteNo}</span>
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
                                        <Input value={quoteType} {...field} readOnly />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="QuoteNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input value={nextQuoteNo} {...field} readOnly />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Product Details Section */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-800">Product Details</h2>
                            <div className="hidden sm:flex gap-12 text-xs font-bold text-slate-400 uppercase tracking-wider pr-8">
                                <span>Unit Price</span>
                                <span>Qty</span>
                                <span>Total Price</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {addProduct.map((product, index) => (
                                <div key={product.localId} className="p-4 border border-slate-200/70 rounded-2xl bg-white shadow-sm space-y-3">
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
                                                                const selectedProduct = productList.find(p => p.id?.toString() === value?.toString());
                                                                setAddProduct(prev => {
                                                                    const updated = [...prev];
                                                                    const qty = 1;
                                                                    updated[index] = {
                                                                        ...updated[index],
                                                                        id: selectedProduct?.id || 0,
                                                                        product_name: selectedProduct?.ProductName || '',
                                                                        unitprice: selectedProduct?.BasePrice || 0,
                                                                        specifications: selectedProduct?.Specifications || '',
                                                                        qty: qty,
                                                                        subtotal: (selectedProduct?.BasePrice || 0) * qty,
                                                                    };
                                                                    return updated;
                                                                });
                                                                form.setValue(`addProduct.${index}.subtotal`, selectedProduct?.BasePrice || 0);
                                                                setTimeout(calculateTotals, 0);
                                                            }}
                                                            value={field.value?.toString() || ""}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                                                                    <SelectValue placeholder={`Select Product ${index + 1}`} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <div className="p-2">
                                                                    <Input
                                                                        placeholder="Search products…"
                                                                        value={search}
                                                                        onChange={(e) => setSearch(e.target.value)}
                                                                        className="w-full h-9 text-sm"
                                                                    />
                                                                </div>
                                                                {isLoading ? (
                                                                    <div className="p-2 text-sm text-slate-400">Loading...</div>
                                                                ) : productList.length > 0 ? (
                                                                    productList.map((product) => (
                                                                        <SelectItem key={product.id} value={product.id?.toString()}>
                                                                            {product.ProductName}
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <div className="p-2 text-sm text-slate-400">No products found</div>
                                                                )}
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
                                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl text-right"
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
                                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl text-center"
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
                                    {additionalCharges.map((charge, index) => (
                                        <div key={charge.localId} className="flex items-start gap-2">
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

                                                        {/* Render manual input field if option is "Others" */}
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

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="catalog"
                                        checked={includeCatalog}
                                        onCheckedChange={() => setIncludeCatalog(!includeCatalog)}
                                    />
                                    <Label htmlFor="catalog" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                        Include Catalog
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
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter customer's first name" {...field} />
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
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter customer's address" {...field} />
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
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter customer's email address" {...field} />
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
                                                <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter customer's last name" {...field} />
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
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setSaleNo(value);
                                            }}
                                            value={field.value?.toString() || ""}
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
                                                {salesList?.map((sale) => (
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
                    <div className="flex sm:justify-between justify-center items-center pt-6 border-t border-slate-100 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm shadow-sm transition-all"
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
                            >
                                Add Quote
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

export default AddBatteryPackQuoteForm;