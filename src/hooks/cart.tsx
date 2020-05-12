import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplaceCart',
        JSON.stringify(products),
      );
    }

    saveProducts();
  }, [products]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem('GoMarketplaceCart');
      storagedProducts
        ? setProducts(JSON.parse(storagedProducts))
        : setProducts([]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    (product: Omit<Product, 'quantity'>) => {
      const hasIndex = products.findIndex(item => item.id === product.id);

      if (hasIndex < 0) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        products[hasIndex].quantity += 1;
        setProducts([...products]);
      }
      // await AsyncStorage.setItem('GoMarketplaceCart', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    id => {
      const hasIndex = products.findIndex(item => item.id === id);
      if (hasIndex !== -1) {
        products[hasIndex].quantity += 1;
        setProducts([...products]);
        // await AsyncStorage.setItem('GoMarketplaceCart', JSON.stringify(products));
      }
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      const hasIndex = products.findIndex(item => item.id === id);

      if (hasIndex >= 0) {
        products[hasIndex].quantity === 1
          ? products.splice(hasIndex, 1)
          : (products[hasIndex].quantity -= 1);
        setProducts([...products]);
        // await AsyncStorage.setItem('GoMarketplaceCart', JSON.stringify(products));
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
