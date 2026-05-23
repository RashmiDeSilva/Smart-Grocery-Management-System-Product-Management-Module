import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Check, ArrowLeft, Pencil, Archive } from "lucide-react";
import CustomSelect from "../components/CustomSelect";

const API = "http://localhost:5000/api/products";

const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(15, 23, 42, 0.05)', padding: '1rem 0', fontSize: '0.875rem' }}>
        <span style={{ color: 'rgba(15, 23, 42, 0.5)', width: '33.333%', fontWeight: 700 }}>{label}</span>
        <span style={{ color: '#0F172A', fontWeight: 900 }}>{value}</span>
    </div>
);

const DetailRowIcon = ({ label, value, iconColor }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(15, 23, 42, 0.05)', padding: '1rem 0', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: iconColor === "bg-orange-500" ? "#F97316" : "#007A5E" }}></div>
        <span style={{ color: 'rgba(15, 23, 42, 0.5)', width: 'calc(33.333% - 1.25rem)', fontWeight: 700 }}>{label}</span>
        <span style={{ color: '#0F172A', fontWeight: 900 }}>{value}</span>
    </div>
);

const DetailRowCheck = ({ label, value }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(15, 23, 42, 0.05)', padding: '1rem 0', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
        <Check size={14} strokeWidth={4} style={{ color: '#007A5E' }} />
        <span style={{ color: 'rgba(15, 23, 42, 0.5)', width: 'calc(33.333% - 1.5rem)', fontWeight: 700 }}>{label}</span>
        <span style={{ color: '#0F172A', fontWeight: 900 }}>{value}</span>
    </div>
);

