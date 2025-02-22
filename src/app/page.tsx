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
    if (user) {
      const email = user.primaryEmailAddress?.emailAddress || "";

      // Generate a hashed password using bcryptjs
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(email, salt); // ✅ Hash the email as the fake password

      fetch("./api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          password: hash,
        }),
      })
          .then((res) => res.json())
          .then(() => setLoading(false));
    }
  }, [user]);

  if (!isSignedIn) {
    return <div className="text-center text-red-500 mt-10">Sign in to view this page</div>;
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
}
