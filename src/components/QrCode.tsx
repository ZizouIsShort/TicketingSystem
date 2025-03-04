import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QrCodeProps {
    id: string;
}

const QrCode: React.FC<QrCodeProps> = ({ eventTitle, id }) => {
    const qrData = JSON.stringify({ event: eventTitle, ticketID: id });

    return (
        <div className="flex flex-col items-center">
            <QRCodeCanvas value={qrData} size={200} />
            <p className="mt-2 text-center">{eventTitle}</p>
        </div>
    );
};

export default QrCode;
