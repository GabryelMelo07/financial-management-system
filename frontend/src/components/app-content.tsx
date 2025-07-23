import { useState } from "react";

import type { Page } from "@/types";

import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Reports from "@/pages/reports";

import Navbar from "@/components/navbar";
import AddTransactionModal from "@/components/add-transaction-modal";
import { Separator } from "./ui/separator";

export default function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions onAddTransaction={() => setShowAddModal(true)} />;
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
        onAddTransaction={() => setShowAddModal(true)}
      />
      <Separator /> 
      <main className="max-w-7xl mx-auto p-6">{renderPage()}</main>
      <AddTransactionModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
