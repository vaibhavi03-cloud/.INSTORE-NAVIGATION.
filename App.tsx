import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import FloorMap from './components/FloorMap';
import ShoppingPanel from './components/ShoppingPanel';
import { ShoppingListItem, StoreSection, Product } from './types';
import { getProductDetails, getOptimalRoute, generateProductList } from './services/geminiService';
import { storeSections } from './data/storeData';

const initialUserPosition = storeSections.find(s => s.id === 'main-entrance')?.center || { x: 11.5, y: 18 };
const SAVED_LIST_KEY = 'inStoreNav-savedList';

// Define GPS boundaries for the store simulation
const STORE_BOUNDS = {
  latMax: 37.4225, // North
  latMin: 37.4215, // South
  lonMin: -122.0850, // West
  lonMax: -122.0830, // East
};
const MAP_GRID_SIZE = { width: 20, height: 20 };


const App: React.FC = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState<boolean>(true);
  
  const [userPosition, setUserPosition] = useState(initialUserPosition);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const watchId = useRef<number | null>(null);

  const [isListSaved, setIsListSaved] = useState(false);

  const animationState = useRef({
    path: [] as {x: number, y: number}[],
    currentIndex: 0,
    animationFrameId: 0,
  });

  const listItems = useMemo(() => shoppingList.filter(item => item.status === 'in-list'), [shoppingList]);
  const cartItems = useMemo(() => shoppingList.filter(item => item.status === 'in-cart'), [shoppingList]);

  const billingDetails = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cartItems]);

  const mapGpsToStoreCoords = (coords: GeolocationCoordinates): { x: number; y: number } => {
    const { latitude, longitude } = coords;

    const clampedLat = Math.max(STORE_BOUNDS.latMin, Math.min(STORE_BOUNDS.latMax, latitude));
    const clampedLon = Math.max(STORE_BOUNDS.lonMin, Math.min(STORE_BOUNDS.lonMax, longitude));
    
    const lonRange = STORE_BOUNDS.lonMax - STORE_BOUNDS.lonMin;
    const latRange = STORE_BOUNDS.latMax - STORE_BOUNDS.latMin;

    const percentX = lonRange === 0 ? 0.5 : (clampedLon - STORE_BOUNDS.lonMin) / lonRange;
    const percentY = latRange === 0 ? 0.5 : (clampedLat - STORE_BOUNDS.latMax) / (STORE_BOUNDS.latMin - STORE_BOUNDS.latMax);

    return {
      x: percentX * MAP_GRID_SIZE.width,
      y: percentY * MAP_GRID_SIZE.height,
    };
  };

  useEffect(() => {
    const savedList = localStorage.getItem(SAVED_LIST_KEY);
    if (savedList) {
        setIsListSaved(true);
    }

    const fetchProducts = async () => {
      setIsFetchingProducts(true);
      try {
        const products = await generateProductList(storeSections);
        setAllProducts(products);
      } catch (e) {
        console.error("Failed to fetch product list", e);
        setError("Could not load the product list. Please try again later.");
      } finally {
        setIsFetchingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isNavigating || isLiveTracking) { // Stop animation if not navigating OR if live tracking
        if (animationState.current.animationFrameId) {
            cancelAnimationFrame(animationState.current.animationFrameId);
            animationState.current.animationFrameId = 0;
        }
        return;
    }

    const animate = () => {
        if (animationState.current.currentIndex >= animationState.current.path.length) {
            setIsNavigating(false); // End of path
            return;
        }

        setUserPosition(currentPosition => {
            const target = animationState.current.path[animationState.current.currentIndex];
            const dx = target.x - currentPosition.x;
            const dy = target.y - currentPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const movementPerFrame = 0.08; 

            if (distance < movementPerFrame) {
                animationState.current.currentIndex++;
                return target;
            } else {
                const newX = currentPosition.x + (dx / distance) * movementPerFrame;
                const newY = currentPosition.y + (dy / distance) * movementPerFrame;
                return { x: newX, y: newY };
            }
        });

        animationState.current.animationFrameId = requestAnimationFrame(animate);
    };

    if (animationState.current.path.length > 0) {
        animationState.current.animationFrameId = requestAnimationFrame(animate);
    } else {
        setIsNavigating(false);
    }

    return () => {
        if (animationState.current.animationFrameId) {
            cancelAnimationFrame(animationState.current.animationFrameId);
            animationState.current.animationFrameId = 0;
        }
    };
  }, [isNavigating, isLiveTracking]);


  const handleAddItem = useCallback(async (itemName: string) => {
    if (!itemName.trim() || (isNavigating && !isLiveTracking)) return;
    setIsLoading(true);
    setError(null);
    setNavigationPath([]);

    try {
      const details = await getProductDetails(itemName, storeSections);
      if (details) {
        const newItem: ShoppingListItem = {
          id: `${Date.now()}-${itemName}`,
          name: itemName,
          price: details.price,
          sectionId: details.sectionId,
          floor: 1, 
          status: 'in-list',
        };
        setShoppingList(prev => [...prev, newItem]);
      } else {
        setError(`Sorry, couldn't find a section for "${itemName}".`);
      }
    } catch (e) {
      setError("An error occurred while adding the item.");
    } finally {
      setIsLoading(false);
    }
  }, [isNavigating, isLiveTracking]);

  const handleRemoveItem = useCallback((itemId: string) => {
    if (isNavigating && !isLiveTracking) return;
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
    setNavigationPath([]);
  }, [isNavigating, isLiveTracking]);

  const handleAddToCart = useCallback((itemId: string) => {
    if (isNavigating && !isLiveTracking) return;
    setShoppingList(prev => prev.map(item => item.id === itemId ? { ...item, status: 'in-cart' } : item));
  }, [isNavigating, isLiveTracking]);

  const handleStartNavigation = useCallback(async () => {
    if (listItems.length === 0) {
        setError("Your shopping list is empty.");
        return;
    };
    setIsLoading(true);
    setError(null);
    
    try {
        const route = await getOptimalRoute(listItems, storeSections);
        setNavigationPath(route);

        const routeCoordinates = route.map(id => storeSections.find(s => s.id === id)?.center).filter((p): p is {x: number; y: number} => !!p);
        
        if (routeCoordinates.length > 0) {
            const waypoints = [userPosition, ...routeCoordinates];
            const detailedPath: {x: number; y: number}[] = [];

            for (let i = 0; i < waypoints.length - 1; i++) {
                const start = waypoints[i];
                const end = waypoints[i + 1];
                if (i === 0) { 
                    detailedPath.push(start);
                }

                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance === 0) continue;

                const numSteps = Math.max(1, Math.round(distance / 0.2));

                for (let j = 1; j <= numSteps; j++) {
                    const t = j / numSteps;
                    detailedPath.push({ x: start.x + dx * t, y: start.y + dy * t });
                }
            }
            animationState.current.path = detailedPath;
            animationState.current.currentIndex = 0;
            
            setIsNavigating(true);
        }
    } catch (e) {
        setError("Could not calculate the optimal route.");
        setIsNavigating(false);
    } finally {
        setIsLoading(false);
    }
  }, [listItems, userPosition]);

  const handleStopNavigation = useCallback(() => {
    setIsNavigating(false);
    setNavigationPath([]);
    animationState.current.path = [];
    animationState.current.currentIndex = 0;
    if (!isLiveTracking) {
      setUserPosition(initialUserPosition);
    }
  }, [isLiveTracking]);
  
  const handleToggleLiveTracking = useCallback(() => {
    if (watchId.current !== null) { // Turning OFF
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
        setIsLiveTracking(false);
        handleStopNavigation(); // Clears path, etc.
        setUserPosition(initialUserPosition);
        setError(null);
    } else { // Turning ON
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setIsLoading(true);
        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const newPosition = mapGpsToStoreCoords(position.coords);
                setUserPosition(newPosition);
                if (!isLiveTracking) setIsLiveTracking(true); // Set only on first success
                setIsLoading(false);
                setError(null);
            },
            (geoError) => {
                let message = "An unknown error occurred with geolocation.";
                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED: message = "Please allow location access to use live tracking."; break;
                    case geoError.POSITION_UNAVAILABLE: message = "Location information is unavailable."; break;
                    case geoError.TIMEOUT: message = "The request to get user location timed out."; break;
                }
                setError(message);
                if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
                setIsLiveTracking(false);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }
  }, [isLiveTracking, handleStopNavigation]);

  const handleSaveList = useCallback(() => {
    if (shoppingList.length > 0) {
      localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(shoppingList));
      setIsListSaved(true);
    } else {
      localStorage.removeItem(SAVED_LIST_KEY);
      setIsListSaved(false);
    }
  }, [shoppingList]);
  
  const handleLoadList = useCallback(() => {
    const savedListJSON = localStorage.getItem(SAVED_LIST_KEY);
    if (savedListJSON) {
      try {
        const savedList: ShoppingListItem[] = JSON.parse(savedListJSON);
        setShoppingList(savedList);
        handleStopNavigation();
      } catch (e) {
        console.error("Failed to parse saved list:", e);
        setError("Could not load the saved list. It might be corrupted.");
        localStorage.removeItem(SAVED_LIST_KEY);
        setIsListSaved(false);
      }
    }
  }, [handleStopNavigation]);


  return (
    <div className="flex flex-col h-screen font-sans antialiased">
      <Header />
      <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4 bg-white max-h-[calc(100vh-64px)]">
        <div className="flex-grow lg:w-2/3 xl:w-3/4 bg-gray-50 rounded-lg shadow-md p-4">
          <FloorMap 
            sections={storeSections} 
            path={navigationPath} 
            userPosition={userPosition} 
          />
        </div>
        <div className="lg:w-1/3 xl:w-1/4 flex-shrink-0">
          <ShoppingPanel
            listItems={listItems}
            cartItems={cartItems}
            billingDetails={billingDetails}
            sections={storeSections}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onAddToCart={handleAddToCart}
            onStartNavigation={handleStartNavigation}
            onStopNavigation={handleStopNavigation}
            onSaveList={handleSaveList}
            onLoadList={handleLoadList}
            isListSaved={isListSaved}
            isLoading={isLoading}
            isNavigating={isNavigating}
            error={error}
            allProducts={allProducts}
            isFetchingProducts={isFetchingProducts}
            isLiveTracking={isLiveTracking}
            onToggleLiveTracking={handleToggleLiveTracking}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
