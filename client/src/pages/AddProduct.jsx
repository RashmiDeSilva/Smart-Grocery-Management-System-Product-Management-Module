import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, X, Upload, Pencil, ClipboardList, PackageSearch } from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import { MAIN_CATEGORIES, SUB_CATEGORIES, validateProduct } from "../constants/product-constants";
import FileUploadModal from "../components/FileUploadModal";

const API = "http://localhost:5000/api/products";

const AddProduct = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({
        productName: "",
        mainCategory: "",
        subCategory: "",
        supplier: "",
        costPrice: "",
        sellingPrice: "",
        imageUrl: "",
        reorderLevel: "",
    });

    const [errors, setErrors] = useState([]);
    const [products, setProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const handleEditClick = (item) => {
        setEditingProductId(item.productId || item._id || item.id);
        setForm({
            productName: item.productName || item.name || "",
            mainCategory: item.mainCategory || item.category || "",
            subCategory: item.subCategory || "",
            supplier: item.supplier || "",
            costPrice: item.costPrice ?? "",
            sellingPrice: item.sellingPrice ?? item.price ?? "",
            imageUrl: item.imageUrl || "",
            reorderLevel: item.reorderLevel ?? "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        if (location.state?.editProduct) {
            handleEditClick(location.state.editProduct);
        }
    }, [location.state]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(API);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (err) {
            console.error("Failed to load products", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const subCategoryOptions = useMemo(() => {
        return SUB_CATEGORIES[form.mainCategory] || [];
    }, [form.mainCategory]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const next = { ...prev, [name]: value };
            if (name === "mainCategory" && value !== prev.mainCategory) {
                next.subCategory = "";
            }
            return next;
        });
        if (errors.length > 0) setErrors([]);
    };

    const cancelEdit = () => {
        setEditingProductId(null);
        setForm({
            productName: "",
            mainCategory: "",
            subCategory: "",
            supplier: "",
            costPrice: "",
            sellingPrice: "",
            imageUrl: "",
            reorderLevel: "",
        });
        setErrors([]);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateProduct(form);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            productName: form.productName.trim(),
            mainCategory: form.mainCategory.trim(),
            subCategory: form.subCategory.trim(),
            supplier: form.supplier.trim(),
            costPrice: Number(form.costPrice),
            sellingPrice: Number(form.sellingPrice),
            imageUrl: form.imageUrl.trim(),
            reorderLevel: Number(form.reorderLevel),
        };

        try {
            setIsSubmitting(true);
            const url = editingProductId ? `${API}/${editingProductId}` : API;
            const method = editingProductId ? "PUT" : "POST";
            
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let msg = "Save failed. Please try again.";
                try {
                    const data = await res.json();
                    msg = data.message || msg;
                } catch { }
                throw new Error(msg);
            }

            await fetchProducts();
            cancelEdit();
        } catch (err) {
            setErrors([err.message || "Save failed. Please try again."]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="products-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="products-content-title" style={{ margin: 0 }}>
                        {editingProductId ? "Edit Product" : "Add Product"}
                    </h1>
                    <p className="products-content-subtitle" style={{ marginTop: "0.25rem" }}>
                        {editingProductId ? `Updating details for ${form.productName}` : "Register a new product in the system"}
                    </p>
                </div>
                <button
                    className="products-btn-cancel"
                    style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => navigate("/staff/products")}
                >
                    <ArrowLeft size={16} /> Back to Products
                </button>
            </div>

            {errors.length > 0 && (
                <div className="products-banner">
                    {errors.length === 1 ? (
                        errors[0]
                    ) : (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {errors.map((msg, i) => (
                              <li key={i}>{msg}</li>
                          ))}
                        </ul>
                    )}
                </div>
            )}

            <div className="products-section-card">
                <div className="products-section-title">
                    <div>
                        <h2 className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <ClipboardList className="text-[#007A5E]" size={20} /> 
                            Product Information{editingProductId ? " - Editing Mode" : ""}
                        </h2>
                        <span className="products-muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                            Ensure all details are correct before saving
                        </span>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="products-form-2col">
                    <div className="products-field">
                        <label>Product Name *</label>
                        <input
                            name="productName"
                            placeholder="e.g. Fresh Milk 1L"
                            value={form.productName}
                            onChange={onChange}
                        />
                    </div>

                    <div className="products-field">
                        <label>Main Category *</label>
                        <CustomSelect
                            name="mainCategory"
                            value={form.mainCategory}
                            onChange={onChange}
                            placeholder="Select Main Category"
                            options={[
                                ...MAIN_CATEGORIES.map((c) => ({ value: c, label: c })),
                            ]}
                        />
                    </div>

                    <div className="products-field">
                        <label>Sub Category *</label>
                        <CustomSelect
                            name="subCategory"
                            value={form.subCategory}
                            onChange={onChange}
                            disabled={!form.mainCategory}
                            placeholder="Select Sub Category"
                            options={[
                                ...subCategoryOptions.map((c) => ({ value: c, label: c })),
                            ]}
                        />
                    </div>

                    <div className="products-field">
                        <label>Supplier *</label>
                        <input
                            name="supplier"
                            placeholder="e.g. Highland Dairy"
                            value={form.supplier}
                            onChange={onChange}
                        />
                    </div>

                    <div className="products-field">
                        <label>Cost Price (Rs) *</label>
                        <input
                            name="costPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.costPrice}
                            onChange={onChange}
                        />
                    </div>

                    <div className="products-field">
                        <label>Selling Price (Rs) *</label>
                        <input
                            name="sellingPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.sellingPrice}
                            onChange={onChange}
                        />
                    </div>

                    <div className="products-field">
                        <label>Reorder Level *</label>
                        <input
                            name="reorderLevel"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="e.g. 10"
                            value={form.reorderLevel}
                            onChange={onChange}
                        />
                    </div>

                    <div className="products-field">
                        <label>Image URL</label>
                        <input
                            name="imageUrl"
                            placeholder="https://... OR upload below"
                            value={form.imageUrl}
                            onChange={onChange}
                        />
                    </div>

                    <div className="products-field">
                        <label>Product Image File</label>
                        <button
                            type="button"
                            className="products-field-btn-upload"
                            onClick={() => setUploadModalOpen(true)}
                            style={{
                                width: "100%",
                                height: "3.25rem",
                                borderRadius: "1.25rem",
                                backgroundColor: "rgba(15, 23, 42, 0.05)",
                                color: "#0F172A",
                                fontWeight: 800,
                                fontSize: "0.875rem",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                transition: "background-color 0.2s"
                            }}
                        >
                            <Upload size={16} /> Choose File / Drag & Drop
                        </button>
                    </div>

                    <FileUploadModal
                        isOpen={uploadModalOpen}
                        onClose={() => setUploadModalOpen(false)}
                        title="Upload Product Image"
                        accept="image/*"
                        onUpload={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
                    />

                    <div className="products-form-actions-2col mt-4 border-t border-[#0F172A]/5 pt-6">
                        <button
                            type="submit"
                            className="products-btn-save flex items-center gap-2 outline-none cursor-pointer"
                            style={{ border: 'none' }}
                            disabled={isSubmitting}
                        >
                            <Save size={16} /> {isSubmitting ? "Saving..." : (editingProductId ? "Update Product" : "Save Product")}
                        </button>
                        <button
                            type="button"
                            className="products-btn-cancel flex items-center gap-2 outline-none cursor-pointer"
                            style={{ border: 'none' }}
                            onClick={editingProductId ? cancelEdit : () => navigate("/staff/products")}
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </form>
            </div>

            {products.length > 0 && (
                <div className="mt-12 animate-fade-in">
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-[#0F172A]">
                        <PackageSearch className="text-[#007A5E]" size={22} /> All Products
                    </h2>
                    <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(15,23,42,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.9)' }}>
                        <table className="w-full text-left border-collapse" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr className="bg-[#0F172A]/5 text-[#0F172A] text-sm uppercase tracking-widest font-black" style={{ backgroundColor: 'rgba(15,23,42,0.05)' }}>
                                    <th className="p-4 border-b border-[#0F172A]/5 text-center w-16" style={{ padding: '1rem', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
                                        Image
                                    </th>
                                    <th className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
                                        Product ID & Name
                                    </th>
                                    <th className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>Category</th>
                                    <th className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>Prices</th>
                                    <th className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>Stock</th>
                                    <th className="p-4 border-b border-[#0F172A]/5 text-right" style={{ padding: '1rem', borderBottom: '1px solid rgba(15,23,42,0.05)', textAlign: 'right' }}>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item, idx) => (
                                    <tr key={idx} className={`transition-colors`} style={{ borderBottom: '1px solid rgba(15,23,42,0.05)', backgroundColor: editingProductId === (item.productId || item._id || item.id) ? 'rgba(0,122,94,0.1)' : 'transparent' }}>
                                        <td className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem' }}>
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center" style={{ width: '48px', height: '48px', backgroundColor: '#ffffff', border: '1px solid rgba(15,23,42,0.05)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                                <img
                                                    src={
                                                        item.imageUrl ||
                                                        "https://placehold.co/150?text=No+Img"
                                                    }
                                                    alt={item.productName || item.name}
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.target.src =
                                                            "https://placehold.co/150?text=No+Img";
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem' }}>
                                            <div className="font-bold text-[#007A5E] text-sm tracking-wider mb-1" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#007A5E' }}>
                                                {item.productId || item._id || item.id}
                                            </div>
                                            <div className="font-black text-[#0F172A]" style={{ fontWeight: 900, color: '#0f172a' }}>
                                                {item.productName || item.name}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem' }}>
                                            <div className="text-base font-bold text-[#0F172A]/80" style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(15,23,42,0.8)' }}>
                                                {item.mainCategory || item.category}
                                            </div>
                                            <div className="text-sm font-bold text-[#0F172A]/40 uppercase tracking-wide" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(15,23,42,0.4)' }}>
                                                {item.subCategory}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem' }}>
                                            <div className="text-base" style={{ fontSize: '1rem' }}>
                                                <span className="text-[#0F172A]/40 font-black text-xs uppercase" style={{ fontSize: '0.75rem', fontWeight: 900, color: 'rgba(15,23,42,0.4)' }}>
                                                    Cost:
                                                </span>{" "}
                                                <span className="font-bold" style={{ fontWeight: 700 }}>Rs {item.costPrice ?? 0}</span>
                                            </div>
                                            <div className="text-base text-[#007A5E]" style={{ fontSize: '1rem', color: '#007A5E' }}>
                                                <span className="opacity-60 font-black text-xs uppercase" style={{ fontSize: '0.75rem', fontWeight: 900 }}>
                                                    Sell:
                                                </span>{" "}
                                                <span className="font-bold" style={{ fontWeight: 700 }}>
                                                    Rs {item.sellingPrice ?? item.price ?? 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-[#0F172A]/5" style={{ padding: '1rem' }}>
                                            <div className="text-base" style={{ fontSize: '1rem' }}>
                                                <span className="text-[#0F172A]/60 font-bold" style={{ fontWeight: 700, color: 'rgba(15,23,42,0.6)' }}>{item.stock ?? 0}</span>/
                                                <span className="text-[#0F172A]/40 text-sm" style={{ fontSize: '0.875rem', color: 'rgba(15,23,42,0.4)' }}>Stock</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-[#0F172A]/5 text-right" style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="px-4 py-2 rounded-xl bg-[#0F172A]/5 text-[#0F172A] hover:bg-[#007A5E] hover:text-white font-bold text-sm transition-all flex items-center gap-2 ml-auto outline-none cursor-pointer"
                                                style={{ border: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddProduct;
