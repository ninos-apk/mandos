"use client";

import type { MouseEvent } from "react";

export function ConfirmSubmit({ children, message = "Diesen Eintrag wirklich löschen?" }: { children: React.ReactNode; message?: string }) {
  function confirm(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }

  return <button className="admin-button danger" type="submit" onClick={confirm}>{children}</button>;
}