const ProductDetails = () => {
    const { id: paramId } = useParams();
    const location = useLocation();
    const id = paramId || location.pathname.split('/').pop();
    
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
    const [archiveReason, setArchiveReason] = useState("Out of Stock");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API}/${id}`);
                if (!res.ok) throw new Error("Could not fetch product");
                const pd = await res.json();

                if (pd) {
                    setProduct({
                        ...pd,
                        productId: pd.productId || pd._id || id,
                        productName: pd.productName || pd.name || "",
                        mainCategory: pd.mainCategory || pd.category || "",
                        subCategory: pd.subCategory || "None",
                        supplier: pd.supplier || "Unknown",
                        costPrice: pd.costPrice || 0,
                        sellingPrice: pd.sellingPrice || pd.price || 0,
                        imageUrl: pd.imageUrl || "",
                        reorderLevel: pd.reorderLevel || 0,
                        stock: pd.stock ?? 0,
                        sold: pd.sold ?? 0,
                        discount: pd.discount || "No active discount",
                        isArchived: pd.isArchived || false,
                    });
                } else {
                    setError("Product not found.");
                }
            } catch (err) {
                setError("Product details could not be loaded.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleArchive = () => {
        setArchiveConfirmOpen(true);
    };

    const handleArchiveConfirm = async () => {
        try {
            const res = await fetch(`${API}/${product._id || id}`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    isArchived: !product.isArchived,
                    archiveReason: product.isArchived ? "" : archiveReason
                })
            });
            if (!res.ok) throw new Error("Archive toggle failed");
            setArchiveConfirmOpen(false);
            navigate("/staff/products");
        } catch (err) {
            alert("Action failed. Please try again.");
        }
    };

    if (loading) {
        return <div className="p-8 font-bold text-center mt-20 text-[#0F172A]">Loading product details...</div>;
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center mt-20">
                <h2 className="text-xl font-bold text-red-600 mb-4">{error}</h2>
                <button className="px-6 py-2 bg-[#0F172A]/10 rounded-xl hover:bg-[#0F172A]/20 transition-all font-bold" onClick={() => navigate("/staff/products")}>Return to Products</button>
            </div>
        );
    }

    const hasSalesInventory = product.stock !== undefined && product.stock !== null;
    const hasDiscount = product.discount && product.discount !== "N/A" && product.discount !== "No active discount";

    const costPriceStr = `Rs. ${Number(product.costPrice).toFixed(2)}`;
    const sellingPriceStr = `Rs. ${Number(product.sellingPrice).toFixed(2)}`;
    const totalSalesStr = `Rs. ${(Number(product.sold) * Number(product.sellingPrice)).toFixed(2)}`;

    return (
        <div className="bg-white text-[#0F172A] min-h-[85vh] rounded-[1.5rem] p-6 lg:p-10 font-sans shadow-xl border border-gray-100" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Breadcrumbs */}
            <div style={{ color: 'rgba(15, 23, 42, 0.5)', fontSize: '0.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <span className="hover:text-[#007A5E] transition-colors" style={{ cursor: 'pointer' }} onClick={() => navigate('/staff')}>Dashboard</span> 
                <span style={{ color: 'rgba(15, 23, 42, 0.2)' }}>/</span> 
                <span className="hover:text-[#007A5E] transition-colors" style={{ cursor: 'pointer' }} onClick={() => navigate('/staff/products')}>Products</span> 
                <span style={{ color: 'rgba(15, 23, 42, 0.2)' }}>/</span> 
                <span style={{ color: '#007A5E' }}>Product Details</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate('/staff/products')} 
                        style={{ border: 'none', background: 'rgba(15,23,42,0.05)', borderRadius: '1rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                        title="Back to Products"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="products-content-title" style={{ margin: 0, textTransform: 'capitalize', fontSize: '1.75rem', fontWeight: 900 }}>{product.productName}</h1>
                        <p className="products-content-subtitle" style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(15, 23, 42, 0.4)', fontWeight: 700, marginTop: '0.25rem' }}>Product Details</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        className="products-btn-save" 
                        style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 700 }}
                        onClick={() => navigate(`/staff/products/edit/${id}`)}
                    >
                        <Pencil size={16} /> Edit Product
                    </button>
                    <button 
                        className="products-btn-cancel" 
                        style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F59E0B', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 700 }}
                        onClick={handleArchive}
                    >
                        <Archive size={16} /> {product.isArchived ? "Unarchive" : "Archive"}
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div 
                style={{ 
                    border: '1px solid rgba(15, 23, 42, 0.05)', 
                    borderRadius: '2rem', 
                    padding: '2.5rem', 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '2rem', 
                    backgroundColor: '#F8FAFC',
                    marginTop: '1.5rem',
                    justifyContent: 'center'
                }}
            >
                {/* Left Column (Image) */}
                <div style={{ flex: '1 1 250px', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '300px', aspectRatio: '1', boxSizing: 'border-box', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px solid rgba(15, 23, 42, 0.05)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden', padding: '1.5rem' }}>
                        <img 
                            src={product.imageUrl || "https://placehold.co/600x600?text=No+Preview"} 
                            alt={product.productName} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.5s' }}
                            className="hover:scale-105" 
                            onError={(e) => { e.target.src = "https://placehold.co/600x600?text=No+Preview"; }}
                        />
                    </div>
                </div>

                {/* Right Column (Details) */}
                <div style={{ flex: '1.2 1 350px', display: 'flex', flexDirection: 'column', gap: '0', minWidth: '280px' }}>
                    <DetailRow label="Product ID:" value={product.productId} />
                    <DetailRow label="Product Name:" value={product.productName} />
                    <DetailRow label="Main Category:" value={product.mainCategory} />
                    <DetailRow label="Sub Category:" value={product.subCategory} />
                    <DetailRow label="Cost Price:" value={costPriceStr} />
                    <DetailRow label="Selling Price:" value={sellingPriceStr} />

                    {/* Sales & Inventory */}
                    <h3 style={{ color: '#0F172A', fontWeight: 900, fontSize: '1.125rem', marginTop: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Sales & Inventory</h3>
                    {!hasSalesInventory ? (
                        <div style={{ color: 'rgba(15, 23, 42, 0.4)', fontSize: '0.875rem', padding: '1rem 0', borderBottom: '1px solid rgba(15, 23, 42, 0.05)', fontStyle: 'italic' }}>
                            Not included yet
                        </div>
                    ) : (
                        <>
                            <DetailRowIcon label="Total Sold:" value={`${product.sold} Units`} iconColor="bg-orange-500" />
                            <DetailRowIcon label="Stock Remaining:" value={`${product.stock} Units`} iconColor="bg-[#007A5E]" />
                            <DetailRowIcon label="Total Sales:" value={totalSalesStr} iconColor="bg-[#007A5E]" />
                        </>
                    )}

                    {/* Discount Details */}
                    <h3 style={{ color: '#0F172A', fontWeight: 900, fontSize: '1.125rem', marginTop: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Discount Details</h3>
                    {!hasDiscount ? (
                        <div style={{ color: 'rgba(15, 23, 42, 0.4)', fontSize: '0.875rem', padding: '1rem 0', borderBottom: '1px solid rgba(15, 23, 42, 0.05)', fontStyle: 'italic' }}>
                            Not included yet
                        </div>
                    ) : (
                        <>
                            <DetailRowCheck label="Current Discount:" value={product.discount} />
                            <DetailRowCheck label="Discount Price:" value={"Calculated at checkout"} />
                        </>
                    )}


                </div>
            </div>

            {/* Archive Confirmation Modal */}
            {archiveConfirmOpen && (
                <div className="archive-reason-modal-backdrop">
                    <div className="archive-reason-modal">
                        <h3 className="archive-modal-title">
                            {product.isArchived ? "Unarchive Product" : "Archive Product"}
                        </h3>
                        <p className="archive-modal-desc">
                            Are you sure you want to {product.isArchived ? "unarchive" : "archive"} <strong>{product.productName}</strong>?
                        </p>
                        {!product.isArchived && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(15, 23, 42, 0.5)", textTransform: "uppercase" }}>
                                    Reason for Archiving
                                </label>
                                <CustomSelect
                                    name="archiveReason"
                                    value={archiveReason}
                                    onChange={(e) => setArchiveReason(e.target.value)}
                                    placeholder="Select Reason"
                                    options={[
                                        { value: "Out of Stock", label: "Out of Stock" },
                                        { value: "Seasonal", label: "Seasonal" },
                                        { value: "Expired", label: "Expired" },
                                        { value: "Other", label: "Other" }
                                    ]}
                                />
                            </div>
                        )}
                        <div className="archive-modal-actions">
                            <button
                                className="products-btn-cancel"
                                style={{ border: "none", cursor: "pointer", padding: "0.65rem 1.25rem", borderRadius: "1rem", fontWeight: 700 }}
                                onClick={() => setArchiveConfirmOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="products-btn-save"
                                style={{
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "0.65rem 1.25rem",
                                    borderRadius: "1rem",
                                    fontWeight: 700,
                                    backgroundColor: product.isArchived ? "#007A5E" : "#EA580C",
                                    color: "#ffffff"
                                }}
                                onClick={handleArchiveConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
