import { getApperClient } from "@/services/apperClient";

class ProductService {
  constructor() {
    this.tableName = 'products_c';
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "reviews_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "material_c"}},
          {"field": {"Name": "colors_c"}},
          {"field": {"Name": "warranty_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "dimensions_c"}},
          {"field": {"Name": "shipping_weight_c"}},
          {"field": {"Name": "origin_c"}},
          {"field": {"Name": "in_stock_c"}},
          {"field": {"Name": "images_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(product => ({
        ...product,
        name: product.name_c,
        description: product.description_c,
        price: product.price_c,
        originalPrice: product.original_price_c,
        rating: product.rating_c,
        reviews: product.reviews_c,
        stock: product.stock_c,
        category: product.category_c,
        brand: product.brand_c,
        material: product.material_c,
        colors: product.colors_c?.split(',') || [],
        warranty: product.warranty_c,
        weight: product.weight_c,
        dimensions: product.dimensions_c,
        shippingWeight: product.shipping_weight_c,
        origin: product.origin_c,
        inStock: product.in_stock_c,
        images: product.images_c ? product.images_c.split('\n').filter(url => url.trim()) : []
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(this.tableName, parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "reviews_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "material_c"}},
          {"field": {"Name": "colors_c"}},
          {"field": {"Name": "warranty_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "dimensions_c"}},
          {"field": {"Name": "shipping_weight_c"}},
          {"field": {"Name": "origin_c"}},
          {"field": {"Name": "in_stock_c"}},
          {"field": {"Name": "images_c"}}
        ]
      });

      if (!response.success) {
        throw new Error(response.message || "Product not found");
      }

      const product = response.data;
      return {
        ...product,
        name: product.name_c,
        description: product.description_c,
        price: product.price_c,
        originalPrice: product.original_price_c,
        rating: product.rating_c,
        reviews: product.reviews_c,
        stock: product.stock_c,
        category: product.category_c,
        brand: product.brand_c,
        material: product.material_c,
        colors: product.colors_c?.split(',') || [],
        warranty: product.warranty_c,
        weight: product.weight_c,
        dimensions: product.dimensions_c,
        shippingWeight: product.shipping_weight_c,
        origin: product.origin_c,
        inStock: product.in_stock_c,
        images: product.images_c ? product.images_c.split('\n').filter(url => url.trim()) : []
      };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  async getByCategory(category) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "reviews_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}}
        ],
        where: [{
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [category]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(product => ({
        ...product,
        name: product.name_c,
        description: product.description_c,
        price: product.price_c,
        originalPrice: product.original_price_c,
        rating: product.rating_c,
        reviews: product.reviews_c,
        stock: product.stock_c,
        category: product.category_c,
        images: product.images_c ? product.images_c.split('\n').filter(url => url.trim()) : []
      }));
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  }

  async searchProducts(query) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "reviews_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [{
                "fieldName": "name_c",
                "operator": "Contains",
                "values": [query]
              }],
              "operator": "OR"
            },
            {
              "conditions": [{
                "fieldName": "category_c",
                "operator": "Contains",
                "values": [query]
              }],
              "operator": "OR"
            },
            {
              "conditions": [{
                "fieldName": "description_c",
                "operator": "Contains",
                "values": [query]
              }],
              "operator": "OR"
            }
          ]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(product => ({
        ...product,
        name: product.name_c,
        description: product.description_c,
        price: product.price_c,
        originalPrice: product.original_price_c,
        rating: product.rating_c,
        reviews: product.reviews_c,
        stock: product.stock_c,
        category: product.category_c,
        images: product.images_c ? product.images_c.split('\n').filter(url => url.trim()) : []
      }));
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  async getRelated(productId, category, limit = 4) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "reviews_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}}
        ],
        where: [{
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [category]
        }],
        orderBy: [{
          "fieldName": "rating_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          "limit": limit + 1,
          "offset": 0
        }
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data
        .filter(product => product.Id !== productId)
        .slice(0, limit)
        .map(product => ({
          ...product,
          name: product.name_c,
          description: product.description_c,
          price: product.price_c,
          originalPrice: product.original_price_c,
          rating: product.rating_c,
          reviews: product.reviews_c,
          stock: product.stock_c,
          category: product.category_c,
          images: product.images_c ? product.images_c.split('\n').filter(url => url.trim()) : []
        }));
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }

  async getCategories() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [{"field": {"Name": "category_c"}}],
        groupBy: ["category_c"]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(item => item.category_c).filter(category => category);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  async getFeatured() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "reviews_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "images_c"}}
        ],
        where: [{
          "FieldName": "rating_c",
          "Operator": "GreaterThanOrEqualTo",
          "Values": [4.7]
        }],
        orderBy: [{
          "fieldName": "reviews_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          "limit": 6,
          "offset": 0
        }
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(product => ({
        ...product,
        name: product.name_c,
        description: product.description_c,
        price: product.price_c,
        originalPrice: product.original_price_c,
        rating: product.rating_c,
        reviews: product.reviews_c,
        stock: product.stock_c,
        category: product.category_c,
        images: product.images_c ? product.images_c.split('\n').filter(url => url.trim()) : []
      }));
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  }
}

export const productService = new ProductService();

export const productService = new ProductService();