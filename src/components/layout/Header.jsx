import React from "react";
import { UserCircle, Bell, Menu } from "lucide-react";

export default function Header({
  currentRole,
  setCurrentRole,
  activeTab,
  setSidebarOpen
}) {
  // Dynamic page title based on active tab
  const pageTitles = {
    dashboard: "Dashboard Overview",
    requisition: "New Material Request (RF)",
    approvals: "Requisition Approvals",
    inventory: "Inventory Monitoring",
    delivery: "Receiving & Delivery (RM/AR)",
    purchasing: "Procurement & Purchase Orders",
  };

  const title = pageTitles[activeTab] || "FurniTrack System";

  return (
    <header
      className="
        h-16 bg-white border-b border-slate-200 
        flex items-center justify-between px-4 md:px-8 
        fixed top-0 right-0 left-0 md:left-64
        z-20 shadow-sm
      "
    >
      {/* ---- MOBILE MENU BUTTON ---- */}
      <button
        className="md:hidden text-slate-600 hover:text-indigo-600 p-2"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* ---- PAGE TITLE / BREADCRUMB ---- */}
      <div className="flex flex-col">
        <span className="text-[11px] text-slate-400 uppercase tracking-wide">
          {currentRole === "DEPARTMENT"
            ? "Department Head"
            : currentRole === "CUSTODIAN"
            ? "General Manager"
            : "System User"}
        </span>
        <h2 className="text-slate-700 font-semibold text-lg leading-tight">
          {title}
        </h2>
      </div>

      {/* ---- RIGHT SECTION ---- */}
      <div className="flex items-center gap-6">

        {/* Profile and Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCircle size={32} className="text-slate-300" />
            <div className="hidden md:block leading-tight">
              <p className="text-sm font-bold text-slate-700">
                {currentRole === "DEPARTMENT" ? "Department Head" : 
                 currentRole === "CUSTODIAN" ? "General Manager" : "System User"}
              </p>
              <p className="text-xs text-slate-400">
                Logged in
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              // Navigate to login page after logout
              const event = new CustomEvent('logout');
              window.dispatchEvent(event);
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
