// components/DigitalSignaturePad.js
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas'; // You would need to install this: npm install react-signature-canvas
import '../StaffDashboard.css'; // Import CSS for styling

const DigitalSignaturePad = forwardRef((props, ref) => {
  const sigCanvas = useRef({});

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    clear: () => sigCanvas.current.clear(),
    toDataURL: () => sigCanvas.current.toDataURL(),
    isEmpty: () => sigCanvas.current.isEmpty(),
  }));

  return (
    <SignatureCanvas
      ref={sigCanvas}
      canvasProps={{ width: 300, height: 150, className: 'signature-pad-canvas' }}
      backgroundColor="#f0f0f0" // Light background for the pad
      penColor="black"
      minWidth={1}
      maxWidth={2}
    />
  );
});

export default DigitalSignaturePad;
