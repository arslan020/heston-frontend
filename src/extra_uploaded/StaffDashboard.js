// MultipleFiles/StaffDashboard.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './StaffDashboard.css';
import { FaPlusCircle, FaClipboardList, FaSearch, FaUpload, FaHome, FaSpinner, FaLock, FaUnlock } from 'react-icons/fa';

// Import Lottie and animation data
import Lottie from "lottie-react";
// You need to create an 'assets/lottie' folder and place your .json animation files there.
// For example, download from lottiefiles.com and rename them.
import sunnyAnim from "../assets/lottie/sunny.json";
import cloudyAnim from "../assets/lottie/cloudy.json";
import rainAnim from "../assets/lottie/rain.json";
import snowAnim from "../assets/lottie/snow.json";
import fogAnim from "../assets/lottie/fog.json";
import thunderstormAnim from "../assets/lottie/thunderstorm.json";


// Assuming these components exist in your project
import ExteriorMap from '../components/ExteriorMap';
import InteriorMap from '../components/InteriorMap';
import FaultTable from '../components/FaultTable';
import ProgressBar from '../components/ProgressBar';

// Static imports for images (ensure these paths are correct relative to StaffDashboard.js)
import exteriorSummaryImage from '../assets/exterior.png';
import interiorSummaryImage from '../assets/interior.png';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [message, setMessage] = useState('');

  // State for base64 versions of static summary images
  const [exteriorSummaryImageBase64, setExteriorSummaryImageBase64] = useState(null);
  const [interiorSummaryImageBase64, setInteriorSummaryImageBase64] = useState(null);

  // Define the structure for each tyre object
  const createEmptyTyre = (position) => ({
    position: position,
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
    // Initialize tyres with 4 empty objects for each position
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
  const [selectedMap, setSelectedMap] = useState('exterior'); // This state is not used in the provided JSX
  const [editFaultIndex, setEditFaultIndex] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Helper to convert File or Blob to Base64
  const toBase64 = (fileOrBlob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileOrBlob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

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

  // Auto-save effect
  useEffect(() => {
    if (user) {
      const savedForm = JSON.parse(localStorage.getItem(`currentAppraisalForm_${user.username}`) || '{}');
      const savedExteriorFaults = JSON.parse(localStorage.getItem(`currentExteriorFaults_${user.username}`) || '[]');
      const savedInteriorFaults = JSON.parse(localStorage.getItem(`currentInteriorFaults_${user.username}`) || '[]');
      const savedCurrentStep = parseInt(localStorage.getItem(`currentAppraisalStep_${user.username}`) || '1', 10);

      if (Object.keys(savedForm).length > 0) {
        // Ensure tyres array is properly initialized when loading from saved data
        const loadedTyres = savedForm.tyres || [];
        const defaultTyres = [
          createEmptyTyre('Front Left'),
          createEmptyTyre('Front Right'),
          createEmptyTyre('Rear Left'),
          createEmptyTyre('Rear Right')
        ];
        // Merge loaded tyres with default structure to ensure all 4 positions exist
        const mergedTyres = defaultTyres.map((defaultTyre, index) => ({
          ...defaultTyre,
          ...(loadedTyres[index] || {}) // Overlay saved data if it exists
        }));

        setForm({ ...savedForm, tyres: mergedTyres }); // Corrected typo here
       // setMessage('Appraisal data loaded from auto-save.'); // Uncomment for user feedback
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`currentAppraisalForm_${user.username}`, JSON.stringify(form));
      localStorage.setItem(`currentExteriorFaults_${user.username}`, JSON.stringify(exteriorFaults));
      localStorage.setItem(`currentInteriorFaults_${user.username}`, JSON.stringify(interiorFaults));
      localStorage.setItem(`currentAppraisalStep_${user.username}`, currentStep.toString());
    }
  }, [form, exteriorFaults, interiorFaults, currentStep, user]);

  // Clear message when activeSection changes
  useEffect(() => {
    setMessage('');
  }, [activeSection]);

  useEffect(() => {
    const staff = JSON.parse(localStorage.getItem('loggedInStaff'));
    if (!staff) return navigate('/staff-login');
    setUser(staff);
    const saved = JSON.parse(localStorage.getItem(`appraisals_${staff.username}`) || '[]');
    setAppraisals(saved);
  }, [navigate]);

  // Effect to load and convert static images to base64 once
  useEffect(() => {
    const loadStaticImages = async () => {
      try {
        // Fetch exterior image and convert to base64
        const extResponse = await fetch(exteriorSummaryImage);
        const extBlob = await extResponse.blob();
        const extBase64 = await toBase64(extBlob);
        setExteriorSummaryImageBase64(extBase64);

        // Fetch interior image and convert to base64
        const intResponse = await fetch(interiorSummaryImage);
        const intBlob = await intResponse.blob();
        const intBase64 = await toBase64(intBlob);
        setInteriorSummaryImageBase64(intBase64);

      } catch (error) {
        console.error("Error loading static summary images:", error);
      }
    };

    loadStaticImages();
  }, []); // Run once on component mount

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Helper function to start a new appraisal by resetting all relevant state
  const startNewAppraisal = () => {
    setForm(initialForm); // Reset the form to its initial empty state
    setExteriorFaults([]); // Clear all exterior faults
    setInteriorFaults([]); // Clear all interior faults
    setEditFaultIndex(null); // Clear any fault being edited
    setCurrentStep(1); // Go back to the first step of the appraisal process
    setActiveSection('start'); // Ensure the 'start' section is active

    // Clear auto-saved data from localStorage for the current user
    if (user) {
      localStorage.removeItem(`currentAppraisalForm_${user.username}`);
      localStorage.removeItem(`currentExteriorFaults_${user.username}`);
      localStorage.removeItem(`currentInteriorFaults_${user.username}`);
      localStorage.removeItem(`currentAppraisalStep_${user.username}`);
    }
    setMessage(''); // Clear any previous messages displayed
  };

  const handleFindVehicle = async () => {
    const reg = form.reg.toUpperCase();
    if (!reg) {
      setMessage('Please enter a registration number.');
      return;
    }
    setLoadingVehicle(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: reg })
      });
      if (!res.ok) throw new Error('Vehicle not found');
      const data = await res.json();
      setForm(prev => ({
        ...prev,
        make: data.make || '',
        model: data.model || data.variant || '',
        colour: data.colour || '',
        vin: data.vin || data.vehicleIdentificationNumber || '',
        transmission: data.transmission || data.typeApproval || '',
        mileage: data.mileage || '',
        fuelType: data.fuelType || '',
        engineSize: data.engineCapacity ? `${data.engineCapacity}cc` : '',
        co2: data.co2Emissions ? `${data.co2Emissions} g/km` : '',
        euroStatus: data.euroStatus || '',
        regDate: data.dateOfFirstRegistration || '',
        artEndDate: data.artEndDate || '',
        motStatus: data.motStatus || '',
        revenueWeight: data.revenueWeight || '',
        taxDueDate: data.taxDueDate || '',
        taxStatus: data.taxStatus || '',
        wheelplan: data.wheelplan || '',
        yearOfManufacture: data.yearOfManufacture || '',
        dateOfLastV5CIssued: data.dateOfLastV5CIssued || ''
      }));
      setMessage('Vehicle details fetched successfully!');
      nextStep();
    } catch (err) {
      setMessage('Vehicle not found or API error. Please enter details manually.');
      setForm(prev => ({ ...prev, vin: '' }));
    } finally {
      setLoadingVehicle(false);
    }
  };

  const handleAddFault = async (fault, type) => {
    if (fault.photo && fault.photo instanceof File) {
      fault.photo = await compressImage(await toBase64(fault.photo));
    }

    // Assign a unique index to the fault
    const totalFaults = exteriorFaults.length + interiorFaults.length;
    const faultWithIdx = { ...fault, idx: totalFaults + 1 };

    if (type === 'exterior') {
      if (editFaultIndex !== null) {
        const updated = [...exteriorFaults];
        updated[editFaultIndex] = faultWithIdx; // Use faultWithIdx
        setExteriorFaults(updated);
        setEditFaultIndex(null);
      } else {
        setExteriorFaults(prev => [...prev, faultWithIdx]); // Use faultWithIdx
      }
    } else if (type === 'interior') {
      if (editFaultIndex !== null) {
        const updated = [...interiorFaults];
        updated[editFaultIndex] = faultWithIdx; // Use faultWithIdx
        setInteriorFaults(updated);
        setEditFaultIndex(null);
      } else {
        setInteriorFaults(prev => [...prev, faultWithIdx]); // Use faultWithIdx
      }
    }
    setMessage(`Fault added: ${fault.part} - ${fault.damage}`);
  };

  const handleDeleteFault = (index, type) => {
    if (type === 'exterior') {
      const updated = [...exteriorFaults];
      updated.splice(index, 1);
      // Re-index remaining faults
      const reIndexed = updated.map((f, i) => ({ ...f, idx: i + 1 }));
      setExteriorFaults(reIndexed);
    } else if (type === 'interior') {
      const updated = [...interiorFaults];
      updated.splice(index, 1);
      // Re-index remaining faults
      const reIndexed = updated.map((f, i) => ({ ...f, idx: i + 1 }));
      setInteriorFaults(reIndexed);
    }
    setMessage('Fault deleted.');
  };

  const handleEditFault = (index, type) => {
    if (type === 'exterior') {
      setEditFaultIndex(index);
      setMessage(`Editing exterior fault at index ${index}`);
    } else if (type === 'interior') {
      setEditFaultIndex(index);
      setMessage(`Editing interior fault at index ${index}`);
    }
  };

  const handleFinalSubmit = () => {
    const newAppraisal = {
      ...form,
      reg: form.reg.toUpperCase(),
      vehicle: `${form.make} ${form.model}`.trim(),
      date: new Date().toLocaleDateString(),
      submittedBy: `${user.firstName} ${user.lastName}`,
      faults: {
        exterior: exteriorFaults,
        interior: interiorFaults
      },
    };

    const updated = editFaultIndex !== null
      ? appraisals.map((a, i) => i === editFaultIndex ? newAppraisal : a)
      : [...appraisals, newAppraisal];

    localStorage.setItem(`appraisals_${user.username}`, JSON.stringify(updated));
    setAppraisals(updated);

    // Clear current appraisal data after submission
    localStorage.removeItem(`currentAppraisalForm_${user.username}`);
    localStorage.removeItem(`currentExteriorFaults_${user.username}`);
    localStorage.removeItem(`currentInteriorFaults_${user.username}`);
    localStorage.removeItem(`currentAppraisalStep_${user.username}`);

    setForm(initialForm); // Reset form to initial state
    setExteriorFaults([]);
    setInteriorFaults([]);
    setCurrentStep(1);
    setMessage('✅ Appraisal submitted successfully!');
    setActiveSection('submitted');
  };

 // Smaller numbered pin for PDF (both exterior & interior)
