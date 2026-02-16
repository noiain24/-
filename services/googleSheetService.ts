import { Order } from '../types';

// ⚠️ สำคัญ: เปลี่ยน URL นี้เป็น Web App URL ของคุณเองที่ได้จากการ Deploy Google Apps Script
// (ต้องลงท้ายด้วย /exec และตั้งค่า Who has access เป็น Anyone)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBpObnFsKvmzlixtPdIASGvlYvXUXz5pfwXdsbiwF1wmCRJnESrIIaWot-jkaLypT8/exec";

export const sendToGoogleSheet = async (orderData: Order): Promise<void> => {
  if (!GOOGLE_SCRIPT_URL) return;

  try {
    const payload = {
      timestamp: orderData.timestamp.toISOString(),
      orderId: orderData.id,
      table: orderData.tableId,
      type: orderData.orderType,
      soup: orderData.details.base,
      spice: orderData.details.spice,
      sauce: orderData.details.sauce, 
      total: orderData.totalPrice,
      // CHANGE: ส่ง itemsRaw เป็น Array เต็มรูปแบบ 
      // เพื่อให้ Google Script ฝั่งคุณสามารถนำไปวนลูปแยกหมวดหมู่ (m, v, b, n) สร้าง LINE Flex Message ได้
      itemsRaw: orderData.items 
    };

    // ใช้ Content-Type: text/plain และ mode: no-cors เพื่อให้ส่งข้อมูลผ่าน Browser ได้โดยไม่ติด CORS
    await fetch(GOOGLE_SCRIPT_URL, { 
      method: "POST", 
      mode: "no-cors", 
      headers: { "Content-Type": "text/plain;charset=utf-8" }, 
      body: JSON.stringify(payload) 
    });
  } catch (error) {
    console.error("Failed to sync with Google Sheets:", error);
  }
};