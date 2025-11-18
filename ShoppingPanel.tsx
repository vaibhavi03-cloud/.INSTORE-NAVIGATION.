import React, { useState, useMemo } from 'react';
import { ShoppingListItem, StoreSection, Product } from '../types';

interface ShoppingPanelProps {
  listItems: ShoppingListItem[];
  cartItems: ShoppingListItem[];
  billingDetails: { subtotal: number; tax: number; total: number; };
  sections: StoreSection[];
  onAddItem: (itemName: string) => void;
  onRemoveItem: (itemId: string) => void;
  onAddToCart: (itemId: string) => void;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onSaveList: () => void;
  onLoadList: () => void;
  isListSaved: boolean;
  isLoading: boolean;
  isNavigating: boolean;
  error: string | null;
  allProducts: Product[];
  isFetchingProducts: boolean;
  isLiveTracking: boolean;
  onToggleLiveTracking: () => void;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

const ShoppingPanel: React.FC<ShoppingPanelProps> = ({ 
    listItems, cartItems, billingDetails, sections, 
    onAddItem, onRemoveItem, onAddToCart, onStartNavigation, onStopNavigation, 
    onSaveList, onLoadList, isListSaved, 
    isLoading, isNavigating, error, allProducts, isFetchingProducts,
    isLiveTracking, onToggleLiveTracking
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [activeTab, setActiveTab] = useState('Shopping List');
  const [listFilter, setListFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(newItemName);
    setNewItemName('');
  };

  const handleSelectProduct = (productName: string) => {
    onAddItem(productName);
    setActiveTab('Shopping List');
    setProductFilter('');
  };
  
  const getSectionName = (sectionId: string) => {
      return sections.find(s => s.id === sectionId)?.name || 'Unknown';
  }

  const handleSaveClick = () => {
    onSaveList();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const filteredShoppingList = useMemo(() => 
    listItems.filter(item => 
      item.name.toLowerCase().includes(listFilter.toLowerCase())
    ), [listItems, listFilter]);
    
  const shoppingListItemNames = useMemo(() => new Set([...listItems, ...cartItems].map(i => i.name.toLowerCase())), [listItems, cartItems]);

  const filteredAllProducts = useMemo(() =>
    allProducts.filter(product =>
      product.name.toLowerCase().includes(productFilter.toLowerCase())
    ), [allProducts, productFilter]);

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  
  const isControlDisabled = isNavigating && !isLiveTracking;

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col p-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {['Shopping List', 'All Products', 'Cart / Billing'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} disabled:text-gray-300 disabled:hover:border-transparent`} disabled={isControlDisabled}>
              {tab}
              {tab === 'Shopping List' && <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">{listItems.length}</span>}
              {tab === 'Cart / Billing' && <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs">{cartItems.length}</span>}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="pt-4 flex-grow overflow-y-auto">
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {isNavigating && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 mb-4 rounded-r-md" role="alert">
                <p className="font-bold">Navigation in Progress</p>
                <p className="text-sm">Follow the path on the map. {isLiveTracking && "Your location is being tracked."}</p>
            </div>
        )}

        {activeTab === 'Shopping List' && (
            <>
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                    <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g., Avocados" className="flex-grow block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100" disabled={isLoading || isControlDisabled} />
                    <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300" disabled={isLoading || !newItemName || isControlDisabled}>Add</button>
                </form>
                
                <div className="relative mb-2">
                    <input type="text" value={listFilter} onChange={(e) => setListFilter(e.target.value)} placeholder="Search your list..." className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pl-8 disabled:bg-gray-100" disabled={listItems.length === 0 || isControlDisabled} />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                </div>

                <div className="flex gap-2 my-4">
                    <button onClick={handleSaveClick} disabled={isControlDisabled || (listItems.length === 0 && cartItems.length === 0)} className="flex-1 justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">{saveStatus === 'saved' ? 'Saved!' : 'Save List'}</button>
                    <button onClick={onLoadList} disabled={!isListSaved || isControlDisabled} className="flex-1 justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">Load List</button>
                </div>
                
                {isLoading && !listItems.length && <div className="flex justify-center p-4"><svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}

                <ul className="space-y-2">
                {filteredShoppingList.map(item => (
                    <li key={item.id} className="p-3 bg-gray-50 rounded-md shadow-sm flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">
                                <span>{getSectionName(item.sectionId)}</span> &bull; <span className="font-bold">{formatCurrency(item.price)}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onAddToCart(item.id)} className="text-sm font-medium text-green-600 hover:text-green-800 bg-green-100 px-3 py-1 rounded-md disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed" disabled={isControlDisabled}>Add to Cart</button>
                            <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 disabled:text-gray-300" disabled={isControlDisabled} aria-label={`Remove ${item.name}`}>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </li>
                ))}
                </ul>

                {listItems.length === 0 && !isLoading && (<div className="text-center text-gray-400 pt-8"><p>Your shopping list is empty.</p><p className="text-sm">Add items above or from the "All Products" tab.</p></div>)}
                {listItems.length > 0 && filteredShoppingList.length === 0 && (<div className="text-center text-gray-400 pt-8"><p>No items match your search.</p></div>)}
            </>
        )}
        
        {activeTab === 'All Products' && (
            <>
                <div className="relative mb-4">
                    <input type="text" value={productFilter} onChange={(e) => setProductFilter(e.target.value)} placeholder="Search for products..." className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pl-8 disabled:bg-gray-100" disabled={isControlDisabled}/>
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                </div>

                {isFetchingProducts ? (
                     <div className="flex justify-center p-4"><svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
                ) : (
                    <ul className="space-y-2">
                        {filteredAllProducts.map(product => {
                            const isAdded = shoppingListItemNames.has(product.name.toLowerCase());
                            return (
                                <li key={product.name} className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{product.name}</p>
                                        <p className="text-xs text-gray-500">{formatCurrency(product.price)}</p>
                                    </div>
                                    <button onClick={() => handleSelectProduct(product.name)} disabled={isAdded || isControlDisabled} className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed">{isAdded ? 'Added' : 'Add +'}</button>
                                </li>
                            );
                        })}
                         {filteredAllProducts.length === 0 && (<div className="text-center text-gray-400 pt-8"><p>No products match your search.</p></div>)}
                    </ul>
                )}
            </>
        )}

        {activeTab === 'Cart / Billing' && (
            <>
                {cartItems.length === 0 ? (
                    <div className="text-center text-gray-400 pt-8"><p>Your cart is empty.</p><p className="text-sm">Add items from your shopping list.</p></div>
                ) : (
                    <div className="space-y-4">
                        <ul className="space-y-2">
                            {cartItems.map(item => (
                                <li key={item.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-500">{getSectionName(item.sectionId)}</p>
                                    </div>
                                    <p className="font-medium text-gray-700">{formatCurrency(item.price)}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatCurrency(billingDetails.subtotal)}</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>Tax (8%)</span><span>{formatCurrency(billingDetails.tax)}</span></div>
                            <div className="flex justify-between text-base font-bold text-gray-800"><span>Total</span><span>{formatCurrency(billingDetails.total)}</span></div>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-gray-200">
        <div className="space-y-1 mb-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Items in List</span><span className="font-medium text-gray-800">{listItems.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Items in Cart</span><span className="font-medium text-gray-800">{cartItems.length}</span></div>
            <div className="flex justify-between text-base"><span className="font-medium text-gray-700">Total Amount</span><span className="font-bold text-lg text-gray-900">{formatCurrency(billingDetails.total)}</span></div>
        </div>

        <div className="flex gap-2">
          {isNavigating ? (
              <button onClick={onStopNavigation} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Stop Navigation</button>
          ) : (
              <button onClick={onStartNavigation} disabled={isLoading || listItems.length === 0} className="flex-grow w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                {isLoading && !isLiveTracking ? <LoadingSpinner /> : 'Start Navigation'}
              </button>
          )}
          <button 
              onClick={onToggleLiveTracking} 
              disabled={(isNavigating && !isLiveTracking) || (isLoading && !isLiveTracking)}
              className={`flex-shrink-0 flex justify-center items-center p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  isLiveTracking 
                  ? 'bg-blue-600 text-white border-transparent hover:bg-blue-700' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              aria-label={isLiveTracking ? 'Stop live location tracking' : 'Start live location tracking'}
          >
              {isLoading && !isLiveTracking ? <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> :
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPanel;
