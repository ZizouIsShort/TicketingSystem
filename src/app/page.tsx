"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import QrCode from "@/components/QrCode";
import bcrypt from "bcryptjs";
import {isThenable} from "next/dist/shared/lib/is-thenable";
import {error} from "next/dist/build/output/log";
import SimpleQRScanner from "@/components/scanner";
import {BackgroundBeams} from "@/components/ui/background-beams";

export default function HomePage() {
    const { user, isSignedIn } = useUser();
    const [loading, setLoading] = useState(true);

    const [cName, setCName] = useState("");
    const [cStream, setCStream] = useState("");
    const [cYear, setCYear] = useState("");
    const [eventTitle, setEventTitle] = useState("");
    const [ticketID, setTicketID] = useState("");

    const [studentExists, setStudentExists] = useState<boolean | null>(null);

    useEffect(() => {
        if (user && user?.publicMetadata?.role !== 'admin') {
            const email = user.primaryEmailAddress?.emailAddress || "";

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(email, salt);

            console.log(user?.publicMetadata?.role);

            // Step 1: Sync user
            fetch("/api/sync-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    email: email,
                    password: hash,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                }),
            })
                .then((res) => res.json())
                .then(() => {
                    return fetch("./api/get_student_id", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: user.id }),
                    });
                })
                .then((res) => res.json())
                .then((data) => {
                    if (data.exists) {
                        setStudentExists(true);
                        const eventT = "Kreiva X Alfaaz"
                        setEventTitle(eventT)
                        const ticket = `${email}${user.id}`.trim();
                        console.log(ticket)
                        setTicketID(ticket);
                        const formatDate = (date: Date = new Date()): string => {
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0
                            const year = date.getFullYear();

                            return `${day}-${month}-${year}`;
                        }
                        const formattedDate: string = formatDate();
                        console.log(formatDate());
                        fetch("./api/ticket", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ticketID: ticket,
                                title: eventT,
                                uid: user.id,
                                createdAt: formattedDate,
                                torf: true,
                            }),
                        })
                            .then((res) => res.json())
                            .then((genTick) => {
                                console.log("Ticket Gen response:", genTick);
                                setLoading(false);

                                // Proceed to check ticket description regardless of whether ticket was newly created or already exists
                                const desc = `${ticket} ${eventTitle}`.trim();
                                return fetch("./api/ticket_desc", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        descid: desc,
                                        hder: user.firstName,
                                        descrip: eventT,
                                        footer: user.lastName,
                                    }),
                                });
                            })
                            .then((res) => res.json())
                            .then((descData) => {
                                if (descData.exists) {
                                    console.log("Description already exists");
                                } else {
                                    console.log("New description added:", descData);
                                }
                            })
                            .catch((error) => {
                                console.error("Error:", error);
                                setLoading(false);
                            });

                    }
                    else {
                        setStudentExists(false);
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error:", error);
                    setLoading(false);
                });
        } else if (user && user?.publicMetadata?.role === 'admin') {
            const email = user.primaryEmailAddress?.emailAddress || "";

            // Generate a hashed password using bcryptjs
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(email, salt);

            console.log(user?.publicMetadata?.role);

            fetch("./api/sync-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    email: email,
                    password: hash,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log("Sync User Response:", data);
                    fetch("./api/admin_details", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: user.id,
                            name: `${user.firstName} ${user.lastName}`.trim(),
                        }),
                    })
                        .then((res) => res.json())
                        .then((adminData) => {
                            console.log("Admin Details Response:", adminData); // Optional debugging
                            setLoading(false);
                        })
                        .catch((error) => {
                            console.error("Error in admin_details:", error);
                            setLoading(false);
                        });
                })
                .catch((error) => {
                    console.error("Error in sync-user:", error);
                    setLoading(false);
                });
        }
    }, [user]);

    const studentDetails = async () => {
        if (!user || !user.id) {
            alert("User ID is not available yet. Try again.");
            return;
        }
        try {
            const res = await fetch("./api/student_details", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    college: cName,
                    stream: cStream,
                    year: cYear,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit");
            window.location.reload();
        } catch (error: any) {
            console.error("Error:", error);
            alert(error.message);
        }
    };

    if (!isSignedIn) {
        return <div>Sign in to view this page</div>;
    }

    if (studentExists === false) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                {/* Background Beams component */}
                <BackgroundBeams/>

                {/* Form container */}
                <div
                    className={'relative z-10 bg-black bg-opacity-70 rounded-lg border border-gray-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-shadow duration-300 flex flex-col mx-auto w-1/2 p-6 gap-4'}>
                    <input
                        className={'bg-black p-2 rounded border border-gray-700'}
                        placeholder="Enter your college"
                        value={cName}
                        onChange={(e) => setCName(e.target.value)}
                    />
                    <input
                        className={'bg-black p-2 rounded border border-gray-700'}
                        placeholder="Enter your stream"
                        value={cStream}
                        onChange={(e) => setCStream(e.target.value)}
                    />
                    <input
                        className={'bg-black p-2 rounded border border-gray-700'}
                        placeholder="Enter your year"
                        value={cYear}
                        onChange={(e) => setCYear(e.target.value)}
                    />
                    <button
                        className={'bg-white hover:bg-gray-700 text-black hover:text-white p-2 rounded'}
                        onClick={studentDetails}
                    >
                        Submit
                    </button>
                </div>
            </div>
        );
    }

    if (user?.publicMetadata?.role === "admin") {
        return (
            <div>
                <SimpleQRScanner></SimpleQRScanner>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen">
            <BackgroundBeams/>
            <div className="relative z-10 flex flex-col items-center justify-center">
                <h1 className="text-xl font-bold mb-4 text-white">Your {eventTitle} ticket</h1>
                {ticketID ? (
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <QrCode id={ticketID}/>
                    </div>
                ) : (
                    <p className="text-white">Generating QR Code...</p>
                )}
            </div>
        </div>
    );
}
