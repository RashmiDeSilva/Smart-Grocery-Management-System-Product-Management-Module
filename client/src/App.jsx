import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetails from './pages/ProductDetails';
import {
  Clock, Settings, Home, LayoutDashboard, Package, Search, Percent, Bell,
  CheckCircle2, BarChart3, UserCircle, LogOut, Archive, HelpCircle, BookOpen,
  Mail, Shield, FileText, ArrowRight, Menu, ArrowLeft
} from 'lucide-react';

function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === "/staff/products") return "Product Directory";
    if (location.pathname === "/staff/products/add") return "Add Product";
    if (location.pathname.includes("/staff/products/edit")) return "Edit Product";
    if (location.pathname.includes("/staff/products/details")) return "Product Details";
    return "Staff Desk";
  };

  const navItems = [
    { label: "Home Page", href: "/", icon: <Home size={18} /> },
    { label: "Staff Desk", href: "/staff", icon: <LayoutDashboard size={18} /> },
    { label: "Products", href: "/staff/products", icon: <Package size={18} /> },
    { label: "Inventory", href: "/staff/inventory", icon: <Search size={18} /> },
    { label: "Discounts", href: "/staff/discounts", icon: <Percent size={18} /> },
    { label: "My Alerts", href: "/staff/alerts", icon: <Bell size={18} /> },
    { label: "Sales Entry", href: "/staff/sales", icon: <CheckCircle2 size={18} /> },
    { label: "Reports", href: "/staff/reports", icon: <BarChart3 size={18} /> },
    { label: "My Profile", href: "/staff/profile", icon: <UserCircle size={18} /> },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'space-between', alignItems: 'center', width: '100%' }}>
          {!sidebarCollapsed && (
            <div className="sidebar-logo-container">
              <div className="logo-circle">
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#007A5E' }}>I</span>
              </div>
              <span className="logo-text">
                INVIGO<span style={{ color: '#007A5E' }}>.</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
          >
            {sidebarCollapsed ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          </button>
        </div>

        {/* Staff Hub Profile Block */}
        {!sidebarCollapsed && (
          <div className="profile-container" style={{ padding: '0 1.25rem', marginBottom: '1rem' }}>
            <div className="profile-card">
              <div className="profile-avatar">
                ST
              </div>
              <div className="profile-info">
                <p className="profile-title">Staff Hub</p>
                <p className="profile-status">Status: Active</p>
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            const isActive = location.pathname.startsWith(item.href) && (item.href !== "/" || location.pathname === "/");
            return (
              <Link
                key={idx}
                to={item.href === "/" ? "/staff/products" : item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && isActive && <span className="sidebar-active-dot" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-nav-item" style={{ cursor: 'pointer', margin: 0, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <span><LogOut size={18} /></span>
            {!sidebarCollapsed && <span>LOG OUT SESSION</span>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        
        {/* Premium Header */}
        <div className="invigo-header-wrapper">
          {/* Top Header Row */}
          <div className="invigo-header-top">
            <div className="invigo-header-brand">
              <span style={{ color: '#ffffff' }}>INVIGO</span>
              <span style={{ color: '#007A5E' }}>.</span>
              <span style={{ margin: '0 0.5rem', color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
              <span className="invigo-header-brand-sub">Product Catalog Registry</span>
            </div>

            <div className="shift-badge-container">
              <span className="shift-badge-dot" />
              <span className="shift-badge-text">Shift: 08:00 - 16:00</span>
            </div>

            <div className="header-right-actions">
              <button className="header-action-btn" title="Search">
                <Search size={16} />
              </button>
              <button className="header-action-btn" title="Notifications">
                <Bell size={16} />
                <span className="badge-dot" />
              </button>
              <div className="header-profile-badge">
                <div className="header-profile-avatar">ST</div>
                <div className="header-profile-info">
                  <span className="header-profile-name" style={{ color: 'white' }}>Staff Hub</span>
                  <span className="header-profile-status" style={{ color: '#10b981' }}>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Nav Tabs Row */}
          <div className="invigo-header-nav">
            {navItems.slice(0, 6).map((item, idx) => {
              const isActive = location.pathname.startsWith(item.href) && (item.href !== "/" || location.pathname === "/");
              return (
                <Link
                  key={idx}
                  to={item.href === "/" ? "/staff/products" : item.href}
                  className={`header-nav-tab ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && <span className="header-nav-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Breadcrumbs Row */}
        <div className="invigo-breadcrumbs-row">
          <span className="breadcrumb-item">Home</span>
          <span>&gt;</span>
          <span className="breadcrumb-item">Staff Desk</span>
          <span>&gt;</span>
          <span className="breadcrumb-item active">{getPageTitle()}</span>
        </div>

        {/* Dynamic Route Content */}
        <div className="page-content-wrapper" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/staff/products" replace />} />
            <Route path="/staff" element={<Navigate to="/staff/products" replace />} />
            <Route path="/staff/products" element={<Products />} />
            <Route path="/staff/products/add" element={<AddProduct />} />
            <Route path="/staff/products/edit/:id" element={<EditProduct />} />
            <Route path="/staff/products/details/:id" element={<ProductDetails />} />
            <Route path="*" element={<Navigate to="/staff/products" replace />} />
          </Routes>
        </div>

        {/* Premium Footer */}
        <footer className="invigo-footer">
          <div className="invigo-footer-grid">
            {/* Col 1 */}
            <div className="footer-col">
              <div className="footer-logo">
                INVIGO<span style={{ color: '#007A5E' }}>.</span>
              </div>
              <p className="footer-description">
                Smart inventory and staff management platform built for modern retail and food service operations.
              </p>
              <div className="footer-status-pill">
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                All systems operational
              </div>
              <div className="footer-version-badge">
                v2.4.1 — Staff Edition
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="footer-col">
              <h3 className="footer-col-title">Navigation</h3>
              <div className="footer-links-list">
                <Link to="/staff/products" className="footer-link-item">
                  <Home size={14} /> Home
                </Link>
                <Link to="/staff/products" className="footer-link-item">
                  <Package size={14} /> Products
                </Link>
                <Link to="/staff/inventory" className="footer-link-item">
                  <Search size={14} /> Inventory
                </Link>
                <Link to="/staff/products" className="footer-link-item">
                  <Archive size={14} /> Archive
                </Link>
                <Link to="/staff/reports" className="footer-link-item">
                  <BarChart3 size={14} /> Reports
                </Link>
              </div>
            </div>

            {/* Col 3: Account */}
            <div className="footer-col">
              <h3 className="footer-col-title">Account</h3>
              <div className="footer-links-list">
                <Link to="/staff/profile" className="footer-link-item">
                  <UserCircle size={14} /> My Profile
                </Link>
                <Link to="/staff" className="footer-link-item">
                  <LayoutDashboard size={14} /> Staff Desk
                </Link>
                <Link to="/staff/alerts" className="footer-link-item">
                  <Bell size={14} /> My Alerts
                </Link>
                <Link to="/staff/sales" className="footer-link-item">
                  <CheckCircle2 size={14} /> Sales Entry
                </Link>
                <Link to="/staff/settings" className="footer-link-item">
                  <Settings size={14} /> Settings
                </Link>
              </div>
            </div>

            {/* Col 4: Support */}
            <div className="footer-col">
              <h3 className="footer-col-title">Support</h3>
              <div className="footer-links-list">
                <a href="#" className="footer-link-item">
                  <HelpCircle size={14} /> Help Center
                </a>
                <a href="#" className="footer-link-item">
                  <BookOpen size={14} /> Documentation
                </a>
                <a href="#" className="footer-link-item">
                  <Mail size={14} /> Contact Us
                </a>
                <a href="#" className="footer-link-item">
                  <Shield size={14} /> Privacy Policy
                </a>
                <a href="#" className="footer-link-item">
                  <FileText size={14} /> Terms of Use
                </a>
              </div>
            </div>
          </div>

          {/* Bottom copyright row */}
          <div className="invigo-footer-divider">
            <span className="footer-copyright">
              © {new Date().getFullYear()} INVIGO. All rights reserved. Built for efficient inventory operations.
            </span>
            <div className="footer-meta-links">
              <a href="#" className="footer-meta-link">Privacy</a>
              <a href="#" className="footer-meta-link">Terms</a>
              <a href="#" className="footer-meta-link">Cookies</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
