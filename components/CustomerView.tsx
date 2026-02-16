import React, { useState, useEffect } from 'react';
import { 
  Flame, Plus, Minus, CheckCircle2, UtensilsCrossed, 
  ArrowLeft, ShoppingBag, Sparkles, ChevronRight, Info, Receipt, 
  Settings, Droplets, PartyPopper, X 
} from 'lucide-react';
import { MenuItem, Soup, Sauce, IngredientsMenu, Topping, Order, IngredientCategory } from '../types';

interface CustomerViewProps {
  tableId: number;
  soupMenu: Soup[];
  ingredientsMenu: IngredientsMenu;
  sauceMenu: Sauce[];
  onSubmitOrder: (orderData: any) => Order;
  onBack: () => void;
  isSyncing: boolean;
  logoUrl: string;
}

interface BowlState {
  base: Soup | null;
  spice: string;
  sauce: Sauce | null;
  toppings: Topping[];
}

export const CustomerView: React.FC<CustomerViewProps> = ({ 
  tableId, soupMenu, ingredientsMenu, sauceMenu, onSubmitOrder, onBack, isSyncing, logoUrl 
}) => {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [currentBowl, setCurrentBowl] = useState<BowlState>({ 
    base: null, 
    spice: 'เผ็ดกลาง', 
    sauce: null, 
    toppings: [] 
  });
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showPromoEffect, setShowPromoEffect] = useState(false);
  const [hasShownPromo, setHasShownPromo] = useState(false);

  const toppingsTotal = currentBowl.toppings.reduce((sum, t) => sum + (t.price * t.qty), 0);
  const isFreeSoup = toppingsTotal >= 100;
  const basePrice = currentBowl.base ? (isFreeSoup ? 0 : currentBowl.base.price) : 0;
  const grandTotal = toppingsTotal + basePrice;

  useEffect(() => {
    if (toppingsTotal >= 100 && !hasShownPromo) { 
      setShowPromoEffect(true); 
      setHasShownPromo(true); 
    }
    if (toppingsTotal < 100 && hasShownPromo) setHasShownPromo(false);
  }, [toppingsTotal, hasShownPromo]);

  const handleAddToBowl = (item: MenuItem, delta: number) => {
    const existing = currentBowl.toppings.find(t => t.id === item.id);
    let newToppings = [...currentBowl.toppings];
    if (existing) {
      if (existing.qty + delta <= 0) newToppings = newToppings.filter(t => t.id !== item.id);
      else newToppings = newToppings.map(t => t.id === item.id ? {...t, qty: t.qty + delta} : t);
    } else if (delta > 0) {
      newToppings.push({ ...item, qty: 1 });
    }
    setCurrentBowl({ ...currentBowl, toppings: newToppings });
  };

  const submitMalaBowl = () => {
    const result = onSubmitOrder({
      type: 'Mala Bowl',
      items: currentBowl.toppings,
      details: {
        base: currentBowl.base?.name || 'ซุปเปล่า',
        spice: currentBowl.base?.spiceLevel ? currentBowl.spice : 'ไม่เผ็ด',
        sauce: currentBowl.sauce?.name || 'ไม่ระบุ',
        isFreeSoup: isFreeSoup,
      },
      totalPrice: grandTotal,
      orderType: orderType
    });
    setCompletedOrder(result);
    setStep(6); 
  };

  const getGroupedToppings = () => {
    const groups: { [key: string]: { title: string, items: Topping[] } } = {
      meat: { title: '🥩 เนื้อสัตว์', items: [] },
      balls: { title: '🍡 ลูกชิ้น/เต้าหู้', items: [] },
      veg: { title: '🥬 ผัก', items: [] },
      noodle: { title: '🍜 เส้น', items: [] }
    };
    currentBowl.toppings.forEach(item => {
      if (item.id.startsWith('m')) groups.meat.items.push(item);
      else if (item.id.startsWith('b')) groups.balls.items.push(item);
      else if (item.id.startsWith('v')) groups.veg.items.push(item);
      else if (item.id.startsWith('n')) groups.noodle.items.push(item);
    });
    return groups;
  };

  const resetForNewOrder = () => {
    setStep(1); 
    setCurrentBowl({ base: null, spice: 'เผ็ดกลาง', sauce: null, toppings: [] });
    setCompletedOrder(null); 
    setHasShownPromo(false);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto bg-white md:shadow-2xl md:my-6 md:rounded-[3rem] overflow-hidden relative border border-slate-100 shadow-slate-200">
      
      {/* Header Section */}
      {step !== 6 && (
        <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-50">
          <div className="flex justify-between items-center px-4 py-4 md:px-10 md:py-8">
            <button onClick={() => step > 1 ? setStep(step - 1) : null} className={`p-2 rounded-full transition-all btn-press ${step > 1 ? 'hover:bg-slate-100 text-slate-500' : 'opacity-0 pointer-events-none'}`}>
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <div className="active:scale-95 transition-transform cursor-pointer group relative" onDoubleClick={onBack}>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-50 overflow-hidden group-hover:rotate-6 transition-transform">
                   <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-md border-2 border-white">
                   <Flame size={12} fill="white" />
                </div>
              </div>
              <h1 className="font-title font-semibold text-lg md:text-xl mt-2 tracking-tight text-slate-800 uppercase">
                {step === 1 ? 'Mala Chuan Chuan' : step === 2 ? 'Select Soup' : step === 3 ? 'Add Ingredients' : step === 4 ? 'Choose Sauce' : 'Confirm Order'}
              </h1>
            </div>
            <button onClick={onBack} className="p-2 text-slate-100 hover:text-red-500 transition-colors btn-press"><Settings size={22} /></button>
          </div>
          <div className="flex w-full h-1 bg-slate-50">
            {[1,2,3,4,5].map(s => <div key={s} className={`flex-1 transition-all duration-700 ${s <= step ? 'bg-red-500' : 'bg-transparent'}`} />)}
          </div>
          {step >= 3 && step <= 4 && (
            <div className={`px-4 py-2.5 text-center text-[10px] md:text-xs font-title font-medium transition-all duration-500 flex items-center justify-center gap-2 ${isFreeSoup ? 'bg-emerald-50 text-emerald-600 border-b border-emerald-100' : 'bg-amber-50 text-amber-600 border-b border-amber-100'}`}>
              {isFreeSoup ? <><Sparkles size={14} className="animate-pulse" /> สั่งครบ 100.- รับน้ำซุปฟรีทันที!</> : <><Info size={12} /> สั่งอีก ฿{100 - toppingsTotal} เพื่อรับน้ำซุปฟรี</>}
            </div>
          )}
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto px-5 py-6 md:px-12 md:py-10 ${step >= 3 && step <= 5 ? 'pb-32 md:pb-44' : 'pb-10'} no-scrollbar`}>
        
        {step === 1 && (
          <div className="flex flex-col items-center justify-center h-full space-y-12 animate-fade py-10 text-center">
            <div className="relative">
              <div className="w-44 h-44 md:w-56 md:h-56 rounded-full border-4 border-slate-50 shadow-2xl overflow-hidden animate-float relative z-10">
                 <img src={logoUrl} alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="absolute -inset-4 bg-red-100 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            </div>
            <div>
               <h2 className="font-title text-4xl md:text-6xl font-semibold text-slate-900 tracking-tighter">หม่าล่าช่วนช่วน</h2>
               <p className="text-slate-400 mt-3 text-lg font-medium tracking-wide">สูตรต้นตำรับ ผสานความนัวและแซ่บให้ลงตัว</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
              <button onClick={() => {setOrderType('dine-in'); setStep(2)}} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] shadow-sm hover:border-red-500 hover:shadow-xl transition-all btn-press flex flex-col items-center gap-5">
                <div className="p-6 bg-red-50 rounded-2xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm shadow-red-100"><UtensilsCrossed size={44} /></div>
                <div className="text-center font-title"><span className="font-semibold text-2xl block text-slate-700">ทานที่ร้าน</span><span className="text-xs text-slate-400 font-medium uppercase mt-1 block tracking-[0.2em]">Table {tableId}</span></div>
              </button>
              <button onClick={() => {setOrderType('takeaway'); setStep(2)}} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] shadow-sm hover:border-blue-500 hover:shadow-xl transition-all btn-press flex flex-col items-center gap-5">
                <div className="p-6 bg-blue-50 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm shadow-blue-100"><ShoppingBag size={44} /></div>
                <div className="text-center font-title"><span className="font-semibold text-2xl block text-slate-700">สั่งกลับบ้าน</span><span className="text-xs text-slate-400 font-medium uppercase mt-1 block tracking-[0.2em]">Take-away</span></div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide space-y-10">
            <div className="text-center max-w-md mx-auto mb-10"><h3 className="font-title text-3xl font-semibold text-slate-900 tracking-tight">1. เลือกน้ำซุป</h3><p className="text-slate-400 font-medium mt-2 text-base leading-relaxed">คัดสรรวัตถุดิบคุณภาพเพื่อรสชาติที่สมบูรณ์แบบ</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {soupMenu.map((soup) => (
                <button key={soup.id} onClick={() => { setCurrentBowl({...currentBowl, base: soup, spice: soup.spiceLevel ? 'เผ็ดกลาง' : 'ไม่เผ็ด'}); setStep(3); }} className={`p-8 rounded-[2.5rem] border-2 text-left transition-all btn-press group relative overflow-hidden ${currentBowl.base?.id === soup.id ? 'border-red-500 bg-red-50/50 shadow-lg ring-4 ring-red-50' : 'bg-white border-slate-100 hover:border-red-200 shadow-sm'}`}>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-6"><span className="text-6xl group-hover:scale-110 transition-transform duration-500">{soup.icon}</span><div><span className="font-title font-semibold text-xl text-slate-800 block leading-none mb-2">{soup.name}</span>{!soup.spiceLevel && <span className="text-[11px] font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Mild</span>}</div></div>
                    <span className="font-title font-semibold text-2xl text-slate-800">฿{soup.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide space-y-14">
            {currentBowl.base?.spiceLevel && (
              <section className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-10"><Flame size={120} /></div>
                <h4 className="font-title font-medium text-xs mb-8 flex items-center opacity-40 uppercase tracking-[0.4em]"><Flame size={18} className="mr-3 text-red-500"/> ระดับความเผ็ด (Spice Level)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  {['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'].map((lvl) => (
                    <button key={lvl} onClick={() => setCurrentBowl({...currentBowl, spice: lvl})} className={`py-5 px-2 text-sm font-title font-medium rounded-3xl transition-all border-2 ${currentBowl.spice === lvl ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-900/50 scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{lvl}</button>
                  ))}
                </div>
              </section>
            )}

            {(Object.entries(ingredientsMenu) as [string, IngredientCategory][]).map(([key, category]) => (
              <section key={key} className="space-y-6">
                <div className="flex items-center gap-4 bg-white/95 py-5 z-10 sticky top-0 border-b border-slate-50">
                  <span className="text-3xl p-3 bg-slate-50 rounded-2xl shadow-inner">{category.icon}</span>
                  <h3 className="font-title font-semibold text-2xl text-slate-900 tracking-tight uppercase">{category.title}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {category.items.map((item) => {
                    const inBowl = currentBowl.toppings.find(t => t.id === item.id);
                    const qty = inBowl ? inBowl.qty : 0;
                    return (
                      <div key={item.id} className={`p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex justify-between items-center ${qty > 0 ? 'border-red-400 bg-red-50/20 shadow-xl' : 'border-slate-50 bg-white shadow-md hover:border-slate-200'}`}>
                        <div className="flex-1 mr-4"><p className="font-medium text-slate-800 text-lg leading-tight">{item.name}</p><p className="font-title text-xs font-medium text-slate-400 mt-2 uppercase tracking-widest">฿{item.price}</p></div>
                        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-[1.8rem] border border-slate-100 shadow-inner">
                           {qty > 0 && <><button onClick={() => handleAddToBowl(item, -1)} className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-600 active:scale-90 transition-all border border-slate-100 hover:bg-red-50"><Minus size={20}/></button><span className="font-title font-semibold text-xl w-7 text-center">{qty}</span></>}
                           <button onClick={() => handleAddToBowl(item, 1)} className="w-10 h-10 rounded-2xl bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-red-600 active:scale-90 transition-all"><Plus size={20}/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="animate-slide space-y-10">
            <div className="text-center py-10">
               <div className="inline-flex p-6 bg-orange-50 rounded-[2.5rem] text-orange-600 mb-6 animate-float shadow-xl shadow-orange-100 border-2 border-white"><Droplets size={52} /></div>
               <h3 className="font-title text-4xl font-semibold text-slate-900 tracking-tight">เลือกน้ำจิ้มฟรี 1 อย่าง</h3>
               <p className="text-slate-400 font-medium mt-3 text-lg opacity-80 leading-relaxed">สัมผัสรสชาติอันเป็นเอกลักษณ์ของหม่าล่าช่วนช่วน</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
              {sauceMenu.map((sauce) => (
                <button key={sauce.id} onClick={() => { setCurrentBowl({...currentBowl, sauce: sauce}); setStep(5); }} className={`flex items-center p-8 rounded-[3.5rem] border-2 transition-all btn-press text-left group ${currentBowl.sauce?.id === sauce.id ? 'border-amber-500 bg-amber-50/50 shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-amber-200 shadow-xl shadow-slate-100'}`}>
                  <span className="text-6xl mr-8 group-hover:scale-110 transition-transform duration-500">{sauce.icon}</span>
                  <div className="flex-1"><p className="font-title font-semibold text-2xl text-slate-800 leading-tight mb-2">{sauce.name}</p><p className="text-sm text-slate-500 leading-relaxed opacity-70">{sauce.desc}</p></div>
                  <ChevronRight size={28} className="text-slate-200 group-hover:text-amber-400 transition-colors" />
                </button>
              ))}
            </div>
            <div className="text-center pt-10">
              <button onClick={() => { setCurrentBowl({...currentBowl, sauce: null}); setStep(5); }} className="font-title font-medium text-slate-300 hover:text-slate-500 text-lg border-b-2 border-slate-100 pb-1 transition-all">ข้าม (ไม่รับน้ำจิ้ม)</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade max-w-xl mx-auto py-4 md:py-6">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-50 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-3 md:h-5 ${isFreeSoup ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="text-center mb-6 md:mb-10 border-b-2 border-dashed border-slate-100 pb-6 md:pb-10">
                  <div className="flex justify-center mb-4 text-slate-200 animate-fade"><Receipt className="w-16 h-16 md:w-24 md:h-24" strokeWidth={1} /></div>
                  <h2 className="font-title text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">สรุปรายการอาหาร</h2>
                  <p className="text-slate-400 text-[10px] md:text-xs font-medium mt-2 uppercase tracking-[0.2em] opacity-50 font-semibold">Table {tableId} • หม่าล่าช่วนช่วน</p>
                </div>

                <div className="space-y-6 md:space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start bg-[#F9FAFB] p-6 rounded-[2rem] border border-slate-100 shadow-inner gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start w-full">
                         <p className="font-title font-semibold text-xl text-slate-800 tracking-tight leading-tight mb-3">{currentBowl.base?.name}</p>
                         <div className="text-right md:hidden">
                            <p className={`font-title font-semibold text-xl ${isFreeSoup ? 'text-emerald-600' : 'text-slate-900'} tracking-tighter`}>{isFreeSoup ? '0' : currentBowl.base?.price}</p>
                         </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">{currentBowl.spice}</span>
                        <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wide px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">{currentBowl.sauce?.name || '-'}</span>
                      </div>
                    </div>
                    <div className="text-right hidden md:block">
                       <p className={`font-title font-semibold text-3xl ${isFreeSoup ? 'text-emerald-600' : 'text-slate-900'} tracking-tighter`}>{isFreeSoup ? '0' : currentBowl.base?.price}</p>
                       {isFreeSoup && <span className="text-[11px] font-medium bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full uppercase mt-2 block shadow-sm shadow-emerald-50 tracking-wider">FREE</span>}
                    </div>
                     {isFreeSoup && <div className="md:hidden w-full"><span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase inline-block shadow-sm">FREE SOUP</span></div>}
                  </div>

                  <div className="space-y-4 px-2 md:px-8">
                    {Object.entries(getGroupedToppings()).map(([key, group]) => group.items.length > 0 && (
                      <div key={key} className="space-y-2">
                        <h4 className="font-title text-[10px] font-medium text-slate-300 uppercase tracking-[0.4em] border-b border-slate-50 pb-2 mb-2">{group.title}</h4>
                        {group.items.map(t => (
                          <div key={t.id} className="flex justify-between items-center text-base md:text-lg">
                            <span className="text-slate-500 font-medium">{t.name} <span className="font-title text-slate-300 ml-2 font-medium tracking-widest text-sm">x{t.qty}</span></span>
                            <span className="font-title font-semibold text-slate-800 tracking-tighter">฿{t.price * t.qty}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#111827] p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] flex justify-between items-center text-white shadow-xl transform hover:scale-[1.01] transition-all duration-300">
                    <div><span className="font-title text-[10px] font-medium opacity-40 uppercase tracking-[0.2em]">Total Amount</span><p className="font-title font-semibold text-4xl md:text-5xl leading-none mt-2 tracking-tighter">฿{grandTotal}</p></div>
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/10"><CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} /></div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {step === 6 && completedOrder && (
          <div className="h-full flex flex-col items-center justify-center text-center animate-pop space-y-6 md:space-y-12 py-10 px-4 md:px-6">
             <div className="relative">
                <div className="w-32 h-32 md:w-48 md:h-48 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner ring-4 md:ring-8 ring-emerald-50/50"><CheckCircle2 className="w-16 h-16 md:w-28 md:h-28" strokeWidth={1} /></div>
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-yellow-400 text-white p-3 md:p-4 rounded-full shadow-xl rotate-12 animate-bounce border-2 md:border-4 border-white"><Sparkles className="w-6 h-6 md:w-10 md:h-10" /></div>
             </div>
             <div>
               <h2 className="font-title text-3xl md:text-5xl font-semibold text-slate-800 tracking-tight leading-tight">สั่งออเดอร์เรียบร้อย!</h2>
               <p className="text-slate-400 mt-2 md:mt-4 text-sm md:text-xl font-bold opacity-60 uppercase tracking-[0.2em]">Thank you for your visit</p>
             </div>
             <div className="bg-[#111827] text-white p-8 md:p-14 rounded-[3rem] md:rounded-[5rem] w-full max-w-[18rem] md:max-w-md shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] relative overflow-hidden group mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-transparent opacity-20 transition-opacity duration-1000 animate-pulse"></div>
                <p className="font-title text-[10px] md:text-sm font-medium opacity-30 uppercase tracking-[0.4em] mb-4 md:mb-8 relative z-10">QUEUE NUMBER</p>
                <p className="font-title text-7xl md:text-[10rem] font-semibold tracking-tighter relative z-10 leading-none">{completedOrder.id.replace('#','')}</p>
             </div>
             <button onClick={resetForNewOrder} className="font-title bg-white border-2 md:border-4 border-slate-100 px-10 py-4 md:px-16 md:py-6 rounded-[2rem] md:rounded-[3rem] font-medium text-slate-400 hover:border-red-500 hover:text-red-500 transition-all btn-press shadow-md text-lg md:text-2xl tracking-widest uppercase">สั่งรายการใหม่</button>
          </div>
        )}

      </main>

      {/* --- Floating Navigation Bar (Footer) --- */}
      {(step >= 3 && step <= 5) && (
        <div className="fixed bottom-0 left-0 w-full md:absolute bg-white/90 backdrop-blur-3xl border-t-2 border-slate-50 p-4 md:p-8 z-40 shadow-[0_-30px_70px_rgba(0,0,0,0.12)] md:rounded-b-[3.5rem]">
           <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 md:gap-12">
              <div className="flex-1">
                 <p className="font-title text-[10px] md:text-[11px] text-slate-400 font-medium uppercase tracking-[0.2em] md:tracking-[0.5em] mb-1 md:mb-2 truncate">CHECKOUT TOTAL</p>
                 <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                    <span className="font-title text-4xl md:text-6xl font-semibold text-slate-900 tracking-tighter leading-none">฿{grandTotal}</span>
                    {isFreeSoup && <span className="w-fit bg-emerald-100 text-emerald-700 text-[10px] md:text-[11px] font-medium px-3 py-1 md:px-4 md:py-1.5 rounded-full animate-pulse uppercase tracking-widest shadow-sm border border-emerald-200 font-semibold whitespace-nowrap">FREE SOUP</span>}
                 </div>
              </div>
              <button 
                onClick={() => step < 5 ? setStep(step + 1) : submitMalaBowl()}
                disabled={currentBowl.toppings.length === 0 || isSyncing}
                className={`flex-none w-44 md:w-auto md:flex-1 py-4 md:py-8 rounded-[2rem] md:rounded-[3rem] font-title font-semibold text-lg md:text-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all btn-press flex items-center justify-center gap-2 md:gap-4 ${
                  currentBowl.toppings.length === 0 ? 'bg-slate-50 text-slate-300 shadow-none grayscale cursor-not-allowed' : 
                  step === 5 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-[#111827] text-white hover:bg-red-600 shadow-slate-900/30'
                }`}
              >
                {isSyncing ? 'SENDING...' : step === 5 ? 'ยืนยันออเดอร์' : 'ขั้นตอนถัดไป'}
                {step < 5 && !isSyncing && <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />}
              </button>
           </div>
        </div>
      )}

      {/* --- Elegant Promo Popup (ซุปฟรี) --- */}
      {showPromoEffect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fade cursor-pointer" onClick={() => setShowPromoEffect(false)}>
           <div className="bg-[#ECFDF5] p-8 md:p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(5,150,105,0.3)] flex flex-col items-center text-center animate-pop border-8 border-white max-w-[18rem] md:max-w-xs w-full relative">
              <button className="absolute top-5 right-5 text-emerald-300 hover:text-emerald-500 transition-colors btn-press" onClick={(e) => {e.stopPropagation(); setShowPromoEffect(false);}}><X size={24}/></button>
              <div className="p-5 bg-white rounded-full mb-6 shadow-xl border-4 border-emerald-50 animate-float"><PartyPopper size={56} className="text-emerald-500" /></div>
              <h2 className="font-title text-3xl font-semibold text-[#064E3B] leading-none tracking-tighter mb-3 tracking-tight">รับสิทธิ์<br/>น้ำซุปฟรี! 🎉</h2>
              <p className="text-emerald-600 font-medium mt-2 bg-white/80 px-6 py-2 rounded-2xl inline-block shadow-sm text-sm uppercase tracking-widest border border-emerald-100 font-semibold">ยอดสั่งครบ 100.- แล้ว</p>
              <p className="font-title text-[10px] text-emerald-800/30 mt-8 font-medium uppercase tracking-[0.3em] animate-pulse">แตะพื้นที่ว่างเพื่อไปต่อ</p>
           </div>
        </div>
      )}

    </div>
  );
};