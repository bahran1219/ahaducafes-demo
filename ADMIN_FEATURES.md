# 🏪 Ahadu Café Admin Dashboard - Complete Feature Walkthrough

## 📊 Dashboard with Charts & Stats

**Location**: First tab when admin logs in

### Display Elements:
- **Top Section**: Greeting message ("Good morning ☀️, Ahadu!")
- **Stat Cards** (4 cards showing real-time data):
  - 💰 Today's Revenue (in Birr)
  - 📋 Orders Today (with breakdown: dine/takeaway/delivery)
  - 📅 Reservations Today (table bookings)
  - ⭐ Avg Rating (4.9 with review count)

### Charts:
- **Donut Chart** (left): Orders by type with color-coded legend
  - 🔴 Dine In (brown)
  - 🟢 Takeaway (green)
  - 🔵 Delivery (blue)
  - Legend shows count for each type

- **Line Chart** (right): Orders per hour throughout the day
  - X-axis: Time slots (8am, 12am, 4pm, 8pm)
  - Y-axis: Order count
  - Brown line shows hourly trend
  - Grid lines for easy reading

- **Live Feed** (bottom): Last 8 orders showing:
  - Item image or placeholder
  - Item name & quantity
  - Order type badge
  - Price
  - Time

### Features:
- ↻ Auto-refresh every 20 seconds
- ↻ Manual refresh button
- Responsive to real-time order data

---

## 📋 Orders Management Tab

**Location**: Second navigation tab

### Filter Bar:
- **Filter buttons**:
  - "All" (shows all orders)
  - "🪑 Dine In" (table orders only)
  - "🥡 Takeaway" (counter pickup)
  - "🛵 Delivery" (delivery orders)

### Summary Cards:
Four cards showing totals for each order type:
- 🪑 Dine In count
- 🥡 Takeaway count
- 🛵 Delivery count
- 📋 Total count

### Order Cards Display:

Each order shows:
```
┌─────────────────────────────────────┐
│ [Image]  Item Name × Qty  │  Price  │
│          Order Type Badge │ Order ID│
│          Time             │ Time    │
│          ▼ View customizations (if applicable)
├─────────────────────────────────────┤
│ ❌ Removed: Onions, Pickles        │
│ ➕ Extra cheese: +40 Birr          │
│ 📝 Note: Extra spicy, no salt      │
└─────────────────────────────────────┘
```

### Special Features:
- **Dine In View**: Groups orders by table
  - Shows "Table 1", "Table 2", etc.
  - Subtotal per table
  - Item count per table
  
- **Expandable Details**: Click "View customizations" to see:
  - Removed ingredients
  - Added extras with prices
  - Special notes

### Action Buttons:
- ↻ Refresh orders
- 🗑️ Clear all orders (with confirmation)

---

## 📅 Reservations with Filtering

**Location**: Third navigation tab

### Filter Section:
- **Date picker**: Filter reservations by date
- **Real-time Stats** (3 cards):
  - 📅 Reservations Today
  - 👥 Total Guests Today
  - 📋 Total Bookings Overall

### Reservation Cards by Date:

Grouped by date, showing:
```
┌─────────────────────────────────────┐
│ Monday, June 2, 2026 [TODAY]        │
│ 3 bookings · 12 guests              │
├─────────────────────────────────────┤
│ 7:00 PM │ John Doe                  │
│         │ 👥 4 guests               │
│         │ 📞 +251 911 234 567       │
│         │ ✉️ john@email.com        │
│         │ 📝 Birthday celebration  │
│         │ [RES-12345] [✕ Delete]   │
├─────────────────────────────────────┤
```

### Features:
- 📍 Time-sorted (earliest first)
- 👤 Guest count display
- 📞 Phone & email contact info
- 📝 Special requests/notes
- 🗑️ Delete individual reservation
- 🗑️ Clear all reservations button

---

## 🍽️ Menu Availability Toggle

**Location**: Fourth navigation tab ("Menu Status")

### Category Filter:
- Buttons to filter: "All", "🍔 Burgers", "🍕 Pizza", "🍜 Noodles", "🍟 Sides"

### Menu Items Grid:
Each item card displays:
```
┌──────────────────────┐
│   [Item Image]       │
│   SOLD OUT (overlay) │ ← (if unavailable)
├──────────────────────┤
│ Item Name            │
│ Category · Price     │
│ [Toggle Switch]      │ ← ON/OFF
│ "Available"/"Sold Out"
└──────────────────────┘
```

