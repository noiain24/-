export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface Soup extends MenuItem {
  spiceLevel: boolean; // true if it has adjustable spice
  icon: string;
}

export interface Sauce {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface Topping extends MenuItem {
  qty: number;
}

export interface IngredientCategory {
  title: string;
  icon: string;
  items: MenuItem[];
}

export interface IngredientsMenu {
  [key: string]: IngredientCategory;
}

export interface OrderDetails {
  base: string;
  spice: string;
  sauce: string;
  isFreeSoup: boolean;
}

export interface Order {
  id: string;
  tableId: number;
  details: OrderDetails;
  items: Topping[];
  totalPrice: number;
  timestamp: Date;
  orderType: 'dine-in' | 'takeaway';
  status: 'pending' | 'completed' | 'served';
}