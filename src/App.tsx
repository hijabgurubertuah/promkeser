import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MobileSidebar } from './components/MobileSidebar';
import { Footer } from './components/Footer';
import { DashboardView } from './components/views/DashboardView';
import { AboutView } from './components/views/AboutView';
import { MembersView } from './components/views/MembersView';
import { DuesView } from './components/views/DuesView';
import { FinanceView } from './components/views/FinanceView';
import { ActivitiesView } from './components/views/ActivitiesView';
import { DocumentsView } from './components/views/DocumentsView';
import { PusakaView } from './components/views/PusakaView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { ReceiptPreviewModal } from './components/modals/ReceiptPreviewModal';
import { SubmitDuesModal } from './components/modals/SubmitDuesModal';
import { MemberDetailModal } from './components/modals/MemberDetailModal';
import { AddActivityModal } from './components/modals/AddActivityModal';
import { CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {activeTab === 'beranda' && <DashboardView />}
      {activeTab === 'tentang' && <AboutView />}
      {activeTab === 'anggota' && <MembersView />}
      {activeTab === 'iuran' && <DuesView />}
      {activeTab === 'keuangan' && <FinanceView />}
      {activeTab === 'kegiatan' && <ActivitiesView />}
      {activeTab === 'dokumen' && <DocumentsView />}
      {activeTab === 'pusaka' && <PusakaView />}
      {activeTab === 'pengaturan' && <SettingsView />}
    </main>
  );
};

const ToastNotification: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 dark:border-slate-200 text-xs font-semibold animate-bounce transition">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors selection:bg-orange-500 selection:text-white">
        <Header />
        <MobileSidebar />
        <MainContent />
        <Footer />

        {/* Global Modals */}
        <AddTransactionModal />
        <ReceiptPreviewModal />
        <SubmitDuesModal />
        <MemberDetailModal />
        <AddActivityModal />

        {/* Floating System Toast */}
        <ToastNotification />
      </div>
    </AppProvider>
  );
}
