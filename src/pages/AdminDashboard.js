// frontend/src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FaHome, FaFileAlt, FaUserPlus, FaUsers, FaCog, FaChartBar, FaSyncAlt, FaChevronDown } from 'react-icons/fa';
import '../pages/AdminDashboard.css';

// PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Static imports for images
import exteriorSummaryImage from '../assets/exterior.png';
import interiorSummaryImage from '../assets/interior.png';
import logo from "../assets/business-logo.png";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [allAppraisals, setAllAppraisals] = useState([]);
  const [msg, setMsg] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Added for PDF functionality
  const [pdfLoading, setPdfLoading] = useState(false);
  const [exteriorSummaryImageBase64, setExteriorSummaryImageBase64] = useState(null);
  const [interiorSummaryImageBase64, setInteriorSummaryImageBase64] = useState(null);

  // New states for UI enhancements
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Staff state
  // === Staff edit/reset modals state ===
const [editingStaff, setEditingStaff] = useState(null);
const [editOpen, setEditOpen] = useState(false);

const [resetOpen, setResetOpen] = useState(false);
const [tempPassword, setTempPassword] = useState(''); // show once after auto-generate
const [manualPw, setManualPw] = useState('');

// optional: banner messages (tum already msg state use kar rahe ho)

  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffErr, setStaffErr] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });

  // Appraisals state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [q, setQ] = useState('');

  // Helper to convert File or Blob to Base64
  const toBase64 = (fileOrBlob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileOrBlob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  // Navigation helper
  const goTo = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  // Search menu handler (kept for potential future use, but removed from UI)
  const handleSearchSelect = (item) => {
    setSearchQuery("");
    setShowSuggestions(false);
    if (item === "Dashboard") goTo("dashboard");
    if (item === "Appraisals") goTo("appraisals");
    if (item === "Create Staff") goTo("createStaff");
    if (item === "Registered Staff") goTo("registeredStaff");
    if (item === "Settings") goTo("settings");
    if (item === "Reports") goTo("reports");
  };

  // Load staff function (DB connected via api.listStaff())
  const loadStaff = async () => {
    setStaffLoading(true);
    setStaffErr('');
    try {
      const list = await api.listStaff();
      setStaff(list || []);
    } catch (e) {
      setStaffErr(e.message || 'Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  };

  // Load appraisals function (DB connected via api.getAllAppraisals())
  const loadAppraisals = async () => {
    try {
      const appraisals = await api.getAllAppraisals();
      setAllAppraisals(appraisals);
      setRows(appraisals); // For filtering
    } catch (e) {
      setMsg(e.message || 'Failed to load appraisals');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    nav('/');
  };

  // Submit staff function (DB connected via api.createStaff())
  // Submit staff function (DB connected via api.createStaff())
// Submit staff function (DB connected via api.createStaff())
const submitStaff = async (e) => {
  e.preventDefault();
  setMsg('');

  const fn = (form.firstName || '').trim();
  const ln = (form.lastName || '').trim();

  // Validation rules:
  // 1) both empty -> block
  if (!fn && !ln) {
    alert('Enter first name.');
    return;
  }
  // 2) last present but first empty -> block
  if (!fn && ln) {
    alert('Enter first name.');
    return;
  }

  try {
    await api.createStaff({
      firstName: fn,
      lastName: ln || null,                 // allow empty last name
      username: (form.username || '').trim(),
      email: (form.email || '').trim(),
      password: form.password
    });
    setMsg('✅ Staff created');
    setForm({ firstName: '', lastName: '', username: '', email: '', password: '' });
    loadStaff();
  } catch (e) {
    setMsg(e.message || '❌ Failed to create staff');
  }
};


  // Remove staff function (DB connected via api.deleteStaff())
  const removeStaff = async (id) => {
    if (!window.confirm('Delete this staff?')) return;
    try {
      await api.deleteStaff(id);
      setMsg('✅ Staff deleted');
      loadStaff();
    } catch (e) {
      setMsg(e.message || '❌ Failed to delete staff');
    }
  };

  // PDF generation function (from original, with DB data)
  const generatePDF = async (data) => {
    setPdfLoading(true);
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Heston Inspect - Vehicle Appraisal Report", 105, 20, { align: "center" });
    doc.setLineWidth(0.8);
    doc.line(5, 24, 205, 24);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Registration: ${data.reg}`, 5, 30);
    doc.text(`Date: ${data.date}`, 205, 30, { align: "right" });
    doc.text(`Owner: ${data.ownerName || 'N/A'}`, 5, 36);
    doc.text(`Contact: ${data.ownerContact || 'N/A'}`, 205, 36, { align: "right" });

    let currentY = 45;
    if (data.vehiclePhoto) {
      try {
        doc.addImage(data.vehiclePhoto, 'JPEG', 15, currentY, 80, 60);
        currentY += 65;
      } catch (e) {
        console.error("Error adding vehicle photo to PDF:", e);
      }
    }

    doc.setFontSize(15);
    doc.setTextColor(0, 51, 102);
    doc.text("Vehicle Information", 5, currentY + 7);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      head: [['Field', 'Value', 'Field', 'Value']],
      body: [
        ['Make', data.make, 'Model', data.model],
        ['VIN', data.vin, 'Colour', data.colour],
        ['Transmission', data.transmission, 'Mileage', data.mileage],
        ['Fuel Type', data.fuelType, 'Engine Size', data.engineSize],
        ['CO2 Emissions', data.co2, 'Euro Status', data.euroStatus],
        ['Reg Date', data.regDate, 'Art End Date', data.artEndDate],
        ['MOT Status', data.motStatus, 'Revenue Weight', data.revenueWeight],
        ['Tax Due Date', data.taxDueDate, 'Tax Status', data.taxStatus],
        ['Wheelplan', data.wheelplan, 'Year Of Manufacture', data.yearOfManufacture],
        ['Date of Last V5C Issued', data.dateOfLastV5CIssued, '', ''],
        ['Overall Grade', data.overallGrade, 'Condition Meter', `${data.conditionMeter}%`]
      ],
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [0, 51, 102], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 5, right: 5 }
    });
    currentY = doc.lastAutoTable.finalY + 15;

    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(15);
    doc.setTextColor(0, 51, 102);
    doc.text("Exterior Faults", 5, currentY);
    currentY += 7;

    if (!data.faults.exterior || data.faults.exterior.length === 0) {
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text("No exterior faults reported.", 20, currentY + 6);
      currentY += 15;
    } else {
      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Part', 'Damage', 'Detail', 'Note']],
        body: data.faults.exterior.map((f, i) => [
          f.idx || (i + 1), f.part || '', f.damage || '', f.detail || '', f.note || ''
        ]),
        styles: { fontSize: 10, cellWidth: 'wrap' },
        columnStyles: { 4: { cellWidth: 40, halign: 'left' } },
        headStyles: { fillColor: [255, 174, 0], textColor: 0 },
        margin: { left: 5, right: 5 }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(15);
    doc.setTextColor(0, 51, 102);
    doc.text("Interior Faults", 5, currentY);
    currentY += 7;

    if (!data.faults.interior || data.faults.interior.length === 0) {
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text("No interior faults reported.", 20, currentY + 6);
      currentY += 15;
    } else {
      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Part', 'Damage', 'Detail', 'Note']],
        body: data.faults.interior.map((f, i) => [
          f.idx || (i + 1), f.part || '', f.damage || '', f.detail || '', f.note || ''
        ]),
        styles: { fontSize: 10, cellWidth: 'wrap' },
        columnStyles: { 4: { cellWidth: 40, halign: 'left' } },
        headStyles: { fillColor: [255, 174, 0], textColor: 0 },
        margin: { left: 5, right: 5 }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(15);
    doc.setTextColor(0, 51, 102);
    doc.text("Tyres, Wheels & Mechanical Check", 5, currentY);
    currentY += 7;

    const tyreData = (data.tyres || []).map(t => [`${t.position} Tread`, `${t.treadDepth}mm`, `${t.position} Wheel`, t.condition]);
    const mechanicalData = [
      ['Lights', data.lightsCheck ? 'Pass' : 'Fail', 'Mirrors', data.mirrorsCheck ? 'Pass' : 'Fail'],
      ['Wipers', data.wipersCheck ? 'Pass' : 'Fail', '', '']
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Tyre/Wheel Detail', 'Value', 'Tyre/Wheel Detail', 'Value']],
      body: [...tyreData, ...mechanicalData],
      styles: { fontSize: 10, cellWidth: 'wrap' },
      headStyles: { fillColor: [0, 160, 170], textColor: 255 },
      margin: { left: 5, right: 5 }
    });
    currentY = doc.lastAutoTable.finalY + 15;

    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(15);
    doc.setTextColor(0, 51, 102);
    doc.text("Test Drive & Performance Notes", 5, currentY);
    currentY += 7;

    const testDriveData = [
      ['Engine Start/Idle Smooth', data.engineStartSmooth ? 'Pass' : 'Fail'],
      ['Steering Alignment', data.steeringAlignment ? 'Pass' : 'Fail'],
      ['Brake Performance', data.brakePerformance ? 'Pass' : 'Fail'],
      ['Gear Shift Quality', data.gearShiftQuality ? 'Pass' : 'Fail'],
    ];
    autoTable(doc, {
      startY: currentY,
      head: [['Check', 'Status']],
      body: testDriveData,
      styles: { fontSize: 10, cellWidth: 'wrap' },
      headStyles: { fillColor: [0, 160, 170], textColor: 255 },
      margin: { left: 5, right: 5 }
    });
    currentY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Notes:", 5, currentY);
    doc.text(data.testDriveNotes || 'No notes.', 5, currentY + 5, { maxWidth: 190 });
    currentY += 20;

    // Exterior Condition Summary
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(255);
    doc.setFillColor(0, 160, 170);
    doc.rect(5, 15, 200, 10, 'F');
    doc.text("Exterior Condition Summary", 10, 22);

    try {
      const imgWidth = 100;
      const imgHeight = 70;
      const imgX = 5;
      const imgY = 30;

      if (exteriorSummaryImageBase64) {
        doc.addImage(exteriorSummaryImageBase64, 'PNG', imgX, imgY, imgWidth, imgHeight);
      } else {
        doc.setFontSize(11);
        doc.setTextColor(255, 0, 0);
        doc.text("Exterior summary image not available.", 5, 40);
      }

      const originalImageWidth = 1332;
      const originalImageHeight = 733;

      (data.faults.exterior || []).forEach(f => {
        if (f.coords && f.idx) {
          const scaleX = imgWidth / originalImageWidth;
          const scaleY = imgHeight / originalImageHeight;
          const px = imgX + f.coords.x * scaleX;
          const py = imgY + f.coords.y * scaleY;
          const outerR = 2.0;
          const innerR = 0.8;
          doc.setFillColor(17, 17, 17);
          doc.circle(px, py, innerR, 'F');
          doc.circle(px, py, outerR, 'F');
          doc.setFontSize(4.5);
          doc.setTextColor(255, 255, 255);
          doc.text(String(f.idx), px, py + 1.0, { align: 'center' });
        }
      });

      const textStartX = 110;
      const textMaxWidth = doc.internal.pageSize.width - textStartX - 5;
      let faultTextY = 35;
      doc.setFontSize(10);
      doc.setTextColor(0);
      (data.faults.exterior || []).forEach(f => {
        const lines = doc.splitTextToSize(`${f.idx}) ${f.part}; ${f.damage}; ${f.detail}`, textMaxWidth);
        lines.forEach(line => {
          if (faultTextY > doc.internal.pageSize.height - 20) {
            doc.addPage();
            faultTextY = 20;
            doc.text(line, 5, faultTextY);
          } else {
            doc.text(line, textStartX, faultTextY);
          }
          faultTextY += 5;
        });
      });
    } catch (e) {
      console.error("Error during exterior summary:", e);
      doc.setFontSize(11);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error: ${e.message}`, 5, 40);
    }

    // Interior Condition Summary
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(255);
    doc.setFillColor(0, 160, 170);
    doc.rect(5, 15, 200, 10, 'F');
    doc.text("Interior Condition Summary", 10, 22);

    try {
      const imgWidth = 100;
      const imgHeight = 70;
      const imgX = 5;
      const imgY = 30;

      if (interiorSummaryImageBase64) {
        doc.addImage(interiorSummaryImageBase64, 'PNG', imgX, imgY, imgWidth, imgHeight);
      } else {
        doc.setFontSize(11);
        doc.setTextColor(255, 0, 0);
        doc.text("Interior summary image not available.", 5, 40);
      }

      const originalImageWidth = 1153;
      const originalImageHeight = 718;

      (data.faults.interior || []).forEach(f => {
        if (f.coords && f.idx) {
          const scaleX = imgWidth / originalImageWidth;
          const scaleY = imgHeight / originalImageHeight;
          const px = imgX + f.coords.x * scaleX;
          const py = imgY + f.coords.y * scaleY;
          const outerR = 2.0;
          const innerR = 0.8;
          doc.setFillColor(17, 17, 17);
          doc.circle(px, py, innerR, 'F');
          doc.circle(px, py, outerR, 'F');
          doc.setFontSize(4.5);
          doc.setTextColor(255, 255, 255);
          doc.text(String(f.idx), px, py + 1.0, { align: 'center' });
        }
      });

      const textStartX = 110;
      const textMaxWidth = doc.internal.pageSize.width - textStartX - 5;
      let faultTextY = 35;

      doc.setFontSize(10);
      doc.setTextColor(0);
      (data.faults.interior || []).forEach(f => {
        const lines = doc.splitTextToSize(`${f.idx}) ${f.part}; ${f.damage}; ${f.detail}`, textMaxWidth);
        lines.forEach(line => {
          if (faultTextY > doc.internal.pageSize.height - 20) {
            doc.addPage();
            faultTextY = 20;
            doc.text(line, 5, faultTextY);
          } else {
            doc.text(line, textStartX, faultTextY);
          }
          faultTextY += 5;
        });
      });
    } catch (e) {
      console.error("Error during interior summary:", e);
      doc.setFontSize(11);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error: ${e.message}`, 5, 40);
    }

    // All Fault Photos
    doc.addPage();
    doc.setFontSize(15);
    doc.setTextColor(0, 51, 102);
    doc.text("All Fault Photos", 5, 20);

    const photoParams = {
      startX: 5,
      startY: 30,
      photosPerRow: 2,
      photoWidth: 85,
      photoHeight: 60,
      spacingX: 10,
      spacingY: 15,
      maxHeight: doc.internal.pageSize.height - 30
    };

    let { startX, startY } = photoParams;
    [...data.faults.exterior, ...data.faults.interior]
      .filter(f => f.photo)
      .forEach((fault, index) => {
        if (startY + photoParams.photoHeight > photoParams.maxHeight) {
          doc.addPage();
          startY = 20;
          startX = photoParams.startX;
        }

        if (startX + photoParams.photoWidth > 195) {
          startX = photoParams.startX;
          startY += photoParams.photoHeight + photoParams.spacingY;
        }

        try {
          const base64String = fault.photo;
          const mimeTypeMatch = base64String.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
          let imageType = 'JPEG';
          if (mimeTypeMatch && mimeTypeMatch[1]) {
            const detectedType = mimeTypeMatch[1].toUpperCase();
            if (detectedType === 'SVG+XML') {
              imageType = 'SVG';
            } else if (detectedType === 'PNG') {
              imageType = 'PNG';
            } else if (detectedType === 'JPEG' || detectedType === 'JPG') {
              imageType = 'JPEG';
            } else {
              imageType = detectedType;
            }
          }

          doc.addImage(base64String, imageType, startX, startY, photoParams.photoWidth, photoParams.photoHeight);

          doc.setFontSize(9);
          doc.setTextColor(0);
          const captionTitle = doc.splitTextToSize(`${fault.idx}) ${fault.part}`, photoParams.photoWidth);
          const captionDetails = doc.splitTextToSize(`${fault.damage} - ${fault.detail}`, photoParams.photoWidth);

          doc.setFont("helvetica", "bold");
          captionTitle.forEach((line, i) => {
            doc.text(line, startX, startY + photoParams.photoHeight + 5 + (i * 5));
          });

          doc.setFont("helvetica", "normal");
          captionDetails.forEach((line, i) => {
            doc.text(
              line,
              startX,
              startY + photoParams.photoHeight + 5 + (captionTitle.length * 5) + (i * 5)
            );
          });
        } catch (e) {
          console.error("Error adding image to PDF:", e);
          doc.setFontSize(9);
          doc.setTextColor(255, 0, 0);
          doc.text(`[Image Error: ${fault.part}]`, startX, startY);
        }

        startX += photoParams.photoWidth + photoParams.spacingX;
      });

    doc.save(`${data.reg}_report.pdf`);
    setPdfLoading(false);
  };

  // Filtered appraisals
  const filtered = rows.filter(a => {
    const s = (q || '').toLowerCase();
    if (!s) return true;
    return (
      (a.reg || '').toLowerCase().includes(s) ||
      (`${a.make || ''} ${a.model || ''}`.trim()).toLowerCase().includes(s) ||
      (a.vehicle || '').toLowerCase().includes(s) ||
      (a.ownerName || '').toLowerCase().includes(s) ||
      (a.submittedBy || '').toLowerCase().includes(s)
    );
  });

  useEffect(() => {
    loadStaff();
    loadAppraisals();
  }, []);

  // Added useEffect to load static images
  useEffect(() => {
    const loadStaticImages = async () => {
      try {
        const extResponse = await fetch(exteriorSummaryImage);
        const extBlob = await extResponse.blob();
        const extBase64 = await toBase64(extBlob);
        setExteriorSummaryImageBase64(extBase64);

        const intResponse = await fetch(interiorSummaryImage);
        const intBlob = await intResponse.blob();
        const intBase64 = await toBase64(intBlob);
        setInteriorSummaryImageBase64(intBase64);
      } catch (error) {
        console.error("Error loading static summary images:", error);
      }
    };
    loadStaticImages();
  }, []);

  // Body scroll lock for mobile drawer
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // ESC to close drawer
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="main-layout no-header">
        <div className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <div className={`sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => goTo('dashboard')}>
            <FaHome /> <span>Dashboard</span>
          </div>
          <div className={`sidebar-item ${activeSection === 'appraisals' ? 'active' : ''}`} onClick={() => goTo('appraisals')}>
            <FaFileAlt /> <span>Appraisals</span>
          </div>
          <div className={`sidebar-item ${activeSection === 'createStaff' ? 'active' : ''}`} onClick={() => goTo('createStaff')}>
            <FaUserPlus /> <span>Create Staff</span>
          </div>
          <div className={`sidebar-item ${activeSection === 'registeredStaff' ? 'active' : ''}`} onClick={() => goTo('registeredStaff')}>
            <FaUsers /> <span>Registered Staff</span>
          </div>
          <div className={`sidebar-item ${activeSection === 'settings' ? 'active' : ''}`} onClick={() => goTo('settings')}>
            <FaCog /> <span>Settings</span>
          </div>
          <div className={`sidebar-item ${activeSection === 'reports' ? 'active' : ''}`} onClick={() => goTo('reports')}>
            <FaChartBar /> <span>Reports</span>
          </div>
        </div>

        <div className={`drawer-backdrop ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

        <div className="content-area">
          {/* Topbar */}
          <div className="topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="topbar-left">
              <img src={logo} alt="Admin Logo" className="topbar-logo" onClick={() => goTo("dashboard")} />
            </div>
            <div className="topbar-center">
              {/* Removed search menu as per request */}
            </div>
            <div className="topbar-right" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="topbar-user">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User Avatar" className="topbar-avatar" />
                <div className="topbar-name">
                  <span>Admin</span>
                  <small>Administrator</small>
                </div>
                <FaChevronDown className={`topbar-caret ${showDropdown ? "open" : ""}`} />
              </div>
              {showDropdown && (
                <div className="topbar-dropdown">
                  <button onClick={logout}>Sign Out</button>
                </div>
              )}
            </div>
          </div>

          {msg && (
            <div className={`admin-message ${msg.startsWith('✅') ? 'success' : 'error'}`}>
              {msg}
            </div>
          )}

          {/* Dashboard */}
          {/* Dashboard */}
{activeSection === 'dashboard' && (
  <section className="admin-section">
    <h2><b>Admin Dashboard</b></h2>

    {/* === KPI STRIP (Top Summary) === */}
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-label">Total Appraisals</div>
        <div className="kpi-value">{allAppraisals.length}</div>
        <div className="kpi-sub">overall</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Pending Review</div>
        <div className="kpi-value">
          {allAppraisals.filter(a => (a?.faults?.exterior?.length || 0) + (a?.faults?.interior?.length || 0) > 0).length}
        </div>
        <div className="kpi-sub">has faults</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Registered Staff</div>
        <div className="kpi-value">{staff.length}</div>
        <div className="kpi-sub">active</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Reports Generated</div>
        <div className="kpi-value">
          {allAppraisals.filter(a => a?.pdfGenerated).length || 0}
        </div>
        <div className="kpi-sub">last 30d</div>
      </div>
    </div>

    {/* === ACTION CARDS (Modules) === */}
    <div className="action-cards">
      <div className="action-card" onClick={() => goTo('appraisals')}>
        <div className="action-icon"><FaFileAlt /></div>
        <div className="action-body">
          <h3>Appraisals</h3>
          <p>View & manage vehicle appraisals</p>
        </div>
        <button className="btn action-btn">Open</button>
      </div>

      <div className="action-card" onClick={() => goTo('createStaff')}>
        <div className="action-icon"><FaUserPlus /></div>
        <div className="action-body">
          <h3>Create Staff</h3>
          <p>Add a new staff member</p>
        </div>
        <button className="btn action-btn">Create</button>
      </div>

      <div className="action-card" onClick={() => goTo('registeredStaff')}>
        <div className="action-icon"><FaUsers /></div>
        <div className="action-body">
          <h3>Registered Staff</h3>
          <p>Manage staff accounts</p>
        </div>
        <button className="btn action-btn">Manage</button>
      </div>

      <div className="action-card" onClick={() => goTo('reports')}>
        <div className="action-icon"><FaChartBar /></div>
        <div className="action-body">
          <h3>Reports</h3>
          <p>View analytics & exports</p>
        </div>
        <button className="btn action-btn">View</button>
      </div>
    </div>

    {/* === LOWER GRID: Activity + Recent Table === */}
    <div className="lower-grid">
      {/* Activity */}
      <div className="panel">
        <div className="panel-head">
          <h3>Activity</h3>
        </div>
        <div className="panel-body activity-list">
          {(allAppraisals.slice(0, 3).map((a, i) => ({
            id: i,
            text: `Appraisal ${a.reg || a.vehicle || a._id} submitted${a.submittedBy ? ` by ${a.submittedBy}` : ''}`,
            time: a.createdAt ? new Date(a.createdAt).toLocaleString() : 'recent'
          })) || []).map(item => (
            <div key={item.id} className="activity-item">
              <span className="dot" />
              <div className="activity-texts">
                <div className="t1">{item.text}</div>
                <div className="t2">{item.time}</div>
              </div>
            </div>
          ))}
          {(!allAppraisals || allAppraisals.length === 0) && <div>No recent activity.</div>}
        </div>
      </div>

      {/* Recent Appraisals */}
      <div className="panel">
        <div className="panel-head row">
          <h3>Recent Appraisals</h3>
          <button className="btn light" onClick={() => goTo('appraisals')}>View all</button>
        </div>
        <div className="panel-body">
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reg</th>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Assignee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(allAppraisals || []).slice(0, 6).map(a => (
                  <tr key={a._id}>
                    <td>{a.reg}</td>
                    <td>{(`${a.make || ''} ${a.model || ''}`.trim()) || a.vehicle}</td>
                    <td>{a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—')}</td>
                    <td>{a.submittedBy || '—'}</td>
                    <td>
                      <span className={`status-pill ${((a?.faults?.exterior?.length || 0) + (a?.faults?.interior?.length || 0)) ? 'pending' : 'approved'}`}>
                        {((a?.faults?.exterior?.length || 0) + (a?.faults?.interior?.length || 0)) ? 'Pending' : 'Approved'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!allAppraisals || allAppraisals.length === 0) && (
                  <tr><td colSpan="5">No appraisals found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
)}

          {/* Appraisals */}
          {activeSection === 'appraisals' && (
            <section className="admin-section">
              <h2>All Submitted Appraisals</h2>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reg</th>
                      <th>Vehicle</th>
                      <th>Date</th>
                      <th>Submitted By</th>
                      <th>Exterior/Interior</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAppraisals.length === 0 ? (
                      <tr><td colSpan="6">No appraisals found.</td></tr>
                    ) : allAppraisals.map((a) => (
                      <tr key={a._id}>
                        <td>{a.reg}</td>
                        <td>{(`${a.make || ''} ${a.model || ''}`.trim()) || a.vehicle}</td>
                        <td>{a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—')}</td>
                        <td>{a.submittedBy || '—'}</td>
                        <td>{(a?.faults?.exterior?.length || 0)}/{(a?.faults?.interior?.length || 0)}</td>
                        <td>
                          <button disabled={pdfLoading} onClick={async () => {
                            await generatePDF(a);
                          }}>
                            {pdfLoading ? 'Generating...' : 'Download PDF'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Create Staff */}
          {activeSection === 'createStaff' && (
            <section className="admin-section">
              <h2>Create New Staff</h2>
              <form onSubmit={submitStaff}>
                <div className="staff-form">
                 <div className="grid-2">
  <input
    placeholder="First Name"
    value={form.firstName}
    onChange={e => setForm({ ...form, firstName: e.target.value })}
    required
  />
  <input
    placeholder="Last Name"
    value={form.lastName}
    onChange={e => setForm({ ...form, lastName: e.target.value })}
    /* last name is optional */
  />
</div>

                  <div className="grid-2">
                    <input
                      placeholder="Username"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid-2">
                    <input
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                  <button className="btn" type="submit">Create Staff</button>
                </div>
              </form>
            </section>
          )}

          {/* Registered Staff */}
          {activeSection === 'registeredStaff' && (
            <section className="admin-section">
              <div className="section-head">
                <h2>Registered Staff</h2>
                <div className="row-actions">
                  <button className="btn" onClick={loadStaff}><FaSyncAlt /> Refresh</button>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffLoading ? (
                      <tr><td colSpan="4">Loading…</td></tr>
                    ) : staffErr ? (
                      <tr><td colSpan="4">{staffErr}</td></tr>
                    ) : staff.length === 0 ? (
                      <tr><td colSpan="4">No staff yet.</td></tr>
                    ) : (
                      staff.map(s => (
                        <tr key={s._id}>
                          <td>{[s.firstName, s.lastName].filter(Boolean).join(' ')}</td>
                          <td>{s.username}</td>
                          <td>{s.email}</td>
  <td>
    <button
      className="btn"
      onClick={() => { setEditingStaff(s); setEditOpen(true); }}>
      Edit
    </button>

   <button
  className="btn"
  style={{ marginLeft: 8 }}
  onClick={() => { 
    setEditingStaff(s);
    setTempPassword('');
    setManualPw('');        // 👈 clear the field on open
    setResetOpen(true);
  }}>
  Reset Password
</button>


    <button
      className="btn danger"
      style={{ marginLeft: 8 }}
      onClick={() => removeStaff(s._id)}>
      Delete
    </button>
  </td>
  

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Settings */}
          {activeSection === 'settings' && (
            <section className="admin-section">
              <h2>Admin Settings</h2>
              <p>Coming soon…</p>
            </section>
          )}

          {/* Reports */}
{activeSection === 'reports' && (
  <section className="admin-section">
    <h2>Reports & Analytics</h2>
    <p>Coming soon…</p>
  </section>
)}

{/* ======= MODALS START (keep these just above .content-area closing) ======= */}

{/* Edit Staff Modal */}
{editOpen && editingStaff && (
  <div className="modal-backdrop">
    <div className="modal">
      <h3>Edit staff</h3>

      <label>First name
        <input
          value={editingStaff.firstName || ''}
          onChange={e => setEditingStaff({ ...editingStaff, firstName: e.target.value })}
        />
      </label>

      <label>Last name
        <input
          value={editingStaff.lastName || ''}
          onChange={e => setEditingStaff({ ...editingStaff, lastName: e.target.value })}
        />
      </label>

      <label>Username
        <input
          value={editingStaff.username || ''}
          onChange={e => setEditingStaff({ ...editingStaff, username: e.target.value })}
        />
      </label>

      <label>Email
        <input
          type="email"
          value={editingStaff.email || ''}
          onChange={e => setEditingStaff({ ...editingStaff, email: e.target.value })}
        />
      </label>

      <div style={{ marginTop: 12 }}>
        <button
          className="btn"
         onClick={async () => {
  try {
    // Trim inputs
    const fn = editingStaff.firstName?.trim() ?? "";
    const ln = editingStaff.lastName?.trim() ?? "";

    // === Validation rules ===
    // Case 3: both empty -> block
    if (!fn && !ln) {
      alert("First name is required.");
      return;
    }
    // Case 2: last name present but first empty -> block
    if (!fn && ln) {
      alert("Enter first name.");
      return;
    }
    // Case 1 (and normal): first present, last may be empty -> allow

    // Build payload
    const payload = {
      username: editingStaff.username?.trim(),
      email:    editingStaff.email?.trim(),
      // Always send firstName (we know it's present here)
      firstName: fn,
      // If last name is empty, send null so backend clears it
      lastName: ln || null,
    };

    await api.updateStaff(editingStaff._id, payload);

    setEditOpen(false);
    setEditingStaff(null);
    if (typeof loadStaff === 'function') loadStaff(); // refresh table
    setMsg('✅ Staff updated');
  } catch (e) {
    setMsg(e?.message || '❌ Failed to update staff');
  }
}}


>
          Save
        </button>

        <button
          style={{ marginLeft: 8 }}
          onClick={() => { setEditOpen(false); setEditingStaff(null); }}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{/* Reset Password Modal */}
{resetOpen && editingStaff && (
  <div className="modal-backdrop">
    <div className="modal">
      <h3>
  Reset password for {[editingStaff.firstName, editingStaff.lastName].filter(Boolean).join(' ')}
</h3>

      <div style={{ marginTop: 8 }}>
        {/* Option A: Auto-generate temp password on server */}
        <button
          className="btn"
          onClick={async () => {
            try {
              const res = await api.resetStaffPassword(editingStaff._id); // expects { tempPassword }
              if (res?.tempPassword) {
                setTempPassword(res.tempPassword); // show once
                setMsg('✅ Temporary password generated');
              } else {
                setMsg('⚠️ No temp password returned from server');
              }
            } catch (e) {
              setMsg(e?.message || '❌ Failed to reset password');
            }
          }}>
          Auto-generate temporary password
        </button>

        {/* Option B: Set a new password manually */}
        <div style={{ marginTop: 12 }}>
  <label>Or set a new password:
    <input
      type="password"
      value={manualPw}
      onChange={(e) => setManualPw(e.target.value)}
    />
  </label>
  <button
    className="btn"
    style={{ marginLeft: 8 }}
    onClick={async () => {
      const pw = manualPw.trim();
      if (!pw) { setMsg('Enter a password'); return; }
      try {
        await api.setStaffPassword(editingStaff._id, { password: pw });
        setMsg('✅ Password updated');
        setResetOpen(false);
        setEditingStaff(null);
        setTempPassword('');
        setManualPw('');           // reset local state
      } catch (e) {
        setMsg(e?.message || '❌ Failed to set password');
      }
    }}>
    Set password
  </button>
</div>


        {/* Show temp password once (after auto-generate) */}
        {tempPassword && (
          <div style={{ marginTop: 12, padding: 10, border: '1px solid #ddd', background: '#fff' }}>
            <strong>Temporary password (copy now):</strong>
            <div style={{ marginTop: 6, fontFamily: 'monospace', fontSize: 16 }}>
              {tempPassword}
            </div>
            <small>This will be visible only once.</small>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={() => { setResetOpen(false); setEditingStaff(null); setTempPassword(''); }}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ======= MODALS END ======= */}

</div>  {/* .content-area CLOSE */}
</div>
</div>
);
}
