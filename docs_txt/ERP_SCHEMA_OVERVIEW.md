# GoldenAgro ERP – Complete Schema & Integration Overview

## Project Objective & Goals

- **Objective:** ERP between **Manufacturer** and **Retailer (shop owner)** to automate operations, centralize data, and improve decision-making.
- **Manufacturer:** Buy from supplier → track what was bought → know how much product can be made from raw materials → add/edit products, suppliers, shop owners → manage cost and profit.
- **Retailer:** See product types, quantity available, and **purchase** (dummy payment for demo).
- **Tech:** Java, Spring Boot, Spring Data JPA, MySQL, REST API, React frontend, .NET AuthService integration.

---

## 🚀 Recent Major Enhancements

### ✅ .NET Integration Complete
- **JWT Authentication** → Extracts `retailer_id` from .NET AuthService
- **Auto-creation** → Retailers created automatically during order placement
- **Sync Endpoint** → `POST /api/retailers/sync-from-net` for direct retailer synchronization
- **Enhanced Logging** → Complete visibility into retailer creation and order processing

### ✅ Order-to-Production Linkage
- **ProductionOrder Entity** → Now linked to RetailerOrder via `@ManyToOne`
- **Auto-creation Methods** → Create production orders directly from retailer orders
- **API Endpoints** → `POST /api/production/from-retailer-order/{id}`
- **BOM Integration** → Production orders use existing Bill of Materials

### ✅ Dashboard & Financial Tracking
- **Expense Management** → Complete CRUD operations with categories
- **Real-time Dashboard** → Live expense totals and breakdowns
- **Profit/Loss Calculations** → Accurate including expenses
- **Visual Analytics** → Pie charts, trends, and breakdowns

---

## Tables Removed (8 tables – simplified architecture)

| Removed Table | Reason |
|---------------|--------|
| **shipments** | Delivery tracking removed for simplified demo flow |
| **return_orders** | Returns process dropped for streamlined operations |
| **payments** | Payment is **dummy**; no real payment tracking needed |
| **expenses** | Simplified to basic expense tracking (not complex accounting) |
| **company_profile** | Single config; not used in core workflow |
| **retailer_balance** | Balance tracking removed; orders sufficient for demo |
| **raw_material_stock_log** | Audit log removed; stock updated directly |
| **finished_goods_stock_log** | Audit log removed; stock tracked in main table |

**Also removed:** 7 repositories and 3 empty controllers (Shipment, Payment, Expense).

---

## Current Tables (16 tables – core functionality)

### 1. Master / Reference Data

| Table | Purpose |
|-------|--------|
| **units** | Unit of measure (kg, pcs, etc.) for materials and products |
| **categories** | Product categorization |
| **taxes** | Tax rates for products (optional) |

### 2. Supplier & Purchases Flow

| Table | Purpose |
|-------|--------|
| **suppliers** | Manufacturer's raw material suppliers |
| **raw_materials** | Materials inventory (name, unit, stock, reorder level) |
| **purchases** | Purchase orders (supplier, date, total, status) |
| **purchase_items** | Purchase line items (material, quantity, price) |

**Flow:** Create Purchase → Complete Purchase → raw material stock increases

### 3. Products & Bill of Materials

| Table | Purpose |
|-------|--------|
| **products** | Manufacturer products (name, prices, tax, category, status) |
| **bills_of_material** | BOM header per product (version, active flag) |
| **bom_items** | BOM line items (raw material + quantity per product unit) |

**Meaning:** "How much product can be made from raw materials" = BOM calculations

### 4. Production Management

| Table | Purpose |
|-------|--------|
| **production_orders** | Production runs (product, quantity, status, retailer_order_link) |
| **finished_goods_stock** | Available product quantities (product, quantity, batch) |

**Enhanced Flow:** Create Production Order → Start (deduct raw materials per BOM) → Complete (add to finished goods stock) → **Linked to retailer orders**

### 5. Retailers & Orders

| Table | Purpose |
|-------|--------|
| **retailers** | Shop owners (shop name, contact, GST, auth user id, status) |
| **retailer_orders** | Customer orders (retailer, date, total, status) |
| **retailer_order_items** | Order line items (product, quantity, price) |

**Enhanced Flow:** Retailer places order → Auto-sync from .NET → Manufacturer confirms → Stock deducted → Production orders auto-created

### 6. Financial & Invoicing

| Table | Purpose |
|-------|--------|
| **invoices** | Order summaries (invoice number, retailer, order, total, status) |
| **expenses** | Business expenses (description, amount, category, date, notes) |

**Note:** Payment is dummy; invoices serve as order summaries. Expenses tracked for dashboard analytics.

---

## 🔄 Complete End-to-End Workflow

### 1. Manufacturer – Procurement
```
Suppliers → Raw Materials → Purchase Order → Complete Purchase → Raw Material Stock ↑
```

### 2. Manufacturer – Production Planning
```
Products + BOM → Calculate Production Capacity → Create Production Orders
```

### 3. Manufacturer – Production Execution
```
Production Order → Start Production (deduct raw materials per BOM) → 
Complete Production → Add to Finished Goods Stock
```

### 4. .NET Retailer Integration
```
.NET Registration → Sync to Spring Boot → JWT with retailer_id → 
Order Placement → Auto-creation if retailer missing
```

