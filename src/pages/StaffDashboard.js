import { api } from '../services/api';
// MultipleFiles/StaffDashboard.js
import React, { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../pages/StaffDashboard.css';
import { FaPlusCircle, FaClipboardList, FaSearch, FaUpload, FaHome, FaSpinner } from 'react-icons/fa';
import logo from "../assets/business-logo.png";

import TyreOverlaySVG from "../components/TyreOverlaySVG";
// Lottie
import Lottie from "lottie-react";
import sunnyAnim from "../assets/lottie/sunny.json";
import cloudyAnim from "../assets/lottie/cloudy.json";
import rainAnim from "../assets/lottie/rain.json";
import snowAnim from "../assets/lottie/snow.json";
import fogAnim from "../assets/lottie/fog.json";
import thunderstormAnim from "../assets/lottie/thunderstorm.json";

// Components
import ExteriorMap from '../components/ExteriorMap';
import InteriorMap from '../components/InteriorMap';
import FaultTable from '../components/FaultTable';
import ProgressBar from '../components/ProgressBar';

// Static images
import exteriorSummaryImage from '../assets/exterior.png';
import interiorSummaryImage from '../assets/interior.png';

const StaffDashboard = () => {
  const getGreetingLabel = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) body.classList.add('no-scroll');
    else body.classList.remove('no-scroll');
    return () => body.classList.remove('no-scroll');
  }, [sidebarOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [message, setMessage] = useState('');

  const [exteriorSummaryImageBase64, setExteriorSummaryImageBase64] = useState(null);
  const [interiorSummaryImageBase64, setInteriorSummaryImageBase64] = useState(null);

  const createEmptyTyre = (position) => ({
    position,
    treadDepth: '',
    condition: ''
  });

  const initialForm = {
    reg: '', vin: '', ownerName: '', ownerContact: '',
    make: '', model: '', year: '', colour: '', transmission: '',
    mileage: '', date: '', fuelType: '', engineSize: '', co2: '', euroStatus: '', regDate: '',
    artEndDate: '', motStatus: '', revenueWeight: '', taxDueDate: '', taxStatus: '', wheelplan: '',
    yearOfManufacture: '', dateOfLastV5CIssued: '',
    vehiclePhoto: null,
    overallGrade: '',
    conditionMeter: 50,
    tyres: [
      createEmptyTyre('Front Left'),
      createEmptyTyre('Front Right'),
      createEmptyTyre('Rear Left'),
      createEmptyTyre('Rear Right')
    ],
    lightsCheck: false, mirrorsCheck: false, wipersCheck: false,
    engineStartSmooth: false, steeringAlignment: false, brakePerformance: false, gearShiftQuality: false,
    testDriveNotes: '',
  };

  const [form, setForm] = useState(initialForm);
  const [exteriorFaults, setExteriorFaults] = useState([]);
  const [interiorFaults, setInteriorFaults] = useState([]);
  const [editFaultIndex, setEditFaultIndex] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
// NEW: popup flag for manual entry notice
const [showManualPopup, setShowManualPopup] = useState(false);

  const goTo = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const toBase64 = (fileOrBlob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileOrBlob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
const handleFaultPointClick = (index, type) => {
  setEditFaultIndex(index);
  setMessage(`Editing ${type} fault #${index + 1}`);
};

const handleFaultPointDelete = (index, type) => {
  handleDeleteFault(index, type);
};

  const compressImage = (base64, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  // Auto-load saved draft
  useEffect(() => {
    if (user) {
      const savedForm = JSON.parse(localStorage.getItem(`currentAppraisalForm_${user.username}`) || '{}');
      if (Object.keys(savedForm).length > 0) {
        const loadedTyres = savedForm.tyres || [];
        const defaultTyres = [
          createEmptyTyre('Front Left'),
          createEmptyTyre('Front Right'),
          createEmptyTyre('Rear Left'),
          createEmptyTyre('Rear Right')
        ];
        const mergedTyres = defaultTyres.map((def, i) => ({ ...def, ...(loadedTyres[i] || {}) }));
        setForm({ ...savedForm, tyres: mergedTyres });
      }
    }
  }, [user]);

  // Auto-save draft
  useEffect(() => {
    if (user) {
      localStorage.setItem(`currentAppraisalForm_${user.username}`, JSON.stringify(form));
      localStorage.setItem(`currentExteriorFaults_${user.username}`, JSON.stringify(exteriorFaults));
      localStorage.setItem(`currentInteriorFaults_${user.username}`, JSON.stringify(interiorFaults));
      localStorage.setItem(`currentAppraisalStep_${user.username}`, currentStep.toString());
    }
  }, [form, exteriorFaults, interiorFaults, currentStep, user]);

  // clear message when section changes
  useEffect(() => {
    setMessage('');
    setSidebarOpen(false);
  }, [activeSection]);

  // Auth + initial list
  useEffect(() => {
    let mounted = true;
    api.me()
      .then(u => {
        if (!mounted) return;
        if (!u || u.role !== 'staff') {
          navigate('/staff-login', { replace: true });
          return;
        }
        const clean = (s) => (s || '').replace(/\bundefined\b/gi, '').trim();
        const safeName = clean(u.name);
        const parts = safeName.split(' ').filter(Boolean);
        const derivedFirst = parts[0] || '';
        const derivedLast = parts.slice(1).join(' ') || '';

        setUser({
          username: u.username,
          email: (u.email || '').trim(),
          firstName: clean(u.firstName) || derivedFirst || 'Staff',
          lastName: clean(u.lastName) || derivedLast
        });

        const saved = JSON.parse(localStorage.getItem(`appraisals_${u.username}`) || '[]');
        setAppraisals(saved);
      })
      .catch(() => navigate('/staff-login', { replace: true }));
    return () => { mounted = false; };
  }, [navigate]);

  // Load static summary images (base64)
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

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, 7));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

  const startNewAppraisal = () => {
  setForm(initialForm);
  setExteriorFaults([]);
  setInteriorFaults([]);
  setEditFaultIndex(null);
  setCurrentStep(1);
  setActiveSection('start');
  setShowManualPopup(false); // NEW: reset the popup
  if (user) {
    localStorage.removeItem(`currentAppraisalForm_${user.username}`);
    localStorage.removeItem(`currentExteriorFaults_${user.username}`);
    localStorage.removeItem(`currentInteriorFaults_${user.username}`);
    localStorage.removeItem(`currentAppraisalStep_${user.username}`);
  }
  setMessage('');
};


  // Load my appraisals from backend (robust filter)
  useEffect(() => {
    if (!user) return;
    const fetchMine = async () => {
      try {
        const allRes = await api.getAllAppraisals();
        const all = Array.isArray(allRes) ? allRes : (allRes?.data || []);

        const email = (user.email || '').trim().toLowerCase();
        const username = (user.username || '').trim().toLowerCase();
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim().toLowerCase();

        const matchesMe = (a) => {
          const e = ((a.submittedByEmail || a.createdByEmail || a.email) || '').trim().toLowerCase();
          const u = ((a.submittedByUsername || a.createdByUsername || a.username) || '').trim().toLowerCase();
          const n = ((a.submittedBy || a.createdBy || '')).trim().toLowerCase();
          return (email && e === email) || (username && u === username) || (fullName && n === fullName);
        };

        const mine = (all || []).filter(matchesMe);

        setAppraisals(mine);
        localStorage.setItem(`appraisals_${user.username}`, JSON.stringify(mine));
      } catch (err) {
        console.error("Failed to load appraisals from server:", err);
      }
    };
    fetchMine();
  }, [user]);

  // Vehicle lookup
 
const handleFindVehicle = async (e) => {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const regTrim = (form.reg || '').trim().toUpperCase();
  if (!regTrim) {
    setMessage('Please enter a registration number.');
    return;
  }

  // Basic UK registration validation
  const ukRegRegex = /^[A-Z0-9]{2,4}\s?[A-Z0-9]{2,3}$/i;

  // ❗ If format is wrong → go to Step 2 (manual) and show popup
  if (!ukRegRegex.test(regTrim)) {
    setForm(prev => ({ ...prev, reg: regTrim, vin: '' }));
    setShowManualPopup(true);
    setCurrentStep(2);
    return;
  }

  setLoadingVehicle(true);
  setMessage('');

  try {
    const data = await api.lookupVehicle(regTrim);

    // ❗ If DVLA returns nothing → go manual
    if (!data || !data.make) {
      setForm(prev => ({ ...prev, reg: regTrim, vin: '' }));
      setShowManualPopup(true);
      setCurrentStep(2);
      return;
    }

    const S = (v) => (v == null ? '' : String(v));
    const derivedYear =
      data.yearOfManufacture
        ? S(data.yearOfManufacture)
        : data.monthOfFirstRegistration
          ? S(new Date(data.monthOfFirstRegistration).getFullYear())
          : '';

    setForm((prev) => ({
      ...prev,
      reg: regTrim,
      make: S(data.make) || prev.make,
      model: prev.model,
      colour: S(data.colour) || S(data.color) || prev.colour,
      fuelType: S(data.fuelType) || prev.fuelType,
      vin: S(data.vin || data.vehicleIdentificationNumber) || prev.vin,

      engineSize: S(data.engineCapacity) || prev.engineSize,
      co2: S(data.co2Emissions) || prev.co2,
      euroStatus: S(data.euroStatus) || prev.euroStatus,
      wheelplan: S(data.wheelplan) || prev.wheelplan,

      regDate: S(data.monthOfFirstRegistration) || prev.regDate,
      year: derivedYear || prev.year,
      yearOfManufacture: S(data.yearOfManufacture) || prev.yearOfManufacture,
      dateOfLastV5CIssued: S(data.dateOfLastV5CIssued) || prev.dateOfLastV5CIssued,

      motStatus: S(data.motStatus) || prev.motStatus,
      taxStatus: S(data.taxStatus) || prev.taxStatus,
      taxDueDate: S(data.taxDueDate) || prev.taxDueDate,
      revenueWeight: S(data.revenueWeight) || prev.revenueWeight,

      transmission: prev.transmission,
      mileage: prev.mileage,
      artEndDate: prev.artEndDate,
    }));

    setMessage('✅ Vehicle details fetched successfully!');
    nextStep(); // proceed as normal
  } catch (err) {
    console.error(err);
    // ❗ On API error → go manual
    setForm(prev => ({ ...prev, vin: '', reg: regTrim }));
    setShowManualPopup(true);
    setCurrentStep(2);
  } finally {
    setLoadingVehicle(false);
  }
};

  const handleAddFault = async (fault, type) => {
    if (fault.photo && fault.photo instanceof File) {
      fault.photo = await compressImage(await toBase64(fault.photo));
    }
    const totalFaults = exteriorFaults.length + interiorFaults.length;
    const faultWithIdx = { ...fault, idx: totalFaults + 1 };

    if (type === 'exterior') {
      if (editFaultIndex !== null) {
        const updated = [...exteriorFaults];
        updated[editFaultIndex] = faultWithIdx;
        setExteriorFaults(updated);
        setEditFaultIndex(null);
      } else {
        setExteriorFaults(prev => [...prev, faultWithIdx]);
      }
    } else if (type === 'interior') {
      if (editFaultIndex !== null) {
        const updated = [...interiorFaults];
        updated[editFaultIndex] = faultWithIdx;
        setInteriorFaults(updated);
        setEditFaultIndex(null);
      } else {
        setInteriorFaults(prev => [...prev, faultWithIdx]);
      }
    }
    setMessage(`Fault added: ${fault.part} - ${fault.damage}`);
  };

  const handleDeleteFault = (index, type) => {
    if (type === 'exterior') {
      const updated = [...exteriorFaults];
      updated.splice(index, 1);
      const reIndexed = updated.map((f, i) => ({ ...f, idx: i + 1 }));
      setExteriorFaults(reIndexed);
    } else if (type === 'interior') {
      const updated = [...interiorFaults];
      updated.splice(index, 1);
      const reIndexed = updated.map((f, i) => ({ ...f, idx: i + 1 }));
      setInteriorFaults(reIndexed);
    }
    setMessage('Fault deleted.');
  };

  const handleEditFault = (index, type) => {
    setEditFaultIndex(index);
    setMessage(`Editing ${type} fault at index ${index}`);
  };

  // === FINAL SUBMIT (optimistic + robust refresh) ===
const handleFinalSubmit = async () => {
  const newAppraisal = {
    ...form,
    reg: (form.reg || '').toUpperCase(),
    vehicle: `${form.make} ${form.model}`.trim(),
    date: new Date().toLocaleDateString(),
    submittedBy: `${user.firstName} ${user.lastName}`,
    submittedByEmail: (user.email || '').trim(),
    submittedByUsername: (user.username || '').trim(),
    faults: { exterior: exteriorFaults, interior: interiorFaults },
  };

  try {
    // ---- CREATE vs UPDATE ----
    const isUpdate = !!form._id; // if editing, _id will exist
    const saved = isUpdate
      ? await api.updateAppraisal(form._id, newAppraisal) // PUT /api/appraisals/:id
      : await api.createAppraisal(newAppraisal);          // POST /api/appraisals

    // ---- Optimistic UI ----
    if (!isUpdate) {
      setAppraisals(prev => [saved || newAppraisal, ...prev]);
    } else {
      setAppraisals(prev =>
        prev.map(a => (a._id === form._id ? (saved || newAppraisal) : a))
      );
    }
    setActiveSection('submitted');

    // ---- Robust refresh (optional) ----
    try {
      const allRes = await api.getAllAppraisals();
      const all = Array.isArray(allRes) ? allRes : (allRes?.data || []);

      const email = (user.email || '').trim().toLowerCase();
      const username = (user.username || '').trim().toLowerCase();
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean).join(' ').trim().toLowerCase();

      const matchesMe = (a) => {
        const e = ((a.submittedByEmail || a.createdByEmail || a.email) || '').trim().toLowerCase();
        const u = ((a.submittedByUsername || a.createdByUsername || a.username) || '').trim().toLowerCase();
        const n = ((a.submittedBy || a.createdBy || '')).trim().toLowerCase();
        return (email && e === email) || (username && u === username) || (fullName && n === fullName);
      };

      const mine = (all || []).filter(matchesMe);
      setAppraisals(mine);
      localStorage.setItem(`appraisals_${user.username}`, JSON.stringify(mine));
    } catch (refreshErr) {
      console.warn("Refresh after submit failed, keeping optimistic item.", refreshErr);
    }

    // ---- Clear draft + reset form ----
    localStorage.removeItem(`currentAppraisalForm_${user.username}`);
    localStorage.removeItem(`currentExteriorFaults_${user.username}`);
    localStorage.removeItem(`currentInteriorFaults_${user.username}`);
    localStorage.removeItem(`currentAppraisalStep_${user.username}`);

    setForm(initialForm);
    setExteriorFaults([]);
    setInteriorFaults([]);
    setCurrentStep(1);

    setMessage(isUpdate ? '✅ Appraisal updated!' : '✅ Appraisal submitted & saved to server!');
  } catch (e) {
    console.error('saveAppraisal failed:', e);
    setMessage('❌ Server save failed. Please try again.');
  }
};


  // Smaller pin for PDF
  const drawPin = (
    doc, xPx, yPx, number,
    imgX, imgY, imgW, imgH,
    originalW, originalH
  ) => {
    const scaleX = imgW / originalW;
    const scaleY = imgH / originalH;
    const px = imgX + xPx * scaleX;
    const py = imgY + yPx * scaleY;
    const outerR = 2.0;
    const innerR = 0.8;

    doc.setFillColor(17, 17, 17);
    doc.circle(px, py, innerR, 'F');
    doc.circle(px, py, outerR, 'F');

    doc.setFontSize(4.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(number), px, py + 1.0, { align: 'center' });
  };

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

    // Exterior map
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
        doc.text("Exterior summary image not available (base64 null).", 5, 40);
      }

      const originalImageWidth = 1332;
      const originalImageHeight = 733;

      (data.faults.exterior || []).forEach(f => {
        if (f.coords && f.idx) {
          drawPin(
            doc,
            f.coords.x,
            f.coords.y,
            f.idx,
            imgX,
            imgY,
            imgWidth,
            imgHeight,
            originalImageWidth,
            originalImageHeight
          );
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
      console.error("Error during exterior summary image processing in PDF:", e);
      doc.setFontSize(11);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error processing exterior image: ${e.message}`, 5, 40);
    }

    // Interior map
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
        doc.text("Interior summary image not available (base64 null).", 5, 40);
      }

      const originalImageWidth = 1153;
      const originalImageHeight = 718;

      (data.faults.interior || []).forEach(f => {
        if (f.coords && f.idx) {
          drawPin(
            doc,
            f.coords.x,
            f.coords.y,
            f.idx,
            imgX,
            imgY,
            imgWidth,
            imgHeight,
            originalImageWidth,
            originalImageHeight
          );
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
      console.error("Error during interior summary image processing in PDF:", e);
      doc.setFontSize(11);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error processing interior image: ${e.message}`, 5, 40);
    }

    // Photos page
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
    [...(data.faults.exterior || []), ...(data.faults.interior || [])]
      .filter(f => f.photo)
      .forEach((fault) => {
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
            if (detectedType === 'SVG+XML') imageType = 'SVG';
            else if (detectedType === 'PNG') imageType = 'PNG';
            else if (detectedType === 'JPEG' || detectedType === 'JPG') imageType = 'JPEG';
            else imageType = detectedType;
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

 const deleteAppraisal = async (i) => {
   const a = appraisals[i];
   if (!a || !a._id) {
     setMessage('❌ Cannot delete: missing appraisal ID.');
     return;
   }
   if (!window.confirm(`Delete appraisal ${a.reg || ''}?`)) return;
   try {
     await api.deleteAppraisal(a._id);
     const updated = appraisals.filter((_, idx) => idx !== i);
     setAppraisals(updated);
     if (user) localStorage.setItem(`appraisals_${user.username}`, JSON.stringify(updated));
     setMessage('✅ Deleted from server.');
   } catch (err) {
     console.error('deleteAppraisal failed', err);
     setMessage('❌ Server delete failed.');
   }
 };

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setMessage('Please enter a search keyword.');
      setSearchResults([]);
      return;
    }
    const results = appraisals.filter(a =>
      (a.reg || '').toLowerCase().includes(query) ||
      ((a.make || '') + ' ' + (a.model || '')).toLowerCase().includes(query) ||
      (a.ownerName || '').toLowerCase().includes(query)
    );
    setSearchResults(results);
    setMessage(`Found ${results.length} results.`);
  };

  const totalSteps = 7;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const [weather, setWeather] = useState({
    loading: true,
    location: '—',
    tempC: null,
    desc: '—',
    icon: '⛅',
    lottieAnim: null
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const handleSearchSelect = (item) => {
    setSearchQuery("");
    setShowSuggestions(false);
    if (item === "New Appraisal") setActiveSection("start");
    if (item === "Submitted Appraisals") setActiveSection("submitted");
    if (item === "Search Appraisals") setActiveSection("search");
    if (item === "Upload Documents") setActiveSection("upload");
  };

  const codeToWeather = (code) => {
    const map = {
      0: ['Clear sky', '☀️', sunnyAnim],
      1: ['Mainly clear', '🌤️', sunnyAnim],
      2: ['Partly cloudy', '⛅', cloudyAnim],
      3: ['Overcast', '☁️', cloudyAnim],
      45: ['Fog', '🌫️', fogAnim],
      48: ['Depositing rime fog', '🌫️', fogAnim],
      51: ['Light drizzle', '🌦️', rainAnim],
      53: ['Drizzle', '🌦️', rainAnim],
      55: ['Heavy drizzle', '🌧️', rainAnim],
      61: ['Light rain', '🌦️', rainAnim],
      63: ['Rain', '🌧️', rainAnim],
      65: ['Heavy rain', '🌧️', rainAnim],
      71: ['Light snow', '🌨️', snowAnim],
      73: ['Snow', '🌨️', snowAnim],
      75: ['Heavy snow', '❄️', snowAnim],
      80: ['Rain showers', '🌦️', rainAnim],
      81: ['Rain showers', '🌦️', rainAnim],
      82: ['Heavy showers', '🌧️', rainAnim],
      95: ['Thunderstorm', '⛈️', thunderstormAnim],
      96: ['Thunderstorm', '⛈️', thunderstormAnim],
      99: ['Thunderstorm', '⛈️', thunderstormAnim],
    };
    return map[code] || ['Weather', '🌡️', null];
  };
  
  // Get a human-readable place name from lat/lon
const reverseLookupName = async (lat, lon) => {
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`
    );
    const j = await r.json();
    const best = j?.results?.[0];
    return (
      best?.city ||
      best?.name ||
      best?.admin2 ||
      best?.admin1 ||
      null
    );
  } catch {
    return null;
  }
};

useEffect(() => {
  const getWeather = async (lat, lon, label) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      const cw = data.current_weather;
      const [desc, icon, lottieAnim] = codeToWeather(cw.weathercode);
      setWeather({
        loading: false,
        location: label,
        tempC: Math.round(cw.temperature),
        desc,
        icon,
        lottieAnim
      });
    } catch {
      setWeather(w => ({ ...w, loading: false, desc: 'Unavailable', icon: '🌐', lottieAnim: null }));
    }
  };

  const fallbackLat = 51.510; // Hayes fallback
  const fallbackLon = -0.420;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // 🔁 new reverse lookup
        const name = await reverseLookupName(latitude, longitude);
        const label = name || 'HAYES';
        await getWeather(latitude, longitude, label);
      },
      async () => {
        const label = 'HAYES';
        await getWeather(fallbackLat, fallbackLon, label);
      },
      { timeout: 5000 }
    );
  } else {
    const label = 'HAYES';
    getWeather(fallbackLat, fallbackLon, label);
  }
}, []);

  

  

  if (!user) {
    return <div style={{ padding: 16 }}>Checking session…</div>;
  }

  return (
    <div className={`staff-dashboard no-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>

          <div className="main-layout no-header">
        

        <div
          className={`drawer-backdrop ${sidebarOpen ? "show" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className="content-area">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
              <img
                src={logo}
                alt="Heston Logo"
                className="left-logo"
                onClick={() => goTo("dashboard")}
              />
            </div>

            <div
              className="topbar-right"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="topbar-user">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="User Avatar"
                  className="topbar-avatar"
                />
                <div className="topbar-name">
                  <span>{[user.firstName, user.lastName].filter(Boolean).join(' ')}</span>
                  <small>Staff</small>
                </div>
                <FaChevronDown className={`topbar-caret ${showDropdown ? "open" : ""}`} />
              </div>

              {showDropdown && (
                <div className="topbar-dropdown">
                  <button onClick={() => api.logout().then(() => navigate("/"))}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

{/* --- Flat Sub Navigation Bar (icons + equal width) --- */}
<div className="subnav-flat">
  <div
    className={`subnav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
    onClick={() => goTo('dashboard')}
  >
    <span className="ico"><FaHome /></span>
    <span>Dashboard</span>
  </div>
  <div
    className={`subnav-item ${activeSection === 'start' ? 'active' : ''}`}
    onClick={startNewAppraisal}
  >
    <span className="ico"><FaPlusCircle /></span>
    <span>New Appraisal</span>
  </div>
  <div
    className={`subnav-item ${activeSection === 'submitted' ? 'active' : ''}`}
    onClick={() => goTo('submitted')}
  >
    <span className="ico"><FaClipboardList /></span>
    <span>Submitted</span>
  </div>
  <div
    className={`subnav-item ${activeSection === 'search' ? 'active' : ''}`}
    onClick={() => goTo('search')}
  >
    <span className="ico"><FaSearch /></span>
    <span>Search</span>
  </div>
  <div
    className={`subnav-item ${activeSection === 'upload' ? 'active' : ''}`}
    onClick={() => goTo('upload')}
  >
    <span className="ico"><FaUpload /></span>
    <span>Upload Docs</span>
  </div>
</div>





          {message && (
            <p
              className={`appraisal-message ${
                message.startsWith('✅')
                  ? 'success'
                  : message.startsWith('❌')
                  ? 'error'
                  : 'info'
              }`}
            >
              {message}
            </p>
          )}

          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-page">
              
              <div className="greeting-bar">
  <div className="greeting-left">
    <h1 className="greet-text">
      {getGreetingLabel()}, {user.firstName}.
    </h1>
  </div>

<div className="greeting-right">
  {/* LEFT: Location + Label */}
  <div className="greet-weather left">
    <div className="loc">{(weather.location || 'HAYES').toString().toUpperCase()}</div>
    <div className="label">WEATHER</div>
  </div>

  {/* CENTER: Cloud Icon */}
  <div className="greet-weather center">
    {weather.lottieAnim ? (
      <Lottie animationData={weather.lottieAnim} style={{ width: 46, height: 46 }} />
    ) : (
      <span className="wx-icon">{weather.icon}</span>
    )}
  </div>

  {/* RIGHT: Temperature + Description */}
  <div className="greet-weather right">
    <div className="temp">
      {weather.tempC !== null ? `${weather.tempC}°C` : '—'}
    </div>
    <div className="desc">{weather.desc || '—'}</div>
  </div>
</div>

</div>


              <div className="quick-actions">
                <div className="action-card" onClick={startNewAppraisal}>
                  <FaPlusCircle /> New Appraisal
                </div>
                <div className="action-card" onClick={() => setActiveSection('submitted')}>
                  <FaClipboardList /> Submitted
                </div>
                <div className="action-card" onClick={() => setActiveSection('search')}>
                  <FaSearch /> Search
                </div>
                <div className="action-card" onClick={() => setActiveSection('upload')}>
                  <FaUpload /> Upload Docs
                </div>
              </div>
            </div>
          )}

{/* START (multi-step) */}
{activeSection === 'start' && (
  <>
    {/* Show title + progress only AFTER Step 1 */}
    {currentStep !== 1 && (
      <>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </>
    )}

    {/* Step 1 — registration-only screen */}
    {currentStep === 1 && (
      <div className="reg-start">
        <img src={logo} alt="Heston Automotive" className="reg-logo" />
        <p className="reg-sub">Enter vehicle registration Number</p>
    <form className="reg-search" onSubmit={(e) => { e.preventDefault(); handleFindVehicle(); }}>
      <input
        className="reg-input"
        placeholder="e.g. AB12 CDE"
        value={form.reg}
        onChange={(e) => setForm({ ...form, reg: e.target.value.toUpperCase() })}
        autoFocus
      />
      <button className="reg-btn" type="submit" disabled={loadingVehicle}>
          {loadingVehicle ? <FaSpinner className="spin" /> : 'Find Vehicle'}
      </button>

    </form>
  </div>
)}


{currentStep === 2 && (
                <>
                   {/* === Step 2: Vehicle Details (editable) === */}
   <div className="sd2-wrap">
  <div className="card">
    <div className="card-head">
      <span>🚘</span>
      <h3>Vehicle Details</h3>
    </div>

    <div className="grid two">
      {/* Make */}
      <div className="f">
        <label className="label">Make</label>
        <input
          className="input"
          value={form.make || ''}
          onChange={(e)=>setForm(p=>({...p, make: e.target.value}))}
          placeholder="Enter make"
        />
      </div>

      {/* Model */}
      <div className="f">
        <label className="label">Model</label>
        <input
          className="input"
          value={form.model || ''}
          onChange={(e)=>setForm(p=>({...p, model: e.target.value}))}
          placeholder="Enter model"
        />
      </div>

      {/* Year */}
      <div className="f">
        <label className="label">Year</label>
        <input
          className="input"
          value={form.year || ''}
          onChange={(e)=>setForm(p=>({...p, year: e.target.value.replace(/\D/g,'')}))}
          placeholder="YYYY"
          inputMode="numeric"
        />
      </div>

      {/* Colour */}
      <div className="f">
        <label className="label">Colour</label>
        <input
          className="input"
          value={form.colour || ''}
          onChange={(e)=>setForm(p=>({...p, colour: e.target.value}))}
          placeholder="Enter colour"
        />
      </div>

      {/* Transmission */}
      <div className="f">
        <label className="label">Transmission</label>
        <input
          className="input"
          value={form.transmission || ''}
          onChange={(e)=>setForm(p=>({...p, transmission: e.target.value}))}
          placeholder="Auto / Manual"
          list="transmissions"
        />
        <datalist id="transmissions">
          <option value="Automatic" />
          <option value="Manual" />
          <option value="Semi-Automatic" />
          <option value="CVT" />
        </datalist>
      </div>

      {/* Mileage */}
      <div className="f">
        <label className="label">Mileage</label>
        <input
          className="input"
          value={form.mileage || ''}
          onChange={(e)=>setForm(p=>({...p, mileage: e.target.value.replace(/\D/g,'')}))}
          placeholder="Enter mileage"
          inputMode="numeric"
        />
      </div>

      {/* Fuel Type */}
      <div className="f">
        <label className="label">Fuel Type</label>
        <input
          className="input"
          value={form.fuelType || ''}
          onChange={(e)=>setForm(p=>({...p, fuelType: e.target.value}))}
          placeholder="Petrol / Diesel / Hybrid / Electric"
          list="fuels"
        />
        <datalist id="fuels">
          <option value="Petrol" />
          <option value="Diesel" />
          <option value="Hybrid" />
          <option value="Plug-in Hybrid" />
          <option value="Electric" />
        </datalist>
      </div>

      {/* Engine Size (cc) */}
      <div className="f">
        <label className="label">Engine Size (cc)</label>
        <input
          className="input"
          value={form.engineSize || ''}
          onChange={(e)=>setForm(p=>({...p, engineSize: e.target.value.replace(/\D/g,'')}))}
          placeholder="e.g. 1998"
          inputMode="numeric"
        />
      </div>

      {/* CO2 Emissions */}
      <div className="f">
        <label className="label">CO2 Emissions</label>
        <input
          className="input"
          value={form.co2 || ''}
          onChange={(e)=>setForm(p=>({...p, co2: e.target.value.replace(/\D/g,'')}))}
          placeholder="e.g. 149"
          inputMode="numeric"
        />
      </div>

      {/* Euro Status */}
      <div className="f">
        <label className="label">Euro Status</label>
        <input
          className="input"
          value={form.euroStatus || ''}
          onChange={(e)=>setForm(p=>({...p, euroStatus: e.target.value}))}
          placeholder="e.g. Euro 6"
        />
      </div>

      {/* Reg Date */}
      <div className="f">
        <label className="label">Reg Date</label>
        <input
          className="input"
          value={form.regDate || ''}
          onChange={(e)=>setForm(p=>({...p, regDate: e.target.value}))}
          placeholder="YYYY-MM"
        />
      </div>

      {/* Art End Date */}
      <div className="f">
        <label className="label">Art End Date</label>
        <input
          className="input"
          value={form.artEndDate || ''}
          onChange={(e)=>setForm(p=>({...p, artEndDate: e.target.value}))}
          placeholder="YYYY-MM-DD"
        />
      </div>

      {/* MOT Status */}
      <div className="f">
        <label className="label">MOT Status</label>
        <input
          className="input"
          value={form.motStatus || ''}
          onChange={(e)=>setForm(p=>({...p, motStatus: e.target.value}))}
          placeholder="Valid / Expired / No MOT"
        />
      </div>

      {/* Revenue Weight */}
      <div className="f">
        <label className="label">Revenue Weight</label>
        <input
          className="input"
          value={form.revenueWeight || ''}
          onChange={(e)=>setForm(p=>({...p, revenueWeight: e.target.value.replace(/\D/g,'')}))}
          placeholder="kg"
          inputMode="numeric"
        />
      </div>

      {/* Tax Due Date */}
      <div className="f">
        <label className="label">Tax Due Date</label>
        <input
          className="input"
          value={form.taxDueDate || ''}
          onChange={(e)=>setForm(p=>({...p, taxDueDate: e.target.value}))}
          placeholder="YYYY-MM-DD"
        />
      </div>

      {/* Tax Status */}
      <div className="f">
        <label className="label">Tax Status</label>
        <input
          className="input"
          value={form.taxStatus || ''}
          onChange={(e)=>setForm(p=>({...p, taxStatus: e.target.value}))}
          placeholder="Taxed / Untaxed / SORN"
        />
      </div>

      {/* Wheelplan */}
      <div className="f">
        <label className="label">Wheelplan</label>
        <input
          className="input"
          value={form.wheelplan || ''}
          onChange={(e)=>setForm(p=>({...p, wheelplan: e.target.value}))}
          placeholder="e.g. 2 AXLE RIGID BODY"
        />
      </div>

      {/* Date of Last V5C Issued */}
      <div className="f">
        <label className="label">Date of Last V5C Issued</label>
        <input
          className="input"
          value={form.dateOfLastV5CIssued || ''}
          onChange={(e)=>setForm(p=>({...p, dateOfLastV5CIssued: e.target.value}))}
          placeholder="YYYY-MM-DD"
        />
      </div>
    </div>
  </div>

 {/* Sticky actions */}
  <div className="sticky-actions">
    <button type="button" className="btn btn-ghost" onClick={prevStep}>Previous</button>
    <button type="button" className="btn btn-primary" onClick={nextStep}>Next Step</button>
  </div>
</div>

{/* 🔽 POPUP yahin add karein — Step 2 ke andar hi 🔽 */}
{showManualPopup && (
  <div
    className="sub-part-backdrop"
    onClick={() => setShowManualPopup(false)}
  >
    <div
      className="sub-part-popup"
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: 420, textAlign: 'center' }}
    >
      <h4 style={{ marginBottom: 10 }}>DVLA Lookup Failed</h4>
      <p style={{ marginBottom: 16 }}>
        No data was found from DVLA. Please enter the vehicle details manually below.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => setShowManualPopup(false)}
      >
        OK
      </button>
    </div>
  </div>
)}
{/* 🔼 POPUP end 🔼 */}

 </>
)}

              {currentStep === 3 && (
  <>
    <h2 className="step-heading">Step 3 — Exterior Inspection</h2>
<p className="step-subtext">
  {exteriorFaults.length > 0
    ? `${exteriorFaults.length} faults recorded`
    : 'Click on the vehicle part to record a fault.'}
</p>
    <p className="mapping-subtext">Click on the vehicle part to record a fault.</p>

    <div className="mapping-layout">
      <div className="mapping-left">
        <ExteriorMap
  imageBase64={exteriorSummaryImageBase64}
  onPartSelect={(fault) => handleAddFault(fault, 'exterior')}
  faults={exteriorFaults}
  onFaultPointClick={(i) => handleFaultPointClick(i, 'exterior')}
  onFaultPointDelete={(i) => handleFaultPointDelete(i, 'exterior')}
/>

      </div>

      <div className="mapping-right">
        <div className="step-navigation">
          <button className="btn" onClick={prevStep}>Previous</button>
          <button className="btn btn-primary" onClick={nextStep}>Next Step</button>
          <button
            className="btn"
            onClick={() => {
              if (exteriorFaults.length > 0 && !window.confirm('This will clear all exterior faults. Continue?')) return;
              setExteriorFaults([]);
              setMessage('No exterior faults recorded.');
              nextStep();
            }}
          >
            No Exterior Faults
          </button>
        </div>
      </div>
    </div>

    {/* Edit popup remains same */}
    {editFaultIndex !== null && currentStep === 3 && (
      <div className="sub-part-backdrop" onClick={() => setEditFaultIndex(null)}>
        <div className="sub-part-popup" onClick={(e) => e.stopPropagation()}>
          <h4>Edit Fault</h4>
          {(() => {
            const f = exteriorFaults[editFaultIndex] || {};
            return (
              <>
                <input
                  value={f.part || ''}
                  onChange={(e) => {
                    const updated = [...exteriorFaults];
                    updated[editFaultIndex] = { ...f, part: e.target.value };
                    setExteriorFaults(updated);
                  }}
                  placeholder="Part"
                  style={{ marginBottom: 8 }}
                />
                <input
                  value={f.damage || ''}
                  onChange={(e) => {
                    const updated = [...exteriorFaults];
                    updated[editFaultIndex] = { ...f, damage: e.target.value };
                    setExteriorFaults(updated);
                  }}
                  placeholder="Damage"
                  style={{ marginBottom: 8 }}
                />
                <input
                  value={f.detail || ''}
                  onChange={(e) => {
                    const updated = [...exteriorFaults];
                    updated[editFaultIndex] = { ...f, detail: e.target.value };
                    setExteriorFaults(updated);
                  }}
                  placeholder="Detail"
                  style={{ marginBottom: 12 }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={() => setEditFaultIndex(null)}>Save</button>
                  <button
                    className="confirm-delete"
                    onClick={() => {
                      handleFaultPointDelete(editFaultIndex, 'exterior');
                      setEditFaultIndex(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    )}
  </>
)}



  {currentStep === 4 && (
  <>
<h2 className="step-heading">Step 4 — Interior Inspection</h2>
<p className="step-subtext">
  {interiorFaults.length > 0
    ? `${interiorFaults.length} faults recorded`
    : 'Click on the interior part to record a fault.'}
</p>
    <p className="mapping-subtext">Click on the interior part to record a fault.</p>

    <div className="mapping-layout">
      <div className="mapping-left">
        <InteriorMap
          onPartSelect={(fault) => handleAddFault(fault, 'interior')}
          faults={interiorFaults}
          onFaultPointClick={(i) => handleFaultPointClick(i, 'interior')}
          onFaultPointDelete={(i) => handleFaultPointDelete(i, 'interior')}
        />
      </div>

      <div className="mapping-right">
        <div className="step-navigation">
          <button className="btn" onClick={prevStep}>Previous</button>
          <button className="btn btn-primary" onClick={nextStep}>Next Step</button>
          <button
            className="btn"
            onClick={() => {
              if (interiorFaults.length > 0 && !window.confirm('This will clear all interior faults. Continue?')) return;
              setInteriorFaults([]);
              setMessage('No interior faults recorded.');
              nextStep();
            }}
          >
            No Interior Faults
          </button>
        </div>
      </div>
    </div>
  </>
)}



{currentStep === 5 && (
  <>
    <h2 className="step-heading">Step 5 — Tyres, Wheels & Mechanical Check</h2>
    <p className="step-subtext">Click a tyre on the image and fill the mini form.</p>

    <TyreOverlaySVG form={form} setForm={setForm} />

    <div className="step-navigation">
      <button className="btn" onClick={prevStep}>Previous</button>
      <button className="btn btn-primary" onClick={nextStep}>Next Step</button>
    </div>
  </>
)}

              {currentStep === 6 && (
                <>
                  <h3>Step 6: Test Drive & Performance Notes</h3>
                  <h4>Checklist:</h4>
                  <div className="checklist-group">
                    <label>
                      <input type="checkbox" checked={form.engineStartSmooth} onChange={e => setForm({ ...form, engineStartSmooth: e.target.checked })} />
                      Engine Start/Idle Smooth
                    </label>
                    <label>
                      <input type="checkbox" checked={form.steeringAlignment} onChange={e => setForm({ ...form, steeringAlignment: e.target.checked })} />
                      Steering Alignment
                    </label>
                    <label>
                      <input type="checkbox" checked={form.brakePerformance} onChange={e => setForm({ ...form, brakePerformance: e.target.checked })} />
                      Brake Performance
                    </label>
                    <label>
                      <input type="checkbox" checked={form.gearShiftQuality} onChange={e => setForm({ ...form, gearShiftQuality: e.target.checked })} />
                      Gear Shift Quality
                    </label>
                  </div>
                  <h4>Freehand Notes:</h4>
                  <textarea
                    placeholder="Add any additional test drive observations here..."
                    rows="5"
                    value={form.testDriveNotes}
                    onChange={e => setForm({ ...form, testDriveNotes: e.target.value })}
                  ></textarea>
                  <div className="step-navigation">
                    <button className="btn" onClick={prevStep}>Previous</button>
                    <button className="btn" onClick={nextStep}>Next Step</button>
                  </div>
                </>
              )}

              {currentStep === 7 && (
                <>
                  <h3>Step 7: Summary & Finalize</h3>
                  <h4>Appraisal Summary:</h4>
                  <div className="summary-table">
                    <table>
                      <tbody>
                        <tr><th>Exterior Faults:</th><td>{exteriorFaults.length}</td></tr>
                        <tr><th>Interior Faults:</th><td>{interiorFaults.length}</td></tr>
                        <tr><th>Tyre/Wheel Checks:</th><td>{form.tyres.filter(t => t.treadDepth || t.condition).length} recorded</td></tr>
                        <tr><th>Mechanical Checks:</th><td>{form.lightsCheck || form.mirrorsCheck || form.wipersCheck ? 'Completed' : 'N/A'}</td></tr>
                        <tr><th>Test Drive Notes:</th><td>{form.testDriveNotes ? 'Recorded' : 'N/A'}</td></tr>
                        <tr><th>Overall Grade:</th><td>{form.overallGrade || 'N/A'}</td></tr>
                        <tr><th>Condition Meter:</th><td>{form.conditionMeter}%</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="step-navigation">
                    <button className="btn" onClick={prevStep}>Previous</button>
                    <button className="btn submit-appraisal-btn" onClick={handleFinalSubmit}>Submit Appraisal</button>
                  </div>
                </>
              )}
            </>
          )}

          {/* SUBMITTED */}
          {activeSection === 'submitted' && (
            <section className="content-section">
              <h2>Submitted Appraisals</h2>
              <div className="table-wrapper">
                <table className="appraisal-table">
                  <thead>
                    <tr>
                      <th>Registration</th>
                      <th>Vehicle</th>
                      <th>Date</th>
                      <th>Submitted By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appraisals.length === 0 ? (
                      <tr><td colSpan="5">No appraisals found.</td></tr>
                    ) : (
                      appraisals.map((a, i) => (
                        <tr key={i}>
                          <td>{a.reg}</td>
                          <td>{a.vehicle}</td>
                          <td>{a.date}</td>
                          <td>{a.submittedBy}</td>
                          <td>
                            <button onClick={() => {
                              setForm(a);
                              setExteriorFaults(a.faults?.exterior || []);
                              setInteriorFaults(a.faults?.interior || []);
                              setActiveSection('start');
                              setCurrentStep(1);
                            }}>Edit</button>

                            <button disabled={pdfLoading} onClick={async () => {
                              await generatePDF(a);
                            }}>
                              {pdfLoading ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button className="confirm-delete" onClick={() => deleteAppraisal(i)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SEARCH */}
          {activeSection === 'search' && (
            <section className="content-section">
              <h2>Search Appraisals</h2>
              <input
                placeholder="Search by Registration, Vehicle, or Owner"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="btn" onClick={handleSearch}>Search</button>
              <div className="table-wrapper">
                <table className="search-results-table">
                  <thead>
                    <tr>
                      <th>Registration</th>
                      <th>Vehicle</th>
                      <th>Owner</th>
                      <th>Date</th>
                      <th>Submitted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.length === 0 && searchQuery ? (
                      <tr><td colSpan="5">No results found for "{searchQuery}".</td></tr>
                    ) : searchResults.length === 0 && !searchQuery ? (
                      <tr><td colSpan="5">Enter a keyword to search.</td></tr>
                    ) : (
                      searchResults.map((a, i) => (
                        <tr key={i}>
                          <td>{a.reg}</td>
                          <td>{a.vehicle}</td>
                          <td>{a.ownerName || 'N/A'}</td>
                          {/* ✅ FIXED: pehle yahan date miss tha */}
                          <td>{a.date || '—'}</td>
                          <td>{a.submittedBy || [a.submittedByFirstName, a.submittedByLastName].filter(Boolean).join(' ')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'upload' && (
            <section className="content-section">
              <h2>Upload Documents</h2>
              <p>Upload functionality will be implemented here.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
