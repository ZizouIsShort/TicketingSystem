"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import bcrypt from "bcryptjs";

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
    }
  }, [user]);

  if (!isSignedIn) {
    return<div>Sign in to view this page</div>;
  }

  if(user?.publicMetadata?.role === 'admin'){
    return <p>Hello Admin</p>
  }
  return (
      <>
        <div>
          {loading ? "Syncing user..." : `Welcome, ${user?.firstName}!`}
        </div>
        {user?.id && <QRCodeCanvas value={`fest-ticket:${user.id}`} size={200} />}
      </>

  );
}
