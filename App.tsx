import React, { useState, useEffect } from 'react';
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
  
  // ตรวจสอบ URL Parameter เมื่อโหลดแอพครั้งแรก
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      const tableId = parseInt(tableParam, 10);
      if (!isNaN(tableId) && tableId > 0) {
        setCustomerTable(tableId);
        setViewMode('customer');
        // Optional: ล้าง URL เพื่อความสวยงาม (แต่ถ้าไม่ล้าง เวลา Refresh ก็จะยังอยู่โต๊ะเดิม)
      }
    }
  }, []);

  const handleCustomerSubmitOrder = async (newOrderData: any): Promise<Order> => {
    setIsSyncing(true);
    
    // สร้างรายการสินค้า (ตอนแรกใส่ ID ชั่วคราวไปก่อน)
    const items: Topping[] = newOrderData.items.map((item: any) => ({ ...item, orderId: "PENDING", status: 'pending' }));
    
    const partialOrder = { 
      tableId: customerTable, 
      details: newOrderData.details, 
      items: items, 
      totalPrice: newOrderData.totalPrice, 
      timestamp: new Date(), 
      orderType: newOrderData.orderType
    };

    // ส่งไป Google Sheet และรอรับ ID กลับมา (await)
    const serverOrderId = await sendToGoogleSheet(partialOrder);
    
    // อัปเดตข้อมูลด้วย ID จริงที่ได้มา
    const finalOrder: Order = {
      ...partialOrder,
      id: serverOrderId,
      status: 'pending',
      items: items.map(i => ({ ...i, orderId: serverOrderId }))
    };

    // เพิ่มลงในรายการออเดอร์ของเครื่องนี้
    setIncomingOrders([finalOrder, ...incomingOrders]);
    
    setIsSyncing(false);
    return finalOrder;
  };

  const handleResetSystem = () => {
    if (window.confirm("⚠️ การรีเซ็ตนี้จะลบรายการบนหน้าจอเครื่องนี้เท่านั้น\n(หากต้องการเริ่มเลขคิว 001 ใหม่ ต้องไปลบแถวข้อมูลใน Google Sheet ด้วย)")) {
      setIncomingOrders([]);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-800 selection:bg-red-50 font-sans overflow-x-hidden antialiased">
      {viewMode === 'admin' ? (
        <AdminView 
          incomingOrders={incomingOrders} 
          onSimulateScan={(id) => {setCustomerTable(id); setViewMode('customer');}} 
          onExitAdmin={() => setViewMode('customer')} 
          onResetSystem={handleResetSystem}
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