### 5. Manufacturer → Retailer Orders
```
Retailer Order → Manufacturer Confirmation → Stock Deduction → 
Auto-create Production Orders → Invoice Generation
```

### 6. Retailer Experience
```
Browse Products → Add to Cart → Checkout (Dummy Payment) → 
Order History → Status Tracking
```

### 7. Financial Management
```
Expenses → Dashboard Analytics → Profit/Loss Calculation → 
Visual Reports (Charts, Breakdowns)
```

---

## 🛠️ Backend Implementation Status

### ✅ OrderService (Enhanced)
```java
// Features:
- Auto-creation of retailers from .NET JWT
- Comprehensive logging for debugging
- Stock deduction on order confirmation
- Integration with production orders
- Error handling and validation
```

### ✅ ProductionService (Enhanced)
```java
// Features:
- Link to retailer orders for traceability
- BOM-based raw material calculation
- Batch production order creation from retailer orders
- Stock management (raw materials → finished goods)
- Production status tracking
```

### ✅ RetailerService (Enhanced)
```java
// Features:
- .NET sync endpoint integration
- Retailer profile updates from .NET
- Auto-creation during order placement
- Status management (active/inactive)
```

### ✅ DashboardController (Enhanced)
```java
// Features:
- Real-time expense calculations
- Profit/Loss including expenses
- Sales and purchase trend analysis
- Expense breakdown by category
- Inventory and order status metrics
```

### ✅ Expense Management (Complete)
```java
// Features:
- Full CRUD operations
- Category-based tracking
- Date range filtering
- Dashboard integration
- Visual analytics
```

---

## 🎨 Frontend Implementation Status

### ✅ Dashboard (Complete)
- **Financial Stats Cards** → Sales, Purchases, Expenses, Profit/Loss
- **Visual Charts** → Sales trend, profit trend, expense breakdown pie chart
- **Real-time Updates** → Auto-refresh every 10 seconds
- **Role-based Views** → Manufacturer sees all analytics, retailer sees orders

### ✅ Order Management (Complete)
- **Cross-role Visibility** → Manufacturer sees all orders, retailer sees their orders
- **Order Details** → Product quantities, prices, status tracking
- **Production Integration** → Create production orders from retailer orders
- **Real-time Updates** → Live order status changes

### ✅ Expense Management (Complete)
- **CRUD Operations** → Add, edit, delete expenses
- **Category Management** → Pre-defined expense categories
- **Date Tracking** → Expense date and filtering
- **Dashboard Integration** → Real-time expense totals

### ✅ Production Management (Complete)
- **Production Orders** → Create, start, complete production
- **BOM Integration** → Automatic raw material calculation
- **Stock Management** → Raw material deduction, finished goods addition
- **Retailer Order Link** → Traceability from customer order to production

---

## 🔗 .NET Integration Details

### JWT Authentication Flow
```java
// .NET AuthService Issues JWT with:
{
  "sub": "user@example.com",
  "role": "RETAILER", 
  "retailer_id": 123
}

// Spring Boot Extracts:
UserPrincipal(userId, email, role, retailerId)
```

### Retailer Sync Endpoint
```http
POST /api/retailers/sync-from-net
Content-Type: application/json

{
  "retailerId": 123,
  "shopName": "My Store",
  "ownerName": "John Doe", 
  "email": "john@store.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "gstNumber": "GST123456",
  "status": "active"
}
```

### Order-to-Production Link
```http
POST /api/production/from-retailer-order/{retailerOrderId}
// Creates production orders for each item in retailer order
```

---

## 📊 System Capabilities

### ✅ Core ERP Functions
- **Supply Chain Management** → Supplier → Raw Materials → Production
- **Inventory Management** → Real-time stock tracking across all stages
- **Order Management** → Complete order lifecycle from placement to fulfillment
- **Production Planning** → BOM-based production capacity calculation
- **Financial Analytics** → Expense tracking and profit/loss analysis

### ✅ Integration Features
- **.NET Compatibility** → Seamless retailer authentication and data sync
- **Real-time Updates** → Live dashboard and order status tracking
- **Role-based Access** → Manufacturer, Admin, Retailer views
- **Cross-system Linkage** → Retailer orders → Production orders → Stock updates

### ✅ Demo-Ready Features
- **Dummy Payment System** → Simplified checkout for demo purposes
- **Visual Analytics** → Charts, graphs, and breakdowns
- **Responsive Design** → Works on desktop and mobile
- **Error Handling** → Comprehensive logging and user feedback

---

## 🎯 Quick Reference

| Metric | Value |
|--------|-------|
| **Total Tables** | 16 (simplified from 24) |
| **Core Entities** | Products, Orders, Production, Inventory |
| **Integration Points** | .NET AuthService, React Frontend |
| **Authentication** | JWT with retailer_id extraction |
| **Payment System** | Dummy (for demo) |
| **Analytics** | Real-time dashboard with charts |
| **Production Flow** | BOM-based with retailer order linkage |

---

## 🚀 Deployment Ready

This simplified ERP system provides:
- **Complete manufacturer-retailer workflow**
- **.NET integration for retailer authentication**
- **Real-time inventory and order management**
- **Production planning with BOM calculations**
- **Financial analytics and expense tracking**
- **Demo-ready with simplified payment flow**

**Perfect for demonstrating core ERP functionality without unnecessary complexity!** 🎉

---

*Last Updated: January 2026*
*Version: Simplified ERP v2.0*
