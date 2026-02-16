import React, { useState } from 'react';
import { CustomerView } from './components/CustomerView';
import { AdminView } from './components/AdminView';
import { sendToGoogleSheet } from './services/googleSheetService';
import { MenuItem, Soup, Sauce, IngredientsMenu, Order, Topping } from './types';

// Asset Constants
const APP_LOGO_URL = "https://lh3.googleusercontent.com/u/0/d/1bTL8n_isrhu_BwCtwNlRawGT2MPH_1rM"; 

// --- Data Menu Definitions ---
const soupMenu: Soup[] = [
  { id: 's1', name: 'ซุปกระดูกหมู', price: 15, spiceLevel: false, icon: '🐷' },
  { id: 's2', name: 'ซุปหม่าล่าผสมกระดูกหมู', price: 15, spiceLevel: true, icon: '🌶️' },
  { id: 's3', name: 'ซุปหม่าล่าใส', price: 15, spiceLevel: true, icon: '🥣' },
  { id: 's4', name: 'ซุปหม่าล่าน้ำข้น', price: 15, spiceLevel: true, icon: '🔥' },
];

const sauceMenu: Sauce[] = [
  { id: 'sc1', name: 'น้ำจิ้มสุกี้', icon: '🍲', desc: 'รสชาติกลมกล่อม ดั้งเดิม' },
  { id: 'sc2', name: 'น้ำจิ้มงา', icon: '🥜', desc: 'หอมมัน สไตล์ต้นตำรับ' },
  { id: 'sc3', name: 'น้ำจิ้มช่วนช่วน', icon: '🌶️', desc: 'สูตรลับต้นตำรับ ผสานความหอมมันของงา' },
  { id: 'sc0', name: 'ไม่รับน้ำจิ้ม', icon: '❌', desc: '' }
];

const ingredientsMenu: IngredientsMenu = {
  meat: { title: 'เนื้อสัตว์ (20.-)', icon: '🥩', items: [{ id: 'm1', name: 'หมูสามชั้น (สไลด์)', price: 20 }, { id: 'm2', name: 'สันคอหมู (สไลด์)', price: 20 }, { id: 'm3', name: 'ปลาดอลลี่', price: 20 }] },
  balls: { title: 'ลูกชิ้น/เต้าหู้ (10.-)', icon: '🍡', items: [{ id: 'b1', name: 'ไข่นกกระทา', price: 10 }, { id: 'b2', name: 'หมูเด้ง', price: 10 }, { id: 'b3', name: 'ไส้กรอกหนังกรอบ', price: 10 }, { id: 'b7', name: 'เต้าหู้ชีส', price: 10 }, { id: 'b10', name: 'ฟองเต้าหู้ม้วนทอด', price: 10 }] },
  veg: { title: 'ผักสด (10.-)', icon: '🥬', items: [{ id: 'v1', name: 'ผักบุ้ง', price: 10 }, { id: 'v2', name: 'ผักกวางตุ้ง', price: 10 }, { id: 'v3', name: 'ผักกาดขาว', price: 10 }, { id: 'v9', name: 'มันฝรั่งแผ่น', price: 10 }] },
  noodle: { title: 'เส้น (10.-)', icon: '🍜', items: [{ id: 'n1', name: 'เส้นมันเทศใหญ่', price: 10 }, { id: 'n2', name: 'เส้นมันเทศเล็ก', price: 10 }, { id: 'n5', name: 'บะหมี่กึ่งสำเร็จรูป', price: 10 }] }
};

const App = () => {
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer'); 
  const [customerTable, setCustomerTable] = useState(1);
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [orderCount, setOrderCount] = useState(1);

  const handleCustomerSubmitOrder = (newOrderData: any): Order => {
    const runningId = String(orderCount).padStart(3, '0');
    const orderId = `#${runningId}`;
    setOrderCount(prev => prev + 1);
    
    const items: Topping[] = newOrderData.items.map((item: any) => ({ ...item, orderId: orderId, status: 'pending' }));
    
    const orderSummary: Order = { 
      id: orderId, 
      tableId: customerTable, 
      details: newOrderData.details, 
      items: items, 
      totalPrice: newOrderData.totalPrice, 
      timestamp: new Date(), 
      orderType: newOrderData.orderType,
      status: 'pending'
    };

    setIncomingOrders([orderSummary, ...incomingOrders]);
    
    setIsSyncing(true);
    sendToGoogleSheet(orderSummary).finally(() => {
      setIsSyncing(false);
    });
    
    return orderSummary;
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-800 selection:bg-red-50 font-sans overflow-x-hidden antialiased">
      {viewMode === 'admin' ? (
        <AdminView 
          incomingOrders={incomingOrders} 
          onSimulateScan={(id) => {setCustomerTable(id); setViewMode('customer');}} 
          onExitAdmin={() => setViewMode('customer')} 
          logoUrl={APP_LOGO_URL}
        />
      ) : (
        <CustomerView 
          tableId={customerTable} 
          soupMenu={soupMenu} 
          ingredientsMenu={ingredientsMenu} 
          sauceMenu={sauceMenu} 
          onSubmitOrder={handleCustomerSubmitOrder} 
          onBack={() => setViewMode('admin')} 
          isSyncing={isSyncing} 
          logoUrl={APP_LOGO_URL}
        />
      )}
    </div>
  );
};

export default App;
