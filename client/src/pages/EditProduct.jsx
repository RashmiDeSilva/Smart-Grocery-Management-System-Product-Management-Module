import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Save, X, Upload } from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import FileUploadModal from "../components/FileUploadModal";
import { MAIN_CATEGORIES, SUB_CATEGORIES, validateProduct } from "../constants/product-constants";

const API = "http://localhost:5000/api/products";

const EditProduct = () => {
    const { id: paramId } = useParams();
    const location = useLocation();
    const id = paramId || location.pathname.split('/').pop();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        productId: "",
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
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`${API}/${id}`);
                if (!res.ok) throw new Error("Could not fetch product");
                const pd = await res.json();

                if (pd) {
                    setForm({
                        productId: pd.productId || pd._id || id,
                        productName: pd.productName || pd.name || "",
                        mainCategory: pd.mainCategory || pd.category || "",
                        subCategory: pd.subCategory || "",
                        supplier: pd.supplier || "",
                        costPrice: pd.costPrice ?? "",
                        sellingPrice: pd.sellingPrice ?? pd.price ?? "",
                        imageUrl: pd.imageUrl || "",
                        reorderLevel: pd.reorderLevel ?? "",
                    });
                } else {
                    setErrors(["Product not found."]);
                }
            } catch (err) {
                setErrors(["Product details could not be loaded."]);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

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

    const onSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateProduct(form);
        if (!form.productId) {
            validationErrors.push("Product ID is missing.");
        }
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
            const res = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let msg = "Update failed. Please try again.";
                try {
                    const data = await res.json();
                    msg = data.message || msg;
                } catch { }
                throw new Error(msg);
            }

            navigate(`/staff/products/details/${id}`);
        } catch (err) {
            setErrors([err.message || "Update failed."]);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="products-page p-8 font-bold">Loading product details...</div>;
    }

    return (
        <div className="products-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="products-content-title" style={{ margin: 0 }}>Edit Product</h1>
                    <p className="products-content-subtitle" style={{ marginTop: "0.25rem" }}>Update information for {form.productName || "Product"}</p>
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
                    <h2 style={{ margin: 0 }}>Product Information - Editing Mode</h2>
                    <span className="products-muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                        Modify the product details below.
                    </span>
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

                    <div className="products-form-actions-2col mt-4 border-t border-[#0F172A]/5 pt-6">
                        <button
                            type="submit"
                            className="products-btn-save flex items-center gap-2 outline-none cursor-pointer"
                            style={{ border: 'none' }}
                            disabled={isSubmitting}
                        >
                            <Save size={16} /> {isSubmitting ? "Updating..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="products-btn-cancel flex items-center gap-2 outline-none cursor-pointer"
                            style={{ border: 'none' }}
                            onClick={() => navigate(-1)}
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </form>
            </div>

            <FileUploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUpload={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                title="Upload Product Image"
                accept="image/*"
            />
        </div>
    );
};

export default EditProduct;
