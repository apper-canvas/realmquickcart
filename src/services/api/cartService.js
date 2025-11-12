import { getApperClient } from "@/services/apperClient";
import { store } from "@/store";

class CartService {
  constructor() {
    this.tableName = 'cart_items_c';
  }

async getAll() {
    // Check if user is authenticated
    const state = store.getState();
    const { isAuthenticated } = state.user;
    
    if (!isAuthenticated) {
      return [];
    }
    
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "product_id_c"}},
          {"field": {"Name": "quantity_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "image_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(item => ({
        ...item,
        productId: item.product_id_c?.Id || item.product_id_c,
        quantity: item.quantity_c,
        price: item.price_c,
        name: item.name_c,
        image: item.image_c
      }));
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }
  }

  async addItem(product, quantity = 1) {
    try {
// Check if user is authenticated
      const state = store.getState();
      const { isAuthenticated } = state.user;
      
      if (!isAuthenticated) {
        return null;
      }
      
      const apperClient = getApperClient();
      // First check if item already exists in cart
      const existingItems = await this.getAll();
      const existingItem = existingItems.find(item => item.productId === product.Id);

      if (existingItem) {
        // Update existing item quantity
        return await this.updateQuantity(product.Id, existingItem.quantity + quantity);
      }

      // Create new cart item
      const response = await apperClient.createRecord(this.tableName, {
        records: [{
          product_id_c: parseInt(product.Id),
          quantity_c: quantity,
          price_c: product.price,
          name_c: product.name,
          image_c: product.images && product.images.length > 0 ? product.images[0] : ''
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || "Failed to add item to cart");
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to add cart item: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

      return await this.getAll();
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  }

  async updateQuantity(productId, quantity) {
    try {
// Check if user is authenticated
      const state = store.getState();
      const { isAuthenticated } = state.user;
      
      if (!isAuthenticated) {
        return null;
      }
      
      const apperClient = getApperClient();
      if (quantity <= 0) {
        return await this.removeItem(productId);
      }

      // Find cart item by product ID
      const cartItems = await this.getAll();
      const cartItem = cartItems.find(item => item.productId === parseInt(productId));

      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      const response = await apperClient.updateRecord(this.tableName, {
        records: [{
          Id: cartItem.Id,
          quantity_c: quantity
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || "Failed to update cart item");
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update cart item: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

      return await this.getAll();
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      throw error;
    }
  }

  async removeItem(productId) {
try {
      // Check if user is authenticated
      const state = store.getState();
      const { isAuthenticated } = state.user;
      
      if (!isAuthenticated) {
        return false;
      }
      
      const apperClient = getApperClient();
      
      // Find cart item by product ID
      const cartItems = await this.getAll();
      const cartItem = cartItems.find(item => item.productId === parseInt(productId));

      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: [cartItem.Id]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || "Failed to remove cart item");
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to remove cart item: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

      return await this.getAll();
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
  }

  async clear() {
try {
      // Check if user is authenticated
      const state = store.getState();
      const { isAuthenticated } = state.user;
      
      if (!isAuthenticated) {
        return 0;
      }
      
      const cartItems = await this.getAll();
      if (cartItems.length === 0) {
        return [];
      }

      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: cartItems.map(item => item.Id)
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || "Failed to clear cart");
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to clear some cart items: ${failed.map(f => f.message).join(', ')}`);
        }
      }

      return [];
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }

  async getItemCount() {
try {
      // Check if user is authenticated
      const state = store.getState();
      const { isAuthenticated } = state.user;
      
      if (!isAuthenticated) {
        return 0;
      }
      
      const cartItems = await this.getAll();
      return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    } catch (error) {
      console.error("Error getting cart item count:", error);
      return 0;
    }
  }

  async getTotal() {
try {
      // Check if user is authenticated
      const state = store.getState();
      const { isAuthenticated } = state.user;
      
      if (!isAuthenticated) {
        return [];
      }
      
      const cartItems = await this.getAll();
      return cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    } catch (error) {
      console.error("Error calculating cart total:", error);
      return 0;
    }
  }
}

export const cartService = new CartService();