import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Sparkles, X, RefreshCw } from 'lucide-react';
import { analyzeSelfie, generateVisualLook, AnalysisResult } from '../services/geminiService';
import { cn } from '../lib/utils';
import { UserProfile, incrementUsage, getUserProfile } from '../firebase';

interface DetectionInterfaceProps {
  onResult: (result: AnalysisResult) => void;
  userProfile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export const DetectionInterface: React.FC<DetectionInterfaceProps> = ({ onResult, userProfile, onProfileUpdate }) => {
  const [mode, setMode] = useState<'idle' | 'camera' | 'upload'>('idle');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setMode('idle');
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMode('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !userProfile) return;
    
    // Check 3-image limit
    if (userProfile.usageCount >= 3 && userProfile.role !== 'admin') {
      alert("You have reached the maximum limit of 3 analyses. Thank you for participating in the beta!");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeSelfie(image);
      // Generate visual look automatically
      try {
        const visualLook = await generateVisualLook(result, image);
        result.signatureLook = visualLook;
      } catch (imgError: any) {
        console.error("Image generation failed:", imgError);
        
        // If it's a quota/auth/permission error and we don't have a key, prompt for one
        if (imgError.message?.includes('429') || imgError.message?.includes('401') || imgError.message?.includes('403') || imgError.message?.includes('quota') || imgError.message?.includes('permission')) {
          // @ts-ignore
          if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            setNeedsKey(true);
            setIsAnalyzing(false);
            return;
          }
        }
      }

      // Increment usage in Firebase
      await incrementUsage(userProfile.uid);
      const updatedProfile = await getUserProfile(userProfile.uid);
      if (updatedProfile) onProfileUpdate(updatedProfile);

      onResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Something went wrong during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setNeedsKey(false);
      handleAnalyze();
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-8 py-12" id="detect">
      <div className="bg-[#ffffff] rounded-3xl p-2 shadow-2xl shadow-[rgba(74,64,224,0.05)] relative overflow-hidden border border-[rgba(226,232,240,0.5)]">
        <div className="bg-[rgba(248,250,252,0.5)] rounded-2xl p-8 md:p-12 text-center border-2 border-dashed border-[rgba(203,213,225,0.5)]">
          
          <AnimatePresence mode="wait">
            {needsKey ? (
              <motion.div
                key="needs-key"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center py-10"
              >
                <div className="w-20 h-20 rounded-full bg-[#fee2e2] flex items-center justify-center mb-6">
                  <Sparkles className="text-[#ef4444] w-10 h-10" />
                </div>
                <h2 className="font-headline text-3xl font-bold mb-3 tracking-tight text-[#2c2f31]">API Key Diperlukan</h2>
                <p className="text-[#595c5e] max-w-sm mx-auto mb-10">
                  Kuota gratis sistem untuk pembuatan gambar (Nano Banana) sudah habis atau nol. Silakan gunakan API Key kamu sendiri untuk melanjutkan.
                </p>
                <button
                  onClick={handleSelectKey}
                  className="soul-gradient text-[#ffffff] px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-[rgba(74,64,224,0.3)] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                >
                  Pilih API Key Saya
                </button>
                <p className="mt-6 text-xs text-[#94a3b8]">
                  Gunakan API Key dari project Google Cloud kamu. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">Pelajari tentang billing</a>.
                </p>
              </motion.div>
            ) : mode === 'idle' && !image && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#ffffff] shadow-xl flex items-center justify-center mb-6">
                  <Sparkles className="text-[#4a40e0] w-10 h-10" />
                </div>
                <h2 className="font-headline text-3xl font-bold mb-3 tracking-tight text-[#2c2f31]">Upload Your Essence</h2>
                <p className="text-[#595c5e] max-w-sm mx-auto mb-10">
                  Take a clear selfie or upload a photo to begin the chromatic scan.
                </p>

                <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
                  <button
                    onClick={() => setMode('camera')}
                    className="bg-[#ffffff] p-8 rounded-2xl border border-[#e2e8f0] hover:border-[rgba(74,64,224,0.4)] transition-all cursor-pointer group flex flex-col items-center justify-center shadow-sm hover:shadow-md"
                  >
                    <Camera className="w-10 h-10 text-[#94a3b8] group-hover:text-[#4a40e0] mb-4 transition-colors" />
                    <span className="font-bold text-[#2c2f31]">Take a Selfie</span>
                    <span className="text-xs text-[#595c5e] mt-1">Uses your system camera</span>
                  </button>
                  
                  <label className="bg-[#ffffff] p-8 rounded-2xl border border-[#e2e8f0] hover:border-[rgba(74,64,224,0.4)] transition-all cursor-pointer group flex flex-col items-center justify-center shadow-sm hover:shadow-md">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    <Upload className="w-10 h-10 text-[#94a3b8] group-hover:text-[#4a40e0] mb-4 transition-colors" />
                    <span className="font-bold text-[#2c2f31]">Upload Photo</span>
                    <span className="text-xs text-[#595c5e] mt-1">JPG, PNG up to 10MB</span>
                  </label>
                </div>
              </motion.div>
            )}

            {mode === 'camera' && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-2xl mx-auto"
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                  mirrored={false}
                  imageSmoothing={true}
                  forceScreenshotSourceSize={false}
                  disablePictureInPicture={true}
                  onUserMedia={() => {}}
                  onUserMediaError={() => {}}
                  screenshotQuality={0.92}
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={() => setMode('idle')}
                    className="bg-[rgba(255,255,255,0.2)] backdrop-blur-md text-[#ffffff] p-3 rounded-full hover:bg-[rgba(255,255,255,0.3)] transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <button
                    onClick={capture}
                    className="bg-[#ffffff] text-[#4a40e0] p-4 rounded-full shadow-xl hover:scale-110 transition-all active:scale-95"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                </div>
              </motion.div>
            )}

            {image && mode === 'idle' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-[#ffffff]">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-[rgba(0,0,0,0.5)] backdrop-blur-md text-[#ffffff] p-1 rounded-full hover:bg-[rgba(0,0,0,0.7)] transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setImage(null)}
                    className="px-6 py-3 rounded-full font-bold text-[#2c2f31] bg-[#ffffff] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Retake
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={cn(
                      "soul-gradient text-[#ffffff] px-10 py-3 rounded-full font-bold text-lg shadow-xl shadow-[rgba(74,64,224,0.3)] flex items-center gap-3 transition-all",
                      isAnalyzing ? "opacity-70 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                    )}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" /> Generate My Color
                      </>
                    )}
                  </button>
                </div>

                {isAnalyzing && (
                  <div className="mt-12 w-full max-w-md bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute inset-0 soul-gradient w-1/2 rounded-full"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
