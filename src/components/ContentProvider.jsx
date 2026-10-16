"use client";
import { createContext, useContext } from "react";

// Published edits for packages (title, picture, price label, hidden). Cards use it so lists match the package page.
const Ctx = createContext({});

export default function ContentProvider({ byId, children }) {
  return <Ctx.Provider value={byId || {}}>{children}</Ctx.Provider>;
}

export const usePackageContent = (id) => useContext(Ctx)[id] || {};
