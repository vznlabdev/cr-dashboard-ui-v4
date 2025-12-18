# Personas (Creator Rights) – Dashboard Feature Specification (MVP)

## Purpose

This document defines **Personas (Creator Rights)** as a new **asset type** within the Creation Rights / Insurance Dashboard. It is written as a **developer-facing specification** to guide implementation for MVP, with future scalability in mind.

Personas represent **people, characters, or mascots** whose likeness, voice, or identity is used in creative assets and must be governed for legal, insurance, and compliance purposes.

---

## 1. New Asset Type: Personas (Creator Rights)

### Add to Asset Categories

Current asset types:
- Images
- Documents
- Archives

Add new type:
- **Personas (Creator Rights)**

### Display Requirements

- Icon: 👤 (or equivalent person identifier)
- Card-style display consistent with other asset categories
- Count of persona records (same behavior as other asset types)

### Stored Data (High Level)

Each Persona stores:
- Person / character name
- Rights & authorization details
- Reference materials (optional)
- Linked creative assets

---

## 2. Asset Library View – Personas Card

### Feature Behavior

In the main Asset Library view, add a **Personas card** alongside existing asset cards.

**Card Contents:**
- Asset type label: Personas
- Icon
- Count (e.g. `5`)
- Sub-label: `Creator Rights`

Clicking the card navigates to the **Personas list view**.

---

## 3. Persona Profile – Detail View (MVP)

Clicking a Persona opens a dedicated **Persona Profile page**.

### 3.1 Basic Information Section

Fields:
- **Full Name**
- **Creator Rights ID** (auto-generated)
  - Format: `CR-YYYY-#####`
- **Persona Type** (dropdown)
  - Real Person
  - Character
  - Brand Mascot

---

### 3.2 Rights Documentation

Fields:
- **Rights Status**
  - Authorized
  - Expiring Soon
  - Expired
- **Rights Agreement Document** (PDF upload)
- **Valid From** (date)
- **Valid Through** (date)

### Logic Notes

- Rights Status is auto-derived from the expiration date
- Expiration thresholds (e.g. 30 days) should be configurable

---

### 3.3 Reference Materials (Optional)

Uploadable items:
- Reference photos
- Voice samples
- Brand or usage guidelines

These are **supporting evidence** and do not affect authorization status directly.

---

### 3.4 Linked Assets

Display a list of all assets using this persona.

Each linked asset shows:
- Asset name
- Asset type

Actions:
- View individual asset
- View all linked assets (full list)

---

### 3.5 Rights Status & Risk Summary

Auto-generated summary block:

- **Risk Level**: LOW / MEDIUM / HIGH
- **Rights validity date**
- **Number of linked assets**
- **Last verified date**

### Risk Logic (MVP)

- LOW: Rights valid > 60 days
- MEDIUM: Rights expiring within threshold
- HIGH: Rights expired

---

## 4. Linking Personas to Regular Assets

### Asset Detail View Enhancement

On any standard asset (image, document, video, etc.), add a **Personas Used** section.

Displayed per persona:
- Persona name
- Creator Rights ID
- Rights status indicator

Example states:
- ✓ Authorized
- ⚠️ Expires in X days
- ❌ Expired

### Actions

- `+ Add Persona`
- `Manage Links`

---

## 5. MVP Data Model

### Required Fields

- Full Name
- Creator Rights ID
- Persona Type
- Rights Status
- Valid From Date
- Valid Through Date

### Optional Fields

- Rights agreement document (PDF)
- Reference photos
- Notes / description
- Contact information

### Auto-Generated Fields

- Risk level
- Linked assets count
- Last verified date
- Created date
- Updated date

---

## 6. Filters & Search Enhancements

Extend existing dashboard filters with **Creator Rights** options:

- All Assets
- Has Personas
- No Personas
- Rights Expiring (next 30 days)
- Rights Expired
- Fully Authorized

These filters should work across **all asset types**, not only Persona records.

---

## 7. Alerts & Monitoring

### Automatic Alerts

- Persona rights expiring soon
- Persona rights expired
- Assets linked to expired personas

### Dashboard Usage

- Alerts surface in the main **Issues & Actions** panel
- Clicking alert → filtered asset or persona list

---

## 8. Export & Compliance Support

### Required Exports

- Persona list with rights status
- Linked assets per persona
- Rights agreement documents

### Insurance / Legal Use

Exports must support:
- Underwriter review
- Claims defense
- Audit trails for creator authorization

---

## 9. Simple MVP Workflow

1. Create Persona
   - Enter name, type, dates
   - Upload rights agreement

2. Link to Assets
   - Tag assets that use the persona

3. Monitor Status
   - Dashboard flags expiring or expired rights

4. Export for Insurance
   - One-click report of personas + linked assets

---

## 10. Key Benefits

- Centralized creator rights management
- Fast auditing of persona usage
- Automatic risk detection for expiring rights
- Compliance-ready documentation
- Scalable foundation for future identity governance features

---

## Summary

Personas extend the dashboard from **content governance** into **identity & likeness governance**.

This feature is critical for:
- AI-generated content
- Talent usage
- Brand safety
- Insurance underwriting

MVP should remain simple, auditable, and tightly integrated with existing asset workflows.

