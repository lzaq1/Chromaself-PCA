import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  Share2, 
  Shirt, 
  Sparkles, 
  Eye, 
  RefreshCw, 
  Palette, 
  User, 
  Zap, 
  Calendar,
  Layers,
  Info,
  FileImage,
  Archive
} from 'lucide-react';
import { AnalysisResult } from '../services/geminiService';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ResultsDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ChromaSelf - My Aesthetic Manifesto',
          text: `I just discovered my Soul Hue: ${result.personalityColor.name}! Check out my personalized style analysis.`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const downloadPNGZip = async () => {
    if (!reportRef.current) return;
    setIsExportingPNG(true);
    
    const styleTags = Array.from(document.getElementsByTagName('style'));
    const originalStyles: {el: HTMLStyleElement, content: string}[] = [];
    styleTags.forEach(style => {
      if (style.innerHTML.includes('oklch') || style.innerHTML.includes('oklab') || style.innerHTML.includes('@import')) {
        originalStyles.push({el: style, content: style.innerHTML});
        style.innerHTML = style.innerHTML
          .replace(/oklch\s*\([^)]+\)/g, '#4a40e0')
          .replace(/oklab\s*\([^)]+\)/g, '#4a40e0')
          .replace(/@import[^;]+;/g, '');
      }
    });

    try {
      const zip = new JSZip();
      const sections = reportRef.current.querySelectorAll('.export-section');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        // Ensure section is visible for capture
        const dataUrl = await toPng(section, {
          quality: 1,
          pixelRatio: 3, // Higher res for PNGs
          backgroundColor: '#ffffff',
          width: 800, // Fixed width for A4 proportions
          style: {
            borderRadius: '0',
            margin: '0',
            padding: '40px',
            width: '800px',
            transform: 'none',
            boxShadow: 'none'
          }
        });
        const pageData = dataUrl.split(',')[1];
        zip.file(`ChromaSelf-Editorial-Page-${i + 1}.png`, pageData, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `ChromaSelf-Editorial-Dossier.zip`);
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('Failed to export PNGs. Please try again.');
    } finally {
      originalStyles.forEach(item => item.el.innerHTML = item.content);
      setIsExportingPNG(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    
    const styleTags = Array.from(document.getElementsByTagName('style'));
    const originalStyles: {el: HTMLStyleElement, content: string}[] = [];
    styleTags.forEach(style => {
      if (style.innerHTML.includes('oklch') || style.innerHTML.includes('oklab') || style.innerHTML.includes('@import')) {
        originalStyles.push({el: style, content: style.innerHTML});
        style.innerHTML = style.innerHTML
          .replace(/oklch\s*\([^)]+\)/g, '#4a40e0')
          .replace(/oklab\s*\([^)]+\)/g, '#4a40e0')
          .replace(/@import[^;]+;/g, '');
      }
    });
    
    try {
      const sections = reportRef.current.querySelectorAll('.export-section');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        const dataUrl = await toPng(section, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          width: 800,
          style: {
            borderRadius: '0',
            margin: '0',
            padding: '40px',
            width: '800px',
            transform: 'none',
            boxShadow: 'none'
          }
        });
        
        if (i > 0) pdf.addPage();
        
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => (img.onload = resolve));
        
        const imgWidth = pdfWidth;
        const imgHeight = (img.height * imgWidth) / img.width;
        
        // Center vertically if it fits, otherwise start at top
        const yPos = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;
        
        pdf.addImage(dataUrl, 'PNG', 0, yPos, imgWidth, imgHeight, undefined, 'FAST');
      }
      
      pdf.save(`ChromaSelf-Editorial-A4-Report.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      originalStyles.forEach(item => item.el.innerHTML = item.content);
      setIsDownloading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Outfit:wght@300;400;600;800&display=swap');
        
        .editorial-font { font-family: 'Playfair Display', serif; }
        .ui-font { font-family: 'Outfit', sans-serif; }
        
        .pdf-report, .pdf-report * {
          color-scheme: light !important;
          text-shadow: none !important;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: auto;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />

      <div ref={reportRef} className="pdf-report bg-[#ffffff] rounded-[2.5rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-[#f1f5f9] relative overflow-hidden ui-font">
        {isDownloading && (
          <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center no-print">
            <div className="w-20 h-20 border-4 border-[#4a40e0] border-t-transparent rounded-full animate-spin mb-6" />
            <p className="font-bold text-[#4a40e0] text-2xl animate-pulse tracking-tight">Crafting your editorial report...</p>
          </div>
        )}

        {/* Header - Print Only */}
        <div className="hidden print-only p-12 border-b border-[#f1f5f9] bg-[#fafafa]">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="editorial-font text-6xl font-black text-[#1a1a1a] tracking-tighter">
                Chroma<span className="text-[#4a40e0]">Self</span>
              </h1>
              <p className="text-[#64748b] font-semibold uppercase tracking-[0.3em] text-[10px] mt-2">
                The Science of Personal Aesthetic • Confidential Dossier
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#94a3b8] font-mono uppercase">№ {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <p className="text-sm text-[#475569] font-bold mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {!showPreview ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 px-8 text-center no-print"
          >
            <div className="w-28 h-28 bg-[#4a40e0]/5 rounded-full flex items-center justify-center mb-10 relative">
              <Sparkles className="w-14 h-14 text-[#4a40e0]" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 bg-[#4a40e0]/10 rounded-full blur-xl"
              />
            </div>
            <h2 className="editorial-font text-5xl md:text-7xl font-black mb-6 tracking-tighter text-[#1a1a1a]">
              Your Aesthetic <br/> <span className="text-[#4a40e0]">Manifesto</span>
            </h2>
            <p className="text-xl text-[#64748b] max-w-xl mb-12 leading-relaxed font-light">
              We've decoded your unique chromatic signature. Your professional style dossier is meticulously prepared and ready for review.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreview(true)}
              className="soul-gradient text-[#ffffff] px-16 py-7 rounded-3xl font-extrabold text-2xl flex items-center gap-5 shadow-[0_25px_50px_-12px_rgba(74,64,224,0.5)] transition-all"
            >
              <Eye className="w-8 h-8" /> Reveal My Profile
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            {/* Hero Section */}
            <div className="export-section relative min-h-[500px] md:h-[800px] py-20 md:py-0 overflow-hidden flex items-center justify-center">
              <div 
                className="absolute inset-0 opacity-10 blur-[100px]"
                style={{ backgroundColor: result.personalityColor.hex }}
              />
              
              <div className="relative z-10 w-full max-w-6xl px-8 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                {/* Signature Look - Left Side */}
                <div className="w-full md:w-1/2">
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                  >
                    <div className="absolute -inset-4 bg-[#f1f5f9] rounded-[3rem] -rotate-2" />
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white bg-white">
                      <img 
                        src={result.signatureLook} 
                        alt="Signature Look" 
                        className="w-full h-auto aspect-[3/4] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-xl flex items-center justify-center p-2 border-8 border-[#f8fafc]">
                      <div 
                        className="w-full h-full rounded-full shadow-inner"
                        style={{ backgroundColor: result.personalityColor.hex }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Soul Hue Info - Right Side */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="inline-block px-6 py-2 rounded-full bg-[#4a40e0]/10 text-[#4a40e0] font-bold text-sm tracking-[0.2em] uppercase mb-8">
                      The Soul Hue
                    </span>
                    <h2 className="editorial-font text-4xl md:text-7xl font-black mb-4 tracking-tighter text-[#1a1a1a] leading-[0.9]">
                      {result.personalityColor.name}
                    </h2>
                    <div className="h-1 w-32 bg-[#4a40e0] mb-8 mx-auto md:mx-0" />
                    <p className="editorial-font italic text-lg md:text-xl text-[#475569] leading-tight font-light">
                      "{result.personalityColor.meaning}"
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Analysis Bento Grid */}
            <div className="export-section px-8 md:px-20 py-24 bg-[#fafafa]">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div>
                    <h3 className="editorial-font text-5xl font-black text-[#1a1a1a] tracking-tight">
                      The Analysis <span className="text-[#4a40e0]">Matrix</span>
                    </h3>
                    <p className="text-[#64748b] mt-2 text-lg">Scientific breakdown of your biometric profile.</p>
                  </div>
                  <div className="flex items-center gap-4 no-print">
                    <button onClick={downloadPDF} className="p-4 rounded-2xl bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shadow-sm">
                      <Download className="w-6 h-6 text-[#475569]" />
                    </button>
                    <button onClick={handleShare} className="p-4 rounded-2xl bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shadow-sm">
                      <Share2 className="w-6 h-6 text-[#475569]" />
                    </button>
                  </div>
                </div>

                <div className="bento-grid">
                  <div className="col-span-1 md:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#f1f5f9] flex flex-col justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-[#4a40e0]/5 flex items-center justify-center mb-8">
                      <User className="w-7 h-7 text-[#4a40e0]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Skin Undertone</p>
                      <h4 className="editorial-font text-4xl font-bold text-[#1a1a1a]">{result.skinToneAnalysis.undertone}</h4>
                    </div>
                  </div>

                  <div className="col-span-1 bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#f1f5f9] flex flex-col justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-8">
                      <Zap className="w-7 h-7 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Contrast</p>
                      <h4 className="editorial-font text-4xl font-bold text-[#1a1a1a]">{result.skinToneAnalysis.contrastLevel}</h4>
                    </div>
                  </div>

                  <div className="col-span-1 bg-[#1a1a1a] p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between text-white">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Seasonal Type</p>
                      <h4 className="editorial-font text-4xl font-bold">{result.skinToneAnalysis.seasonalType}</h4>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-4 bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#f1f5f9] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Info className="w-40 h-40" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="editorial-font text-2xl font-bold mb-4 text-[#1a1a1a]">Professional Reasoning</h4>
                      <p className="text-xl text-[#475569] leading-relaxed italic font-light">
                        "{result.skinToneAnalysis.professionalReasoning}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Palettes - Editorial Style */}
            <div className="px-8 md:px-20 py-32 bg-white">
              <div className="max-w-6xl mx-auto space-y-32">
                
                {/* Tops Section */}
                <section className="export-section">
                  <div className="flex items-center gap-6 mb-16">
                    <div className="w-16 h-16 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center editorial-font text-2xl font-bold">01</div>
                    <h3 className="editorial-font text-5xl font-black text-[#1a1a1a]">Signature <span className="text-[#4a40e0]">Tops</span></h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {result.recommendedPalette.tops.map((color, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="group"
                      >
                        <div 
                          className="w-full aspect-[4/3] rounded-[2rem] shadow-xl mb-6 transition-transform duration-500 group-hover:scale-[1.02]"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="px-2">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="editorial-font text-2xl font-bold text-[#1a1a1a]">{color.name}</h4>
                            <span className="text-xs font-mono text-[#94a3b8]">{color.hex}</span>
                          </div>
                          <p className="text-[#64748b] leading-relaxed font-light text-sm">
                            {color.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Bottoms Section */}
                <section className="export-section">
                  <div className="flex items-center gap-6 mb-16">
                    <div className="w-16 h-16 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center editorial-font text-2xl font-bold">02</div>
                    <h3 className="editorial-font text-5xl font-black text-[#1a1a1a]">Essential <span className="text-[#4a40e0]">Bottoms</span></h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {result.recommendedPalette.bottoms.map((color, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="group"
                      >
                        <div 
                          className="w-full aspect-[4/3] rounded-[2rem] shadow-xl mb-6 transition-transform duration-500 group-hover:scale-[1.02]"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="px-2">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="editorial-font text-2xl font-bold text-[#1a1a1a]">{color.name}</h4>
                            <span className="text-xs font-mono text-[#94a3b8]">{color.hex}</span>
                          </div>
                          <p className="text-[#64748b] leading-relaxed font-light text-sm">
                            {color.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Hijabs Section (Conditional) */}
                {result.isHijabi && result.recommendedPalette.hijabs && (
                  <section className="export-section">
                    <div className="flex items-center gap-6 mb-16">
                      <div className="w-16 h-16 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center editorial-font text-2xl font-bold">03</div>
                      <h3 className="editorial-font text-5xl font-black text-[#1a1a1a]">Editorial <span className="text-[#4a40e0]">Hijabs</span></h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      {result.recommendedPalette.hijabs.map((color, idx) => (
                        <motion.div 
                          key={idx}
                          whileHover={{ y: -10 }}
                          className="group"
                        >
                          <div 
                            className="w-full aspect-[4/3] rounded-[2rem] shadow-xl mb-6 transition-transform duration-500 group-hover:scale-[1.02]"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="px-2">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="editorial-font text-2xl font-bold text-[#1a1a1a]">{color.name}</h4>
                              <span className="text-xs font-mono text-[#94a3b8]">{color.hex}</span>
                            </div>
                            <p className="text-[#64748b] leading-relaxed font-light text-sm">
                              {color.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Accessories Section */}
                {result.recommendedPalette.accessories && result.recommendedPalette.accessories.length > 0 && (
                  <section className="export-section">
                    <div className="flex items-center gap-6 mb-16">
                      <div className="w-16 h-16 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center editorial-font text-2xl font-bold">
                        {result.isHijabi ? '04' : '03'}
                      </div>
                      <h3 className="editorial-font text-5xl font-black text-[#1a1a1a]">Curated <span className="text-[#4a40e0]">Accents</span></h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      {result.recommendedPalette.accessories.map((color, idx) => (
                        <motion.div 
                          key={idx}
                          whileHover={{ y: -10 }}
                          className="group"
                        >
                          <div 
                            className="w-full aspect-[4/3] rounded-[2rem] shadow-xl mb-6 transition-transform duration-500 group-hover:scale-[1.02]"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="px-2">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="editorial-font text-2xl font-bold text-[#1a1a1a]">{color.name}</h4>
                              <span className="text-xs font-mono text-[#94a3b8]">{color.hex}</span>
                            </div>
                            <p className="text-[#64748b] leading-relaxed font-light text-sm">
                              {color.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Weekly Style Guide - Horizontal Scroll or Grid */}
            <div className="export-section px-8 md:px-20 py-32 bg-[#1a1a1a] text-white overflow-hidden">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                  <div>
                    <h3 className="editorial-font text-6xl font-black tracking-tight">
                      The Weekly <span className="text-[#4a40e0]">Protocol</span>
                    </h3>
                    <p className="text-white/50 mt-4 text-xl font-light">Seven days of meticulously curated aesthetics.</p>
                  </div>
                  <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-[#4a40e0]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {result.weeklyOutfits?.map((outfit, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors group"
                    >
                      <span className="text-[10px] font-bold text-[#4a40e0] uppercase tracking-[0.3em] mb-4 block">{outfit.day}</span>
                      <h4 className="editorial-font text-2xl font-bold mb-8 group-hover:text-[#4a40e0] transition-colors">{outfit.vibe}</h4>
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl shadow-inner border border-white/10 flex-shrink-0" style={{ backgroundColor: outfit.topHex }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Top</p>
                            <p className="text-sm font-medium truncate">{outfit.top}</p>
                            <p className="text-[8px] font-mono text-white/30">{outfit.topHex}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl shadow-inner border border-white/10 flex-shrink-0" style={{ backgroundColor: outfit.bottomHex }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Bottom</p>
                            <p className="text-sm font-medium truncate">{outfit.bottom}</p>
                            <p className="text-[8px] font-mono text-white/30">{outfit.bottomHex}</p>
                          </div>
                        </div>
                        {result.isHijabi && outfit.hijab && outfit.hijabHex && (
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl shadow-inner border border-white/10 flex-shrink-0" style={{ backgroundColor: outfit.hijabHex }} />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Hijab</p>
                              <p className="text-sm font-medium truncate">{outfit.hijab}</p>
                              <p className="text-[8px] font-mono text-white/30">{outfit.hijabHex}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Styling Advice - Final Note */}
            <div className="export-section px-8 md:px-20 py-32 bg-white">
              <div className="max-w-4xl mx-auto text-center">
                <div className="w-20 h-20 bg-[#4a40e0]/5 rounded-full flex items-center justify-center mx-auto mb-10">
                  <Palette className="w-10 h-10 text-[#4a40e0]" />
                </div>
                <h3 className="editorial-font text-5xl font-black text-[#1a1a1a] mb-8">Styling <span className="text-[#4a40e0]">Philosophy</span></h3>
                <div className="relative mb-20">
                  <span className="absolute -top-10 -left-10 text-9xl text-[#f1f5f9] editorial-font select-none">“</span>
                  <p className="editorial-font text-3xl md:text-4xl text-[#475569] leading-tight font-light relative z-10 break-words overflow-wrap-anywhere">
                    {result.clothingAdvice}
                  </p>
                  <span className="absolute -bottom-20 -right-10 text-9xl text-[#f1f5f9] editorial-font select-none">”</span>
                </div>
                
                <div className="pt-20 border-t border-[#f1f5f9] text-left">
                  <p className="text-[10px] text-[#94a3b8] uppercase tracking-[0.3em] font-bold mb-4">Editorial Note</p>
                  <p className="text-xs text-[#64748b] leading-relaxed max-w-2xl">
                    This dossier was generated using the ChromaSelf™ Chromatic Analysis Engine. The recommendations provided are based on biometric color theory and personal aesthetic mapping. For the most accurate results, ensure your profile photo was taken in natural daylight.
                  </p>
                </div>
              </div>
            </div>

            {/* Final Actions */}
            <div className="px-8 pb-32 no-print">
              <div className="max-w-xl mx-auto flex flex-col gap-6">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadPDF}
                  disabled={isDownloading || isExportingPNG}
                  className="w-full soul-gradient text-white p-8 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-[0_25px_50px_-12px_rgba(74,64,224,0.4)] disabled:opacity-70"
                >
                  {isDownloading ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Download className="w-8 h-8" />}
                  {isDownloading ? 'Generating Dossier...' : 'Download Editorial Report (PDF)'}
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadPNGZip}
                  disabled={isDownloading || isExportingPNG}
                  className="w-full bg-[#1a1a1a] text-white p-8 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl disabled:opacity-70"
                >
                  {isExportingPNG ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Archive className="w-8 h-8" />}
                  {isExportingPNG ? 'Exporting PNGs...' : 'Export High-Res PNGs (ZIP)'}
                </motion.button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleShare} className="bg-white border border-[#e2e8f0] p-6 rounded-[2rem] font-bold text-[#475569] hover:bg-[#f8fafc] transition-colors flex items-center justify-center gap-3">
                    <Share2 className="w-5 h-5" /> Share
                  </button>
                  <button onClick={onReset} className="bg-white border border-[#e2e8f0] p-6 rounded-[2rem] font-bold text-[#94a3b8] hover:bg-[#f8fafc] transition-colors flex items-center justify-center gap-3">
                    <RefreshCw className="w-5 h-5" /> Reset
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
