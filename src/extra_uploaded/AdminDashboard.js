import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFileAlt, FaUserPlus, FaUsers, FaHome, FaCog, FaChartBar } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminDashboard.css'; // Import the CSS file

// Helper: fetch an asset URL and convert to base64 (PNG)
const toBase64FromUrl = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Smaller numbered pin for PDF (both exterior & interior)
const drawPin = (
  doc, xPx, yPx, number,
  imgX, imgY, imgW, imgH,
  originalW, originalH
) => {
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
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Heston Inspect - Vehicle Appraisal Report", 105, 20, { align: "center" });
  doc.setLineWidth(0.8);
  doc.line(15, 24, 195, 24);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Registration: ${data.reg || ''}`, 15, 30);
  doc.text(`Date: ${data.date || ''}`, 195, 30, { align: "right" });

  // Vehicle info
  let currentY = 40;
  doc.setFontSize(15);
  doc.setTextColor(0, 51, 102);
  doc.text("Vehicle Information", 15, currentY + 7);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    head: [['Field', 'Value', 'Field', 'Value']],
    body: [
      ['Make', data.make || '', 'Model', data.model || ''],
      ['VIN', data.vin || '', 'Colour', data.colour || ''],
      ['Transmission', data.transmission || '', 'Mileage', data.mileage || ''],
      ['Fuel Type', data.fuelType || '', 'Engine Size', data.engineSize || ''],
      ['CO2 Emissions', data.co2 || '', 'Euro Status', data.euroStatus || ''],
      ['Reg Date', data.regDate || '', 'Art End Date', data.artEndDate || ''],
      ['MOT Status', data.motStatus || '', 'Revenue Weight', data.revenueWeight || ''],
      ['Tax Due Date', data.taxDueDate || '', 'Tax Status', data.taxStatus || ''],
      ['Wheelplan', data.wheelplan || '', 'Year Of Manufacture', data.yearOfManufacture || ''],
      ['Date of Last V5C Issued', data.dateOfLastV5CIssued || '', '', '']
    ],
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 15, right: 15 }
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // Exterior faults table
  doc.setFontSize(15);
  doc.setTextColor(0, 51, 102);
  doc.text("Exterior Faults", 15, currentY);
  currentY += 7;

  const ext = (data.faults && data.faults.exterior) ? data.faults.exterior : [];
  if (!ext.length) {
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("No exterior faults reported.", 20, currentY + 6);
    currentY += 15;
  } else {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Part', 'Damage', 'Detail', 'Note']],
      body: ext.map((f, i) => [f.idx || (i + 1), f.part || '', f.damage || '', f.detail || '', f.note || '']),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 174, 0], textColor: 0 },
      columnStyles: { 4: { cellWidth: 40 } },
      margin: { left: 15, right: 15 }
    });
    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Interior faults table
  doc.setFontSize(15);
  doc.setTextColor(0, 51, 102);
  doc.text("Interior Faults", 15, currentY);
  currentY += 7;

  const intr = (data.faults && data.faults.interior) ? data.faults.interior : [];
  if (!intr.length) {
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("No interior faults reported.", 20, currentY + 6);
    currentY += 15;
  } else {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Part', 'Damage', 'Detail', 'Note']],
      body: intr.map((f, i) => [f.idx || (i + 1), f.part || '', f.damage || '', f.detail || '', f.note || '']),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 174, 0], textColor: 0 },
      columnStyles: { 4: { cellWidth: 40 } },
      margin: { left: 15, right: 15 }
    });
    currentY = doc.lastAutoTable.finalY + 15;
  }

  // --- Exterior Summary (with pins) ---
  doc.addPage();
  doc.setFontSize(12);
  doc.setTextColor(255);
  doc.setFillColor(0, 160, 170);
  doc.rect(15, 15, 180, 10, 'F');
  doc.text("Exterior Condition Summary", 20, 22);

  try {
    // staff me jo images use ho rahi hain: exterior.png / interior.png
    const exteriorBase64 = await toBase64FromUrl(new URL('../assets/exterior.png', import.meta.url));
    const imgX = 15, imgY = 30, imgW = 100, imgH = 70;
    doc.addImage(exteriorBase64, 'PNG', imgX, imgY, imgW, imgH);

    const originalW = 1332, originalH = 733; // Exterior image intrinsic size (same as Staff)
    ext.forEach((f) => {
      if (f.coords && f.idx) {
        drawPin(doc, f.coords.x, f.coords.y, f.idx, imgX, imgY, imgW, imgH, originalW, originalH);
      }
    });

    // Legend on right
    const textStartX = 120;
    const textMaxWidth = 80;
    let y = 35;
    doc.setFontSize(10);
    doc.setTextColor(0);
    ext.forEach(f => {
      const lines = doc.splitTextToSize(`${f.idx}) ${f.part}; ${f.damage}; ${f.detail}`, textMaxWidth);
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, textStartX, y);
        y += 5;
      });
    });
  } catch (e) {
    doc.setFontSize(11);
    doc.setTextColor(255, 0, 0);
    doc.text("Exterior summary image failed.", 20, 40);
  }

  // --- Interior Summary (with pins) ---
  doc.addPage();
  doc.setFontSize(12);
  doc.setTextColor(255);
  doc.setFillColor(0, 160, 170);
  doc.rect(15, 15, 180, 10, 'F');
  doc.text("Interior Condition Summary", 20, 22);

  try {
    const interiorBase64 = await toBase64FromUrl(new URL('../assets/interior.png', import.meta.url));
    const imgX = 15, imgY = 30, imgW = 100, imgH = 70;
    doc.addImage(interiorBase64, 'PNG', imgX, imgY, imgW, imgH);

    const originalW = 1153, originalH = 718; // Interior image intrinsic size (same as Staff)
    intr.forEach((f) => {
      if (f.coords && f.idx) {
        drawPin(doc, f.coords.x, f.coords.y, f.idx, imgX, imgY, imgW, imgH, originalW, originalH);
      }
    });

    const textStartX = 120;
    const textMaxWidth = 80;
    let y = 35;
    doc.setFontSize(10);
    doc.setTextColor(0);
    intr.forEach(f => {
      const lines = doc.splitTextToSize(`${f.idx}) ${f.part}; ${f.damage}; ${f.detail}`, textMaxWidth);
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, textStartX, y);
        y += 5;
      });
    });
  } catch (e) {
    doc.setFontSize(11);
    doc.setTextColor(255, 0, 0);
    doc.text("Interior summary image failed.", 20, 40);
  }

  // --- All Fault Photos (reuse Admin ka MIME detection logic) ---
  doc.addPage();
  doc.setFontSize(15);
  doc.setTextColor(0, 51, 102);
  doc.text("All Fault Photos", 15, 20);

  const photoParams = { startX: 15, startY: 30, photoWidth: 85, photoHeight: 60, spacingX: 10, spacingY: 15, maxHeight: doc.internal.pageSize.height - 30 };
  let { startX, startY } = photoParams;

  [...ext, ...intr].filter(f => f.photo).forEach(fault => {
    if (startY + photoParams.photoHeight > photoParams.maxHeight) { doc.addPage(); startY = 20; startX = photoParams.startX; }
    if (startX + photoParams.photoWidth > 190) { startX = photoParams.startX; startY += photoParams.photoHeight + photoParams.spacingY; }

    try {
      const base64 = fault.photo;
      const mime = base64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
      let type = mime && mime[1] ? mime[1].toUpperCase() : 'JPEG';
      if (type === 'SVG+XML') type = 'SVG';
      else if (type === 'PNG') type = 'PNG';
      else if (type !== 'JPEG' && type !== 'JPG') type = 'JPEG';
      doc.addImage(base64, type, startX, startY, photoParams.photoWidth, photoParams.photoHeight);

      // captions
      doc.setFontSize(9);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      const title = doc.splitTextToSize(`${fault.idx || ''}) ${fault.part}`, photoParams.photoWidth);
      const details = doc.splitTextToSize(`${fault.damage} - ${fault.detail}`, photoParams.photoWidth);
      title.forEach((line, i) => doc.text(line, startX, startY + photoParams.photoHeight + 5 + (i * 5)));
      doc.setFont("helvetica", "normal");
      details.forEach((line, i) => doc.text(line, startX, startY + photoParams.photoHeight + 5 + (title.length * 5) + (i * 5)));
    } catch {
      doc.setFontSize(9);
      doc.setTextColor(255, 0, 0);
      doc.text(`[Image Error: ${fault.part}]`, startX, startY);
    }
    startX += photoParams.photoWidth + photoParams.spacingX;
  });

  doc.save(`${data.reg}_report.pdf`);
};


const AdminDashboard = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [activeSection, setActiveSection] = useState('dashboard'); // Default to dashboard
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [allAppraisals, setAllAppraisals] = useState([]);

  useEffect(() => {
    loadStaff();
    loadAppraisals();
  }, []);

  const loadStaff = () => {
    const data = JSON.parse(localStorage.getItem('allStaff') || '[]');
    setStaffList(data);
  };

  const loadAppraisals = () => {
    const allStaff = JSON.parse(localStorage.getItem('allStaff') || '[]');
    let combined = [];
    allStaff.forEach(staff => {
      const appraisals = JSON.parse(localStorage.getItem(`appraisals_${staff.username}`) || '[]');
      appraisals.forEach(a => combined.push({ ...a, submittedBy: `${staff.firstName} ${staff.lastName}` }));
    });
    setAllAppraisals(combined);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = [...staffList, form];
    localStorage.setItem('allStaff', JSON.stringify(updated));
    setMessage(`✅ Staff "${form.username}" created.`);
    setForm({ firstName: '', lastName: '', username: '', email: '', password: '' });
    loadStaff();
    setActiveSection('registered');
  };

  const handleEdit = (index) => {
    const selected = staffList[index];
    setForm(selected);
    const updatedList = staffList.filter((_, i) => i !== index);
    localStorage.setItem('allStaff', JSON.stringify(updatedList));
    loadStaff();
    setActiveSection('create');
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      const updated = [...staffList];
      updated.splice(index, 1);
      localStorage.setItem('allStaff', JSON.stringify(updated));
      loadStaff();
      setMessage(`❌ Staff deleted successfully.`);
    }
  };

  return (
    <div className="admin-dashboard">
      <header>
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <small>Management Portal</small>
        </div>
        <div className="header-right">
          <span>Welcome, Admin</span> {/* You can add dynamic admin name here */}
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem("loggedInAdmin"); // Assuming you have an admin login state
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
            className={`sidebar-item ${activeSection === 'appraisals' ? 'active' : ''}`}
            onClick={() => setActiveSection('appraisals')}
          >
            <FaFileAlt className="sidebar-icon" />
            <span>Appraisals</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'create' ? 'active' : ''}`}
            onClick={() => setActiveSection('create')}
          >
            <FaUserPlus className="sidebar-icon" />
            <span>Create Staff</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveSection('registered')}
          >
            <FaUsers className="sidebar-icon" />
            <span>Registered Staff</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <FaCog className="sidebar-icon" />
            <span>Settings</span>
          </div>
          <div
            className={`sidebar-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveSection('reports')}
          >
            <FaChartBar className="sidebar-icon" />
            <span>Reports</span>
          </div>
        </div>

        <div className="content-area">
          {activeSection === 'dashboard' && (
            <section className="content-section">
              <h2>Dashboard Overview</h2>
              <div className="dashboard-grid">
                <div className="dashboard-card" onClick={() => setActiveSection('appraisals')}>
                  <FaFileAlt className="icon" />
                  <h3>Appraisals</h3>
                  <p>View and manage vehicle appraisals</p>
                </div>
                <div className="dashboard-card" onClick={() => setActiveSection('create')}>
                  <FaUserPlus className="icon" />
                  <h3>Create Staff</h3>
                  <p>Add new staff member</p>
                </div>
                <div className="dashboard-card" onClick={() => setActiveSection('registered')}>
                  <FaUsers className="icon" />
                  <h3>Registered Staff</h3>
                  <p>Manage staff accounts</p>
                </div>
                <div className="dashboard-card" onClick={() => setActiveSection('reports')}>
                  <FaChartBar className="icon" />
                  <h3>Reports</h3>
                  <p>Generate and view reports</p>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'appraisals' && (
            <section className="content-section">
              <h2>All Submitted Appraisals</h2>
              <div className="table-wrapper"> {/* Added wrapper for responsiveness */}
                <table>
                  <thead>
                    <tr>
                      <th>Reg</th>
                      <th>Vehicle</th>
                      <th>Date</th>
                      <th>Submitted By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAppraisals.length === 0 ? (
                      <tr><td colSpan="5">No appraisals found.</td></tr>
                    ) : (
                      allAppraisals.map((a, i) => (
                        <tr key={i}>
                          <td>{a.reg}</td>
                          <td>{a.vehicle}</td>
                          <td>{a.date}</td>
                          <td>{a.submittedBy}</td>
                          <td>
                            <button className="btn" onClick={() => generatePDF(a)}>PDF</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'create' && (
            <section className="content-section">
              <h2>Create New Staff</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input type="text" placeholder="First Name" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  <input type="text" placeholder="Last Name" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Username" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                  <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <button type="submit" className="btn">Create Staff</button>
              </form>
              {message && <p className="msg">{message}</p>}
            </section>
          )}

          {activeSection === 'registered' && (
            <section className="content-section">
              <h2>Registered Staff</h2>
              <div className="table-wrapper"> {/* Added wrapper for responsiveness */}
                <table>
                  <thead>
                    <tr><th>Name</th><th>Username</th><th>Email</th><th>Password</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {staffList.length === 0 ? (
                      <tr><td colSpan="5">No staff found.</td></tr>
                    ) : (
                      staffList.map((staff, index) => (
                        <tr key={index}>
                          <td>{staff.firstName} {staff.lastName}</td>
                          <td>{staff.username}</td>
                          <td>{staff.email}</td>
                          <td>{staff.password}</td>
                          <td>
                            <button className="btn" onClick={() => handleEdit(index)}>Edit</button>
                            <button className="btn confirm-delete" onClick={() => handleDelete(index)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {message && <p className="msg">{message}</p>}
            </section>
          )}

          {activeSection === 'settings' && (
            <section className="content-section">
              <h2>Admin Settings</h2>
              <p><b>Setting options will come later.</b></p>
              {/* Add settings forms/components here */}
            </section>
          )}

          {activeSection === 'reports' && (
            <section className="content-section">
              <h2>Reports and Analytics</h2>
              <p>View various reports and analytics related to appraisals and staff activity.</p>
              {/* Add report generation/display components here */}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
