import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdDelete, MdOutlineRefresh } from "react-icons/md";
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

const additionalChargeSchema = z.object({
    type: z.string().min(1, { message: "Charge type is required" }),
    value: z.union([z.string(), z.number()]).transform((val) => Number(val)),
});

const formSchema = z.object({
    Type: z.string().min(1, { message: "Quote type is required" }),
    QuoteNo: z.string().min(2, { message: "Quote number is required" }),


    // addProduct: z
    //     .array(productSchema)
    //     .min(1, { message: "At least one product is required" }),


    SubTotal: z.number({ required_error: "Sub total is required" }),
    additionalCharges: z.array(additionalChargeSchema).optional(),
    Discount: z.number().optional(),
    Total: z.number({ required_error: "Total is required" }),

    Title: z.string().min(2, { message: "Title is required" }),
    // PhoneNo1: z
    // .string()
    // .refine((val) => isValidPhoneNumber(val), {
    //   message: "Invalid  phone number",
    // }),
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

    // PhoneNo2: z.string()
    // .regex(/^94\d{9}$/, {
    //     message: "Phone number must be in the format 94XXXXXXXXX (e.g., 94771234567)",
    // })
    // .or(z.literal(""))
    // .optional(),

    FirstName: z.string().min(2, { message: "First name is required" }),
    LastName: z.string().optional(),
    Email: z.string().optional(),
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

    const [search, setSearch] = useState("")
    const [searchSales, setSearchSales] = useState("")
    const [limit, setLimit] = useState(15)
    const [offset, setOffset] = useState(0)
    const [includeVat, setIncludeVat] = useState(false);
    const [netTotal, setNetTotal] = useState(0);
    const [includeCatalog, setIncludeCatalog] = useState(false);
    console.log("Include Catalog:", includeCatalog);


    const [addProduct, setAddProduct] = useState([{ id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '' }]);
    console.log("Add Product:", addProduct);

    const handleAddProductChange = () => {
        setAddProduct([...addProduct, { id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '' }]);
    }

    const handleRemoveProduct = (index) => {
        const updated = [...addProduct];
        updated.splice(index, 1);
        setAddProduct(updated);
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
            const feachSalesList = async () => {
                const token = await getToken();
                const response = await fetchSalesNoList(token, searchSales, 15, 0);
                setSalesList(response?.data?.sales);

            };
            feachSalesList();
        } catch (error) {
            console.error("Error fetching sales list:", error);
        }
    }, [getToken, searchSales]);



    const [additionalCharges, setAdditionalCharges] = useState([]);

    const handleAddAdditionalCharge = () => {
        setAdditionalCharges([...additionalCharges, { type: '', value: '' }]);
    };

    const handleRemoveCharge = (index) => {
        const updated = [...additionalCharges];
        updated.splice(index, 1);
        setAdditionalCharges(updated);
    };

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Title: "Mr.",
            Type: "Quo/EHP/",
            Discount: 0,
            Date: new Date(),
        }
    });

    // Fetch latest quote numbers by type
    useEffect(() => {
        const fetchLatestQuoteNoType = async () => {
            try {
                const token = await getToken();
                const response = await featchLatestQuotNoType(token);

                if (response?.data?.quote_numbers) {
                    setLatestQuoteNumbers(response.data.quote_numbers)
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
    }, []);

    // Fetch product list
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

    }, [search]);

    // Check if any selected product has category "Solar" to determine quote type
    const updateQuoteType = (addProduct) => {
        // Filter out any undefined or empty product IDs
        const validProductIds = addProduct.filter(id => id);

        if (validProductIds.length === 0) {
            return "Quo/EHP/";
        }

        // Check if any product has Solar category
        const hasSolarProduct = validProductIds.some(productId => {
            const product = productList.find(p => p.id === productId);
            return product?.category === "SOLAR";
        });

        return hasSolarProduct ? "Quo/SOLAR/" : "Quo/EHP/";
    };

    // Update quote type and number whenever selected products change
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

                // Update form fields
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
                VatNo: values.vatNo
            },
            quote: {
                QuoteNo: values.QuoteNo,
                Type: values.Type,
                SubTotal: values.SubTotal,
                additional_charges: values.additionalCharges,
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
            customer_name: values.FirstName + values.LastName,
            customer_phone: values.PhoneNo1,
            // description: values.Description,
            // recording_url: recordingUrl,
            updated_by: userID
        };
        try {
            if (values.SalesPerson == null) {
                const response = await createQuote(token, payload);
                if (response.message === "success") {
                    toast.success("Quote added successfully!", { position: "bottom-right" });
                    navigate("/quotes");
                } else {
                    toast.error("Error adding quote!", { position: "bottom-right" });
                }
            }
            else {
                const response = await createSale(token, salesPayload);
                if (response.message == "success") {
                    const payloadWithSalesID = {
                        customer: {
                            Title: values.Title,
                            PhoneNo1: values.PhoneNo1,
                            PhoneNo2: values.PhoneNo2,
                            FirstName: values.FirstName,
                            LastName: values.LastName,
                            Email: values.Email,
                            Address: values.Address,
                            VatNo: values.vatNo
                        },
                        quote: {
                            QuoteNo: values.QuoteNo,
                            Type: values.Type,
                            SubTotal: values.SubTotal,
                            additional_charges: values.additionalCharges,
                            Discount: values.Discount,
                            Total: values.Total,
                            Vat: includeVat,
                            IsCatalog: includeCatalog,
                            CreatedBy: user.id,
                            PoNo: values.poNo,
                            SalesID: response.data.id,
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
    };

    // Calculate total price based on selected products
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
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">
                    {
                        isMobile ? (<div className="flex">
                            {addProduct.length > 0 && (
                                <div>
                                    <h1 className="">
                                        Quote No: <span className="font-semibold">{quoteType}{nextQuoteNo}</span>
                                    </h1>
                                </div>
                            )}
                        </div>) : (<div className="flex justify-end">
                            {addProduct.length > 0 && (
                                <div>
                                    <h1 className="">
                                        Quote No: <span className="font-semibold">{quoteType}{nextQuoteNo}</span>
                                    </h1>
                                </div>
                            )}
                        </div>)
                    }


                    <div className="hidden">
                        <div className="flex">
                            <div className="pt-2 pr-1">
                                <FormLabel>Quote No.</FormLabel>
                            </div>

                            <FormField
                                control={form.control}
                                name="Type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input className="bg-white w-[60px]" value={quoteType} {...field} readOnly />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="QuoteNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input className="bg-white w-fit" value={nextQuoteNo} {...field} readOnly />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>


                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h1 className="font-semibold text-2xl mb-6 text-gray-800">Product Details</h1>

                            </div>
                            <div className="flex justify-between mt-6 mx-6">
                                <h1 className="">Unit Price</h1>
                                <h1 className="">Qty.</h1>
                                <h1 className="">Total Price</h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            {/* Product Selectors */}
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
                                                                <SelectContent>
                                                                    <div className="p-2">
                                                                        <Input
                                                                            placeholder="Search products…"
                                                                            value={search}
                                                                            onChange={(e) => setSearch(e.target.value)}
                                                                            className="w-full"
                                                                        />
                                                                    </div>

                                                                    {isLoading ? (
                                                                        <div className="p-2 text-sm text-gray-500">Loading...</div>
                                                                    ) : productList.length > 0 ? (
                                                                        productList?.map((product) => (
                                                                            <SelectItem key={product.id} value={product.id}>
                                                                                {product.ProductName}
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <div className="p-2 text-sm text-gray-500">No products found</div>
                                                                    )}
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
                                    className="flex items-center text-blue-600 hover:underline cursor-pointer gap-x-1"
                                >
                                    <PlusCircle size={12} onClick={handleAddProductChange} />
                                    <span onClick={handleAddProductChange} className="text-xs">Add</span>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <div className="">
                                    <div className="flex flex-col sm:gap-y-14">
                                        {addProduct.map((product, index) => (
                                            <div key={index} className="flex items-center gap-2 sm:pb-5">
                                                <div className="flex items-center gap-2 ">
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex flex-col sm:gap-y-14">
                                        {addProduct.map((product, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="flex items-center justify-center gap-2 sm:pb-5">
                                                    <button
                                                        type="button"
                                                        className={addProduct[index].qty > 1 ? "text-black hover:text-black-700" : "text-slate-300"}
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex flex-col sm:gap-y-14">
                                        {addProduct.map((product, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="flex items-center gap-2 sm:pb-5">
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                        <Separator className="mt-4 p-[1px]" />
                        {/* Subtotal, Discount, Total */}
                        <div className="grid grid-cols-2 gap-6" >
                            <div className="mt-8 space-y-6">
                                <div className="flex flex-col">

                                    <FormLabel className="mb-4">Sub Total</FormLabel>

                                    <FormLabel className="mb-1">Additional Charges</FormLabel>
                                    <div className={additionalCharges.length === 0 ? "hidden" : ""}>
                                        {additionalCharges.map((charge, index) => (
                                            <div key={index} className="flex items-center py-1 w-full">
                                                <FormField
                                                    control={form.control}
                                                    name={`additionalCharges.${index}.type`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    const updated = [...additionalCharges];
                                                                    updated[index].type = value;
                                                                    setAdditionalCharges(updated);
                                                                    field.onChange(value);
                                                                }}
                                                                defaultValue={charge.type}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-white w-full">
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
                                        className="flex items-center text-blue-600 hover:underline cursor-pointer gap-x-1"
                                    >
                                        <PlusCircle size={12} onClick={handleAddAdditionalCharge} />
                                        <span onClick={handleAddAdditionalCharge} className="text-xs">Add</span>
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

                                    <div className="flex items-center gap-3 pt-6">
                                        <Checkbox
                                            id="catalog"
                                            checked={includeCatalog}
                                            onCheckedChange={() => setIncludeCatalog(!includeCatalog)}
                                        />
                                        <Label htmlFor="catalog" className="text-xs font-normal italic">
                                            Catalog
                                        </Label>
                                    </div>

                                </div>
                            </div>
                            <div className="mt-6  flex flex-col items-end">
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
                                {additionalCharges.map((charge, index) => (
                                    <div key={index} className="flex pt-2 gap-x-2  items-center">
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

                                <div className="flex flex-col pt-7 gap-y-2">
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
                                                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
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
                                                        <SelectValue className="bg-white" placeholder="Mr" />
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    <div className="flex sm:justify-between justify-end">
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900 ">Add Quote</Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddBatteryPackQuoteForm;