import React, { useState } from 'react';
import HeaderComponent from '@/components/HeaderComponent';
import CameraView from '@/components/CameraView';
import AnalysisView from '@/components/AnalysisView';
import HistoryView from '@/pages/HistoryView';
import ProfileView from '@/components/ProfileView';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { queryClient } from '@/lib/queryClient';

const Home: React.FC = () => {
  const [activeView, setActiveView] = useState<'camera' | 'analysis' | 'history' | 'profile'>('camera');
  const { 
    image, 
    result, 
    isAnalyzing, 
    isSaving, 
    handleImageCapture, 
    saveToHistory, 
    resetState 
  } = useImageAnalysis();

  const handleImageCaptured = async (file: File) => {
    await handleImageCapture(file);
    setActiveView('analysis');
  };

  const handleNewAnalysis = () => {
    resetState();
    setActiveView('camera');
  };

  const handleSaveAnalysis = async () => {
    const savedItem = await saveToHistory();
    if (savedItem) {
      // Invalidate the history query to refresh the history view
      queryClient.invalidateQueries({ queryKey: ['/api/analysis-history'] });
    }
  };

  const handleShowHistory = () => {
    setActiveView('history');
  };

  const handleCloseHistory = () => {
    setActiveView('camera');
  };

  const handleShowProfile = () => {
    setActiveView('profile');
  };

  const handleCloseProfile = () => {
    setActiveView('camera');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HeaderComponent 
        onHistoryClick={handleShowHistory} 
        onProfileClick={handleShowProfile}
      />
      
      <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        {activeView === 'camera' && (
          <CameraView onImageCapture={handleImageCaptured} />
        )}
        
        {activeView === 'analysis' && (
          <AnalysisView 
            isLoading={isAnalyzing}
            isSaving={isSaving}
            image={image}
            result={result}
            onNewAnalysis={handleNewAnalysis}
            onSaveAnalysis={handleSaveAnalysis}
          />
        )}
        
        {activeView === 'history' && (
          <HistoryView onClose={handleCloseHistory} />
        )}

        {activeView === 'profile' && (
          <ProfileView onClose={handleCloseProfile} />
        )}
      </main>
    </div>
  );
};

export default Home;
