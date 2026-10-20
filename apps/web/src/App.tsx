import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar, NavTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { TransactionsPage } from "./features/transactions/TransactionsPage";
import { BudgetsPage } from "./features/budgets/BudgetsPage";
import { HistoryPage } from "./features/history/HistoryPage";
import { CategoriesPage } from "./features/categories/CategoriesPage";
import { ImportPage } from "./features/imports/ImportPage";
import { ReportsPage } from "./features/reports/ReportsPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { TransactionModal } from "./features/transactions/TransactionModal";
import { Category, Transaction } from "./types";
import { api } from "./services/apiClient";

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const fetchCategories = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.get<Category[]>("/categories");
      setCategories(data);
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const handleOpenAddTx = () => {
    setTxToEdit(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsTxModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08120e] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === "login" ? (
      <LoginPage onSwitchToRegister={() => setAuthView("register")} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView("login")} />
    );
  }

  const getPageMeta = () => {
    switch (currentTab) {
      case "dashboard":
        return {
          title: "Financial Dashboard",
          subtitle: "Real-time overview of spending, budgets, and savings",
        };
      case "transactions":
        return {
          title: "Transaction Register",
          subtitle: "View, filter, and audit recorded income and expenses",
        };
      case "budgets":
        return {
          title: "Budget Management",
          subtitle: "Track category spending against allocated monthly caps",
        };
      case "history":
        return {
          title: "Spending History",
          subtitle: "Period-over-period delta comparisons and category shifts",
        };
      case "categories":
        return {
          title: "Category Catalog",
          subtitle: "Customize categories and solid visual accents",
        };
      case "import":
        return {
          title: "Import Statement",
          subtitle: "Safe statement ingestion from CSV and Excel spreadsheets",
        };
      case "reports":
        return {
          title: "Statements & Reports",
          subtitle: "Export printable PDF statements and structured data files",
        };
      case "settings":
        return {
          title: "System Settings",
          subtitle: "Regional formatting, currencies, and data privacy options",
        };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="flex min-h-screen bg-surface-subtle dark:bg-surface-darker">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAddTransaction={handleOpenAddTx}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === "dashboard" && (
            <DashboardPage
              onOpenAddTransaction={handleOpenAddTx}
              onOpenEditTransaction={handleOpenEditTx}
              onNavigateToImport={() => setCurrentTab("import")}
            />
          )}

          {currentTab === "transactions" && (
            <TransactionsPage
              onOpenAddTransaction={handleOpenAddTx}
              onOpenEditTransaction={handleOpenEditTx}
              categories={categories}
            />
          )}

          {currentTab === "budgets" && <BudgetsPage categories={categories} />}

          {currentTab === "history" && <HistoryPage />}

          {currentTab === "categories" && (
            <CategoriesPage
              categories={categories}
              onRefreshCategories={fetchCategories}
            />
          )}

          {currentTab === "import" && (
            <ImportPage
              onImportSuccess={() => {
                fetchCategories();
                setCurrentTab("dashboard");
              }}
            />
          )}

          {currentTab === "reports" && <ReportsPage categories={categories} />}

          {currentTab === "settings" && <SettingsPage />}
        </main>
      </div>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={() => {
          fetchCategories();
        }}
        transactionToEdit={txToEdit}
        categories={categories}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
