import { Order } from '../types';

// ⚠️ เปลี่ยน URL นี้ให้เป็น URL ล่าสุดที่คุณ Deploy (ลงท้ายด้วย /exec)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBpObnFsKvmzlixtPdIASGvlYvXUXz5pfwXdsbiwF1wmCRJnESrIIaWot-jkaLypT8/exec";

// ฟังก์ชันนี้จะส่งข้อมูลไปและ "รอ" รับเลขคิว (String) กลับมา
export const sendToGoogleSheet = async (orderData: Omit<Order, 'id' | 'status'>): Promise<string> => {
  if (!GOOGLE_SCRIPT_URL) return "#OFFLINE";

  try {
    const payload = {
      // ไม่ส่ง orderId ไป เพราะจะให้ Server สร้างให้
      table: orderData.tableId,
      type: orderData.orderType,
      soup: orderData.details.base,
      spice: orderData.details.spice,
      sauce: orderData.details.sauce, 
      total: orderData.totalPrice,
      itemsRaw: orderData.items // ส่งรายการอาหารไปตัดสต็อกหรือแสดงผล
    };

    // ⚠️ ลบ mode: 'no-cors' ออก เพื่อให้รับค่าตอบกลับ (Response) ได้
    // Google Script ต้องเขียน return ContentService ให้ถูกต้อง (ตามโค้ดใหม่ด้านล่าง)
    const response = await fetch(GOOGLE_SCRIPT_URL, { 
      method: "POST", 
      headers: { "Content-Type": "text/plain;charset=utf-8" }, 
      body: JSON.stringify(payload) 
    });

    const result = await response.json();
    
    // ตรวจสอบว่า Server ส่ง orderId กลับมาหรือไม่
    if (result && result.result === 'success' && result.orderId) {
      return result.orderId;
    } else {
      console.error("Server error:", result);
      throw new Error("Server did not return an Order ID");
    }

  } catch (error) {
    console.error("Failed to sync with Google Sheets:", error);
    // กรณีเน็ตหลุดจริงๆ ให้ Gen เลขมั่วๆ ไปก่อนเพื่อกันแอพค้าง
    return "#ERR-" + Math.floor(Math.random() * 1000);
  }
};