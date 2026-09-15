import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MobileSidebar } from './components/MobileSidebar';
import { Footer } from './components/Footer';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { AboutView } from './components/views/AboutView';
import { MembersView } from './components/views/MembersView';
import { UsersManagementView } from './components/views/UsersManagementView';
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
import { MemberImportWizardModal } from './components/modals/MemberImportWizardModal';
import { MemberExportModal } from './components/modals/MemberExportModal';

import { CsvDropzone } from './components/CsvDropzone';

const MainContent: React.FC = () => {
  const { activeTab, isMasterAdmin, isPengurus } = useApp();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {activeTab === 'beranda' && <DashboardView />}
      {activeTab === 'tentang' && <AboutView />}
      {activeTab === 'anggota' && <MembersView />}
      {activeTab === 'pengguna' && (isMasterAdmin || isPengurus ? <UsersManagementView /> : <DashboardView />)}
      {activeTab === 'iuran' && <DuesView />}
      {activeTab === 'keuangan' && <FinanceView />}
      {activeTab === 'kegiatan' && <ActivitiesView />}
      {activeTab === 'dokumen' && <DocumentsView />}
      {activeTab === 'pusaka' && <PusakaView />}
      {activeTab === 'pengaturan' && <SettingsView />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { isAuthenticated, isImportModalOpen, closeImportModal, isExportModalOpen, closeExportModal } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors selection:bg-orange-500 selection:text-white overflow-x-hidden">
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

      {/* Enhanced Import & Export Wizard Modals */}
      <MemberImportWizardModal isOpen={isImportModalOpen} onClose={closeImportModal} />
      <MemberExportModal isOpen={isExportModalOpen} onClose={closeExportModal} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <CsvDropzone>
        <AppShell />
      </CsvDropzone>
    </AppProvider>
  );
}
