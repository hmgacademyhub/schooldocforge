# SchoolDocForge Enterprise Features — Free-First Edition

SchoolDocForge Enterprise is designed for schools that need professional administration without recurring software bills. It avoids AI APIs, paid SMS gateways, paid document-generation APIs and mandatory backend hosting.

## Enterprise Control Centre

### 1. Policy Library
Tracks policy title, owner, review date and approval status. Use it for data privacy, child protection, assessment, records retention, fee payment, transport, hostel, ICT and exam policies.

### 2. Risk Register
Captures operational risks, severity/level, owner and mitigation plan. Useful risks include device loss, missing backups, fee leakage, exam malpractice risk, transport safety and data privacy exposure.

### 3. Incident Register
Records safety, academic, data, discipline and facility incidents. Schools can print or export these records for internal review and accountability meetings.

### 4. SOP / Checklist Builder
Creates step-by-step operational checklists. Example SOPs: end-of-term report publishing, WAEC/NECO registration, school excursion approval, visitor screening, hostel inspection and emergency response.

### 5. Vendor / Service Register
Tracks vendors and services such as internet provider, printer technician, bus maintenance, stationery supplier, domain/hosting provider, security provider or exam registration partner.

### 6. Compliance Calendar
Tracks deadlines and responsibilities. Examples: WAEC registration close date, NECO payment deadline, internal audit, policy review, asset inspection, health check, fire drill and PTA reporting.

## Free tools used
- Static HTML/CSS/JavaScript
- Browser localStorage
- CSV export through Blob downloads
- Browser print support
- PWA service worker for offline shell caching
- Web Crypto API for encrypted backups in the main app
- QR generation and ZIP export using free client-side libraries already included in the platform

## What this layer deliberately does not use
- No AI API
- No paid SMS API
- No paid SMTP server
- No paid PDF service
- No mandatory cloud database
- No subscription-only dependency

## Data warning
Enterprise records are stored locally in the browser. Schools should export CSVs and create full backups regularly, especially before changing device, browser or hosting version.
