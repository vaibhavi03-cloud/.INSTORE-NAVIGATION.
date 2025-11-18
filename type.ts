export interface StoreSection {
  id: string;
  name: string;
  color: string;
  gridArea: string;
  floor: number;
  center: {
    x: number;
    y: number;
  };
}

export interface Product {
  name: string;
  price: number;
}

export interface ShoppingListItem extends Product {
  id: string;
  sectionId: string;
  floor: number;
  status: 'in-list' | 'in-cart';
}