### Toggle Features:
- **ON** (green): Item available for ordering
- **OFF** (gray): Item marked as sold out
- Real-time UI update:
  - Card becomes grayscale when unavailable
  - "SOLD OUT" ribbon appears on image
  - Text changes to "Sold Out"

### Quick Actions:
- ✅ "All Available" button (one click to enable all)
- ✕ "All Sold Out" button (one click to disable all)
- Confirmation toast after each action

### Toast Messages:
- "✓ Burger marked as available"
- "✕ Pizza marked as sold out"

---

## 🔑 Admin Users Management

**Location**: Fifth navigation tab ("Manage Admins")

### Admin List Display:
Each admin shows:
```
┌──────────────────────────────────────┐
│ [A]  Ahadu (Owner)                   │
│      @admin · 👑 Owner               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ [M]  Marta                    [You]  │
│      @marta · 🔑 Admin               │
└──────────────────────────────────────┘
```

### Features:
- **Avatar circle**: First letter of name (color-coded by username)
- **Name display**: Full name with "You" tag for current user
- **Role badge**:
  - 👑 Owner
  - 🔑 Admin
  - 👤 Staff
- **Delete button**: Remove admin (only for other users, not self)

### Add New Admin:
- ➕ "Add admin" button opens modal with fields:
  - Full name (text input)
  - Username (text input, lowercase)
  - Password (password input, min 6 chars)
  - Role dropdown (Admin / Staff)
  - Error messages for:
    - Missing fields
    - Weak password
    - Duplicate username
  - Save button
  - Cancel button

### Permissions:
- **Owner** can: Add/remove all admins, access all features
- **Admin** can: Same as owner
- **Staff** can: View-only access (no admin management tab)

---

## 📱 QR Code Generator

**Location**: Sixth navigation tab ("QR Codes")

### Base URL Configuration:
- Text input field to set QR base URL
- Auto-filled with current website origin
- "↻ Update" button to refresh all QR codes

### General QR Code:
```
┌─ General QR Code ──────────┐
│ Use this to link to your   │
│ main site                  │
│                            │
│  [QR Code Image]           │
│                            │
│ [⬇ Download] [🖨 Print]   │
└────────────────────────────┘
```

### Table QR Codes:
- **Table Count Selector**: Buttons for 5, 10, 15, 20 tables
- **Grid Layout**: Each table gets its own card:
```
┌──────────────────────┐
│ 🪑 Table 1           │
│ [QR Code (140px)]    │
│ https://ahadu...     │
│ [⬇] [🖨]             │
└──────────────────────┘
```

### Features:
- **QR Generation**: Real-time using QR server API
- **Download**: Full-resolution 600x600 PNG
- **Print**: Opens print dialog for each code
- **Batch Download**: "⬇ Download all QRs" button
  - Downloads QR codes sequentially (0.6s delay per file)
  - Named: `ahadu-cafe-table-1.png`, `ahadu-cafe-table-2.png`, etc.
- **Print Feature**: Opens formatted print page with:
  - Ahadu Café branding
  - Instruction text ("Scan to view menu & order online")
  - Table number
  - QR code at 380x380px
  - URL display

---

## 🏦 Payment Verification Panel

**Location**: Seventh navigation tab ("Payments") with badge notification

### Badge Notification:
- Red badge on "Payments" tab showing pending verification count
- Updates in real-time as orders are processed

### Two-Section Layout:

### Section 1: ⏳ Awaiting Verification
Orders pending admin confirmation:
```
┌─ Payment Verification ────────────────┐
│ [Order ID] Item Name × Qty  Total: 500│
│                          [⏳ Pending]  │
│                          📱 +251...   │
├───────────────────────────────────────┤
│ Amount Info:                          │
│ ⚠️ Underpaid — 50 Birr short         │
│ 💸 Overpaid — 25 Birr over           │
│ ✓ Exact amount paid                   │
├───────────────────────────────────────┤
│ [Screenshot Preview]                  │
│ Click to enlarge                      │
├───────────────────────────────────────┤
│ Bank: Commercial Bank of Ethiopia     │
│ Account: Ahadu Café PLC               │
│ Number: 1000 2345 6789                │
│ Reference: Order ID                   │
├───────────────────────────────────────┤
│ [Input: Amount Received]              │
│ [✓ Confirm] [✕ Reject]              │
│ [⚠️ Notify Customer - Add X Birr]    │
│ [💸 Handle X Birr Overpayment]       │
└───────────────────────────────────────┘
```

### Section 2: ✅ Processed
Previously verified/rejected orders:
- Same display format but read-only
- Shows status badges:
  - ✓ Confirmed (green)
  - ✕ Rejected (red)
  - ⚠️ Underpaid (orange)

