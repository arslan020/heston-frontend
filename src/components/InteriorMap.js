import React, { useState } from 'react';
import interiorImage from '../assets/interior.png';

const InteriorMap = ({
  onPartSelect,
  faults = [],
  onFaultPointClick,   // NEW
  onFaultPointDelete   // NEW
}) => {
 // Added faults prop
  const [showSubParts, setShowSubParts] = useState(null);
  const [selectedSubPart, setSelectedSubPart] = useState(null);
  const [showConditions, setShowConditions] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedMainPart, setSelectedMainPart] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState('');
  const [pendingFault, setPendingFault] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null); // New state for click coordinates

  // All parts with conditions
  const partsWithConditions = [
    "Air Vents nsf", "Air Vents osf",
    "Centre Console Front", "Dash Warning Lights",
    "Fascia Panel", "Fascia Trim", "Glove Box Lid",
    "In Car Entertainment", "Steering Wheel", "Switches And Controls",
    "Door Pad osf", "Handle Inner osf",
    "Door Pad osr", "Handle Inner osr",
    "Qtr Panel Trim os", "Carpets Front", "Carpets Rear",
    "Jack", "Load Area Carpet", "Rear Panel Trim Int", "Shelfload Cover Rear",
    "Tools", "Tyre Inflation Kit", "Wheel Brace",
    "Tailgate Pad",
    "Roof Lining", "Sunvisor ns", "Sunvisor os",
    "Door Pad nsf", "Handle Inner nsf",
    "Door Pad nsr", "Handle Inner nsr",
    "Qtr Panel Trim ns",
    "Headrest Assy nsf", "Seat Back Cover nsf", "Seat Base Cover nsf", "Seat Belt nsf",
    "Headrest Assy osf", "Seat Back Cover osf", "Seat Base Cover osf", "Seat Belt osf", // Corrected from "Headrest Assy os"
    "Headrest Assy os", "Seat Back Cover osr", "Seat Base Cover osr", "Seat Belt osr", // Corrected from "Headrest Assy os"
    "Headrest Assy Rear Seat Centr", "Headrest Assy Rear Seat ns", "Seat Back Cover nsr", "Seat Base Cover nsr", "Seat Belt nsr", "Seat Belt Rear Centre"
  ];

  const conditionOptionsMap = {
    "Air Vents nsf": ["Damaged", "Missing"],
    "Air Vents osf": ["Damaged", "Missing"],
    "Centre Console Front": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Dash Warning Lights": ["Displayed"],
    "Fascia Panel": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Fascia Trim": ["Damaged", "Missing"],
    "Glove Box Lid": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "In Car Entertainment": ["Broken", "Missing"],
    "Steering Wheel": ["Damaged", "Missing"],
    "Switches And Controls": ["Broken", "Missing"],
    "Door Pad osf": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Handle Inner osf": ["Damaged", "Missing"],
    "Door Pad osr": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Handle Inner osr": ["Damaged", "Missing"],
    "Qtr Panel Trim os": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Carpets Front": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Carpets Rear": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Jack": ["Broken", "Missing"],
    "Load Area Carpet": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Rear Panel Trim Int": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Shelfload Cover Rear": ["Damaged", "Missing"],
    "Tools": ["Broken", "Missing"],
    "Tyre Inflation Kit": ["Broken", "Missing"],
    "Wheel Brace": ["Broken", "Missing"],
    "Tailgate Pad": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Roof Lining": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Sunvisor ns": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Sunvisor os": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Door Pad nsf": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Handle Inner nsf": ["Damaged", "Missing"],
    "Door Pad nsr": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Handle Inner nsr": ["Damaged", "Missing"],
    "Qtr Panel Trim ns": ["Broken", "Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Headrest Assy nsf": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Back Cover nsf": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Base Cover nsf": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Belt nsf": ["Broken", "Missing"],
    "Headrest Assy osf": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Back Cover osf": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Base Cover osf": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Belt osf": ["Broken", "Missing"],
    "Headrest Assy os": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Back Cover osr": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Base Cover osr": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Belt osr": ["Broken", "Missing"],
    "Headrest Assy Rear Seat Centr": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Headrest Assy Rear Seat ns": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Back Cover nsr": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Base Cover nsr": ["Burn", "Holed", "Missing", "Scuffed", "Soiled", "Torn"],
    "Seat Belt nsr": ["Broken", "Missing"],
    "Seat Belt Rear Centre": ["Broken", "Missing"]
  };

  const severityMap = {
    "Air Vents nsf": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Air Vents osf": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Centre Console Front": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Dash Warning Lights": { "Displayed": ["No Action"] },
    "Fascia Panel": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Fascia Trim": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Glove Box Lid": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "In Car Entertainment": { "Broken": ["Replace"], "Missing": ["Replace"] },
    "Steering Wheel": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Switches And Controls": { "Broken": ["Replace"], "Missing": ["Replace"] },
    "Door Pad osf": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Handle Inner osf": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Door Pad osr":{ "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Handle Inner osr": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Qtr Panel Trim os": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Carpets Front": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Carpets Rear": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Load Area Carpet":{ "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Rear Panel Trim Int": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Shelfload Cover Rear": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Tools": { "Broken": ["Replace"], "Missing": ["Replace"] },
    "Tyre Inflation Kit": { "Broken": ["Replace"], "Missing": ["Replace"] },
    "Wheel Brace": { "Broken": ["Replace"], "Missing": ["Replace"] },
    "Tailgate Pad": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Roof Lining": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Sunvisor ns":{ "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Sunvisor os": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Door Pad nsf": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Handle Inner nsf": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Door Pad nsr":{ "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Handle Inner nsr": { "Damaged": ["Replace"], "Missing": ["Replace"] },
    "Qtr Panel Trim ns": { "Broken": ["Replace"], "Burn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'], "Holed": ['Over 3mm','Upto 3mm'], "Missing": ["Replace"], "Scuffed": ['Over 25mm','Upto 25mm'], "Soiled": ['Heavy','Light'], "Torn": ["Between 3mm + 10mm",'  Over 10mm','UpTo3mm'] },
    "Headrest Assy nsf": {
       "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Back Cover nsf": {
       "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Base Cover nsf": {
      "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Belt nsf": {
      "Broken": ["Replace"],
      "Missing": ["Replace"]
    },
    "Headrest Assy osf": {
      "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Back Cover osf": {
      "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Base Cover osf": {
      "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Belt osf": {
      "Broken": ["Replace"],
      "Missing": ["Replace"]
    },
    "Headrest Assy os": {
      "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Back Cover osr": {
       "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Base Cover osr": {
      "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Belt osr": {
      "Broken": ["Replace"],
      "Missing": ["Replace"]
    },
    "Headrest Assy Rear Seat Centr": {
       "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Headrest Assy Rear Seat ns": {
       "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Back Cover nsr": {
      "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Base Cover nsr": {
      "Burn": ['Over 3mm','UpTo 3mm'],
      "Holed": ['Over 3mm','UpTo 3mm'],
      "Missing": ["Replace"],
      "Scuffed": ['Over 25mm','UpTo 25mm'],
      "Soiled": ['Heavy','Light'],
      "Torn":['Over 3mm','UpTo 3mm']
    },
    "Seat Belt nsr": {
      "Broken": ["Replace"],
      "Missing": ["Replace"]
    },
    "Seat Belt Rear Centre": {
      "Broken": ["Replace"],
      "Missing": ["Replace"]
    }
  };

  // Marker component for SVG
  const Marker = ({ x, y, n }) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0,-16 C-9,-16 -16,-9 -16,0 C-16,9 0,24 0,24 C0,24 16,9 16,0 C16,-9 9,-16 0,-16Z"
            fill="#111" opacity="0.95" />
      <circle cx="0" cy="-2" r="12" fill="#111"/>
      <text x="0" y="2" fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle">{n}</text>
    </g>
  );

  const handleClick = (partName, event) => { // Add event parameter
    // Capture click coordinates relative to the SVG
    const svg = event.currentTarget.ownerSVGElement; // Get the root <svg> element
    const rect = svg.getBoundingClientRect();
    const viewW = 1153; // interior.png intrinsic width from viewBox
    const viewH = 718;  // interior.png intrinsic height from viewBox

    // Calculate x and y relative to the SVG's viewBox
    const x = ((event.clientX - rect.left) / rect.width) * viewW;
    const y = ((event.clientY - rect.top) / rect.height) * viewH;
    setClickedCoords({ x, y });

    if (partName === "steering wheel") {
      setShowSubParts([
        "Air Vents nsf", "Air Vents osf", "Centre Console Front",
        "Dash Warning Lights", "Fascia Panel", "Fascia Trim",
        "Glove Box Lid", "In Car Entertainment", "Steering Wheel",
        "Switches And Controls"
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === "front right door panel") {
      setShowSubParts(["Door Pad osf", "Handle Inner osf"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "back right back door") {
      setShowSubParts(["Door Pad osr", "Handle Inner osr"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "right side rear") {
      setShowSubParts(["Qtr Panel Trim os"]);
      setSelectedMainPart(partName);
    }
 else if (partName === "carpet front" || partName === "carpet front 2") {
      setShowSubParts(["Carpets Front"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "carpet rear" || partName === "carpet rear 2") {
      setShowSubParts(["Carpets Rear"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "boot carpet") {
      setShowSubParts([
        "Jack",
        "Load Area Carpet",
        "Rear Panel Trim Int",
        "Shelfload Cover Rear",
        "Tools",
        "Tyre Inflation Kit",
        "Wheel Brace"
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === "iner tail") {
      setShowSubParts(["Tailgate Pad"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "iner roof") {
      setShowSubParts(["Roof Lining", "Sunvisor ns", "Sunvisor os"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "front left door panel") {
      setShowSubParts(["Door Pad nsf", "Handle Inner nsf"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "back left door panel") {
      setShowSubParts(["Door Pad nsr", "Handle Inner nsr"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "left side rear ") {
      setShowSubParts(["Qtr Panel Trim ns"]);
      setSelectedMainPart(partName);
    }
    else if (partName === "head1") {
      setShowSubParts([
        "Headrest Assy nsf",
        "Seat Back Cover nsf",
        "Seat Base Cover nsf",
        "Seat Belt nsf"
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === "head2") {
      setShowSubParts([
        "Headrest Assy osf",
        "Seat Back Cover osf",
        "Seat Base Cover osf",
        "Seat Belt osf"
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === "head 3") {
      setShowSubParts([
        "Headrest Assy osr",
        "Seat Back Cover osr",
        "Seat Base Cover osr",
        "Seat Belt osr"
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === "head 4") {
      setShowSubParts([
        "Headrest Assy Rear Seat Centr",
        "Headrest Assy Rear Seat ns",
        "Seat Back Cover nsr",
        "Seat Base Cover nsr",
        "Seat Belt nsr",
        "Seat Belt Rear Centre"
      ]);
      setSelectedMainPart(partName);
    }
    else if (partsWithConditions.includes(partName)) {
      setSelectedSubPart(partName);
      setShowConditions(true);
    }
    else {
      setShowSubParts(null);
      setShowConditions(false);
      onPartSelect({ part: partName, damage: '', detail: '', coords: clickedCoords }); // Pass coords
      setClickedCoords(null); // Reset coords
    }
  };

  const handleSubPartClick = (part) => {
    setSelectedSubPart(part);
    setShowConditions(true);
  };

  const handleConditionSelect = (condition) => {
    setSelectedCondition(condition);
  };

  const handleSeveritySelect = (severity) => {
    const faultDetails = {
      part: selectedSubPart,
      damage: selectedCondition,
      detail: severity,
      coords: clickedCoords // Pass coords
    };
    setPendingFault(faultDetails);
  };

  return (
    <div className="image-mapping-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
       <svg viewBox="0 0 1153 718" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <image href={interiorImage} x="0" y="0" width="1153" height="718" />
    <rect x="204" y="228" width="113" height="238" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("steering wheel", e)} style={{ cursor: "pointer" }} />
    <polygon points="181,107 182,178 185,199 186,205 341,204 342,48 297,46 264,56 221,79" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("front right door panel", e)} style={{ cursor: "pointer" }} />
    <polygon points="346,48 347,202 438,203 455,167 469,156 484,148 483,47" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("back right back door", e)} style={{ cursor: "pointer" }} />
    <polygon points="491,47 489,148 518,152 534,162 543,171 549,174 586,174 635,174 635,49" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("right side rear", e)} style={{ cursor: "pointer" }} />
    <polygon points="179,564 184,659 340,659 340,503 297,504 267,511" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("front left door panel", e)} style={{ cursor: "pointer" }} />
    <polygon points="346,503 346,658 439,657 457,619 479,606 484,604 484,502" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("back left door panel", e)} style={{ cursor: "pointer" }} />
    <polygon points="487,502 489,604 515,604 533,617 544,630 637,629 634,504" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("left side rear ", e)} style={{ cursor: "pointer" }} />
    <rect x="355" y="247" width="186" height="95" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("carpet front", e)} style={{ cursor: "pointer" }} />
    <rect x="354" y="347" width="185" height="102" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("carpet front 2", e)} style={{ cursor: "pointer" }} />
    <rect x="544" y="248" width="152" height="94" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("carpet rear", e)} style={{ cursor: "pointer" }} />
    <rect x="545" y="347" width="150" height="98" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("carpet rear 2", e)} style={{ cursor: "pointer" }} />
    <rect x="699" y="248" width="106" height="199" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("boot carpet", e)} style={{ cursor: "pointer" }} />
    <rect x="689" y="489" width="326" height="165" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("iner roof", e)} style={{ cursor: "pointer" }} />
    <rect x="832" y="264" width="180" height="155" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("iner tail", e)} style={{ cursor: "pointer" }} />
    <rect x="683" y="146" width="160" height="92" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("head1", e)} style={{ cursor: "pointer" }} />
    <rect x="683" y="49" width="159" height="91" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("head2", e)} style={{ cursor: "pointer" }} />
    <rect x="849" y="53" width="151" height="89" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("head 3", e)} style={{ cursor: "pointer" }} />
    <rect x="849" y="145" width="147" height="90" fill="transparent" stroke="none" strokeWidth="2" onClick={(e) => handleClick("head 4", e)} style={{ cursor: "pointer" }} />

    {/* Render Markers for existing faults */}
   {/* Render Markers for existing faults (click to edit, × to delete) */}
{Array.isArray(faults) && faults.map((f, i) => {
  if (!f?.coords) return null;
  const x = f.coords.x;
  const y = f.coords.y;
  return (
    <g
      key={f.idx ?? i}
      className="fault-pin"
      onClick={(e) => {
        e.stopPropagation();
        onFaultPointClick && onFaultPointClick(i);
      }}
    >
      {/* marker */}
      <Marker x={x} y={y} n={f.idx ?? (i + 1)} />

      {/* small delete badge */}
      <g
        onClick={(e) => {
          e.stopPropagation();
          onFaultPointDelete && onFaultPointDelete(i);
        }}
        style={{ cursor: 'pointer' }}
      >
        <rect x={x + 10} y={y - 24} width="16" height="16" rx="3" fill="#e11" />
        <text x={x + 18} y={y - 12} textAnchor="middle" fontSize="10" fill="#fff">×</text>
      </g>
    </g>
  );
})}

  </svg>

      {showSubParts && (
        <div className="sub-part-backdrop" onClick={() => {
          setShowSubParts(null);
          setShowConditions(false);
          setSelectedCondition(null);
          setSelectedSubPart(null);
          setClickedCoords(null); // Reset coords
        }}>
          <div className="side-by-side-popup" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowSubParts(null);
                setShowConditions(false);
                setSelectedCondition(null);
                setSelectedSubPart(null);
                setClickedCoords(null); // Reset coords
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer'
              }}
              aria-label="Close"
            >
            </button>

            <div className="column">
              <h4>Select Part</h4>
              {showSubParts.map((part) => (
                <button
                  key={part}
                  className={part === selectedSubPart ? 'active' : ''}
                  onClick={() => handleSubPartClick(part)}
                >
                  {part}
                </button>
              ))}
            </div>

            <div className="column">
              {selectedSubPart && showConditions && (
                <>
                  <h4>Condition</h4>
                  {conditionOptionsMap[selectedSubPart] ? (
                    conditionOptionsMap[selectedSubPart].map((condition) => (
                      <button
                        key={condition}
                        onClick={() => handleConditionSelect(condition)}
                        className={condition === selectedCondition ? 'active' : ''}
                      >
                        {condition}
                      </button>
                    ))
                  ) : (
                    <p>No conditions available for this part.</p>
                  )}
                </>
              )}
            </div>

            <div className="column">
              {selectedSubPart && selectedCondition && severityMap[selectedSubPart]?.[selectedCondition] && (
                <>
                  <h4>Severity</h4>
                  {severityMap[selectedSubPart][selectedCondition].map((severity) => (
                    <button
                      key={severity}
                      onClick={() => handleSeveritySelect(severity)}
                    >
                      {severity}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {pendingFault && (
        <div className="sub-part-backdrop" style={{ zIndex: 10000 }}>
          <div className="sub-part-popup scrollable-popup" onClick={e => e.stopPropagation()}>
            <h4>Optional Photo & Note for: {pendingFault.part}</h4>

            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
            <textarea
              placeholder="Enter notes (optional)"
              rows="3"
              value={note }
              onChange={e => setNote(e.target.value)}
              style={{ marginTop: '10px', width: '100%' }}
            />

            <button style={{ marginTop: '12px' }} onClick={() => {
              const finalFault = {
                ...pendingFault,
                photo: photo || null,
                note: note || ''
              };
              onPartSelect(finalFault);
              setPendingFault(null);
              setPhoto(null);
              setNote('');
              setShowSubParts(null);
              setShowConditions(false);
              setSelectedSubPart(null);
              setSelectedCondition(null);
              setClickedCoords(null); // Reset coords
            }}>Save Fault</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorMap;
