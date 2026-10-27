import { updateQuote } from "@/api/quoteApi";
import { fetchProductsList } from "@/api/productApi";
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
import { useAuth } from "@clerk/clerk-react";
import { MinusCircleIcon, PlusCircle, PlusCircleIcon, Trash2, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Utility to generate unique keys safely
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

export function EditBatteryPackQuote({ onUpdate, quoteData: initialQuoteData }) {
  const { getToken } = useAuth();
  const quoteId = initialQuoteData?.id;

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(15);
  const [offset, setOffset] = useState(0);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // FIX: Added localId to track products accurately during deletions
  const [addProduct, setAddProduct] = useState([{ id: null, product_id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '', localId: generateLocalId() }]);

  const handleAddProductChange = () => {
    setAddProduct([...addProduct, { id: null, product_id: 0, product_name: '', unitprice: 0, qty: 1, subtotal: 0, note: '', specifications: '', localId: generateLocalId() }]);
  };

  const handleRemoveProduct = (index) => {
    const updated = [...addProduct];
    updated.splice(index, 1);
    setAddProduct(updated);
  };

  const handleIncrementQty = (index) => {
    const updated = [...addProduct];
    updated[index].qty++;
    updated[index].subtotal = updated[index].qty * updated[index].unitprice;
    setAddProduct(updated);
  };

  const handleDecrementQty = (index) => {
    if (addProduct[index].qty <= 1) return;
    const updated = [...addProduct];
    updated[index].qty--;
    updated[index].subtotal = updated[index].qty * updated[index].unitprice;
    setAddProduct(updated);
  };

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

  // FIX: Track the option type as well as the custom value
  const [additionalCharges, setAdditionalCharges] = useState([{ option: '', type: '', value: '', localId: generateLocalId() }]);

  const handleAddAdditionalCharge = () => {
    setAdditionalCharges([...additionalCharges, { option: '', type: '', value: '', localId: generateLocalId() }]);
  };

  const handleRemoveCharge = (index) => {
    const updated = [...additionalCharges];
    updated.splice(index, 1);
    setAdditionalCharges(updated);
  };

  const [subTotal, setSubTotal] = useState("");
  const [discount, setDiscount] = useState("");
  const [total, setTotal] = useState("");
  const [vat, setVat] = useState(false);
  const [includeCatalog, setIncludeCatalog] = useState(false);
  const [netTotal, setNetTotal] = useState();
  const [vatAmount, setVatAmount] = useState();

  const [title, setTitle] = useState("");
  const [fisrtName, setFisrtName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo1, setPhoneNo1] = useState("");
  const [phoneNo2, setPhoneNo2] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [poNo, setPoNO] = useState("");
  const [vatNo, setVatNo] = useState("");

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
  }, [search, open, limit, offset, getToken]);

  const initializeFormData = () => {
    if (!initialQuoteData) return;

    const items = initialQuoteData.items || [];

    const normalizedItems = items.map((item) => {
      const spec = item.specifications || '';
      const note = getNoteFromSpecification(spec);
      return {
        id: item.id || null,
        product_id: item.product_id || 0,
        product_name: item.product_name || "",
        unitprice: item.unitprice || item.unit_price || 0,
        qty: item.quantity,
        subtotal: item.subtotal || 0,
        note: note || item.note || "",
        specifications: spec,
        localId: generateLocalId() // FIX: Set local ID
      };
    });

    setAddProduct(normalizedItems);

    // FIX: Parse existing additional charges to separate "Others(value)" correctly
    const parsedCharges = (initialQuoteData.additional_charges || []).map(charge => {
      let optionType = charge.type;
      let customType = charge.type;
      
      const match = charge.type?.match(/^Others\((.*)\)$/);
      if (match) {
          optionType = "Others";
          customType = match[1];
      } else if (!["Delivery Charges", "Installation Charges", "Installation Material Charges"].includes(charge.type)) {
          // Fallback if it's a completely unformatted custom string
          optionType = "Others";
      }

      return {
          id: charge.id || null,
          option: optionType,
          type: customType,
          value: charge.value,
          localId: generateLocalId()
      };
    });

    setAdditionalCharges(parsedCharges);
    
    setSubTotal(initialQuoteData.subtotal || 0);
    setDiscount(initialQuoteData.discount || 0);
    setTotal(initialQuoteData.total || 0);
    setVat(initialQuoteData.vat || false);
    setIncludeCatalog(initialQuoteData.is_catalog || false);
    setTitle(initialQuoteData.title || "");
    setFisrtName(initialQuoteData.first_name || "");
    setLastName(initialQuoteData.last_name || "");
    setEmail(initialQuoteData.email || "");
    setPhoneNo1(initialQuoteData.phone_no1 || "");
    setPhoneNo2(initialQuoteData.phone_no2 || "");
    setAddress(initialQuoteData.address || "");
    setStatus(initialQuoteData.status || "");
    setPoNO(initialQuoteData.PoNo || "");
    setVatNo(initialQuoteData.vat_no || "");
  };

  useEffect(() => {
    if (open && initialQuoteData) {
      initializeFormData();
    }
  }, [open, initialQuoteData]);

  useEffect(() => {
    const subtotal = (addProduct || []).reduce((acc, item) => {
      const value = parseFloat(item?.subtotal || 0);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

    const additionalChargesTotal = (additionalCharges ?? []).reduce((acc, charge) => {
      const value = parseFloat(charge.value || "0");
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

    const subTotalWithAdditionalCharges = subtotal + additionalChargesTotal;
    const totalCalc = subTotalWithAdditionalCharges - (parseFloat(discount) || 0);

    const vatCalc = totalCalc * 0.18;
    const netTotalCalc = totalCalc + vatCalc;

    setSubTotal(subtotal.toFixed(2));
    setTotal(totalCalc.toFixed(2));
    setNetTotal(netTotalCalc.toFixed(2));
    setVatAmount(vatCalc.toFixed(2));
  }, [addProduct, additionalCharges, discount]);

  const handleEditBatteryPackQuoteSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      const quotePayload = {
        customer: {
          customer_id: initialQuoteData.customer_id,
          Title: title,
          PhoneNo1: phoneNo1,
          PhoneNo2: phoneNo2,
          FirstName: fisrtName,
          LastName: lastName,
          Email: email,
          Address: address,
          VatNo: vatNo,
        },
        quote: {
          QuoteNo: initialQuoteData.quote_no,
          SubTotal: parseFloat(subTotal) || 0,
          // FIX: Format "Others" before sending
          additional_charges: additionalCharges.map(charge => {
            const finalType = charge.option === "Others" 
                ? `Others(${charge.type})` 
                : (charge.option || charge.type);
            
            return {
                type: finalType,
                value: parseFloat(charge.value) || 0,
            };
          }),
          Discount: parseFloat(discount) || 0,
          Total: parseFloat(total) || 0,
          Vat: vat,
          IsCatalog: includeCatalog,
          Status: status,
          PoNo: poNo,
        },
        quote_items: {
          items: addProduct
            .filter(p => p.product_id && p.subtotal !== undefined)
            .map(p => ({
              id: p.id || null,
              product_id: p.product_id,
              unit_price: parseFloat(p.unitprice),
              quantity: p.qty,
              subtotal: p.subtotal,
              note: p.note || '',
            })),
        },
      };

      const response = await updateQuote(token, quoteId, quotePayload);

      if (response && (response.message === "success" || response.status === "success")) {
        setOpen(false);
        toast.success("Battery pack quote updated successfully!", { position: "bottom-right" });

        if (onUpdate) {
          onUpdate(); 
        }
      } else {
        console.error("API returned non-success:", response);
        toast.error(response?.message || "Failed to update quote. Please try again.", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating quote:", error);
      toast.error("Failed to update quote. Please try again.", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (newOpen && !initialQuoteData) {
        return;
      }
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4">
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">{initialQuoteData?.type}{initialQuoteData?.quote_no}</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to quote details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditBatteryPackQuoteSubmit} className="space-y-6 pt-4">
          
          {/* Product Details Section */}
          <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
            <h2 className="font-bold text-lg text-slate-800">Product Details</h2>

            <div className="space-y-4">
              {addProduct.map((product, index) => (
                <div key={product.localId || index} className="p-4 border border-slate-200/70 rounded-2xl bg-white shadow-sm space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Product Select */}
                    <div className="md:col-span-5">
                      <Select
                        value={addProduct[index].product_id ? addProduct[index].product_id.toString() : undefined}
                        onValueChange={(value) => {
                          const selectedProduct = products.find(p => p.productId.toString() === value.toString());
                          const specs = selectedProduct?.specifications || '';
                          const note = getNoteFromSpecification(specs);

                          setAddProduct(prev => {
                            const updated = [...prev];
                            const qty = 1;
                            const price = selectedProduct?.price || 0;

                            updated[index] = {
                              ...updated[index],
                              id: selectedProduct?.id || null,
                              product_id: selectedProduct?.productId || 0,
                              product_name: selectedProduct?.productName || '',
                              unitprice: price,
                              specifications: specs,
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
                        <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
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
                              className="w-full h-9 text-sm"
                            />
                          </div>

                          {isLoading ? (
                            <div className="p-2 text-sm text-slate-400">Loading...</div>
                          ) : products.length > 0 ? (
                            products.map((prod) => (
                              <SelectItem key={prod.productId} value={prod.productId?.toString()}>
                                {prod.productName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-slate-400">No products found</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Unit Price */}
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Unit Price"
                        className="bg-slate-50 border-slate-200 h-11 rounded-xl text-right font-medium"
                        value={product.unitprice}
                        onChange={(e) => {
                          const value = Number(e.target.value) || 0;
                          const updated = [...addProduct];
                          const qty = updated[index].qty || 1;
                          updated[index].unitprice = value;
                          updated[index].subtotal = value * qty;
                          setAddProduct(updated);
                        }}
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
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="bg-slate-50 border-slate-200 h-11 rounded-xl text-center font-medium flex-1"
                          value={product.qty}
                          onChange={(e) => {
                            let qty = Number(e.target.value) || 1;
                            if (qty < 1) qty = 1;
                            const updated = [...addProduct];
                            updated[index].qty = qty;
                            updated[index].subtotal = qty * updated[index].unitprice;
                            setAddProduct(updated);
                          }}
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
                      <Input
                        type="number"
                        placeholder="Subtotal"
                        className="bg-slate-50 border-slate-200 h-11 rounded-xl text-right font-bold flex-1"
                        value={product.subtotal}
                        readOnly
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

                  {/* Note */}
                  <Textarea
                    value={product.note}
                    onChange={(e) => {
                      const updated = [...addProduct];
                      updated[index].note = e.target.value;
                      setAddProduct(updated);
                    }}
                    placeholder={`Note for product ${index + 1}`}
                    className="bg-slate-50/50 border-slate-200 text-xs rounded-xl p-3"
                    rows={2}
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
                    <div key={charge.localId || index} className="flex items-start gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        <Select
                          value={charge.option || ""}
                          onValueChange={(value) => {
                            const updated = [...additionalCharges];
                            updated[index].option = value;
                            updated[index].type = value === "Others" ? "" : value;
                            setAdditionalCharges(updated);
                          }}
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                            <SelectValue placeholder="Charge Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Delivery Charges">Delivery Charges</SelectItem>
                            <SelectItem value="Installation Charges">Installation Charges</SelectItem>
                            <SelectItem value="Installation Material Charges">Installation Material Charges</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>

                        {charge.option === "Others" && (
                          <Input
                            placeholder="Enter custom charge type"
                            className="bg-slate-50 border-slate-200 h-11 rounded-xl mt-1"
                            value={charge.type}
                            onChange={(e) => {
                              const updated = [...additionalCharges];
                              updated[index].type = e.target.value;
                              setAdditionalCharges(updated);
                            }}
                          />
                        )}
                      </div>

                      <Input
                        type="number"
                        className="bg-slate-50 border-slate-200 h-11 rounded-xl w-32 text-right"
                        placeholder="0.00"
                        value={charge.value}
                        onChange={(e) => {
                          const updated = [...additionalCharges];
                          updated[index].value = e.target.value;
                          setAdditionalCharges(updated);
                        }}
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
                    className="border-slate-200 text-blue-600 hover:bg-blue-50 rounded-xl h-9 px-3 text-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Charge
                  </Button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Checkbox
                    id="vat"
                    checked={vat}
                    onCheckedChange={() => setVat(!vat)}
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
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold text-sm">Sub Total</span>
                  <Input
                    type="number"
                    className="bg-slate-50 border-slate-200 h-11 rounded-xl w-44 text-right font-medium"
                    value={subTotal}
                    readOnly
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold text-sm">Discount</span>
                  <Input
                    type="number"
                    className="bg-slate-50 border-slate-200 h-11 rounded-xl w-44 text-right font-medium"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-bold text-base">Total</span>
                  <Input
                    type="number"
                    className="bg-slate-50 border-slate-200 h-11 rounded-xl w-44 text-right font-bold text-slate-900"
                    value={total}
                    readOnly
                  />
                </div>

                {vat && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold text-sm">VAT (18%)</span>
                      <Input
                        type="number"
                        className="bg-slate-50 border-slate-200 h-11 rounded-xl w-44 text-right font-medium"
                        value={vatAmount}
                        readOnly
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-blue-700 font-extrabold text-base">Net Total</span>
                      <Input
                        type="number"
                        className="bg-blue-50 border-blue-200 h-11 rounded-xl w-44 text-right font-extrabold text-blue-800"
                        value={netTotal}
                        readOnly
                      />
                    </div>
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
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-semibold text-sm">Title</Label>
                  <Select value={title || undefined} onValueChange={setTitle}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                      <SelectValue placeholder="Select title" />
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

                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-semibold text-sm">Secondary Phone No.</Label>
                  <Input value={phoneNo2} onChange={(e) => setPhoneNo2(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="94XXXXXXXXX" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-semibold text-sm">First Name</Label>
                  <Input value={fisrtName} onChange={(e) => setFisrtName(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="John" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-semibold text-sm">Address</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="123 Street Name" />
                </div>

                {vat && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-slate-700 font-semibold text-sm">VAT No.</Label>
                    <Input value={vatNo} onChange={(e) => setVatNo(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Customer's VAT No" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-semibold text-sm">Phone No.</Label>
                  <Input value={phoneNo1} onChange={(e) => setPhoneNo1(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="94XXXXXXXXX" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-semibold text-sm">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="john@example.com" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-semibold text-sm">Last Name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Doe" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-semibold text-sm">PO No.</Label>
                  <Input value={poNo} onChange={(e) => setPoNO(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Purchasing Order No" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}