### Payment Status Badges:
```
✓ Confirmed    → Green badge
✕ Rejected     → Red badge
⚠️ Underpaid   → Orange badge
⏳ Pending     → Gray badge
```

### Payment Details Shown:
- Order ID & Item name
- Total amount due
- Amount customer sent
- Difference (if any)
- Bank details
- Reference number
- Customer phone
- Payment screenshot (clickable to enlarge)

### Admin Actions:
1. **Confirm Payment**:
   - Input amount received
   - Confirm button processes it
   - If underpaid: Shows warning, asks for confirmation
   - Saves payment status
   - Sends SMS to customer

2. **Reject Payment**:
   - Shows confirmation dialog
   - Marks as rejected
   - Customer notified via SMS

3. **Handle Underpayment**:
   - Auto-shows button if amount < total
   - Opens notification to customer
   - Requests additional amount
   - Updates order status

4. **Handle Overpayment**:
   - Auto-shows button if amount > total
   - Confirms refund or store credit choice
   - Processes accordingly
   - Notifies customer

### Toast Messages:
- "✅ Payment confirmed for AHD-0001! SMS sent to +251..."
- "❌ Payment rejected for AHD-0001"
- "⚠️ Customer notified to add 50 Birr more"
- "✅ Payment confirmed. 25 Birr refund processing..."

---

## 🎨 Admin Sidebar Navigation

**Always Visible (Left Side)**:
```
┌─────────────────────┐
│ 🏪 Ahadu            │
├─────────────────────┤
│ 👑 Ahadu (Owner)    │
│ Owner               │
├─────────────────────┤
│ 📊 Dashboard        │ (Active)
│ 📋 Live Orders      │
│ 📅 Reservations     │
│ 🍽️ Menu Status      │
│ 🔑 Manage Admins    │
│ 📱 QR Codes         │
│ 🏦 Payments    [3]  │ (Badge)
├─────────────────────┤
│ 🚪 Logout           │
└─────────────────────┘
```

---

## 🔐 Admin Login Screen

**Before Dashboard Access**:
```
┌────────────────────────────────┐
│       Ahadu Café               │
│     Admin Dashboard            │
│                                │
│ Username: [admin         ]     │
│ Password: [••••••        ]  👁 │
│                                │
│ [Sign in]                      │
│                                │
│ ❌ Error message (if any)      │
└────────────────────────────────┘
```

### Features:
- Default credentials: `admin` / `ahadu2026`
- Password eye toggle to show/hide
- Error messages for invalid login
- Session storage for current user
- Logout clears session

---

## 🔄 Real-Time Features

### Auto-Refresh:
- Dashboard refreshes every 20 seconds when visible
- Orders tab refreshes every 20 seconds when visible
- Charts update automatically

### Live Updates:
- New orders appear instantly
- Payment verification badge updates
- Menu availability changes reflect immediately
- Reservation counts update in real-time

### Toast Notifications:
- Green background for success
- Red background for errors/warnings
- Auto-dismiss after 2.6 seconds
- Position: bottom-right corner

---

## 📱 Responsive Design

### Desktop (Full Width):
- Sidebar: Fixed left, 220px
- Main content: Full height, scrollable
- Charts: Side-by-side layout
- Grid: 4 columns for stat cards

### Tablet:
- Sidebar: Responsive width reduction
- Charts: Stack vertically
- Grid: 2 columns

### Mobile:
- Sidebar: Collapsible/horizontal tabs
- Main content: Full width
- Grid: Single column
- Charts: Stacked

---

## ✨ Summary of All Admin Features

| Feature | Status | Details |
|---------|--------|---------|
| Dashboard | ✅ | Live charts, stats, feed |
| Orders Management | ✅ | Filter, expand, view details |
| Reservations | ✅ | Date filter, guest count, notes |
| Menu Control | ✅ | Toggle availability per item |
| Admin Users | ✅ | Add, remove, role management |
| QR Codes | ✅ | Generate, download, print |
| Payment Verification | ✅ | Screenshot review, confirm/reject |
| Real-time Updates | ✅ | Auto-refresh every 20s |
| Toast Notifications | ✅ | Action confirmations |
| Responsive UI | ✅ | Desktop, tablet, mobile |

---

## 🎯 Access Point

**Admin URL**: `https://bahran1219.github.io/ahaducafes-demo/admin.html`

**Credentials**:
- Username: `admin`
- Password: `ahadu2026`
- Role: Owner (full access)

All features fully functional and styled! 🎉
