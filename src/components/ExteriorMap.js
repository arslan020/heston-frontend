// MultipleFiles/ExteriorMap.js
import React, { useState } from 'react';
import '../pages/StaffDashboard.css';
import exteriorImage from '../assets/exterior.png';

const ExteriorMap = ({
  imageBase64,
  onPartSelect,
  faults = [],
  onFaultPointClick,
  onFaultPointDelete
}) => {

// Added faults prop
  const [showSubParts, setShowSubParts] = useState(null);
  const [selectedSubPart, setSelectedSubPart] = useState(null);
  const [showConditions, setShowConditions] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedMainPart, setSelectedMainPart] = useState(null);
  const [photo, setPhoto] = useState(null); // State for the photo file
  const [note, setNote] = useState('');     // State for the note
  const [pendingFault, setPendingFault] = useState(null); // Holds fault details before photo/note are added
  const [clickedCoords, setClickedCoords] = useState(null); // New state for click coordinates


  

  // Define all parts that should display conditions
  const partsWithConditions = [
    'Screen Front',
    'Badgedecal Front',
    'Bonnet',
    'Bumper Front',
    'Bumper Front Grill',
    'Bumper Front Moulding',
    'Fog Lamp Surround ns',
    'Fog Lamp Surround os',
    'Fogdriving Lamp nsf',
    'Fogdriving Lamp osf',
    'Front TowEye Cvr',
    'Headlamp ns',
    'Headlamp os',
    'Headlamp Washer ns',
    'Headlamp Washer os',
    'Number Plate Front',
    'Panel Front',
    'Parking Sensor Front',
    'Roof',
    'Aerial',
    'Glass Roof',
    'Sunroof',
    'Wiper nsf',
    'Wiper osf',
    'Bumper Rear',
    'Bumper Rear Moulding',
    'Bumper Reflector nsr',
    'Bumper Reflector osr',
    'Exhaust',
    'Fog Lamp nsr',
    'Fog Lamp osr',
    'Lamp nsr',
    'Lamp osr',
    'Number Plate Lamp',
    'Number Plate Rear',
    'Panel Rear',
    'Parking Sensor Rear',
    'Rear TowEye Cvr',
    'Reflector nsr',
    'Reflector osr',
    'Badgedecal Rear',
    'Moulding Tailgate',
    'Spoiler Rear',
    'Tailgate',
    'Tailgate Aperture Seal',
    'Tailgate Glass',
    'Tailgate Trim Panel',
    'Wiper Rear',
    'A Post ns',
    'Aperture Seal nsf',
    'B Post ns',
    'Door Lock nsf',
    'Door Mirror Assy nsf',
    'Door Mirror Glass ns',
    'Door Moulding nsf',
    'Door nsf',
    'Door Qtr Light nsf',
    'Door Window nsf',
    'Handle Outer nsf',
    'Aperture Seal nsr',
    'C Post ns',
    'D Post ns',
    'Door Moulding nsr',
    'Door nsr',
    'Door Qtr Light nsr',
    'Door Window nsr',
    'Handle Outer nsr',
    'Fuel Flap',
    'Qtr Panel Arch Extension ns',
    'Qtr Panel Moulding ns',
    'Qtr Panel nsr',
    'Qtr Panel Window ns',
    'Flasher Side Repeater ns',
    'Moulding nsf Wing',
    'Wing Front Arch Extension ns',
    'Wing nsf',
    'Tyre nsf',
    'Wheel nsf',
    'Wheel Trim nsf',
    'Tyre nsr',
    'Wheel nsr',
    'Wheel Trim nsr',
    'EV Charging Port',
    'Spare Tyre',
    'Spare Wheel',
    'A Post os',
    'Aperture Seal osf',
    'B Post os',
    'Door Lock osf',
    'Door Mirror Assy osf',
    'Door Mirror Glass os',
    'Door Moulding osf',
    'Door osf',
    'Door Qtr Light osf',
    'Door Window osf',
    'Handle Outer osf',
    'Aperture Seal osr',
    'C Post os',
    'D Post os',
    'Door Moulding osr',
    'Door osr',
    'Door Qtr Light osr',
    'Door Window osr',
    'Handle Outer osr',
    'Tyre osf',
    'Wheel osf',
    'Wheel Trim osf',
    'Tyre osr',
    'Wheel osr',
    'Wheel Trim osr',
    'Qtr Panel Arch Extension os',
    'Qtr Panel Moulding os',
    'Qtr Panel osr',
    'Qtr Panel Window os',
    'Flasher Side Repeater os',
    'Moulding osf Wing',
    'Wing Front Arch Extension os',
    'Wing osf',
    'Front Windshield Side Frame',
  ];

  const conditionOptionsMap = {
    'Front Windshield Side Frame': ['Broken', 'Missing'],
    'Flasher Side Repeater os': ['Broken', 'Missing'],
    'Moulding osf Wing': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wing Front Arch Extension os': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wing osf': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Flasher Side Repeater ns': ['Broken', 'Missing'],
    'Moulding nsf Wing': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wing Front Arch Extension ns': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wing nsf': ['Chipped', 'Cracked', 'Dented', 'Hote', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Fuel Flap': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Qtr Panel Arch Extension ns': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Qtr Panel Moulding ns': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Qtr Panel nsr': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Qtr Panel Window ns': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Screen Front': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Badgedecal Front': ['Broken', 'Missing'],
    'Bonnet': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Bumper Front': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Insecure', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Bumper Front Grill': ['Broken', 'Missing', 'Scratched (Painted)','Scuffed (Unpainted)'],
    'Bumper Front Moulding': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Fog Lamp Surround ns': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Fog Lamp Surround os': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Fogdriving Lamp nsf': ['Broken', 'Missing'],
    'Fogdriving Lamp osf': ['Broken', 'Missing'],
    'Front TowEye Cvr': ['Broken', 'Missing'],
    'Headlamp ns': ['Broken', 'Missing'],
    'Headlamp os': ['Broken', 'Missing'],
    'Headlamp Washer ns': ['Broken', 'Missing'],
    'Headlamp Washer os': ['Broken', 'Missing'],
    'Number Plate Front': ['Broken', 'Missing'],
    'Panel Front': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Parking Sensor Front': ['Broken', 'Missing'],
    'Roof': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Aerial': ['Broken', 'Missing'],
    'Glass Roof': ['Broken', 'Missing'],
    'Sunroof': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Wiper nsf': ['Broken', 'Missing'],
    'Wiper osf': ['Broken', 'Missing'],
    'Bumper Rear': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Insecure', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Bumper Rear Moulding': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Bumper Reflector nsr': ['Broken', 'Missing'],
    'Bumper Reflector osr': ['Broken', 'Missing'],
    'Exhaust': ['Broken', 'Missing'],
    'Fog Lamp nsr': ['Broken', 'Missing'],
    'Fog Lamp osr': ['Broken', 'Missing'],
    'Lamp nsr': ['Broken', 'Missing'],
    'Lamp osr': ['Broken', 'Missing'],
    'Number Plate Lamp': ['Broken', 'Missing'],
    'Number Plate Rear': ['Broken', 'Missing'],
    'Panel Rear': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Parking Sensor Rear': ['Broken', 'Missing'],
    'Rear TowEye Cvr': ['Broken', 'Missing'],
    'Reflector nsr': ['Broken', 'Missing'],
    'Reflector osr': ['Broken', 'Missing'],
    'Badgedecal Rear': ['Broken', 'Missing'],
    'Moulding Tailgate': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Spoiler Rear': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Tailgate': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Tailgate Aperture Seal': ['Broken', 'Missing'],
    'Tailgate Glass': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Tailgate Trim Panel': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wiper Rear': ['Broken', 'Missing'],
    'A Post ns': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Aperture Seal nsf': ['Broken', 'Missing'],
    'B Post ns': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Door Lock nsf': ['Broken', 'Missing'],
    'Door Mirror Assy nsf': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Door Mirror Glass ns': ['Broken', 'Missing'],
    'Door Moulding nsf': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Door nsf': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Door Qtr Light nsf': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Door Window nsf': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Handle Outer nsf': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Aperture Seal nsr': ['Broken', 'Missing'],
    'C Post ns': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'D Post ns': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Door Moulding nsr': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Door nsr': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Door Qtr Light nsr': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Door Window nsr': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Handle Outer nsr': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Fuel Flap': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Qtr Panel Arch Extension ns': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Qtr Panel Moulding ns': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Qtr Panel nsr': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Qtr Panel Window ns': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Flasher Side Repeater ns': ['Broken', 'Missing'],
    'Moulding nsf Wing': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wing Front Arch Extension ns': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wing nsf': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Tyre nsf': ['1.6mm', '2mm', '3mm', '4mm', '5mm', '6mm', '7mm', '8mm', 'Damaged', 'Less Than 1.6mm', 'Missing', 'Punctured', 'Worn'],
    'Wheel nsf': ['Corroded', 'Damaged', 'Dented', 'Missing', 'Scratched', 'Punctured', 'Worn'],
    'Wheel Trim nsf': ['Broken', 'Missing', 'Scratched'],
    'Tyre nsr': ['1.6mm', '2mm', '3mm', '4mm', '5mm', '6mm', '7mm', '8mm', 'Damaged', 'Less Than 1.6mm', 'Missing', 'Punctured', 'Worn'],
    'Wheel nsr': ['Corrodated', 'Damaged', 'Dented', 'Missing', 'Scratched'],
    'Wheel Trim nsr': ['Broken', 'Missing', 'Scratched'],
    'EV Charging Port': ['Broken', 'Missing'],
    'Spare Tyre': ['1.6mm', '2mm', '3mm', '4mm', '5mm', '6mm', '7mm', '8mm', 'Damaged', 'Less Than 1.6mm', 'Missing'],
    'Spare Wheel': ['Corroded', 'Damaged', 'Dented', 'Missing', 'Scratched'],
    'A Post os': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Aperture Seal osf': ['Broken', 'Missing'],
    'B Post os': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Door Lock osf': ['Broken', 'Missing'],
    'Door Mirror Assy osf': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Door Mirror Glass os': ['Broken', 'Missing'],
    'Door Moulding osf': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Door osf': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Door Qtr Light osf': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Door Window osf': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Handle Outer osf': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Aperture Seal osr': ['Broken', 'Missing'],
    'C Post os': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'D Post os': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Door Moulding osr': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Door osr': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Door Qtr Light osr': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Door Window osr': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Handle Outer osr': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Tyre osf': ['1.6mm', '2mm', '3mm', '4mm', '5mm', '6mm', '7mm', '8mm', 'Damaged', 'Less Than 1.6mm', 'Missing', 'Punctured', 'Worn'],
    'Wheel osf': ['Corroded', 'Damaged', 'Dented', 'Missing', 'Scratched', 'Punctured', 'Worn'],
    'Wheel Trim osf': ['Broken', 'Missing', 'Scratched'],
    'Tyre osr': ['1.6mm', '2mm', '3mm', '4mm', '5mm', '6mm', '7mm', '8mm', 'Damaged', 'Less Than 1.6mm', 'Missing', 'Punctured', 'Worn'],
    'Wheel osr': ['Corroded', 'Damaged', 'Dented', 'Missing', 'Scratched', 'Punctured', 'Worn'],
    'Wheel Trim osr': ['Broken', 'Missing', 'Scratched'],
    'Qtr Panel Arch Extension os': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Qtr Panel Moulding os': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Qtr Panel osr': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Qtr Panel Window os': ['Chipped', 'Cracked', 'Missing', 'Scratched'],
    'Flasher Side Repeater os': ['Broken', 'Missing'],
    'Moulding osf Wing': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wing Front Arch Extension os': ['Broken', 'Missing', 'Scratched (Painted)', 'Scuffed (Unpainted)'],
    'Wing osf': ['Chipped', 'Cracked', 'Dented', 'Hole', 'Missing', 'Poor Previous Repair', 'Rusted', 'Scratched'],
    'Front Windshield Side Frame': ['Broken', 'Missing'],
  };

  const severityMap = {
    'Screen Front': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Badgedecal Front': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Bonnet': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Bumper Front': {
      'Chipped': ['1 To 5', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Over 25mm', 'UpTo 25mm'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 25mm', 'UpTo 25mm'],
      'Insecure': ['Action Required'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['25 to 100mm Thru Paint', 'Over 100mm Thru Paint', 'Over 25mm Not Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Bumper Front Grill': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Bumper Front Moulding': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Fog Lamp Surround ns': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Fog Lamp Surround os': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Fogdriving Lamp nsf': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Fogdriving Lamp osf': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Front TowEye Cvr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Headlamp ns': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Headlamp os': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Headlamp Washer ns': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Headlamp Washer os': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Number Plate Front': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Panel Front': {
      'Chipped': ['1 To 5', 'Edge Chiped', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Parking Sensor Front': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Roof': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Aerial': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Glass Roof': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Sunroof': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Wiper nsf': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Wiper osf': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Bumper Rear': {
      'Chipped': ['1 To 5', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Over 25mm', 'UpTo 25mm'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 25mm', 'UpTo 25mm'],
      'Insecure': ['Action Required'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 25mm', 'UpTo 25mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Bumper Rear Moulding': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Bumper Reflector nsr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Bumper Reflector osr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Exhaust': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Fog Lamp nsr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Fog Lamp osr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Lamp nsr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Lamp osr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Number Plate Lamp': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Number Plate Rear': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Panel Rear': {
      'Chipped': ['1 To 5', 'Edge Chiped', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Parking Sensor Rear': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Rear TowEye Cvr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Reflector nsr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Reflector osr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Badgedecal Rear': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Moulding Tailgate': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Spoiler Rear': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Tailgate': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Tailgate Aperture Seal': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Tailgate Glass': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Tailgate Trim Panel': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Wiper Rear': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'A Post ns': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Aperture Seal nsf': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'B Post ns': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Door Lock nsf': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Door Mirror Assy nsf': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Door Mirror Glass ns': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Door Moulding nsf': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Door nsf': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Door Qtr Light nsf': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Door Window nsf': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Handle Outer nsf': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Aperture Seal nsr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'C Post ns': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
    },
    'D Post ns': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
    },
    'Door Moulding nsr': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Door nsr': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
    },
    'Door Qtr Light nsr': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 10mm', 'UpTo 10mm']
    },
    'Door Window nsr': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 10mm', 'UpTo 10mm']
    },
    'Handle Outer nsr': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Fuel Flap': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
    },
    'Qtr Panel Arch Extension ns': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Qtr Panel Moulding ns': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Qtr Panel nsr': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
    },
    'Qtr Panel Window ns': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Flasher Side Repeater ns': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Moulding nsf Wing': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Wing Front Arch Extension ns': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Wing nsf': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
    },
    'Tyre nsf': {
      '1.6mm': ['Legal'],
      '2mm': ['Legal'],
      '3mm': ['Legal'],
      '4mm': ['Legal'],
      '5mm': ['Legal'],
      '6mm': ['Legal'],
      '7mm': ['Legal'],
      '8mm': ['Legal'],
      'Damaged': ['Replace'],
      'Less Than 1.6mm': ['Ilegal'],
      'Missing': ['Replace'],
      'Punctured': ['Replace'],
      'Worn': ['Replace']
    },
    'Wheel nsf': {
      'Corroded': ['Light'],
      'Damaged': ['Replace'],
      'Dented': ['Over 30mm (Alloy)', 'Over 30mm (Steel)', 'UpTo 30mm (Alloy)', 'UpTo 30mm (Steel)'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm'],
    },
    'Wheel Trim nsf': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm'],

    },
    'Tyre osf': {
      '1.6mm': ['Legal'],
      '2mm': ['Legal'],
      '3mm': ['Legal'],
      '4mm': ['Legal'],
      '5mm': ['Legal'],
      '6mm': ['Legal'],
      '7mm': ['Legal'],
      '8mm': ['Legal'],
      'Damaged': ['Replace'],
      'Less Than 1.6mm': ['Ilegal'],
      'Missing': ['Replace'],
      'Punctured': ['Replace'],
      'Worn': ['Replace']
    },
    'Wheel osf': {
      'Corroded': ['Light'],
      'Damaged': ['Replace'],
      'Dented': ['Over 30mm (Alloy)', 'Over 30mm (Steel)', 'UpTo 30mm (Alloy)', 'UpTo 30mm (Steel)'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm'],
    },
    'Wheel Trim osf': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm'],

    },
    'Tyre nsr': {
      '1.6mm': ['Legal'],
      '2mm': ['Legal'],
      '3mm': ['Legal'],
      '4mm': ['Legal'],
      '5mm': ['Legal'],
      '6mm': ['Legal'],
      '7mm': ['Legal'],
      '8mm': ['Legal'],
      'Damaged': ['Replace'],
      'Less Than 1.6mm': ['Ilegal'],
      'Missing': ['Replace'],
      'Punctured': ['Replace'],
      'Worn': ['Replace']
    },
    'Wheel nsr': {
      'Corroded': ['Light'],
      'Damaged': ['Replace'],
      'Dented': ['Over 30mm (Alloy)', 'Over 30mm (Steel)', 'UpTo 30mm (Alloy)', 'UpTo 30mm (Steel)'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm'],

    },
    'Wheel Trim nsr': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm'],
    },
    'EV Charging Port': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Spare Tyre': {
      '1.6mm': ['Legal'],
      '2mm': ['Legal'],
      '3mm': ['Legal'],
      '4mm': ['Legal'],
      '5mm': ['Legal'],
      '6mm': ['Legal'],
      '7mm': ['Legal'],
      '8mm': ['Legal'],
      'Damaged': ['Replace'],
      'Less Than 1.6mm': ['Ilegal'],
      'Missing': ['Replace']
    },
    'Spare Wheel': {
      'Corroded': ['Light'],
      'Damaged': ['Replace'],
      'Dented': ['Over 30mm (Alloy)', 'Over 30mm (Steel)', 'UpTo 30mm (Alloy)', 'UpTo 30mm (Steel)'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm'],
    },
    'A Post os': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Aperture Seal osf': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'B Post os': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Door Lock osf': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Door Mirror Assy osf': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Door Mirror Glass os': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Door Moulding osf': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Door osf': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Door Qtr Light osf': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Door Window osf': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Handle Outer osf': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
    },
    'Aperture Seal osr': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'C Post os': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'D Post os': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Door Moulding osr': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Door osr': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],

      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'Rusted', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint']
    },
    'Door Qtr Light osr': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Door Window osr': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Handle Outer osr': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },

    'Tyre osr': {
      '1.6mm': ['Legal'],
      '2mm': ['Legal'],
      '3mm': ['Legal'],
      '4mm': ['Legal'],
      '5mm': ['Legal'],
      '6mm': ['Legal'],
      '7mm': ['Legal'],
      '8mm': ['Legal'],
      'Damaged': ['Replace'],
      'Less Than 1.6mm': ['Ilegal'],
      'Missing': ['Replace'],
      'Punctured': ['Replace'],
      'Worn': ['Replace']
    },
    'Wheel osr': {
      'Corroded': ['Light'],
      'Damaged': ['Replace'],
      'Dented': ['Over 30mm (Alloy)', 'Over 30mm (Steel)', 'UpTo 30mm (Alloy)', 'UpTo 30mm (Steel)'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm'],
    },
    'Wheel Trim osr': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 50mm', 'UpTo 50mm']
    },
    'Qtr Panel Arch Extension os': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Qtr Panel Moulding os': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Qtr Panel osr': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Rusted', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
    },
    'Qtr Panel Window os': {
      'Chipped': ['Over 10mm', 'UpTo 10mm'],
      'Cracked': ['Replace'],
      'Missing': ['Replace'],
      'Scratched': ['Over 30mm', 'UpTo 30mm']
    },
    'Flasher Side Repeater os': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
    },
    'Moulding osf Wing': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Wing Front Arch Extension os': {
      'Broken': ['Replace'],
      'Missing': ['Replace'],
      'Scratched (Painted)': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
      'Scuffed (Unpainted)': ['Over 100mm', 'UpTo 100mm']
    },
    'Wing osf': {
      'Chipped': ['1 To 5', 'Edge Chip', 'Multiple Chips', 'Over 5mm'],
      'Cracked': ['Replace'],
      'Dented': ['2 Or Less UpTo 10mm', 'Between 10mm + 30mm', 'Over 2 UpTo 10mm', 'Over 30% Of Panel', 'Over 30mm', 'With Paint Damage'],
      'Hole': ['Over 10mm', 'UpTo 10mm'],
      'Missing': ['Replace'],
      'Poor Previous Repair': ['Paint Flake', 'Poor Colour', 'Poor Paint', 'Rippled Over 30%', 'Rippled UpTo 30%'],
      'Rusted': ['Holed', 'Over 5mm', 'UpTo 5mm'],
      'Scratched': ['Over 25mm Not Thru Paint', 'Over 25mm Thru Paint', 'UpTo 25mm Not Thru Paint', 'UpTo 25mm Thru Paint'],
    },
    'Front Windshield Side Frame': {
      'Broken': ['Replace'],
      'Missing': ['Replace']
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
    setSelectedMainPart(partName);
    // Reset photo and note when a new main part is clicked
    setPhoto(null);
    setNote('');

    // Capture click coordinates relative to the SVG
    const svg = event.currentTarget.ownerSVGElement; // Get the root <svg> element
    const rect = svg.getBoundingClientRect();
    const viewW = 1332; // exterior.png intrinsic width from viewBox
    const viewH = 733;  // exterior.png intrinsic height from viewBox

    // Calculate x and y relative to the SVG's viewBox
    const x = ((event.clientX - rect.left) / rect.width) * viewW;
    const y = ((event.clientY - rect.top) / rect.height) * viewH;
    setClickedCoords({ x, y });

    // Special cases for parts with sub-parts
    if (partName === 'Bonnet') {
      setShowSubParts(['Badgedecal Front', 'Bonnet']);
    }
    else if (partName === 'Front Bumper') {
      setShowSubParts([
        'Bumper Front', 'Bumper Front Grill', 'Bumper Front Moulding',
        'Fog Lamp Surround ns', 'Fog Lamp Surround os',
        'Fogdriving Lamp nsf', 'Fogdriving Lamp osf',
        'Front TowEye Cvr', 'Headlamp ns', 'Headlamp os',
        'Headlamp Washer ns', 'Headlamp Washer os',
        'Number Plate Front', 'Panel Front', 'Parking Sensor Front'
      ]);
    }
    else if (partName === 'Back Bumper') {
      setShowSubParts([
        'Bumper Rear', 'Bumper Rear Moulding',
        'Bumper Reflector nsr', 'Bumper Reflector osr',
        'Exhaust',
        'Fog Lamp nsr', 'Fog Lamp osr',
        'Lamp nsr', 'Lamp osr',
        'Number Plate Lamp', 'Number Plate Rear',
        'Panel Rear', 'Parking Sensor Rear',
        'Rear TowEye Cvr',
        'Reflector nsr', 'Reflector osr'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Boot') {
      setShowSubParts([
        'Badgedecal Rear',
        'Moulding Tailgate',
        'Spoiler Rear',
        'Tailgate',
        'Tailgate Aperture Seal',
        'Tailgate Glass',
        'Tailgate Trim Panel',
        'Wiper Rear'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Left Front Door') {
      setShowSubParts([
        'A Post ns',
        'Aperture Seal nsf',
        'B Post ns',
        'Door Lock nsf',
        'Door Mirror Assy nsf',
        'Door Mirror Glass ns',
        'Door Moulding nsf',
        'Door nsf',
        'Door Qtr Light nsf',
        'Door Window nsf',
        'Handle Outer nsf'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Front Left Fender / Wing') {
      setShowSubParts([
        'Flasher Side Repeater ns',
        'Moulding nsf Wing',
        'Wing Front Arch Extension ns',
        'Wing nsf'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Front Right Fender / Wing') {
      setShowSubParts([
        'Flasher Side Repeater os',
        'Moulding osf Wing',
        'Wing Front Arch Extension os',
        'Wing osf'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Left Back Door') {
      setShowSubParts([
        'Aperture Seal nsr',
        'C Post ns',
        'D Post ns',
        'Door Moulding nsr',
        'Door nsr',
        'Door Qtr Light nsr',
        'Door Window nsr',
        'Handle Outer nsr'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Fuel Cap Panel Left') {
      setShowSubParts([
        'Fuel Flap',
        'Qtr Panel Arch Extension ns',
        'Qtr Panel Moulding ns',
        'Qtr Panel nsr',
        'Qtr Panel Window ns'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Fuel Cap Panel Right') {
      setShowSubParts([
        'Fuel Flap',
        'Qtr Panel Arch Extension os',
        'Qtr Panel Moulding os',
        'Qtr Panel osr',
        'Qtr Panel Window os'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Glass/Sun Roof') {
      setShowSubParts(['Aerial', 'Glass Roof', 'Sunroof']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Front mirror') {
      setShowSubParts(['Screen Front', 'Wiper nsf', 'Wiper osf']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Front Left Tyre') {
      setShowSubParts(['Tyre nsf', 'Wheel nsf', 'Wheel Trim nsf']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Back Left tyre') {
      setShowSubParts(['Tyre nsr', 'Wheel nsr', 'Wheel Trim nsr']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Spare tyre') {
      setShowSubParts(['EV Charging Port', 'Spare Tyre', 'Spare Wheel']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Front Right Door Panel') {
      setShowSubParts([
        'A Post os',
        'Aperture Seal osf',
        'B Post os',
        'Door Lock osf',
        'Door Mirror Assy osf',
        'Door Mirror Glass os',
        'Door Moulding osf',
        'Door osf',
        'Door Qtr Light osf',
        'Door Window osf',
        'Handle Outer osf'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Back Right Door Panel') {
      setShowSubParts([
        'Aperture Seal osr',
        'C Post os',
        'D Post os',
        'Door Moulding osr',
        'Door osr',
        'Door Qtr Light osr',
        'Door Window osr',
        'Handle Outer osr'
      ]);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Front Right tyre') {
      setShowSubParts(['Tyre osf', 'Wheel osf', 'Wheel Trim osf']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Back Right tyre') {
      setShowSubParts(['Tyre osr', 'Wheel osr', 'Wheel Trim osr']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Front Bumper Corner (Right Side)') {
      setShowSubParts(['Bumper Front']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Front Bumper Corner (Left Side)') {
      setShowSubParts(['Bumper Front']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Back Bumper Corner (Right Side)') {
      setShowSubParts(['Bumper Rear']);
      setSelectedMainPart(partName);
    }
    else if (partName === 'Back Bumper Corner (Left Side)') {
      setShowSubParts(['Bumper Rear']);
      setSelectedMainPart(partName);
    }
    else if (partsWithConditions.includes(partName)) {
      setSelectedSubPart(partName);
      setShowConditions(true);
      setShowSubParts([partName]);
    }
    else {
      // If it's a direct part selection without sub-parts or conditions,
      // immediately call onPartSelect with default empty damage/detail
      onPartSelect({ part: partName, damage: '', detail: '', photo: null, note: '', coords: clickedCoords }); // Pass coords
      setShowSubParts(null);
      setShowConditions(false);
      setSelectedSubPart(null);
      setSelectedMainPart(null);
      setSelectedCondition(null);
      setClickedCoords(null); // Reset coords
    }
  };

  const handleSubPartClick = (subPart) => {
    setSelectedSubPart(subPart);
    // Reset photo and note when a new sub-part is clicked
    setPhoto(null);
    setNote('');
    if (partsWithConditions.includes(subPart)) {
      setShowConditions(true);
    } else {
      // If sub-part doesn't have conditions, immediately save it
      onPartSelect({ part: subPart, damage: '', detail: '', photo: null, note: '', coords: clickedCoords }); // Pass coords
      setShowConditions(false);
      setShowSubParts(null);
      setSelectedSubPart(null);
      setSelectedMainPart(null);
      setSelectedCondition(null);
      setClickedCoords(null); // Reset coords
    }
  };

  const handleConditionSelect = (condition) => {
    setSelectedCondition(condition);
    // Reset photo and note when a new condition is selected
    setPhoto(null);
    setNote('');
    if (selectedSubPart && severityMap[selectedSubPart]?.[condition]) {
      // Don't close yet - wait for severity selection
    } else if (selectedSubPart) {
      // If no severity options, immediately set pending fault to show photo/note popup
      setPendingFault({
        part: selectedSubPart,
        damage: condition,
        detail: '', // No detail if no severity options
        coords: clickedCoords // Pass coords
      });
      setShowSubParts(null); // Close the part/condition/severity selection popup
      setShowConditions(false);
      setSelectedSubPart(null);
      setSelectedMainPart(null);
      setSelectedCondition(null);
      setClickedCoords(null); // Reset coords
    }
  };

  const handleSeveritySelect = (severity) => {
    // Set pending fault with all details, then show photo/note popup
    setPendingFault({
      part: selectedSubPart,
      damage: selectedCondition,
      detail: severity,
      coords: clickedCoords // Pass coords
    });
    setShowSubParts(null); // Close the part/condition/severity selection popup
    setShowConditions(false);
    setSelectedSubPart(null);
    setSelectedMainPart(null);
    setSelectedCondition(null);
    setClickedCoords(null); // Reset coords
  };

  return (
    <div className="image-mapping-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1332 / 733' }}>
       <img
  src={imageBase64 || exteriorImage}
  alt="vehicle top view"
  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
/>


        <svg
          viewBox="0 0 1332 733"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'all' }}
        >
          <polygon points="610,287,613,425,919,426,919,292" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Roof', e)} style={{ cursor: 'pointer' }} />
          <polygon points="230,315,230,395,377,446,383,270" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Bonnet', e)} style={{ cursor: 'pointer' }} />
          <circle cx="773" cy="629" r="43" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Left tyre', e)} style={{ cursor: 'pointer' }} />
          <circle cx="347" cy="95" r="44" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Right tyre', e)} style={{ cursor: 'pointer' }} />
          <circle cx="786" cy="84" r="43" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Right tyre', e)} style={{ cursor: 'pointer' }} />
          <circle cx="1042" cy="136" r="47" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Spare tyre', e)} style={{ cursor: 'pointer' }} />
          <polygon points="437,98,435,197,453,179,567,183,588,147,524,100,496,100,603,155,608 ,100" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Right Door Panel', e)} style={{ cursor: 'pointer' }} />
          <polygon points="187,308,202,403" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Grill front', e)} style={{ cursor: 'pointer' }} />
          <polygon points="429,258,406,347,419,456,513,431,513,286" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front mirror', e)} style={{ cursor: 'pointer' }} />
          <polygon points="422,533,429,610,596,613,591,563,550,543,550,526" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Left door panel', e)} style={{ cursor: 'pointer' }} />
          <polygon points="730,583,742,566,768,561,800,561,809,569,810,578,774,573" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Right Wheel Arch / Fender Arch', e)} style={{ cursor: 'pointer' }} />
          <polygon points="278,589,294,564,317,557,358,557,378,574,311,567,344,555,303,574" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Left Wheel Arch / Fender Arch', e)} style={{ cursor: 'pointer' }} />
          <polygon points="293,133,321,156,358,158,382,149,402,121,358,151" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Right Wheel Arch / Fender Arch', e)} style={{ cursor: 'pointer' }} />
          <polygon points="731,117,753,142,777,152,813,149,831,129,782,138,743,126" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Left Wheel Arch / Fender Arch', e)} style={{ cursor: 'pointer' }} />
          <polygon points="246,85,227,105,220,124,223,132,248,132,278,133,287,131,281,106,280,85,269,87" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Bumper Corner (Left Side)', e)} style={{ cursor: 'pointer' }} />
          <rect x="1158" y="432" width="6" height="18" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Right indicator', e)} style={{ cursor: 'pointer' }} />
          <rect x="1157" y="279" width="8" height="17" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Left indicator', e)} style={{ cursor: 'pointer' }} />
          <rect x="157" y="431" width="6" height="18" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Right Indicator', e)} style={{ cursor: 'pointer' }} />
          <rect x="540" y="300" width="64" height="119" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Glass/Sun Roof', e)} style={{ cursor: 'pointer' }} />
          <polygon points="238,254,229,308,391,259" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front right edge of the bonnet', e)} style={{ cursor: 'pointer' }} />
          <polygon points="228,401,234,459,384,459" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front left edge of the bonnet', e)} style={{ cursor: 'pointer' }} />
          <polygon points="400,255,388,290,382,330,381,376,384,410,388,429,394,457,411,456,396,362,407,295,419,253,407,254" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Windshield Side Frame', e)} style={{ cursor: 'pointer' }} />
          <polygon points="150,296,168,296,168,420,151,420" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Bumper', e)} style={{ cursor: 'pointer' }} />
          <polygon points="171,254,184,251,184,466,173,466" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Bumper', e)} style={{ cursor: 'pointer' }} />
          <circle cx="393" cy="172" r="8" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Right Indicator', e)} style={{ cursor: 'pointer' }} />
          <rect x="400" y="621" width="305" height="13" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Right Side Skirt', e)} style={{ cursor: 'pointer' }} />
          <rect x="410" y="79" width="310" height="12" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Left Side Skirt', e)} style={{ cursor: 'pointer' }} />
          <rect x="1110" y="224" width="85" height="268" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Bumper', e)} style={{ cursor: 'pointer' }} />
          <rect x="135" y="243" width="82" height="235" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Bumper', e)} style={{ cursor: 'pointer' }} />
          <polygon points="933,272,1107,272,1107,449,933,449" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Boot', e)} style={{ cursor: 'pointer' }} />
          <polygon points="596,446 597,619 424,620 419,544 421,517 443,495 490,465 550,447" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Left Front Door', e)} style={{ cursor: 'pointer' }} />
          <polygon points="604,449 604,619 704,618 711,591 720,577 733,563 749,553 755,543 754,529 755,517 755,503 753,489 754,472 753,459 753,449" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Left Back Door', e)} style={{ cursor: 'pointer' }} />
          <polygon points="761,448 761,553 792,555 812,565 820,573 860,573 924,573 924,527 926,471 922,447" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Fuel Cap Panel Left', e)} style={{ cursor: 'pointer' }} />
          <circle cx="333" cy="618" r="46" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Left Tyre', e)} style={{ cursor: 'pointer' }} />
          <polygon points="614,96 615,258 770,257 769,157 740,145 727,130 721,112 718,96" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Right Door Panel', e)} style={{ cursor: 'pointer' }} />
          <polygon points="779,257 936,257 936,136 832,136 815,149 800,154 788,156 777,156" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Fuel Cap Panel Right', e)} style={{ cursor: 'pointer' }} />
          <polygon points="227,553,228,575,278,575,293,562,316,552,347,551,371,561,383,573,393,589,396,616,420,618,419,596,415,575,415,553,416,537,414,516,381,518,330,522,290,526,252,535,234,542" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Left Fender / Wing', e)} style={{ cursor: 'pointer' }} />
          <polygon points="269,581,210,584,216,603,228,620,238,623,251,624,261,623,268,620" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Bumper Corner (Right Side)', e)} style={{ cursor: 'pointer' }} />
          <polygon points="246,85,227,105,220,124,223,132,248,132,278,133,287,131,281,106,280,85,269,87" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Bumper Corner (Left Side)', e)} style={{ cursor: 'pointer' }} />
          <polygon points="846,82,841,121,934,121,919,90" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Bumper Corner (Right Side)', e)} style={{ cursor: 'pointer' }} />

          <polygon points="242,135,240,161,264,175,300,184,334,188,374,191,408,194,427,195,427,175,426,158,426,141,428,120,433,95,411,92,404,118,397,135,384,148,369,155,346,158,324,156,307,149,290,135" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Right Fender / Wing', e)} style={{ cursor: 'pointer' }} />
          <polygon points="829,588 832,629 907,624 919,608 921,589" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Back Bumper Corner (Left Side)', e)} style={{ cursor: 'pointer' }} />

          <polygon points="610,97 609,259 556,264 502,243 470,227 433,202 429,179 430,156 432,131 433,98" fill="transparent" strokeWidth="2" onClick={(e) => handleClick('Front Right Door Panel', e)} style={{ cursor: 'pointer' }} />

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
      {/* your existing nice Marker */}
      <Marker x={x} y={y} n={f.idx ?? (i + 1)} />

      {/* tiny delete badge (top-right) */}
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
            setPhoto(null); // Reset photo
            setNote('');    // Reset note
            setPendingFault(null); // Clear pending fault
            setClickedCoords(null); // Reset coords
          }}>
            <div className="side-by-side-popup" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowSubParts(null);
                  setShowConditions(false);
                  setSelectedCondition(null);
                  setSelectedSubPart(null);
                  setPhoto(null); // Reset photo
                  setNote('');    // Reset note
                  setPendingFault(null); // Clear pending fault
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
                &times; {/* Close button icon */}
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
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ marginTop: '10px', width: '100%' }}
              />

              <button style={{ marginTop: '12px' }} onClick={() => {
                const finalFault = {
                  ...pendingFault,
                  photo: photo || null, // Use the photo from state
                  note: note || ''     // Use the note from state
                };
                onPartSelect(finalFault); // Pass the complete fault object
                setPendingFault(null);
                setPhoto(null);
                setNote('');
                // Ensure all popups are closed and states reset
                setShowSubParts(null);
                setShowConditions(false);
                setSelectedSubPart(null);
                setSelectedMainPart(null);
                setSelectedCondition(null);
                setClickedCoords(null); // Reset coords
              }}>Save Fault</button>
            </div>
          </div>
        )}

        {(selectedSubPart || selectedMainPart) && (
          <table className="selected-component-table">
            <thead>
              <tr>
                <th>Selected Component</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedSubPart || selectedMainPart}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExteriorMap;
