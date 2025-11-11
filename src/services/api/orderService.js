import { getApperClient } from "@/services/apperClient";

class OrderService {
  constructor() {
    this.tableName = 'orders_c';
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "items_c"}}
        ],
        orderBy: [{
          "fieldName": "order_date_c",
          "sorttype": "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(order => ({
        ...order,
        id: order.order_number_c,
        orderDate: order.order_date_c,
        status: order.status_c,
        totalAmount: order.total_amount_c,
        items: order.items_c ? JSON.parse(order.items_c) : []
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(this.tableName, parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "items_c"}}
        ]
      });

      if (!response.success) {
        throw new Error(response.message || "Order not found");
      }

      const order = response.data;
      return {
        ...order,
        id: order.order_number_c,
        orderDate: order.order_date_c,
        status: order.status_c,
        totalAmount: order.total_amount_c,
        items: order.items_c ? JSON.parse(order.items_c) : []
      };
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  }

  async create(orderData) {
    try {
      const apperClient = getApperClient();
      const orderNumber = await this.generateOrderNumber();
      
      const response = await apperClient.createRecord(this.tableName, {
        records: [{
          order_number_c: orderData.id || orderNumber,
          order_date_c: orderData.orderDate || new Date().toISOString(),
          status_c: orderData.status || "confirmed",
          total_amount_c: orderData.totalAmount,
          items_c: JSON.stringify(orderData.items || [])
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || "Failed to create order");
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create order: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        if (successful.length > 0) {
          const order = successful[0].data;
          return {
            ...order,
            id: order.order_number_c,
            orderDate: order.order_date_c,
            status: order.status_c,
            totalAmount: order.total_amount_c,
            items: order.items_c ? JSON.parse(order.items_c) : []
          };
        }
      }

      throw new Error("Failed to create order");
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async generateOrderNumber() {
    try {
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      return `QC${timestamp}${randomSuffix}`;
    } catch (error) {
      console.error("Error generating order number:", error);
      return `QC${Date.now()}000`;
    }
  }
}

export const orderService = new OrderService();
export const orderService = new OrderService();