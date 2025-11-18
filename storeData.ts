import { StoreSection } from '../types';

export const storeSections: StoreSection[] = [
  // Row 1
  {
    id: 'fresh-produce',
    name: 'Fresh Produce',
    color: '#a7f3d0', // Emerald 200
    gridArea: '2 / 2 / 10 / 8',
    floor: 1,
    center: { x: 4.5, y: 5.5 }
  },
  {
    id: 'bakery',
    name: 'Bakery',
    color: '#fef08a', // Yellow 200
    gridArea: '2 / 9 / 6 / 13',
    floor: 1,
    center: { x: 11, y: 4 }
  },
  {
    id: 'mens-washroom',
    name: "Men's Washroom",
    color: '#e5e7eb', // Gray 200
    gridArea: '2 / 14 / 4 / 18',
    floor: 1,
    center: { x: 16, y: 3 }
  },
  {
    id: 'womens-washroom',
    name: "Women's Washroom",
    color: '#e5e7eb', // Gray 200
    gridArea: '5 / 14 / 7 / 18',
    floor: 1,
    center: { x: 16, y: 6 }
  },
  // Row 2
  {
    id: 'dairy-cheese',
    name: 'Dairy & Cheese',
    color: '#bfdbfe', // Blue 200
    gridArea: '7 / 9 / 12 / 13',
    floor: 1,
    center: { x: 11, y: 9.5 }
  },
  {
    id: 'pantry-goods',
    name: 'Pantry Goods',
    color: '#fef08a', // Yellow 200
    gridArea: '8 / 14 / 12 / 18',
    floor: 1,
    center: { x: 16, y: 10 }
  },
  // Row 3
  {
    id: 'butcher-shop',
    name: 'Butcher Shop',
    color: '#fecaca', // Red 200
    gridArea: '11 / 2 / 16 / 8',
    floor: 1,
    center: { x: 5, y: 13.5 }
  },
  {
    id: 'florist',
    name: 'Florist',
    color: '#fbcfe8', // Pink 200
    gridArea: '13 / 9 / 16 / 13',
    floor: 1,
    center: { x: 11, y: 14.5 }
  },
  {
    id: 'beverages',
    name: 'Beverages',
    color: '#a5f3fc', // Cyan 200
    gridArea: '13 / 14 / 16 / 18',
    floor: 1,
    center: { x: 16, y: 14.5 }
  },
  // Row 4
  {
    id: 'pet-supplies',
    name: 'Pet Supplies',
    color: '#fed7aa', // Orange 200
    gridArea: '17 / 2 / 19 / 5',
    floor: 1,
    center: { x: 3.5, y: 18 }
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    color: '#f5d0fe', // Fuchsia 200
    gridArea: '17 / 6 / 19 / 9',
    floor: 1,
    center: { x: 7.5, y: 18 }
  },
  {
    id: 'main-entrance',
    name: 'Main Entrance',
    color: '#f3f4f6', // Gray 100
    gridArea: '17 / 10 / 19 / 13',
    floor: 1,
    center: { x: 11.5, y: 18 }
  },
  {
    id: 'cleaning-supplies',
    name: 'Cleaning Supplies',
    color: '#bfdbfe', // Blue 200
    gridArea: '17 / 14 / 19 / 17',
    floor: 1,
    center: { x: 15.5, y: 18 }
  },
  {
    id: 'exit',
    name: 'Exit',
    color: '#e5e7eb', // Gray 200
    gridArea: '17 / 18 / 19 / 20',
    floor: 1,
    center: { x: 19, y: 18 }
  }
];
