# Admin Pages — How to Use

This guide explains how to use each page in the Stock Admin area. The admin section is for managing inventory, boxes, stock movements, and settings.

## Accessing the Admin

1. Go to `/admin` (or click **Admin** from the home page).
2. If not logged in, you’ll be redirected to **Admin Login** (`/admin/login`).
3. Sign in with your admin email and password.
4. After login, you’re taken to the **Dashboard**.

---

## Navigation

The admin header shows links to all sections:

- **Dashboard** — Overview and low-stock alerts
- **Items** — Add and manage inventory items
- **Boxes** — Create boxes and generate QR links
- **Stock In** — Record deliveries
- **Returns** — Record returns to stock
- **Transactions** — View all transactions and history
- **Usage** — Usage by job (for Tradify)
- **Settings** — Edit window and low-stock alerts

On mobile, use the hamburger menu to open navigation.

---

## Dashboard (`/admin`)

Overview of stock levels and low-stock items.

### Low Stock Section

- Lists items where current stock is below the minimum, or stock is negative.
- Shows: item name, current stock, minimum threshold.
- Links to **Items** to set min stock and **Settings** to enable email alerts.

### All Items Table

- Lists every item with: Name, Unit, Stock, Min.
- Quick reference for stock levels across items.

---

## Items (`/admin/items`)

Manage inventory items (e.g. pipes, fittings, cables).

### Add Item

1. Enter **Name** (e.g. "2m Copper Pipe").
2. Choose **Unit**: Each, Metre, or Box.
3. (Optional) Set **Min stock** as a number; leave blank for no minimum.
4. Click **Add item**.

### Edit Minimum Stock

- Each row has a **Min** input.
- Change the value and blur (click away or press Enter) to save.
- Used for low-stock alerts on the Dashboard.

### Delete Item

- Click **Delete** on an item row.
- **Warning**: Deleting an item used in boxes or transactions can affect reporting.

---

## Boxes (`/admin/boxes`)

Create boxes and generate QR codes/links for engineers to log usage.

### Create Box

1. Enter a **Box label** (e.g. "Van Shelf A1", "Shed Rack 2").
2. Select one or more **Items** from the checkboxes.
3. Click **Create box**.

Engineers will choose items from this list when logging usage.

### Box Link

- Each box has a link: `/b/[token]`.
- Open it in a new tab or share it with engineers.
- Engineers use this link (or QR code) to log usage.

### QR Code

- Click **Show QR** next to the box link.
- A QR code for the box URL is generated.
- Click **Download PNG** to save the image for printing.
- Click **Hide QR** to close the popup.

### Edit Box

- Click **Edit** on a box row.
- Change the label and/or linked items.
- Click **Save** or **Cancel**.

### Delete Box

- Click **Delete** on a box row.
- Confirm; the QR link will stop working after deletion.

---

## Stock In (`/admin/stock-in`)

Record deliveries to increase stock.

### Record Delivery

1. Select **Box**.
2. Select **Item** (only items linked to that box appear).
3. Enter **Quantity**.
4. (Optional) Enter **Supplier / delivery reference** (e.g. PO-12345, Docket #789).
5. Click **Record stock in**.

A success message shows the new stock level. Stock amounts are global per item, not per box.

**Prerequisite**: There must be at least one box with items. Create boxes on the **Boxes** page first.

---

## Returns (`/admin/returns`)

Record unused materials returned to stock.

### Record Return

1. Select **Box**.
2. Select **Item**.
3. Enter **Quantity**.
4. (Optional) Enter **Job number** (e.g. job the materials came back from).
5. Click **Record return**.

A success message shows the new stock level. Both Stock In and Returns increase stock.

**Prerequisite**: Same as Stock In — boxes with items must exist.

---

## Transactions (`/admin/transactions`)

View all stock movements (usage, stock-in, returns).

### Transaction List

- Columns: Date, Type, Item, Box, Qty, Job/Ref.
- Click a date or **View** to open the transaction detail page.
- Use **Load more** to paginate older transactions.

### Transaction Detail (`/admin/transactions/[id]`)

- Shows: Type, Item, Box, Quantity, Job/reference, Created at.
- **Change history** shows who created or edited the transaction, when, and what changed (quantity, job number).
- Actors may be: Admin, Engineer (device ID), or email if known.

---

## Usage (`/admin/usage`)

View usage grouped by job for Tradify costing and reporting.

### Filters

- **Job number** — Exact or partial match.
- **Date from** / **Date to** — Limit results to a date range.
- **Item** — Filter to a specific item.
- **Engineer (device)** — Device ID used when logging.

### Search

- Click **Search** to run the query.
- Results show jobs with total quantities per item.
- At least one filter is needed for meaningful results.

### Export CSV

- Click **Export CSV** to download a CSV with the current filters.
- Format is suitable for Tradify import.

---

## Settings (`/admin/settings`)

Configure app behaviour and alerts.

### Edit Window

- **Edit window (minutes)** — How long engineers can edit their last submission after submitting.
- Range: 1–1440 minutes (24 hours).
- Default: 10 minutes.

### Low Stock Email Alerts

- **Enable low-stock email alerts** — Turn alerts on or off.
- **Alert recipient email** — Address to receive low-stock emails.
- **Send test alert** — Sends a test email (if there are low-stock items and email is configured).

**Note**: Email requires Resend configuration (`RESEND_API_KEY`, `ALERT_FROM_EMAIL`). See `.env` and DEPLOY.md.

### Save

- Click **Save** for each section to apply changes.

---

## Typical Workflow

1. **Setup**
   - Add items on **Items**.
   - Create boxes and link items on **Boxes**.
   - Print QR codes or share `/b/[token]` links with engineers.

2. **Daily Use**
   - Engineers scan QR or open links to log usage.
   - Use **Stock In** to record deliveries.
   - Use **Returns** to record materials returned.

3. **Monitoring**
   - Check **Dashboard** for low-stock items.
   - Adjust min stock on **Items** and enable alerts in **Settings** if needed.

4. **Reporting**
   - Use **Transactions** for audit and history.
   - Use **Usage** to filter by job, date, item, or engineer, and export CSV for Tradify.
