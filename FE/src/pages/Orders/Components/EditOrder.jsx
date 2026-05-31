import { fetchBasicProductsList, fetchProductsList } from "@/api/productApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateOrder } from "@/api/orderApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { uploadImageToCloudinary } from "@/api/cloudinaryApi";
import { MdDelete } from "react-icons/md";
import { MinusCircleIcon, PlusCircle, PlusCircleIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { fetchSalesNoList } from "@/api/saleApi";
import { FormLabel } from "@/components/ui/form";

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

export function EditOrder({ onUpdate, ...props }) {
  const { getToken } = useAuth();

  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(15)
  const [offset, setOffset] = useState(0)

  const orderId = props.orderData?.id;
  const { user } = useUser();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [paymentType, setPaymentType] = useState("Partial");

  const [salesList, setSalesList] = useState([]);
  const [searchSales, setSearchSales] = useState("")


  const [addProduct, setAddProduct] = useState([{ id: null, product_id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '' }]);
  console.log("Add Product:", addProduct);
  const handleAddProductChange = () => {
    setAddProduct([...addProduct, { id: null, product_id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '' }]);
  }

  useEffect(() => {
    const feachSalesList = async () => {
      try {
        const token = await getToken();
        const response = await fetchSalesNoList(token, searchSales, 15, 0);

        let list = response?.data?.sales || [];

        if (props.orderData?.sales_id &&
          !list.some(item => item.id === props.orderData.sales_id)) {

          list = [
            { id: props.orderData.sales_id, sale_no: props.orderData.sales_no || "Current Sale" },
            ...list
          ];
        }

        setSalesList(list);
      } catch (err) {
        console.error(err);
      }
    };

    feachSalesList();
  }, [getToken, searchSales]);


  const handleRemoveProduct = (index) => {
    const updated = [...addProduct];
    updated.splice(index, 1);
    setAddProduct(updated);
  }
  const handleIncrementQty = (index) => {
    const updated = [...addProduct];
    updated[index].qty++;
    updated[index].subtotal = updated[index].qty * updated[index].unitprice;
    setAddProduct(updated);
  }
  const handleDecrementQty = (index) => {
    if (addProduct[index].qty <= 1) return;
    const updated = [...addProduct];
    updated[index].qty--;
    updated[index].subtotal = updated[index].qty * updated[index].unitprice;
    setAddProduct(updated);
  }

  useEffect(() => {
    let updated = [...addProduct];
    let changed = false;

    addProduct.forEach((product, index) => {
      const generatedNote = getNoteFromSpecification(product.specifications);

      if (generatedNote && generatedNote !== product.note) {
        updated[index] = {
          ...product,
          note: generatedNote,
        };
        changed = true;
      }
    });

    if (changed) {
      setAddProduct(updated);
    }
  }, [addProduct.map(p => p.specifications).join('|')]);


  const [additionalCharges, setAdditionalCharges] = useState([{ type: '', value: '' }]);

  const handleAddAdditionalCharge = () => {
    setAdditionalCharges([...additionalCharges, { type: '', value: '' }]);
  };


  const handleRemoveCharge = (index) => {
    const updated = [...additionalCharges];
    updated.splice(index, 1);
    setAdditionalCharges(updated);
  };

  // Form state
  const [subTotal, setSubTotal] = useState("");
  const [discount, setDiscount] = useState("");
  const [total, setTotal] = useState("");
  const [vat, setVat] = useState(false);
  const [includeLoan, setIncludeLoan] = useState(false);
  const [netTotal, setNetTotal] = useState();
  const [vatAmount, setVatAmount] = useState();
  const [saleNo, setSaleNo] = useState();
  const [loanAmount, setLoanAmount] = useState(0);
  console.log("Loan Amount:", loanAmount);


  const [title, setTitle] = useState("");
  const [fisrtName, setFisrtName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo1, setPhoneNo1] = useState("");
  const [phoneNo2, setPhoneNo2] = useState("");
  const [address, setAddress] = useState("");
  const [poNo, setPoNo] = useState("");
  const [vatNo, setVatNo] = useState("")



  const [paidDate, setPaidDate] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  // const [newPaidAmount, setNewPaidAmount] = useState("");
  const [paidRecipt, setPaidRecipt] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const delayDebounceFn = setTimeout(() => {
      const fetchProducts = async () => {
        try {
          setIsLoading(true);
          const token = await getToken();
          const response = await fetchProductsList(token, search, limit, offset);
          const apiData = response?.data?.products || [];

          const mappedData = apiData.map((item) => ({
            productId: item.id,
            productName: item.ProductName,
            category: item.category,
            price: item.BasePrice,
            specifications: item.Specifications,
          }));
          setProducts(mappedData);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, open, limit, offset]);

  useEffect(() => {
    if (open) {
      initializeFormData();
    }
  }, [open]);


  const initializeFormData = () => {
    if (!props.orderData) return;

    const items = props.orderData.order_items || [];


    const normalizedItems = items.map((item) => ({
      id: item.id || null,
      product_id: item.product_id || 0,
      product_name: item.product_name || "",
      unitprice: item.unitprice || item.unit_price || 0,
      qty: item.quantity,
      subtotal: item.subtotal || 0,
      note: item.note || ""
    }));
    setAddProduct(normalizedItems);

    setAdditionalCharges(props.orderData.additional_charges || []);

    setSubTotal(props.orderData.subtotal || 0);
    setDiscount(props.orderData.discount || 0);
    setTotal(props.orderData.total || 0);
    setVat(props.orderData.vat || false);
    setTitle(props.orderData.title || "");
    setFisrtName(props.orderData.first_name || "");
    setLastName(props.orderData.last_name || "");
    setEmail(props.orderData.email || "");
    setPhoneNo1(props.orderData.phone_no1 || "");
    setPhoneNo2(props.orderData.phone_no2 || "");
    setAddress(props.orderData.address || "");
    setPoNo(props.orderData.po_no || "");
    setVatNo(props.orderData.vat_no || "");
    setPaidDate("");
    setPaymentStatus(props.orderData.PaymentStatus || "");
    // setNewPaidAmount("");
    setPaidRecipt(props.orderData.paid_recipt || "");
    setSaleNo(props.orderData.sales_id || "")
    setLoanAmount(props.totalLoanAmount || 0);
  };

  useEffect(() => {
    if (open && props.orderData) {
      initializeFormData();
    }
  }, [open, props.orderData]);


  useEffect(() => {
    const subtotal = (addProduct || []).reduce((acc, item) => {
      const value = parseFloat(item?.subtotal || 0);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

    // const discountP = parseFloat(discount) || 0;

    const additionalChargesTotal = (additionalCharges || []).reduce((acc, charge) => {
      const value = parseFloat(charge.value || "0");
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

    const subTotalWithCharges = subtotal + additionalChargesTotal;
    // const discountAmount = subTotalWithCharges * (discountP / 100);
    const total = (subTotalWithCharges) - (discount);

    const vatAmount = total * 0.18;
    const netTotal = total + vatAmount;

    setSubTotal(subtotal.toFixed(2));
    setTotal(total.toFixed(2));
    setNetTotal(netTotal.toFixed(2));
    setVatAmount(vatAmount.toFixed(2));

  }, [addProduct, additionalCharges, discount]);


  const currentTotalPaid = props.orderData?.payments?.map(payment => payment.amount).reduce((acc, amount) => acc + amount, 0);
  const paid = parseFloat(currentTotalPaid || 0) + parseFloat(paidAmount || 0);
  const totalPaid = parseFloat(paid || 0) + parseFloat(loanAmount || 0);

  // useEffect(() => {

  //   const totalAmount = parseFloat(total || 0);
  //   const netAmount = parseFloat(netTotal || 0);
  //   const paidValue = parseFloat(totalPaid || "0");

  //   if (paidValue === totalAmount || paidValue === netAmount) {
  //     console.log("Setting status to Paid");
  //     setPaymentStatus("Paid");
  //     setPaymentType("Partial");
  //   } else if (paidValue > 0 && paidValue < netAmount || paidValue < totalAmount) {
  //     console.log("Setting status to Advanced");
  //     setPaymentStatus("Advanced");
  //     setPaymentType("Partial");
  //   }
  // }, [totalPaid, netTotal, total, currentTotalPaid, addProduct, additionalCharges, vat]);

  useEffect(() => {
  const totalAmount = parseFloat(total || 0);
  const netAmount = parseFloat(netTotal || 0);
  const paidValue = parseFloat(totalPaid || "0");

  if (paidValue > 0 && (paidValue === totalAmount || paidValue === netAmount)) {
    console.log("Setting status to Paid");
    setPaymentStatus("Paid");
    setPaymentType("Partial"); 
  } 

  else if (paidValue > 0 && (paidValue < netAmount || paidValue < totalAmount)) {
    console.log("Setting status to Advanced");
    setPaymentStatus("Advanced");
    setPaymentType("Partial");
  } 

  else if (paidValue === 0) {
    console.log("Setting status to Awaiting");
    setPaymentStatus("Awaiting"); 
    setPaymentType("None");
  }
}, [totalPaid, netTotal, total, currentTotalPaid, addProduct, additionalCharges, vat]);


  useEffect(() => {
    if (!paidAmount || paidAmount === 0) {
      setPaymentType("None");
    }
  }, [paidAmount, total]);

  useEffect(() => {
    if (props.totalLoanAmount === 0) {
      setIncludeLoan(false);
    }
    else
      setIncludeLoan(true);
  }, [props.totalLoanAmount]);

  const handleEditBatteryPackQuoteSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      let receiptUrl = "";
      if (paidRecipt && paidRecipt.length > 0) {
        try {
          const file = paidRecipt[0];
          receiptUrl = await uploadImageToCloudinary(file);
          console.log("Upload successful, URL:", receiptUrl);
        } catch (uploadError) {
          console.error("Failed to upload receipt:", uploadError);
          toast.error("Failed to upload receipt image. Please try again.", { position: "bottom-right" });
          setIsSubmitting(false);
          return;
        }
      }
      const orderData = {
        customer: {
          customer_id: props.orderData.customer_id,
          Title: title,
          PhoneNo1: phoneNo1,
          PhoneNo2: phoneNo2,
          FirstName: fisrtName,
          LastName: lastName,
          Email: email,
          Address: address,
          VatNo: vatNo,
        },
        order: {
          OrderNo: props.orderData.order_no,
          SubTotal: parseFloat(subTotal) || 0,
          additional_charges: additionalCharges.map(charge => ({
            type: charge.type,
            value: parseFloat(charge.value) || 0,
          })),
          Discount: parseFloat(discount) || 0,
          Total: parseFloat(total) || 0,
          Vat: vat,
          // FullAmountPaidDate: paidDate,
          // PaidAmount: parseFloat(currentTotalPaid) || 0,
          OrderStatus: props.orderData.OrderStatus,
          PaymentStatus: paymentStatus,
          CreatedBy: user?.id,
          paidRecipt: receiptUrl,
          PoNo: poNo,
          SalesID: saleNo,

        },
        order_items: {
          items: addProduct
            .filter(p => p.product_id && p.subtotal !== undefined)
            .map(p => ({
              id: p.id || null,
              product_id: p.product_id,
              unit_price: parseFloat(p.unitprice),
              quantity: parseFloat(p.qty),
              subtotal: parseFloat(p.subtotal),
              note: p.note || '',
            })),
        },
        payments: {
          payment_type: paymentType,
          amount: parseFloat(paidAmount),
          loan_amount: parseFloat(loanAmount),
          paid_date: paidDate,
          image: receiptUrl,
          created_by: user?.id
        }
      };

      const response = await updateOrder(token, orderId, orderData);

      const isSuccess = response && (response.message === "success" || response.status === "success");

      if (isSuccess) {
        setOpen(false);
        toast.success("Order updated successfully!", { position: "bottom-right" });
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.error("API returned non-success:", response);
        toast.error(response?.message || "Failed to update order. Please try again.", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order. Please try again.", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog className="" open={open} onOpenChange={(newOpen) => {
      if (newOpen && !props.orderData) {
        console.error("orderData is not available");
        return;
      }
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px] sm:h-screen h-[800px] overflow-y-auto my-8">
        <DialogHeader>
          <DialogTitle>{props.orderData?.type}{props.orderData?.order_no}</DialogTitle>
          <DialogDescription>
            Make changes to order details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>


        <>
          <div className="flex items-center gap-2 w-fit">
            <Label htmlFor="SaleNo" className="text-left">
              Sale No.
            </Label>
            <Select value={saleNo} onValueChange={setSaleNo}>
              <SelectTrigger className="bg-white min-w-[150px]">
                <SelectValue placeholder="Select sale no" />
              </SelectTrigger>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div>
              <h1 className="font-semibold text-2xl text-gray-800">Product Details</h1>

            </div>
            <div className="flex justify-between mt-6 mx-6">
              <h1 className="">Unit Price</h1>
              <h1 className="">Qty.</h1>
              <h1 className="">Total Price</h1>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-x-4">
            <div>
              {/* Product  */}
              {
                addProduct.map((product, index) => (
                  <div key={index} className=" items-center py-2">
                    <div>
                      <Select
                        value={addProduct[index].product_id.toString()}
                        onValueChange={(value) => {
                          const selectedProduct = products.find(p => p.productId.toString() === value);
                          const specs = selectedProduct?.specifications || '';
                          const note = getNoteFromSpecification(specs);

                          setAddProduct(prev => {
                            const updated = [...prev];
                            const qty = 1;
                            const price = selectedProduct?.price || 0;
                            updated[index] = {
                              ...updated[index],
                              id: selectedProduct?.id || 0,
                              product_id: selectedProduct?.productId || 0,
                              product_name: selectedProduct?.productName || '',
                              unitprice: price,
                              specifications: selectedProduct?.specifications || '',
                              note: note,
                              qty,
                              subtotal: price * qty,
                            };
                            return updated;
                          });
                        }}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) setSearch("");
                        }}
                      >

                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select product">
                            {product.product_name || "Select product"}
                          </SelectValue>
                        </SelectTrigger>
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
                          ) : products.length > 0 ? (
                            products.map((product) => (
                              <SelectItem key={product.productId} value={product.productId.toString()}>
                                {product.productName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-gray-500">No products found</div>
                          )}
                        </SelectContent>

                      </Select>
                    </div>
                    <div>
                      <Textarea
                        id="Product1Price"
                        type="text"
                        value={addProduct[index]?.note}
                        onChange={(e) => {
                          const updated = [...addProduct];
                          updated[index].note = e.target.value;
                          setAddProduct(updated);
                        }}
                        placeholder={`**Note for product ${index + 1}**`}
                        className="col-span-3 w-full mt-1"
                      />
                    </div>

                  </div>
                ))
              }

              <div
                className="flex items-center text-blue-600 hover:underline cursor-pointer mt-1 gap-x-1"
              >
                <PlusCircle size={12} onClick={handleAddProductChange} />
                <span className="text-xs" onClick={handleAddProductChange}>Add</span>
              </div>
            </div>
            <div className="justify-between items-center">
              {
                addProduct.map((product, index) => (
                  <div key={index} className="grid grid-cols-3 py-2 pb-8">
                    <div>
                      <Input
                        id={addProduct[index].unitprice}
                        type="number"
                        value={addProduct[index]?.unitprice}
                        onChange={(e) => {
                          const updated = [...addProduct];
                          updated[index].unitprice = e.target.value;
                          updated[index].subtotal = e.target.value * addProduct[index].qty;
                          setAddProduct(updated);
                        }}
                        className="col-span-3 w-fit text-right"
                      />
                    </div>
                    <div className="flex gap-x-2  justify-center">
                      <button
                        type="button"
                        className={`text-black hover:text-black-700 mb-9 ${addProduct[index].qty > 1 ? '' : 'text-slate-300 hover:text-black-700 mb-9'}`}
                        onClick={() => handleDecrementQty(index)}
                      >
                        <MinusCircleIcon size={18} />
                      </button>
                      <Input
                        id="Product1Price"
                        type="number"
                        value={addProduct[index]?.qty}
                        onChange={(e) => {
                          const updated = [...addProduct];
                          updated[index].qty = e.target.value;
                          updated[index].subtotal = e.target.value * addProduct[index].unitprice;
                          setAddProduct(updated);
                        }}
                        className="col-span-3 w-20 text-center"
                      />
                      <button
                        type="button"
                        className="text-black hover:text-black-700 mb-9"
                        onClick={() => handleIncrementQty(index)}
                      >
                        <PlusCircleIcon size={18} />
                      </button>
                    </div>
                    <div className="flex mr-8 mb-10">
                      <Input
                        id="Product1Price"
                        type="number"
                        value={addProduct[index]?.subtotal}
                        onChange={(e) => {
                          const updated = [...addProduct];
                          updated[index].subtotal = e.target.value;
                          setAddProduct(updated);
                        }}
                        className="col-span-3 w-fit text-right"
                      />
                      <button
                        type="button"
                        className="text-zinc-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>
                ))
              }


            </div>
          </div>

          <Separator className="mt-2" />
          <div className="grid grid-cols-2">
            {/* Labels */}
            <div className="pt-2 space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subTotal" className="justify-self-start text-right">
                  Sub Total
                </Label>
              </div>

              <div>
                <Label className="justify-self-start text-right">
                  Additional Charges
                </Label>
                <div className={additionalCharges.length === 0 ? "hidden" : ""}>
                  {additionalCharges.map((charge, index) => (
                    <div key={index} className="flex items-center py-2 w-[430px]">
                      <Select
                        value={charge.type}
                        onValueChange={(value) => {
                          const updated = [...additionalCharges];
                          updated[index].id = charge.id;
                          updated[index].type = value;
                          setAdditionalCharges(updated);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select charge type">
                            {charge.type || "Select charge type"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Delivery Charges">Delivery Charges</SelectItem>
                          <SelectItem value="Installation Charges">Installation Charges</SelectItem>
                          <SelectItem value="Installation Material Charges">Installation Material Charges</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center text-blue-600 hover:underline cursor-pointer gap-x-1"

                >
                  <PlusCircle size={12} onClick={handleAddAdditionalCharge} />
                  <span className="text-xs" onClick={handleAddAdditionalCharge}>Add</span>
                </div>
              </div>


              <div className="grid grid-cols-4 items-center gap-4 pt-3">
                <Label htmlFor="discount" className="justify-self-start text-right">
                  Discount (%)
                </Label>
              </div>

              <div className="grid grid-cols-4 items-center gap-4 pt-4">
                <Label htmlFor="total" className="justify-self-start text-right">
                  Total
                </Label>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Checkbox
                  id="vat"
                  checked={vat}
                  onCheckedChange={() => setVat(!vat)}
                />
                <Label htmlFor="vat" className="text-xs font-normal italic">
                  Include VAT (18%)
                </Label>
              </div>
              {
                vat && (
                  <div className="flex items-center gap-3 pt-8">
                    <Label htmlFor="NetTotal" className="">
                      Net Total
                    </Label>
                  </div>
                )
              }

            </div>

            <div className="space-y-4">
              {/* <Input
                id="subtotal"
                type="number"
                value={subTotal}
                onChange={(e) => setSubTotal(e.target.value)}
                className="col-span-3 sm:w-fit w-[160px] justify-self-end text-right  mb-6 mr-4"
              /> */}
              <Input
                id="subtotal"
                type="number"
                value={subTotal}
                readOnly
                className="col-span-3 sm:w-fit w-[160px] justify-self-end text-right mb-6 mr-4 bg-gray-100"
              />

              {additionalCharges.map((charge, index) => (
                <div
                  key={index}
                  className="flex justify-end items-center"
                >
                  <Input
                    id={`additionalCharge-${index}.value`}
                    type="number"
                    value={additionalCharges[index]?.value}
                    onChange={(e) => {
                      const updated = [...additionalCharges];
                      updated[index].value = e.target.value;
                      updated[index].id = charge.id;
                      setAdditionalCharges(updated);
                    }}
                    className="w-[185px] text-right"
                  />
                  <button
                    type="button"
                    className="text-zinc-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    onClick={() => handleRemoveCharge(index)}
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              ))}

              <div className="space-y-4 pt-7">
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="col-span-3 sm:w-fit w-[160px] justify-self-end text-right mr-4"
                />
                {/* <Input
                  id="total"
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="col-span-3 sm:w-fit w-[160px] justify-self-end text-right mr-4"
                  readOnly
                /> */}
                <Input
                  id="total"
                  type="number"
                  value={total}
                  className="col-span-3 sm:w-fit w-[160px] justify-self-end text-right mr-4 bg-gray-100"
                  readOnly
                />
                {
                  vat && (<>
                    <Input
                      id="vat"
                      type="number"
                      value={vatAmount}
                      className="col-span-3 sm:w-fit w-[160px] justify-self-end text-right mr-4 bg-gray-100"
                      readOnly
                    />
                    <Input
                      id="netTotal"
                      type="number"
                      value={netTotal}
                      className="col-span-3 sm:w-fit w-[160px] justify-self-end text-right mr-4 bg-gray-100"
                      readOnly
                    />
                  </>
                  )
                }

              </div>

            </div>
          </div>
          <Separator className="mt-2" />
          <div>
            <h1 className="text-md font-semibold">Customer Details</h1>
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="PackType" className="justify-self-start text-left">
                    Title
                  </Label>
                  <Select
                    value={title || undefined}
                    onValueChange={setTitle}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select title">
                        {title || "Select title"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr</SelectItem>
                      <SelectItem value="Mrs.">Mrs</SelectItem>
                      <SelectItem value="Miss.">Miss</SelectItem>
                      <SelectItem value="M/S.">M/S</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Rev">Rev</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="PhoneNo2" className="justify-self-start text-left">
                    Secondary Phone No.
                  </Label>
                  <Input
                    id="PhoneNo2"
                    value={phoneNo2}
                    onChange={(e) => setPhoneNo2(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="FirstName" className="justify-self-start text-left">
                    First Name
                  </Label>
                  <Input
                    id="FirstName"
                    value={fisrtName}
                    onChange={(e) => setFisrtName(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="Address" className="justify-self-start text-left">
                    Address
                  </Label>
                  <Input
                    id="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                {
                  vat && (<div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="VatNo" className="justify-self-start text-left">
                      VAT No
                    </Label>
                    <Input
                      id="VatNo"
                      value={vatNo}
                      onChange={(e) => setVatNo(e.target.value)}
                      className="col-span-3"
                    />
                  </div>)
                }

              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="PhoneNo1" className="justify-self-start text-left">
                    Phone No.
                  </Label>
                  <Input
                    id="PhoneNo1"
                    value={phoneNo1}
                    onChange={(e) => setPhoneNo1(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="Email" className="justify-self-start text-left">
                    Email
                  </Label>
                  <Input
                    id="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="LastName" className="justify-self-start text-left">
                    Last Name
                  </Label>
                  <Input
                    id="LastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="PoNo" className="justify-self-start text-left">
                    PO No
                  </Label>
                  <Input
                    id="PoNo"
                    value={poNo}
                    onChange={(e) => setPoNo(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="mt-4" />
          {
            !(props.orderData?.PaymentStatus === "Paid" && currentTotalPaid >= (vat ? parseFloat(netTotal) : parseFloat(total))) && <div>
              <Separator className="mt-4" />
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-md font-semibold">Payment Details</h1>
                </div>
                <div>
                  <div className="flex items-center gap-3 pt-6">
                    <Checkbox
                      id="loan"
                      checked={includeLoan}
                      oonCheckedChange={(checked) => {
                        setIncludeLoan(checked);
                        if (!checked) setLoanAmount(0);
                      }}
                    />
                    <Label htmlFor="loan" className="text-xs font-normal italic">
                      Include Loan
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="PaidDate" className="justify-self-start text-left">
                      Paid Date
                    </Label>
                    <input
                      type="date"
                      id="PaidDate"
                      value={paidDate ? paidDate.slice(0, 10) : ""}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        const isoDate = date.toISOString();
                        setPaidDate(isoDate);
                      }}
                      className="col-span-3 border rounded-md p-2 w-full"
                    />
                  </div>


                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="PaidRecipt" className="justify-self-start text-left">
                      Paid Recipt
                    </Label>
                    <input
                      type="file"
                      id="PaidRecipt"
                      onChange={(e) => setPaidRecipt(e.target.files)}
                      className="col-span-3 border rounded-md p-2 w-full"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="PaidAmount" className="justify-self-start text-left">
                      Paid Amount
                    </Label>
                    <input
                      type="number"
                      id="PaidAmount"
                      value={paidAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        const max = parseFloat(
                          (vat ? netTotal - (currentTotalPaid + loanAmount) : total - (currentTotalPaid + loanAmount)).toFixed(2)
                        );

                        if (isNaN(value) || value <= max) {
                          setPaidAmount(e.target.value);
                        } else {
                          setPaidAmount(max.toString());
                        }
                      }}
                      placeholder={`Remaining Amount: ${vat ? (netTotal - (currentTotalPaid + loanAmount)).toFixed(2) : (total - (currentTotalPaid + loanAmount)).toFixed(2)}`}
                      className="col-span-3 border rounded-md p-2 w-full"
                      max={vat ? (netTotal - (currentTotalPaid + loanAmount)).toFixed(2) : (total - (currentTotalPaid + loanAmount)).toFixed(2)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    {
                      loanAmount && (
                        <div className="flex items-center gap-3">
                          <Label htmlFor="NetTotal" className="">
                            Loan Amount:
                          </Label>
                        </div>
                      )
                    }

                    {
                      loanAmount && (<>
                        <Input
                          id="loan"
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="col-span-3"
                        />
                      </>
                      )
                    }
                  </div>


                </div>
              </div>
            </div>
          }


          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-800 hover:bg-blue-900"
              onClick={handleEditBatteryPackQuoteSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Save changes"}
            </Button>
          </DialogFooter>
        </>
      </DialogContent>
    </Dialog>
  );
}