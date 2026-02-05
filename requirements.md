# 📝 Product Requirements Document (PRD)

| Project | FleetOps Manager |
| :--- | :--- |
| **Version** | 1.0 (MVP) |
| **Status** | Draft |
| **Owner** | Carter Williams |

---

## 1. Context & Scope
Current fleet maintenance relies on paper tickets and disparate emails. This results in a 4-hour average latency between a defect being found and a work order being created. **FleetOps** digitizes this workflow to reduce latency to <15 minutes.

## 2. User Stories

### 🧑‍🔧 Technician (The Reporter)
| ID | Story | Acceptance Criteria | Priority |
| :--- | :--- | :--- | :--- |
| **TEC-1** | As a Technician, I want to scan a VIN barcode so that I don't type the wrong 17-digit ID. | • Camera opens within 2 seconds.<br>• Successful scan auto-populates "Make/Model/Year". | **P0** |
| **TEC-2** | As a Technician, I want to attach a photo of the damage. | • Image compresses to <2MB.<br>• Image is previewable before submit. | **P1** |
| **TEC-3** | As a Technician, I want to work offline when inside a shielded garage. | • App caches ticket locally.<br>• Auto-syncs when connection is restored. | **P2** |

### 👨‍💼 Fleet Manager (The Admin)
| ID | Story | Acceptance Criteria | Priority |
| :--- | :--- | :--- | :--- |
| **MGR-1** | As a Manager, I want to see a "Live Feed" of incoming tickets. | • Dashboard updates in real-time (no refresh needed).<br>• Tickets sorted by "Severity" by default. | **P0** |
| **MGR-2** | As a Manager, I want to export maintenance logs for audit compliance. | • Export to CSV/PDF.<br>• Date range selector acts as filter. | **P1** |

---

## 3. Functional Specifications

### 3.1 Data Validation
* **VIN Format:** Must be 17 alphanumeric characters (excluding I, O, Q).
* **Severity Levels:**
    * 🔴 **Critical:** Vehicle grounded (e.g., Brake failure, HV isolation fault).
    * 🟡 **Major:** Vehicle usable but needs repair <48h (e.g., AC broken, mirror cracked).
    * 🟢 **Minor:** Cosmetic/Routine (e.g., Wiper fluid low).

### 3.2 Technical Constraints
* **Mobile Support:** Must run on low-end Android tablets used in the shop.
* **Connectivity:** Must handle intermittent Wi-Fi in large metal warehouses.

## 4. Future Considerations (V2)
* Integration with ELD (Electronic Logging Device) for auto-mileage updates.
* Push notifications for "Parts Arrived" status.