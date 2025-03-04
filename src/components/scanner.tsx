import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';

const SimpleQRScanner: React.FC = () => {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);

    useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                if (qrScannerRef.current instanceof QrScanner) {
                    qrScannerRef.current.stop();
                    qrScannerRef.current.destroy();
                }
            }
        };
    }, []);

    const startScanning = () => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const scanner = new QrScanner(
            videoElement,
            (result: QrScanner.ScanResult) => {
                if (result.data) {
                    console.log('Scanned result:', result.data);
                    setScanResult(result.data);

                    if (qrScannerRef.current instanceof QrScanner) {
                        qrScannerRef.current.stop();
                        fetch("./api/isscan_ticket", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ scannedData: result.data }), // Send as an object
                        })
                            .then(response => response.json()) // Convert response to JSON
                            .then(data => {
                                console.log("Server response:", data); // Log response
                            })
                            .catch(error => {
                                console.error("Error:", error); // Log any errors
                            });
                    }
                }
            },
            {
                highlightScanRegion: true,
                returnDetailedScanResult: true
            }
        );

        qrScannerRef.current = scanner;
        scanner.start();
    };

    const stopScanning = () => {
        if (qrScannerRef.current instanceof QrScanner) {
            qrScannerRef.current.stop();
            qrScannerRef.current.destroy();
            qrScannerRef.current = null;
        }
        setScanResult(null);
    };

    return (
        <div>
            <video
                ref={videoRef}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    display: scanResult ? 'none' : 'block'
                }}
            />

            {!scanResult ? (
                <button onClick={startScanning}>
                    Start Scanning
                </button>
            ) : (
                <div>
                    <p>Scanned Result: {scanResult}</p>
                    <button onClick={stopScanning}>
                        Scan Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default SimpleQRScanner;