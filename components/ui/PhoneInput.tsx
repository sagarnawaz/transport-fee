"use client";

import { useState } from "react";

export function PhoneInput() {
  const [phone, setPhone] = useState("");

  return (
    <label className="grid gap-2">
      <span className="label">Phone number</span>
      <input
        autoComplete="tel"
        className="field"
        inputMode="numeric"
        maxLength={11}
        name="phone"
        onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
        pattern="03[0-9]{9}"
        placeholder="03xxxxxxxxx"
        required
        type="text"
        value={phone}
      />
    </label>
  );
}
