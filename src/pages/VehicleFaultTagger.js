import React, { useState } from 'react';
import './StaffDashboard.css';

const VehicleFaultTagger = ({ onAddFault }) => {
  const [tab, setTab] = useState('exterior');
  const [selectedPart, setSelectedPart] = useState(null);
  const [damage, setDamage] = useState('');
  const [severity, setSeverity] = useState('');
  const [detail, setDetail] = useState('');
  const [photo, setPhoto] = useState(null); // New state for photo
  const [errorMessage, setErrorMessage] = useState('');

  const handlePartClick = (part) => {
    setSelectedPart(part);
    setDamage('');
    setSeverity('');
    setDetail('');
    setPhoto(null); // Reset photo when selecting a new part
    setErrorMessage('');
  };

  const confirmFault = () => {
    if (!damage || !severity) {
      setErrorMessage('Please select damage type and severity.');
      return;
    }
    onAddFault({ part: selectedPart, damage, severity, detail, photo }); // Include photo
    setSelectedPart(null);
  };

  return (
    <div>
      <div className="tab-selector">
        <button onClick={() => setTab('exterior')} className={tab === 'exterior' ? 'active' : ''}>Exterior</button>
        <button onClick={() => setTab('interior')} className={tab === 'interior' ? 'active' : ''}>Interior</button>
      </div>

      <div className="diagram-container">
        <img
          src={tab === 'exterior' ? '/exterior.png' : '/interior.png'}
          useMap="#vehicle-map"
          width="1000" // Adjust this to match actual display size
          alt="Vehicle"
        />

        <map name="vehicle-map">
          <area shape="rect" coords="70,60,270,160" alt="Left Interior" onClick={() => handlePartClick('Left Cabin')} />
          <area shape="rect" coords="370,60,570,160" alt="Right Interior" onClick={() => handlePartClick('Right Cabin')} />
          <area shape="rect" coords="270,180,470,280" alt="Roof Interior" onClick={() => handlePartClick('Roof')} />
          <area shape="rect" coords="70,300,270,400" alt="Driver Side" onClick={() => handlePartClick('Driver')} />
          <area shape="rect" coords="370,300,570,400" alt="Passenger Side" onClick={() => handlePartClick('Passenger')} />
        </map>
      </div>

      {selectedPart && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Component: {selectedPart}</h3>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <div className="section">
              <label>Damage Type</label>
              {['Scratched', 'Dented', 'Cracked', 'Broken', 'Rust'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDamage(d)}
                  className={damage === d ? 'selected' : ''}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="section">
              <label>Severity</label>
              {['Low', 'Medium', 'High'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={severity === s ? 'selected' : ''}
                >
                  {s}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Additional Notes"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />

            {/* File input for image upload */}
            <div className="section">
              <label>Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setPhoto(reader.result); // Store Base64 string in photo state
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <button className="btn" onClick={confirmFault}>Add Fault</button>
              <button className="btn cancel" onClick={() => setSelectedPart(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleFaultTagger;
