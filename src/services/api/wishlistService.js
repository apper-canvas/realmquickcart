import { getApperClient } from "@/services/apperClient";
import { toast } from 'react-toastify';

class WishlistService {
  constructor() {
    this.tableName = 'wishlist_items_c';
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "product_id_c"}},
          {"field": {"Name": "added_at_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(item => ({
        ...item,
        productId: item.product_id_c?.Id || item.product_id_c,
        addedAt: item.added_at_c
      }));
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      return [];
    }
  }

  async isInWishlist(productId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [{"field": {"Name": "Id"}}],
        where: [{
          "FieldName": "product_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(productId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      return response.data.length > 0;
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  }

  async add(productId) {
    try {
      const isAlreadyInWishlist = await this.isInWishlist(productId);
      if (isAlreadyInWishlist) {
        return { success: false, message: 'Product already in wishlist' };
      }

      const apperClient = getApperClient();
      const response = await apperClient.createRecord(this.tableName, {
        records: [{
          product_id_c: parseInt(productId),
          added_at_c: new Date().toISOString()
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return { success: false, message: response.message || 'Failed to add to wishlist' };
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to add to wishlist: ${failed.map(f => f.message).join(', ')}`);
          return { success: false, message: failed[0].message || 'Failed to add to wishlist' };
        }

        if (successful.length > 0) {
          return { success: true, message: 'Added to wishlist', item: successful[0].data };
        }
      }

      return { success: false, message: 'Failed to add to wishlist' };
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return { success: false, message: error.message || 'Failed to add to wishlist' };
    }
  }

  async remove(productId) {
    try {
      const apperClient = getApperClient();
      
      // First find the wishlist item
      const existingItems = await this.getAll();
      const wishlistItem = existingItems.find(item => item.productId === parseInt(productId));

      if (!wishlistItem) {
        return { success: false, message: 'Product not found in wishlist' };
      }

      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: [wishlistItem.Id]
      });

      if (!response.success) {
        console.error(response.message);
        return { success: false, message: response.message || 'Failed to remove from wishlist' };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to remove from wishlist: ${failed.map(f => f.message).join(', ')}`);
          return { success: false, message: failed[0].message || 'Failed to remove from wishlist' };
        }
      }

      return { success: true, message: 'Removed from wishlist' };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return { success: false, message: error.message || 'Failed to remove from wishlist' };
    }
  }

  async toggle(productId) {
    try {
      const isInWishlist = await this.isInWishlist(productId);
      
      if (isInWishlist) {
        return await this.remove(productId);
      } else {
        return await this.add(productId);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      return { success: false, message: error.message || 'Failed to update wishlist' };
    }
  }

  async clear() {
    try {
      const wishlistItems = await this.getAll();
      if (wishlistItems.length === 0) {
        return { success: true, message: 'Wishlist already empty' };
      }

      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: wishlistItems.map(item => item.Id)
      });

      if (!response.success) {
        console.error(response.message);
        return { success: false, message: response.message || 'Failed to clear wishlist' };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to clear some wishlist items: ${failed.map(f => f.message).join(', ')}`);
        }
      }

      return { success: true, message: 'Wishlist cleared' };
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      return { success: false, message: error.message || 'Failed to clear wishlist' };
    }
  }
}

export const wishlistService = new WishlistService();