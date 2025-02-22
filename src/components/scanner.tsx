"use client";

import { useState, useRef, useEffect } from "react";
import QrScanner from "qr-scanner";
import toast, { Toaster } from "react-hot-toast";

export default function QRComponent() {
    const [enabled, setEnabled] = useState(true);
    const [status, setStatus] = useState<"valid" | "invalid" | "scanned" | null>(null);
    const scannerRef = useRef<HTMLDivElement>(null);
    const lastScannedId = useRef<string>("");

    useEffect(() => {
        return () => {
            lastScannedId.current = "";
        };
    }, []);

    const scan = async () => {
        setEnabled(false);
        const video = document.createElement("video");
        scannerRef.current?.appendChild(video);

        const qrScanner = new QrScanner(
            video,
            async (result) => {
                if (result.data) {
                    qrScanner.stop();
                    qrScanner.destroy();
                    video.remove();

                    if (result.data !== lastScannedId.current) {
                        lastScannedId.current = result.data;
                        try {
                            const response = await fetch(
                                `${location.origin}/api/confirm-ticket?id=${result.data}`,
                                { cache: "no-cache" }
                            );
                            const jsonData = await response.json();

                            if (jsonData.scanned) {
                                toast.error("Error: Ticket Already Scanned.");
                                setStatus("scanned");
                            } else if (jsonData.error) {
                                toast.error("Error: Invalid Ticket.");
                                setStatus("invalid");
                            } else {
                                toast.success("Success! Ticket Verified.");
                                setStatus("valid");
                            }
                        } catch (e) {
                            console.error(e);
                            toast.error("Error: Server Issue.");
                            setStatus("invalid");
                        }
                    } else {
                        toast.error("Error: Ticket Already Scanned.");
                        setStatus("scanned");
                    }
                    setEnabled(true);
                }
            },
            { highlightScanRegion: true, returnDetailedScanResult: true }
        );

        qrScanner.start();
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
                <Toaster position="bottom-center" reverseOrder={false} />
                <div ref={scannerRef} className="w-full max-w-md aspect-square bg-white border-2 border-gray-300 rounded-lg shadow-md flex items-center justify-center">
                    {enabled && <p className="text-gray-500">Scan a QR Code</p>}
                </div>
                <div className="mt-4 w-full max-w-md text-center">
                    {status === "scanned" && (
                        <p className="text-red-500 font-semibold">Ticket Already Scanned</p>
                    )}
                    {status === "valid" && (
                        <p className="text-green-600 font-bold text-xl">Success! Ticket Verified.</p>
                    )}
                    {status === "invalid" && (
                        <p className="text-red-500 font-semibold">Invalid Ticket</p>
                    )}
                </div>
                {enabled && (
                    <button
                        onClick={scan}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
                        Start Scanning
                    </button>
                )}
            </div>
        </>
    );
}
