"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import bcrypt from "bcryptjs";

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
    return <div>Sign in to view this page</div>;
  }

  return <div>{loading ? "Syncing user..." : `Welcome, ${user?.firstName}!`}</div>;
}
