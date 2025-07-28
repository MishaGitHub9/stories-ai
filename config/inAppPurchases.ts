import Constants from 'expo-constants';
import {
  clearTransactionIOS,
  finishTransaction,
  getAvailablePurchases,
  getSubscriptions,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
} from 'react-native-iap';

// Перевіряємо, чи це Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Перевіряємо, чи це TestFlight
const isTestFlight = Constants.appOwnership && Constants.appOwnership !== 'expo';

// ID продуктів в App Store Connect
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'com.mihadev.story.ai.premium.monthly',
} as const;

// Типи підписок
export const SUBSCRIPTION_TYPES = {
  [PRODUCT_IDS.PREMIUM_MONTHLY]: {
    status: 'premium' as const,
    plan: 'monthly' as const,
    duration: 30, // днів
  },
} as const;

// Змінні для відстеження стану
let isConnected = false;
let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;

// Ініціалізація In-App Purchases
export const initializeInAppPurchases = async () => {
  if (isExpoGo) {
    console.log('In-App Purchases not available in Expo Go');
    throw new Error('In-App Purchases not available in Expo Go');
  }

  try {
    console.log('Initializing react-native-iap...');
    
    // Підключаємося до магазину
    const result = await initConnection();
    console.log('Connection result:', result);
    
    isConnected = true;
    
    // Очищуємо попередні незавершені транзакції (тільки для iOS)
    if (Constants.platform?.ios) {
      await clearTransactionIOS();
    }
    
    // Налаштовуємо слухачів покупок
    purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      console.log('Purchase updated:', purchase);
      
      try {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          // Завершуємо транзакцію
          await finishTransaction({ purchase });
          console.log('Transaction finished successfully');
        }
      } catch (ackErr) {
        console.warn('Failed to finish transaction', ackErr);
      }
    });
    
    purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.error('Purchase error:', error);
    });
    
    console.log('react-native-iap initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize react-native-iap:', error);
    isConnected = false;
    throw error;
  }
};

// Отримання доступних продуктів
export const getAvailableProducts = async () => {
  if (isExpoGo) {
    console.log('In-App Purchases not available in Expo Go');
    return [];
  }

  if (!isConnected) {
    throw new Error('IAP not connected. Call initializeInAppPurchases first.');
  }

  try {
    console.log('Fetching subscriptions...');
    const productIds = Object.values(PRODUCT_IDS);
    console.log('Product IDs:', productIds);
    console.log('Bundle ID:', Constants.expoConfig?.ios?.bundleIdentifier);
    console.log('App ownership:', Constants.appOwnership);
    
    const subscriptions = await getSubscriptions({ skus: productIds });
    console.log('Fetched subscriptions:', subscriptions);
    
    if (!subscriptions || subscriptions.length === 0) {
      // Спробуємо отримати всі доступні продукти для діагностики
      try {
        const allProducts = await getSubscriptions({ skus: [] });
        console.log('All available products:', allProducts);
      } catch (allProductsError) {
        console.log('Error getting all products:', allProductsError);
      }
      
      // Для TestFlight додаємо додаткову інформацію
      const additionalInfo = isTestFlight 
        ? '\n\nДля TestFlight перевірте:\n• Використовується Sandbox тестовий акаунт\n• Вийшли з реального App Store акаунта\n• Продукт активний в App Store Connect'
        : '';
      
      throw new Error(`No subscriptions found for IDs: ${productIds.join(', ')}\n\nПеревірте:\n• Product ID в App Store Connect\n• Статус продукту (Ready to Submit)\n• Угода про платні додатки\n• Bundle ID співпадає\n• Використовується sandbox тестер${additionalInfo}`);
    }
    
    return subscriptions;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Покупка продукту
export const purchaseProduct = async (productId: string) => {
  if (isExpoGo) {
    throw new Error('In-App Purchases not available in Expo Go');
  }

  if (!isConnected) {
    throw new Error('IAP not connected');
  }

  try {
    console.log('Starting purchase for subscription:', productId);
    
    // Здійснюємо покупку підписки
    const result = await requestSubscription({
      sku: productId,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });
    
    console.log('Purchase result:', result);
    return result;
  } catch (error) {
    console.error('Error purchasing product:', error);
    
    // Більш детальна обробка помилок
   
    
    throw error;
  }
};

// Відновлення покупок
export const restorePurchases = async () => {
  if (isExpoGo) {
    console.log('In-App Purchases not available in Expo Go');
    return [];
  }

  if (!isConnected) {
    throw new Error('IAP not connected');
  }

  try {
    console.log('Restoring purchases...');
    const purchases = await getAvailablePurchases();
    console.log('Available purchases:', purchases);
    
    return purchases || [];
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

// Відключення In-App Purchases
export const disconnectInAppPurchases = async () => {
  if (isExpoGo) {
    console.log('In-App Purchases not available in Expo Go');
    return;
  }

  try {
    // Видаляємо слухачів
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
    
    // Відключаємося (react-native-iap автоматично відключається)
    isConnected = false;
    console.log('IAP disconnected');
  } catch (error) {
    console.error('Error disconnecting IAP:', error);
  }
};

// Перевірка стану підключення
export const isIAPConnected = () => isConnected;