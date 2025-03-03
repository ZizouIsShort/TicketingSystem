"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import QrCode from "@/components/QrCode";
import bcrypt from "bcryptjs";
import {isThenable} from "next/dist/shared/lib/is-thenable";
import {error} from "next/dist/build/output/log";

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
                            headers: { "Content-Type": "application/json"},
                            body: JSON.stringify({
                                ticketID: ticket,
                                title: eventT,
                                uid: user.id,
                                createdAt: formattedDate,
                                torf: true,
                            }),
                        }).then((res)=> res.json()).then((genTick)=>{
                            console.log("Ticket Gen response:", genTick);
                            setLoading(false);
                        }).catch((error)=>{
                            console.error("Error in ticket generation:", error)
                            setLoading(false);
                        })

                    } else {
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
        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    };

    if (!isSignedIn) {
        return <div>Sign in to view this page</div>;
    }

    if (studentExists === false) {
        return (
            <>
                <input
                    className={'bg-black'}
                    placeholder="Enter your college"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                />
                <input
                    className={'bg-black'}
                    placeholder="Enter your stream"
                    value={cStream}
                    onChange={(e) => setCStream(e.target.value)}
                />
                <input
                    className={'bg-black'}
                    placeholder="Enter your year"
                    value={cYear}
                    onChange={(e) => setCYear(e.target.value)}
                />
                <button onClick={studentDetails}>Submit</button>
            </>
        );
    }

    if (user?.publicMetadata?.role === "admin") {
        return <p>Hello Admin</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-xl font-bold mb-4">Your Event Ticket</h1>
            {ticketID ? <QrCode eventTitle={eventTitle} id={ticketID}/> : <p>Generating QR Code...</p>}
        </div>
    );
}
