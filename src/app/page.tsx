"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import bcrypt from "bcryptjs";
import Scanner from "../components/scanner";

export default function HomePage() {
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user?.publicMetadata?.role !== 'admin') {
      const email = user.primaryEmailAddress?.emailAddress || "";

      // Generate a hashed password using bcryptjs
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(email, salt); // ✅ Hash the email as the fake password

      console.log(user?.publicMetadata?.role);

      fetch("./api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          password: hash,
          role: 'user',
        }),
      })
          .then((res) => res.json())
          .then(() => setLoading(false));
    const { user, isSignedIn } = useUser();
    const [loading, setLoading] = useState(true);

    const [cName, setCName] = useState("");
    const [cStream, setCStream] = useState("");
    const [cYear, setCYear] = useState("");

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
                    email,
                    password: hash,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                }),
            })
                .then((res) => res.json())
                .then(() => {
                    return fetch("/api/get_student_id", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: user.id }),
                    });
                })
                .then((res) => res.json())
                .then((data) => {
                    if (data.exists) {
                        setStudentExists(true);
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
                            console.log("Admin Details Response:", adminData);
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
    else if(user && user?.publicMetadata?.role === 'admin'){
      const email = user.primaryEmailAddress?.emailAddress || "";

      // Generate a hashed password using bcryptjs
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(email, salt); // ✅ Hash the email as the fake password

      console.log(user?.publicMetadata?.role);

      fetch("./api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          password: hash,
          role: 'admin',
        }),
      })
          .then((res) => res.json())
          .then(() => setLoading(false));

    if (studentExists === false) {
        return (
            <>
                <input
                    placeholder="Enter your college"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                />
                <input
                    placeholder="Enter your stream"
                    value={cStream}
                    onChange={(e) => setCStream(e.target.value)}
                />
                <input
                    placeholder="Enter your year"
                    value={cYear}
                    onChange={(e) => setCYear(e.target.value)}
                />
                <button onClick={studentDetails}>Submit</button>
            </>
        );
    }
  }, [user]);

<<<<<<< Updated upstream
  if (!isSignedIn) {
    return <div className="text-center text-red-500 mt-10">Sign in to view this page</div>;
  }
  


  if(user?.publicMetadata?.role === 'admin'){
    return <p>Hello Admin</p>
  }
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Event Name</h1>
        <div className="text-2xl text-gray-800 mb-4">
          {loading ? "Syncing user..." : `Welcome, ${user?.firstName}!`}
        </div>
        {user?.id && (
            <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-md">
              <QRCodeCanvas value={`fest-ticket:${user.id}`} size={200} />
            </div>
        )}
        <Scanner/>
      </div>
  );
=======
    if (user?.publicMetadata?.role === "admin") {
        return <p>Hello Admin</p>;
    }

    return (
        <>
            <div>{loading ? "Syncing user..." : `Welcome, ${user?.firstName}!`}</div>
            {user?.id && <QRCodeCanvas value={`fest-ticket:${user.id}`} size={200} />}
        </>
    );
>>>>>>> Stashed changes
}
