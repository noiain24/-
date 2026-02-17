import React, { useState } from 'react';
import { ChefHat, QrCode, LogOut, Printer, Coffee, RotateCcw, X, ScanLine } from 'lucide-react';
import { Order } from '../types';

interface AdminViewProps {
  incomingOrders: Order[];
  onSimulateScan: (id: number) => void;
  onExitAdmin: () => void;
  onResetSystem: () => void;
  logoUrl: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ incomingOrders, onSimulateScan, onExitAdmin, onResetSystem, logoUrl }) => {
  const [activeTab, setActiveTab] = useState<'kitchen' | 'qr'>('kitchen'); 
  const [printTableId, setPrintTableId] = useState<number | null>(null);

  // สร้าง URL ของ QR Code โดยใช้ API (ใช้ window.location.origin เพื่อให้ลิงก์กับเว็บปัจจุบันอัตโนมัติ)
  const getQrDataUrl = (tableId: number) => {
    const appUrl = `${window.location.origin}${window.location.pathname}?table=${tableId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(appUrl)}&color=111827`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F3F4F6] font-title text-slate-800">
      {/* Sidebar - Desktop (Hidden when printing) */}
      <aside className="w-full lg:w-96 bg-[#111827] text-white p-12 hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl no-print">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-20 h-20 bg-white rounded-full shadow-2xl border-4 border-slate-700 overflow-hidden flex items-center justify-center shadow-red-900/30">
             <img src={logoUrl} alt="Admin Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <h1 className="text-3xl font-semibold uppercase tracking-tighter leading-none">Mala<br/>Chuan</h1>
        </div>
        <nav className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('kitchen')} className={`w-full text-left p-6 rounded-[2.5rem] font-medium flex items-center gap-6 transition-all text-xl font-semibold ${activeTab === 'kitchen' ? 'bg-red-600 shadow-2xl shadow-red-900/40' : 'hover:bg-white/5 text-slate-500'}`}><ChefHat size={32} /> Kitchen Feed</button>
          <button onClick={() => setActiveTab('qr')} className={`w-full text-left p-6 rounded-[2.5rem] font-medium flex items-center gap-6 transition-all text-xl font-semibold ${activeTab === 'qr' ? 'bg-red-600 shadow-2xl shadow-red-900/40' : 'hover:bg-white/5 text-slate-500'}`}><QrCode size={32} /> QR Management</button>
        </nav>
        
        <div className="space-y-4 mt-auto">
          <button onClick={onResetSystem} className="w-full p-6 bg-slate-800 hover:bg-slate-700 rounded-3xl font-medium text-slate-400 flex items-center gap-6 transition-all border border-slate-700 hover:text-white font-semibold btn-press">
            <RotateCcw size={32} /> Daily Reset
          </button>
          <button onClick={onExitAdmin} className="w-full p-6 bg-white/5 hover:bg-red-600/20 rounded-3xl font-medium text-slate-400 flex items-center gap-6 transition-all border border-white/5 hover:text-red-500 font-semibold btn-press">
            <LogOut size={32} /> Customer Mode
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 md:p-16 overflow-y-auto pb-32 lg:pb-16 no-scrollbar no-print">
        {activeTab === 'kitchen' && (
          <div className="animate-fade">
             <div className="mb-16">
                <h2 className="text-6xl font-semibold text-slate-900 tracking-tighter">Kitchen Feed</h2>
                <p className="text-slate-400 font-medium text-2xl opacity-60 uppercase tracking-[0.3em] mt-3 tracking-widest font-semibold">Incoming Orders ({incomingOrders.length})</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {incomingOrders.map((o, i) => (
                  <div key={i} className="bg-white rounded-[4rem] shadow-2xl border border-slate-50 overflow-hidden flex flex-col group hover:-translate-y-3 transition-all duration-500 shadow-slate-200">
                    <div className={`p-10 flex justify-between items-center ${o.orderType === 'takeaway' ? 'bg-blue-50/50' : 'bg-red-50/50'}`}>
                      <div className="flex items-center gap-5">
                          <span className={`text-[11px] font-medium px-5 py-2 rounded-full border bg-white ${o.orderType === 'takeaway' ? 'text-blue-600 border-blue-200' : 'text-red-600 border-red-200'} uppercase tracking-[0.2em] font-semibold tracking-widest`}>
                              {o.orderType === 'takeaway' ? 'TO GO' : `TBL ${o.tableId}`}
                          </span>
                          <span className="text-sm font-medium text-slate-400 opacity-60 font-semibold">{o.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <span className="font-semibold text-4xl text-slate-800 tracking-tighter">{o.id}</span>
                    </div>
                    <div className="p-12 flex-1 space-y-8">
                      <div className="border-b-4 border-dashed border-slate-50 pb-8">
                          <p className="font-semibold text-3xl text-slate-900 leading-tight mb-4 tracking-tight">{o.details.base}</p>
                          <div className="flex gap-2">
                              <span className="text-[11px] font-medium bg-slate-900 text-white px-5 py-2 rounded-2xl uppercase tracking-widest font-semibold">{o.details.spice}</span>
                              <span className="text-[11px] font-medium bg-amber-100 text-amber-600 px-5 py-2 rounded-2xl uppercase tracking-widest font-semibold">{o.details.sauce}</span>
                          </div>
                      </div>
                      <ul className="space-y-4">
                          {o.items.map((it, idx) => (
                              <li key={idx} className="flex justify-between text-2xl font-medium text-slate-500 font-semibold">
                                  <span>{it.name}</span>
                                  <span className="bg-slate-100 px-4 py-1 rounded-2xl text-slate-900 font-semibold tracking-widest">x{it.qty}</span>
                              </li>
                          ))}
                      </ul>
                    </div>
                    <div className="p-10 bg-[#F9FAFB] border-t border-slate-100 flex justify-between items-center">
                        <div className="font-semibold text-slate-900 tracking-tight leading-tight">
                            <span className="text-[12px] text-slate-400 block uppercase tracking-[0.2em] mb-1 opacity-60 font-bold tracking-widest">Total Price</span>
                            <span className="text-5xl font-semibold tracking-tighter">฿{o.totalPrice}</span>
                        </div>
                        <button className="bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-semibold text-lg shadow-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest btn-press">
                            Complete
                        </button>
                    </div>
                  </div>
                ))}
             </div>
             {incomingOrders.length === 0 && (
                 <div className="text-center py-48 opacity-10 flex flex-col items-center">
                     <Coffee size={140} className="mb-10 shadow-sm"/>
                     <p className="text-4xl font-semibold uppercase tracking-[0.5em] tracking-widest leading-loose">Kitchen<br/>Idle</p>
                 </div>
             )}
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="animate-fade">
             <div className="mb-16">
                 <h2 className="text-6xl font-semibold text-slate-900 tracking-tighter">QR Management</h2>
                 <p className="text-slate-400 font-medium text-2xl opacity-60 uppercase tracking-[0.3em] mt-4 tracking-widest font-semibold">Print and setup tables</p>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-12 pb-24">
                {[1,2,3,4,5,6].map(id => (
                  <div key={id} className="bg-white p-12 rounded-[5rem] shadow-2xl border border-slate-50 flex flex-col items-center group transition-all hover:scale-[1.02] relative overflow-hidden shadow-slate-200">
                    <div className="w-full text-center mb-10">
                        <h3 className="font-semibold text-4xl text-slate-900 leading-none">Table {id}</h3>
                        <div className="h-3 w-20 bg-red-600 mx-auto rounded-full mt-6 shadow-sm shadow-red-100"></div>
                    </div>
                    <div className="bg-white p-6 rounded-[3rem] mb-10 flex items-center justify-center border-4 border-slate-50 shadow-inner group-hover:rotate-2 transition-transform duration-500 w-full aspect-square">
                        {/* Real QR Code Image */}
                        <img src={getQrDataUrl(id)} alt={`QR for Table ${id}`} className="w-full h-full object-contain mix-blend-multiply opacity-90" />
                    </div>
                    <div className="flex gap-4 w-full">
                        <button onClick={() => onSimulateScan(id)} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[2.5rem] font-semibold text-xs shadow-sm hover:bg-slate-200 transition-all uppercase tracking-widest">Simulate</button>
                        <button onClick={() => setPrintTableId(id)} className="flex-1 bg-slate-900 text-white py-6 rounded-[2.5rem] font-semibold text-xs shadow-xl hover:bg-red-600 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                           <Printer size={16}/> Print
                        </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* Print Preview Modal */}
      {printTableId && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 print-modal-container">
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl print-sheet">
             <button onClick={() => setPrintTableId(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors no-print">
               <X size={24} />
             </button>

             {/* Printable Area */}
             <div className="p-16 flex flex-col items-center text-center border-[20px] border-[#111827]">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-900">
                      <img src={logoUrl} className="w-full h-full object-cover" />
                   </div>
                   <h1 className="font-bold text-2xl uppercase tracking-tighter text-slate-900">Mala Chuan</h1>
                </div>

                <h2 className="text-xl font-medium uppercase tracking-[0.4em] text-slate-400 mb-2">Scan to Order</h2>
                <div className="bg-slate-900 text-white px-10 py-4 rounded-2xl mb-12 shadow-lg">
                   <h3 className="text-6xl font-bold tracking-tighter">TABLE {printTableId}</h3>
                </div>

                <div className="w-64 h-64 bg-white border-4 border-slate-900 p-4 rounded-3xl mb-10 shadow-xl">
                   <img src={getQrDataUrl(printTableId)} className="w-full h-full object-contain" />
                </div>

                <div className="flex items-center gap-3 text-slate-400 opacity-60">
                   <ScanLine size={20} />
                   <span className="text-sm font-medium uppercase tracking-widest">Use Camera App</span>
                </div>
             </div>

             {/* Print Action Button */}
             <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-100 no-print">
               <button onClick={handlePrint} className="bg-emerald-600 text-white px-12 py-4 rounded-full font-bold text-xl shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-3">
                 <Printer size={24} /> Print Now
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Replacement (Hidden when printing) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#111827] text-white p-8 flex justify-around z-50 border-t border-white/5 shadow-2xl rounded-t-[4rem] no-print">
        <button onClick={() => setActiveTab('kitchen')} className={`flex flex-col items-center gap-3 ${activeTab === 'kitchen' ? 'text-red-500 scale-125' : 'text-slate-500 opacity-60'} transition-all`}>
            <ChefHat size={32}/>
            <span className="text-[12px] font-semibold uppercase tracking-widest">Feed</span>
        </button>
        <button onClick={onResetSystem} className={`flex flex-col items-center gap-3 text-slate-500 opacity-60 transition-all active:text-red-500`}>
            <RotateCcw size={32}/>
            <span className="text-[12px] font-semibold uppercase tracking-widest">Reset</span>
        </button>
        <button onClick={onExitAdmin} className="flex flex-col items-center gap-3 text-slate-500 opacity-60 transition-all active:text-red-500">
            <LogOut size={32}/>
            <span className="text-[12px] font-semibold uppercase tracking-widest">Exit</span>
        </button>
      </nav>
    </div>
  );
};