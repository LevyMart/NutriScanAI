import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface CameraViewProps {
  onImageCapture: (file: File) => Promise<void>;
}

const CameraView: React.FC<CameraViewProps> = ({ onImageCapture }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraAccess = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onImageCapture(files[0]);
    }
  };

  return (
    <div className="mb-6 animate-in fade-in">
      <div className="flex flex-col items-center">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-medium text-primary-foreground mb-2">Análise Nutricional</h2>
          <p className="text-muted-foreground text-sm">
            Tire uma foto do seu alimento para analisar os valores nutricionais
          </p>
        </div>
        
        {/* Placeholder when no image */}
        <div className="w-full aspect-[4/3] bg-surface rounded-xl mb-4 flex flex-col items-center justify-center">
          <span className="material-icons text-6xl text-muted-foreground mb-2">no_food</span>
          <p className="text-muted-foreground text-sm">Nenhuma imagem selecionada</p>
        </div>
        
        {/* Camera Access Button */}
        <div className="flex justify-center">
          {/* Hidden input for camera access */}
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleFileChange}
          />
          
          {/* Button that triggers hidden input */}
          <Button 
            className="bg-primary hover:bg-primary/90 text-white py-3 px-8 rounded-full flex items-center justify-center shadow-lg transition-colors"
            onClick={handleCameraAccess}
          >
            <Camera className="mr-2 h-5 w-5" />
            <span>Tirar Foto</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraView;
