import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  PlusCircle,
  Archive,
  Eye,
  Pencil,
  Copy,
  Trash,
  MoreVertical,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Boxes
} from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import { MAIN_CATEGORIES } from "../constants/product-constants";

const API = "http://localhost:5000/api/products";

const SUPER_CATEGORIES = [
  {
    id: "fresh-foods",
    title: "Fresh Foods",
    categories: ["Meat & Fish", "Vegetables", "Fruits"]
  },
  {
    id: "grocery-staples",
    title: "Grocery & Staples",
    categories: ["Grocery", "Beverages", "Snacks & Sweets", "Bakery"]
  },
  {
    id: "home-essentials",
    title: "Home and Essentials",
    categories: ["Health & Personal Care", "Household"]
  },
  {
    id: "chilled-frozen",
    title: "Chilled & Frozen",
    categories: ["Baby Care", "Frozen Food"]
  }
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [sortOption, setSortOption] = useState("A-Z Name");

  // Tab State: 'products' or 'archived'
  const [activeTab, setActiveTab] = useState("products");

  // Pagination states for Archived Products
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Card Context Menu state: tracks productId of open menu
  const [openMenuId, setOpenMenuId] = useState(null);

  // Archive modal state
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveReason, setArchiveReason] = useState("Out of Stock");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const contextMenuRef = useRef(null);

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(
        (Array.isArray(data) ? data : []).map((p) => ({
          ...p,
          productId: p.productId ?? p._id ?? p.id,
          productName: p.productName ?? p.name,
          mainCategory: p.mainCategory ?? p.category,
          sellingPrice: p.sellingPrice ?? p.price ?? 0,
          salesCount: p.sold || p.salesCount || 0
        }))
      );
    } catch (err) {
      setErrors(["Failed to load products"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (openMenuId && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenuId]);

  // Extract suppliers list dynamically
  const suppliersList = useMemo(() => {
    const list = new Set(products.map((p) => p.supplier).filter(Boolean));
    return Array.from(list).sort();
  }, [products]);

  // Compute product stats for the sidebar
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => !p.isArchived).length;
    const archived = products.filter((p) => p.isArchived).length;
    const outOfStock = products.filter((p) => !p.isArchived && (p.stock || 0) <= 0).length;
    return { total, active, archived, outOfStock };
  }, [products]);

  // Filtered and Sorted list of products (only active or archived depending on selected tab)
  const filteredAndSorted = useMemo(() => {
    let result = products.filter((p) => {
      // Tab filter
      const matchTab = activeTab === "products" ? !p.isArchived : p.isArchived;
      if (!matchTab) return false;

      // Text/filter search
      const matchSearch = (p.productName || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory = selectedCategory
        ? p.mainCategory === selectedCategory
        : true;
      const matchSupplier = selectedSupplier
        ? p.supplier === selectedSupplier
        : true;
      return matchSearch && matchCategory && matchSupplier;
    });

    if (sortOption === "A-Z Name") {
      result.sort((a, b) =>
        (a.productName || "").localeCompare(b.productName || "")
      );
    } else if (sortOption === "Best selling") {
      result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    } else if (sortOption === "Low Selling") {
      result.sort((a, b) => (a.salesCount || 0) - (b.salesCount || 0));
    }

    return result;
  }, [products, search, selectedCategory, selectedSupplier, sortOption, activeTab]);

  // Paginated archived products
  const paginatedArchived = useMemo(() => {
    if (activeTab !== "archived") return [];
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSorted, activeTab, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;

  // Actions
  const handleToggleMenu = (e, productId) => {
    e.stopPropagation();
    if (openMenuId === productId) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(productId);
    }
  };

  const handleOpenArchiveModal = (e, p) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setArchiveTarget(p);
    setArchiveReason("Out of Stock");
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    try {
      const res = await fetch(`${API}/${archiveTarget._id || archiveTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true, archiveReason })
      });
      if (!res.ok) throw new Error("Failed to archive product");
      setArchiveTarget(null);
      await loadProducts();
    } catch (err) {
      setErrors([err.message]);
    }
  };

  const handleRestore = async (p) => {
    try {
      const res = await fetch(`${API}/${p._id || p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false })
      });
      if (!res.ok) throw new Error("Failed to restore product");
      await loadProducts();
    } catch (err) {
      setErrors([err.message]);
    }
  };

  const handleDelete = (e, p) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setDeleteTarget(p);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API}/${deleteTarget._id || deleteTarget.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      setErrors([err.message]);
    }
  };

  // Helper date formatter
  const formatArchivedDate = (dateStr) => {
    if (!dateStr) return { date: "N/A", time: "" };
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const time = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    return { date, time };
  };

  return (
    <div className="products-page">
      {/* ── Header Row ── */}
      <div className="products-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Package style={{ color: "#007A5E" }} size={32} />
            <h1 className="products-content-title">Products</h1>
          </div>
          <p className="products-content-subtitle">BROWSE YOUR PRODUCT CATALOG</p>
        </div>
        <button
          className="products-btn-add"
          onClick={() => navigate("/staff/products/add")}
        >
          <PlusCircle size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* ── Error Banner ───────────────────────────────── */}
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

      {/* ── PRODUCT INFO & QUICK TIPS (Stacked) ── */}
      {activeTab === "products" && (
        <div className="products-info-section">
          <div className="products-info-stats">
            <div className="info-horizontal-item">
              <div className="info-label-row">
                <Boxes size={14} className="info-icon" />
                <span className="info-label">Total Products</span>
              </div>
              <span className="info-value">{stats.total}</span>
            </div>
            <div className="info-horizontal-item">
              <div className="info-label-row">
                <CheckCircle size={14} className="info-icon active" />
                <span className="info-label">Active Products</span>
              </div>
              <span className="info-value active">{stats.active}</span>
            </div>
            <div className="info-horizontal-item">
              <div className="info-label-row">
                <Archive size={14} className="info-icon archived" />
                <span className="info-label">Archived Products</span>
              </div>
              <span className="info-value archived">{stats.archived}</span>
            </div>
          </div>
          <div className="products-info-tips">
            <Lightbulb style={{ color: "#D97706" }} size={16} />
            <span><strong>Quick Tips:</strong> You can archive products which are out of stock or not available currently.</span>
          </div>
        </div>
      )}

      {/* ── Toolbar (Single Row) ── */}
      <div className="products-toolbar">
        <div className="relative flex items-center products-search-container">
          <Search size={18} className="absolute left-4 text-[#0F172A]/30" />
          <input
            className="products-search pl-11"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <CustomSelect
          name="selectedCategory"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          placeholder="Main Category (All)"
          options={[
            { value: "", label: "Main Category (All)" },
            ...MAIN_CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
        />

        <CustomSelect
          name="selectedSupplier"
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          placeholder="Suppliers (All)"
          options={[
            { value: "", label: "Suppliers (All)" },
            ...suppliersList.map((s) => ({ value: s, label: s })),
          ]}
        />

        <CustomSelect
          name="sortOption"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          placeholder="Sort: A-Z Name"
          options={[
            { value: "A-Z Name", label: "Sort: A-Z Name" },
            { value: "Best selling", label: "Sort: Best Selling" },
            { value: "Low Selling", label: "Sort: Low Selling" },
          ]}
        />
      </div>

      {/* ── Tab Selector Row ── */}
      <div className="products-tabs">
        <button
          className={`products-tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("products");
            setSearch("");
          }}
        >
          <Package size={16} />
          <span>Products</span>
        </button>
        <button
          className={`products-tab-btn ${activeTab === "archived" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("archived");
            setSearch("");
            setCurrentPage(1);
          }}
        >
          <Archive size={16} />
          <span>Archived Products</span>
        </button>
      </div>

      {/* ── Main Layout Body ── */}
      {loading ? (
        <div className="products-skeleton">Loading products…</div>
      ) : (
        <div className={`products-main-layout ${activeTab === "archived" ? "no-sidebar" : ""}`}>
          
          {/* ── TAB CONTENT ── */}
          {activeTab === "products" ? (
            /* ACTIVE PRODUCTS COLUMN */
            <div className="super-categories-list">
              {filteredAndSorted.length === 0 ? (
                <div className="products-empty">
                  {products.filter(p => !p.isArchived).length === 0
                    ? 'No products yet. Click "+ Add Product" to get started.'
                    : "No active products match your search or filters."}
                </div>
              ) : (
                SUPER_CATEGORIES.map((superCat) => {
                  const superCatProducts = filteredAndSorted.filter((p) =>
                    superCat.categories.includes(p.mainCategory)
                  );

                  if (superCatProducts.length === 0) return null;

                  return (
                    <div className="super-category-section" key={superCat.id}>
                      <div className="super-category-header">
                        <h2>{superCat.title}</h2>
                        <span className="super-category-count">
                          {superCatProducts.length} {superCatProducts.length === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                      <div className="products-grid">
                        {superCatProducts.map((p) => {
                          const isLowStock = (p.stock || 0) <= (p.reorderLevel || 10) && (p.stock || 0) > 0;
                          const isOutOfStock = (p.stock || 0) <= 0;

                          return (
                            <div
                              className="product-card clickable hover:cursor-pointer"
                              key={p.productId}
                              style={{ position: "relative" }}
                              onClick={() => navigate(`/staff/products/details/${p.productId}`)}
                            >
                              {/* Context Action Menu Trigger */}
                              <div className="card-menu-container">
                                <button
                                  className={`card-menu-trigger ${openMenuId === p.productId ? "active" : ""}`}
                                  onClick={(e) => handleToggleMenu(e, p.productId)}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {openMenuId === p.productId && (
                                  <div className="context-menu-dropdown" ref={contextMenuRef}>
                                    <button
                                      className="context-menu-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        navigate(`/staff/products/details/${p.productId}`);
                                      }}
                                    >
                                      <Eye size={14} />
                                      <span>View Details</span>
                                    </button>
                                    <button
                                      className="context-menu-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        navigate(`/staff/products/edit/${p.productId}`);
                                      }}
                                    >
                                      <Pencil size={14} />
                                      <span>Edit Product</span>
                                    </button>

                                    <button
                                      className="context-menu-item danger"
                                      onClick={(e) => handleOpenArchiveModal(e, p)}
                                    >
                                      <Archive size={14} />
                                      <span>Archive Product</span>
                                    </button>
                                    <button
                                      className="context-menu-item danger"
                                      onClick={(e) => handleDelete(e, p)}
                                    >
                                      <Trash size={14} />
                                      <span>Delete Permanently</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="product-card-image-container">
                                <img
                                  className="product-card-img"
                                  src={
                                    p.imageUrl ||
                                    "https://placehold.co/300x200?text=No+Image"
                                  }
                                  alt={p.productName || "Product"}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://placehold.co/300x200?text=No+Image";
                                  }}
                                />
                              </div>
                              <div className="product-card-body">
                                <div className="product-card-name">{p.productName}</div>
                                <div className="product-card-category">
                                  {p.mainCategory.toUpperCase()} • {p.subCategory.toUpperCase()}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div className="product-card-price">Rs {p.sellingPrice}</div>
                                  {!isOutOfStock && (
                                    <span
                                      className={`stock-badge ${
                                        isLowStock ? "low-stock" : "in-stock"
                                      }`}
                                    >
                                      {isLowStock ? "Low Stock" : "In Stock"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ARCHIVED PRODUCTS FULL TABLE COLUMN */
            <div className="archived-section">
              <div className="archived-header-row">
                <h2>Archived Products</h2>
                <span className="archived-badge">
                  {filteredAndSorted.length} {filteredAndSorted.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              {filteredAndSorted.length === 0 ? (
                <div className="products-empty">
                  No archived products.
                </div>
              ) : (
                <>
                  <table className="archived-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Supplier</th>
                        <th>Archived Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedArchived.map((p) => {
                        const { date, time } = formatArchivedDate(p.archivedDate);
                        return (
                          <tr key={p.productId}>
                            <td>
                              <div className="table-product-cell">
                                <div className="table-product-thumb">
                                  <img
                                    className="table-product-img"
                                    src={p.imageUrl || "https://placehold.co/100?text=No+Image"}
                                    alt={p.productName}
                                    onError={(e) => {
                                      e.target.src = "https://placehold.co/100?text=No+Image";
                                    }}
                                  />
                                </div>
                                <div className="table-product-info">
                                  <span className="table-product-name">{p.productName}</span>
                                  <span className="table-product-sub">{p.subCategory || "1 pc"}</span>
                                </div>
                              </div>
                            </td>
                            <td>{p.mainCategory}</td>
                            <td>{p.supplier}</td>
                            <td>
                              <div>{date}</div>
                              <div style={{ fontSize: "0.75rem", color: "rgba(15, 23, 42, 0.4)", marginTop: "0.15rem" }}>
                                {time}
                              </div>
                            </td>
                            <td>{p.archiveReason || "Other"}</td>
                            <td>
                              <span className="badge-archived-status">Archived</span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
                                <button className="btn-restore" onClick={() => handleRestore(p)}>
                                  Restore
                                </button>
                                <button
                                  className={`card-menu-trigger ${openMenuId === p.productId ? "active" : ""}`}
                                  style={{ border: "none", boxShadow: "none" }}
                                  onClick={(e) => handleToggleMenu(e, p.productId)}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {openMenuId === p.productId && (
                                  <div
                                    className="context-menu-dropdown"
                                    ref={contextMenuRef}
                                    style={{ right: 0, top: "100%" }}
                                  >
                                    <button
                                      className="context-menu-item danger"
                                      onClick={(e) => handleDelete(e, p)}
                                    >
                                      <Trash size={14} />
                                      <span>Delete Permanently</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination Footer */}
                  <div className="table-footer">
                    <span>
                      Showing {Math.min((currentPage - 1) * pageSize + 1, filteredAndSorted.length)} to{" "}
                      {Math.min(currentPage * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length}{" "}
                      results
                    </span>

                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="page-size-selector">
                      <select
                        className="page-size-select"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── ARCHIVE CONFIRMATION MODAL ── */}
      {archiveTarget && (
        <div className="archive-reason-modal-backdrop">
          <div className="archive-reason-modal">
            <h3 className="archive-modal-title">Archive Product</h3>
            <p className="archive-modal-desc">
              Please choose a reason for archiving <strong>{archiveTarget.productName}</strong>:
            </p>
            <div style={{ margin: "0.5rem 0" }}>
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
            <div className="archive-modal-actions">
              <button
                className="products-btn-cancel"
                onClick={() => setArchiveTarget(null)}
                style={{ padding: "0.5rem 1rem" }}
              >
                Cancel
              </button>
              <button
                className="products-btn-save"
                onClick={handleArchiveConfirm}
                style={{ padding: "0.5rem 1.25rem", borderRadius: "1rem" }}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="archive-reason-modal-backdrop">
          <div className="archive-reason-modal">
            <h3 className="archive-modal-title" style={{ color: "#EF4444" }}>Delete Product Permanently</h3>
            <p className="archive-modal-desc">
              Are you sure you want to permanently delete the product <strong>{deleteTarget.productName}</strong>? This action is irreversible.
            </p>
            <div className="archive-modal-actions">
              <button
                className="products-btn-cancel"
                onClick={() => setDeleteTarget(null)}
                style={{ padding: "0.5rem 1rem" }}
              >
                Cancel
              </button>
              <button
                className="products-btn-save"
                onClick={handleDeleteConfirm}
                style={{ padding: "0.5rem 1.25rem", borderRadius: "1rem", backgroundColor: "#EF4444", boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.2)" }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