const drawPin = (
  doc, xPx, yPx, number,
  imgX, imgY, imgW, imgH,
  originalW, originalH
) => {
  // map original-pixel coords -> PDF coords
  const scaleX = imgW / originalW;
  const scaleY = imgH / originalH;
  const px = imgX + xPx * scaleX;
  const py = imgY + yPx * scaleY;

  // ↓↓↓ smaller sizes
  const outerR = 2.0;    // was 3
  const innerR = 0.8;    // was 1.2

  doc.setFillColor(17, 17, 17);
  doc.circle(px, py, innerR, 'F');
  doc.circle(px, py, outerR, 'F');

  // smaller number text
  doc.setFontSize(4.5);  // was 5.5
  doc.setTextColor(255, 255, 255);
  doc.text(String(number), px, py + 1.0, { align: 'center' }); // was +1.5
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
          f.idx || (i + 1), f.part || '', f.damage || '', f.detail || '', f.note || '' // Use f.idx
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
          f.idx || (i + 1), f.part || '', f.damage || '', f.detail || '', f.note || '' // Use f.idx
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

    // Ensure data.tyres is an array before mapping
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

    // Removed signature section from PDF

    // --- Exterior Condition Summary ---
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(255);
    doc.setFillColor(0, 160, 170);
    doc.rect(5, 15, 200, 10, 'F');
    doc.text("Exterior Condition Summary", 10, 22);

    try {
      const imgWidth = 100; // Width of the image in PDF
      const imgHeight = 70; // Height of the image in PDF
      const imgX = 5;
      const imgY = 30;

      // Use the base64 version of the exterior image
      if (exteriorSummaryImageBase64) {
        doc.addImage(exteriorSummaryImageBase64, 'PNG', imgX, imgY, imgWidth, imgHeight);
      } else {
        console.warn("Exterior summary image base64 is NULL. Image not added to PDF.");
        doc.setFontSize(11);
        doc.setTextColor(255, 0, 0);
        doc.text("Exterior summary image not available (base64 null).", 5, 40);
      }

      const originalImageWidth = 1332; // Original intrinsic width of exterior.png
      const originalImageHeight = 733; // Original intrinsic height of exterior.png

      // Scale and plot each exterior fault that has coords and idx
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

      // Right-side legend for exterior faults
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
          faultTextY += 5; // Reduced line height for legend
        });
      });

    } catch (e) {
      console.error("Error during exterior summary image processing in PDF:", e);
      doc.setFontSize(11);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error processing exterior image: ${e.message}`, 5, 40);
    }

    // --- Interior Condition Summary ---
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(255);
    doc.setFillColor(0, 160, 170);
    doc.rect(5, 15, 200, 10, 'F');
    doc.text("Interior Condition Summary", 10, 22);

    try {
      const imgWidth = 100; // Width of the image in PDF
      const imgHeight = 70; // Height of the image in PDF
      const imgX = 5;
      const imgY = 30;

      // Use the base64 version of the interior image
      if (interiorSummaryImageBase64) {
        doc.addImage(interiorSummaryImageBase64, 'PNG', imgX, imgY, imgWidth, imgHeight);
      } else {
        console.warn("Interior summary image base64 is NULL. Image not added to PDF.");
        doc.setFontSize(11);
        doc.setTextColor(255, 0, 0);
        doc.text("Interior summary image not available (base64 null).", 5, 40);
      }

      const originalImageWidth = 1153; // Original intrinsic width of interior.png
      const originalImageHeight = 718; // Original intrinsic height of interior.png

      // Scale and plot each interior fault that has coords and idx
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

      // Right-side legend for interior faults
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
          faultTextY += 5; // Reduced line height for legend
        });
      });

    } catch (e) {
      console.error("Error during interior summary image processing in PDF:", e);
      doc.setFontSize(11);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error processing interior image: ${e.message}`, 5, 40);
    }

    // --- All Fault Photos ---
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
          const captionTitle = doc.splitTextToSize(`${fault.idx}) ${fault.part}`, photoParams.photoWidth); // Added idx
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

  const deleteAppraisal = (i) => {
    if (!window.confirm('Are you sure you want to delete this appraisal?')) return;
    const updated = [...appraisals];
    updated.splice(i, 1);
    localStorage.setItem(`appraisals_${user.username}`, JSON.stringify(updated));
    setAppraisals(updated);
    setMessage('✅ Appraisal deleted successfully!');
  };

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setMessage('Please enter a search keyword.');
      setSearchResults([]);
      return;
    }
    const results = appraisals.filter(a =>
      a.reg.toLowerCase().includes(query) ||
      (a.make + ' ' + a.model).toLowerCase().includes(query) ||
      (a.ownerName || '').toLowerCase().includes(query)
    );
    setSearchResults(results);
    setMessage(`Found ${results.length} results.`);
  };

  const totalSteps = 7;

  // time-based greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Weather state (current)
  const [weather, setWeather] = useState({
    loading: true,
    location: '—',
    tempC: null,
    desc: '—',
    icon: '⛅', // Default emoji icon
    lottieAnim: null // To store the Lottie animation data
  });

  // Map WMO weather codes -> text + emoji + Lottie animation data
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
    return map[code] || ['Weather', '🌡️', null]; // Default if code not found
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

    // Try browser location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          getWeather(latitude, longitude, 'Your location');
        },
        () => {
          // Fallback: Hayes, UK
          getWeather(51.510, -0.420, 'HAYES');
        },
        { timeout: 5000 }
      );
    } else {
      getWeather(51.510, -0.420, 'HAYES');
    }
  }, []);


  return user && (
    <div className="staff-dashboard">
      <header>
        <div className="header-left">
          <h1>Heston Inspect</h1>
          <small>Staff Portal</small>
        </div>
        <div className="header-right">
          <span>Welcome, {user.firstName} {user.lastName}</span>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem("loggedInStaff");
            navigate("/");
          }}>Logout</button>
        </div>
      </header>

      <div className="main-layout">
        <div className="sidebar">
          <div
            className={`sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <FaHome className="sidebar-icon" />
            <span>Dashboard</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'start' ? 'active' : ''}`}
            onClick={startNewAppraisal}
          >
            <FaPlusCircle className="sidebar-icon" />
            <span>New Appraisal</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'submitted' ? 'active' : ''}`}
            onClick={() => setActiveSection('submitted')}
          >
            <FaClipboardList className="sidebar-icon" />
            <span>Submitted Appraisals</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'search' ? 'active' : ''}`}
            onClick={() => setActiveSection('search')}
          >
            <FaSearch className="sidebar-icon" />
            <span>Search Appraisals</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveSection('upload')}
          >
            <FaUpload className="sidebar-icon" />
            <span>Upload Documents</span>
          </div>
        </div>

        <div className="content-area">
          {message && <p className={`appraisal-message ${message.startsWith('✅') ? 'success' : message.startsWith('❌') ? 'error' : ''}`}>{message}</p>}

          {activeSection === 'dashboard' && (
            <section className="content-section">
              {/* NEW: Top Greeting / Summary strip */}
              <div className="dashboard-hero">
                <div className="hero-left">
                  <h1 className="hero-title">{getGreeting()}, {user.firstName}.</h1>
                  <p className="hero-sub">Have a productive shift.</p>
                </div>

                <div className="hero-right">
                  <div className="weather-card">
                    <div className="weather-loc">{weather.location}</div>
                    <div className="weather-row">
                      {/* Conditional rendering for Lottie or CSS animated emoji */}
                      {weather.lottieAnim ? (
                        <Lottie
                          animationData={weather.lottieAnim}
                          style={{ width: 40, height: 40 }}
                          loop={true}
                        />
                      ) : (
                        <span className={`weather-icon ${weather.icon === '☀️' ? 'sun' : (weather.icon === '☁️' || weather.icon === '⛅' || weather.icon === '🌤️') ? 'cloud' : ''}`}>
                          {weather.icon}
                        </span>
                      )}
                      <div className="weather-temp">
                        {weather.loading ? '—' : `${weather.tempC}°C`}
                      </div>
                    </div>
                    <div className="weather-desc">{weather.loading ? 'Loading…' : weather.desc}</div>
                  </div>
                </div>
              </div>

              <h2>Dashboard Overview</h2>
              <div className="dashboard-grid">
                <div className="dashboard-card" onClick={startNewAppraisal}> {/* Changed onClick to call startNewAppraisal */}
                  <FaPlusCircle className="icon" /><h3>New Appraisal</h3>
                </div>
                <div className="dashboard-card" onClick={() => setActiveSection('submitted')}>
                  <FaClipboardList className="icon" /><h3>Submitted Appraisals</h3>
                </div>
                <div className="dashboard-card" onClick={() => setActiveSection('search')}>
                  <FaSearch className="icon" /><h3>Search Appraisals</h3>
                </div>
                <div className="dashboard-card" onClick={() => setActiveSection('upload')}>
                  <FaUpload className="icon" /><h3>Upload Documents</h3>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'start' && (
            <section className="content-section">
              <h2>{editFaultIndex !== null ? 'Edit Vehicle Appraisal' : 'New Vehicle Appraisal'}</h2>
              <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

              {/* Step 1 – Vehicle Lookup & Owner Details */}
              {currentStep === 1 && (
                <>
                  <h3>Step 1: Vehicle Lookup & Owner Details</h3>
                  <div className="form-grid">
                    <div>
                      <label htmlFor="reg">Registration Number:</label>
                      <input
                        id="reg"
                        placeholder="Enter Registration"
                        value={form.reg}
                        onChange={e => setForm({ ...form, reg: e.target.value })}
                        required
                      />
                      <button className="btn" onClick={handleFindVehicle} disabled={loadingVehicle}>
                        {loadingVehicle ? <><FaSpinner className="spinner" /> Finding...</> : 'Find Vehicle'}
                      </button>
                    </div>
                    <div>
                      <label htmlFor="vin">VIN (Auto-filled or Manual):</label>
                      <input
                        id="vin"
                        placeholder="VIN"
                        value={form.vin}
                        onChange={e => setForm({ ...form, vin: e.target.value })}
                        readOnly={loadingVehicle}
                      />
                      <label htmlFor="ownerName">Owner Name (Optional):</label>
                      <input
                        id="ownerName"
                        placeholder="Owner Name"
                        value={form.ownerName}
                        onChange={e => setForm({ ...form, ownerName: e.target.value })}
                      />
                      <label htmlFor="ownerContact">Owner Contact (Optional):</label>
                      <input
                        id="ownerContact"
                        placeholder="Owner Contact"
                        value={form.ownerContact}
                        onChange={e => setForm({ ...form, ownerContact: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="step-navigation">
                    <button className="btn" onClick={nextStep}>Next Step</button>
                  </div>
                </>
              )}

              {/* Step 2 – Vehicle Details Confirmation & Condition Overview */}
              {currentStep === 2 && (
                <>
                  <h3>Step 2: Vehicle Details & Condition Overview</h3>
                  <div className="form-grid">
                    <div>
                      <label htmlFor="vehiclePhoto">Vehicle Photo (Thumbnail):</label>
                      {form.vehiclePhoto && <img src={form.vehiclePhoto} alt="Vehicle Thumbnail" className="vehicle-thumbnail" />}
                      <input
                        type="file"
                        id="vehiclePhoto"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files[0]) {
                            const base64 = await toBase64(e.target.files[0]);
                            const compressed = await compressImage(base64, 300, 200, 0.7);
                            setForm({ ...form, vehiclePhoto: compressed });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label>Overall Vehicle Grade:</label>
                      <select value={form.overallGrade} onChange={e => setForm({ ...form, overallGrade: e.target.value })}>
                        <option value="">Select Grade</option>
                        <option value="A">A - Excellent</option>
                        <option value="B">B - Good</option>
                        <option value="C">C - Fair</option>
                        <option value="D">D - Poor</option>
                      </select>

                      <label>Condition Meter:</label>
                      <div className="condition-meter-container">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={form.conditionMeter}
                          onChange={e => setForm({ ...form, conditionMeter: e.target.value })}
                          className="condition-meter-slider"
                        />
                        <span className="condition-meter-value">{form.conditionMeter}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="vehicle-info-grid">
                    {[
                      ['Make', 'make'], ['Model', 'model'], ['Year', 'year'], ['Colour', 'colour'],
                      ['Transmission', 'transmission'], ['Mileage', 'mileage'], ['Fuel Type', 'fuelType'],
                      ['Engine Size (cc)', 'engineSize'], ['CO2 Emissions', 'co2'], ['Euro Status', 'euroStatus'],
                      ['Reg Date', 'regDate'], ['Art End Date', 'artEndDate'], ['MOT Status', 'motStatus'],
                      ['Revenue Weight', 'revenueWeight'], ['Tax Due Date', 'taxDueDate'], ['Tax Status', 'taxStatus'],
                      ['Wheelplan', 'wheelplan'], ['Date of Last V5C Issued', 'dateOfLastV5CIssued'],
                    ].map(([labelText, key]) => (
                      <div key={key} className="input-with-lock">
                        <label>{labelText}</label>
                        <input
                          value={form[key]}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                        />
                        {/* <FaLock className="lock-icon" /> */}
                      </div>
                    ))}
                  </div>
                  <div className="step-navigation">
                    <button className="btn" onClick={prevStep}>Previous</button>
                    <button className="btn" onClick={nextStep}>Next Step</button>
                  </div>
                </>
              )}

              {/* Step 3 – Exterior Inspection */}
              {currentStep === 3 && (
                <>
                  <h3>Step 3: Exterior Inspection ({exteriorFaults.length} faults recorded)</h3>
                  <p className="mapping-subtext">Click on the vehicle part to record a fault.</p>
                  <ExteriorMap
                    onPartSelect={(fault) => handleAddFault(fault, 'exterior')}
                    faults={exteriorFaults} // Pass faults to render markers
                  />
                  <h4>Exterior Faults List</h4>
                  <FaultTable
                    faults={exteriorFaults}
                    onEdit={(index) => handleEditFault(index, 'exterior')}
                    onDelete={(index) => handleDeleteFault(index, 'exterior')}
                  />
                  <button className="btn" onClick={() => { setExteriorFaults([]); setMessage('No exterior faults recorded.'); nextStep(); }}>No Exterior Faults</button>
                  <div className="step-navigation">
                    <button className="btn" onClick={prevStep}>Previous</button>
                    <button className="btn" onClick={nextStep}>Next Step</button>
                  </div>
                </>
              )}

              {/* Step 4 – Interior Inspection */}
              {currentStep === 4 && (
                <>
                  <h3>Step 4: Interior Inspection ({interiorFaults.length} faults recorded)</h3>
                  <p className="mapping-subtext">Click on the interior part to record a fault.</p>

                  <InteriorMap
                    onPartSelect={(fault) => handleAddFault(fault, 'interior')}
                    faults={interiorFaults} // Pass faults to render markers
                  />
                  <h4>Interior Faults List</h4>
                  <FaultTable
                    faults={interiorFaults}
                    onEdit={(index) => handleEditFault(index, 'interior')}
                    onDelete={(index) => handleDeleteFault(index, 'interior')}
                  />
                  <button className="btn" onClick={() => { setInteriorFaults([]); setMessage('No interior faults recorded.'); nextStep(); }}>No Interior Faults</button>
                  <div className="step-navigation">
                    <button className="btn" onClick={prevStep}>Previous</button>
                    <button className="btn" onClick={nextStep}>Next Step</button>
                  </div>
                </>
              )}

              {/* Step 5 – Tyres, Wheels & Mechanical Check */}
              {currentStep === 5 && (
                <>
                  <h3>Step 5: Tyres, Wheels & Mechanical Check</h3>
                  <div className="form-grid">
                    {['Front Left', 'Front Right', 'Rear Left', 'Rear Right'].map((pos, index) => (
                      <div key={pos} className="tyre-check-group">
                        <h4>{pos}</h4>
                        <label>Tread Depth (mm):</label>
                        <select
                          value={form.tyres[index].treadDepth || ''} // Access directly, as it's initialized
                          onChange={(e) => {
                            const newTyres = [...form.tyres];
                            newTyres[index] = { ...newTyres[index], position: pos, treadDepth: e.target.value };
                            setForm({ ...form, tyres: newTyres });
                          }}
                        >
                          <option value="">Select</option>
                          <option value="1.6">1.6mm (Legal Min)</option>
                          <option value="3">3mm</option>
                          <option value="4">4mm</option>
                          <option value="5">5mm</option>
                          <option value="6">6mm</option>
                          <option value="7">7mm</option>
                          <option value="8">8mm (New)</option>
                        </select>
                        <label>Wheel Condition:</label>
                        <input
                          placeholder="e.g., Scratches, Dents"
                          value={form.tyres[index].condition || ''} // Access directly
                          onChange={(e) => {
                            const newTyres = [...form.tyres];
                            newTyres[index] = { ...newTyres[index], position: pos, condition: e.target.value };
                            setForm({ ...form, tyres: newTyres });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <h4>Lights, Mirrors, Wipers Check</h4>
                  <div className="checklist-group">
                    <label>
                      <input type="checkbox" checked={form.lightsCheck} onChange={e => setForm({ ...form, lightsCheck: e.target.checked })} />
                      Lights (Pass/Fail)
                    </label>
                    <label>
                      <input type="checkbox" checked={form.mirrorsCheck} onChange={e => setForm({ ...form, mirrorsCheck: e.target.checked })} />
                      Mirrors (Pass/Fail)
                    </label>
                    <label>
                      <input type="checkbox" checked={form.wipersCheck} onChange={e => setForm({ ...form, wipersCheck: e.target.checked })} />
                      Wipers (Pass/Fail)
                    </label>
                  </div>
                  <div className="step-navigation">
                    <button className="btn" onClick={prevStep}>Previous</button>
                    <button className="btn" onClick={nextStep}>Next Step</button>
                  </div>
                </>
              )}

              {/* Step 6 – Test Drive & Performance Notes */}
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

              {/* Step 7 – Summary & Sign-off */}
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
            </section>
          )}

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
                              setExteriorFaults(a.faults.exterior || []);
                              setInteriorFaults(a.faults.interior || []);
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
                          <td>{a.submittedBy}</td>
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
