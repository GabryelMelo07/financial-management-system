import { useState } from "react";

import type { Page } from "@/lib/types";

import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Reports from "@/pages/reports";

import Navbar from "@/components/navbar";
import { Separator } from "./ui/separator";

export default function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <Separator /> 
      <main className="max-w-7xl mx-auto p-6">{renderPage()}</main>
    </div>
  );
}
