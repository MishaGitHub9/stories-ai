import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { purchaseUpdatedListener } from 'react-native-iap';
import {
  disconnectInAppPurchases,
  getAvailableProducts,
  initializeInAppPurchases,
  PRODUCT_IDS,
  purchaseProduct,
  restorePurchases,
  SUBSCRIPTION_TYPES
} from '../config/inAppPurchases';
import { useProfile } from './useProfile';

export const useInAppPurchases = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [iapAvailable, setIapAvailable] = useState(false);
  const { updateSubscription, fetchProfile } = useProfile();

  // Перевіряємо, чи це Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  // Ініціалізація In-App Purchases
  const initialize = useCallback(async () => {
    if (isExpoGo) {
      console.log('In-App Purchases not available in Expo Go');
      setInitialized(true);
      setIapAvailable(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('Initializing In-App Purchases...');
      await initializeInAppPurchases();
      
      console.log('Getting available products...');
      const availableProducts = await getAvailableProducts();
      
      if (!availableProducts || availableProducts.length === 0) {
        throw new Error('No products available. Check App Store Connect configuration.');
      }
      
      setProducts(availableProducts);
      setInitialized(true);
      setIapAvailable(true);
      
      console.log('In-App Purchases initialized successfully', availableProducts);
    } catch (error) {
      console.error('Failed to initialize In-App Purchases:', error);
      setInitialized(false);
      setIapAvailable(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Помилка ініціалізації покупок', 
        `Деталі помилки: ${errorMessage}\n\nПеревірте:\n• Продукт створений в App Store Connect\n• Product ID співпадає з кодом\n• Використовується sandbox тестер\n• Інтернет з'єднання активне`
      );
    } finally {
      setLoading(false);
    }
  }, [isExpoGo]);

  // Покупка підписки
  const purchaseSubscription = useCallback(async (productId: string) => {
    if (isExpoGo) {
      Alert.alert(
        'Expo Go', 
        'In-App Purchases доступні тільки в реальному додатку. Для тестування використовуйте EAS Build.'
      );
      return;
    }

    if (!initialized || !iapAvailable) {
      Alert.alert('Помилка', 'Покупки не ініціалізовані або недоступні');
      return;
    }

    // Перевіряємо, чи продукт доступний
    const product = getProduct(productId);
    if (!product) {
      Alert.alert('Помилка', `Продукт ${productId} недоступний`);
      return;
    }

    try {
      setLoading(true);
      
      console.log(`Starting purchase for product: ${productId}`);
      
      // Створюємо Promise для очікування завершення покупки
      let purchaseCompleted = false;
      let purchaseError: any = null;
      
      const purchasePromise = new Promise((resolve, reject) => {
        // Тимчасовий обробник для цієї покупки
        const tempHandler = (purchase: any) => {
          if (purchase.productId === productId) {
            purchaseCompleted = true;
            resolve(purchase);
          }
        };
        
        // Додаємо тимчасовий обробник
        const tempSubscription = purchaseUpdatedListener(tempHandler);
        
        // Таймаут на випадок, якщо покупка не завершиться
        setTimeout(() => {
          if (!purchaseCompleted) {
            tempSubscription.remove();
            reject(new Error('Purchase timeout'));
          }
        }, 30000); // 30 секунд
      });
      
      // Ініціюємо покупку
      await purchaseProduct(productId);
      
      // Чекаємо на завершення покупки
      const purchaseResult = await purchasePromise;
      console.log('Purchase completed:', purchaseResult);
      
      // Отримуємо інформацію про тип підписки
      const subscriptionType = SUBSCRIPTION_TYPES[productId as keyof typeof SUBSCRIPTION_TYPES];
      if (!subscriptionType) {
        throw new Error(`Unknown product ID: ${productId}`);
      }

      // Розраховуємо дати
      const now = new Date();
      const startDate = now.toISOString();
      let endDate: string | undefined;

      if (subscriptionType.duration) {
        const end = new Date(now.getTime() + subscriptionType.duration * 24 * 60 * 60 * 1000);
        endDate = end.toISOString();
      }

      // Оновлюємо підписку в базі даних
      await updateSubscription({
        subscription_status: subscriptionType.status,
        subscription_plan: subscriptionType.plan,
        subscription_start_date: startDate,
        subscription_end_date: endDate,
        subscription_provider: 'apple',
        subscription_id: productId,
      });

      // Оновлюємо профіль для одразуї доступності підписки
      await fetchProfile();

      Alert.alert(
        'Успішно!', 
        `Підписка ${subscriptionType.status} активована!`
      );
      
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Помилка покупки', `Не вдалося завершити покупку.\nДеталі: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [initialized, iapAvailable, updateSubscription, isExpoGo]);

  // Відновлення покупок
  const restore = useCallback(async () => {
    if (isExpoGo) {
      Alert.alert(
        'Expo Go', 
        'Відновлення покупок доступне тільки в реальному додатку.'
      );
      return;
    }

    if (!initialized || !iapAvailable) {
      Alert.alert('Помилка', 'Покупки не ініціалізовані або недоступні');
      return;
    }

    try {
      setLoading(true);
      console.log('Restoring purchases...');
      
      const purchaseHistory = await restorePurchases();
      console.log('Purchase history:', purchaseHistory);
      
      if (purchaseHistory && purchaseHistory.length > 0) {
        // Знаходимо найновішу активну покупку
        const latestPurchase = purchaseHistory[purchaseHistory.length - 1];
        const productId = latestPurchase.productId;
        
        const subscriptionType = SUBSCRIPTION_TYPES[productId as keyof typeof SUBSCRIPTION_TYPES];
        if (subscriptionType) {
          await updateSubscription({
            subscription_status: subscriptionType.status,
            subscription_plan: subscriptionType.plan,
            subscription_provider: 'apple',
            subscription_id: productId,
          });
          
          // Оновлюємо профіль для одразуї доступності підписки
          await fetchProfile();
          
          Alert.alert('Успішно!', 'Покупки відновлено');
        }
      } else {
        Alert.alert('Інформація', 'Активних покупок не знайдено');
      }
    } catch (error) {
      console.error('Restore error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Помилка', `Не вдалося відновити покупки.\nДеталі: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [initialized, iapAvailable, updateSubscription, isExpoGo]);

  // Отримання продукту за ID
  const getProduct = useCallback((productId: string) => {
    return products.find(product => product.productId === productId);
  }, [products]);

  // Отримання ціни продукту
  const getProductPrice = useCallback((productId: string) => {
    if (isExpoGo) {
      // Повертаємо тестові ціни для Expo Go
      const testPrices: Record<string, string> = {
        [PRODUCT_IDS.PREMIUM_MONTHLY]: '$9.99',
      };
      return testPrices[productId] || 'N/A';
    }
    
    const product = getProduct(productId);
    return product?.price || 'N/A';
  }, [getProduct, isExpoGo]);

  // Функція для повторної ініціалізації
  const reinitialize = useCallback(async () => {
    console.log('Reinitializing In-App Purchases...');
    setInitialized(false);
    setIapAvailable(false);
    setProducts([]);
    await initialize();
  }, [initialize]);

  // Ініціалізація при монтуванні
  useEffect(() => {
    initialize();
    
    // Відключення при розмонтуванні
    return () => {
      if (!isExpoGo && initialized) {
        console.log('Disconnecting In-App Purchases...');
        disconnectInAppPurchases();
      }
    };
  }, [initialize, isExpoGo, initialized]);

  return {
    products,
    loading,
    initialized,
    iapAvailable,
    purchaseSubscription,
    restore,
    getProduct,
    getProductPrice,
    initialize,
    reinitialize,
    isExpoGo,
  };
};