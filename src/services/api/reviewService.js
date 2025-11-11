import { getApperClient } from "@/services/apperClient";

class ReviewService {
  constructor() {
    this.tableName = 'reviews_c';
  }

  async getByProductId(productId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "comment_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "helpful_c"}},
          {"field": {"Name": "verified_c"}},
          {"field": {"Name": "product_id_c"}}
        ],
        where: [{
          "FieldName": "product_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(productId)]
        }],
        orderBy: [{
          "fieldName": "date_c",
          "sorttype": "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(review => ({
        ...review,
        customerName: review.customer_name_c,
        rating: review.rating_c,
        title: review.title_c,
        comment: review.comment_c,
        date: review.date_c,
        helpful: review.helpful_c || 0,
        verified: review.verified_c || false,
        productId: review.product_id_c?.Id || review.product_id_c
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }

  async getById(reviewId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(this.tableName, parseInt(reviewId), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "comment_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "helpful_c"}},
          {"field": {"Name": "verified_c"}},
          {"field": {"Name": "product_id_c"}}
        ]
      });

      if (!response.success) {
        throw new Error(response.message || "Review not found");
      }

      const review = response.data;
      return {
        ...review,
        customerName: review.customer_name_c,
        rating: review.rating_c,
        title: review.title_c,
        comment: review.comment_c,
        date: review.date_c,
        helpful: review.helpful_c || 0,
        verified: review.verified_c || false,
        productId: review.product_id_c?.Id || review.product_id_c
      };
    } catch (error) {
      console.error(`Error fetching review ${reviewId}:`, error);
      throw error;
    }
  }

  async create(reviewData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord(this.tableName, {
        records: [{
          product_id_c: parseInt(reviewData.productId),
          customer_name_c: reviewData.reviewerName || reviewData.customerName,
          rating_c: parseInt(reviewData.rating),
          title_c: reviewData.title || "",
          comment_c: reviewData.reviewText || reviewData.comment,
          date_c: new Date().toISOString(),
          helpful_c: 0,
          verified_c: true
        }]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || "Failed to create review");
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create review: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        if (successful.length > 0) {
          const review = successful[0].data;
          return {
            ...review,
            customerName: review.customer_name_c,
            rating: review.rating_c,
            title: review.title_c,
            comment: review.comment_c,
            date: review.date_c,
            helpful: review.helpful_c || 0,
            verified: review.verified_c || false,
            productId: review.product_id_c?.Id || review.product_id_c
          };
        }
      }

      throw new Error("Failed to create review");
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  async getAverageRating(productId) {
    try {
      const reviews = await this.getByProductId(productId);
      if (reviews.length === 0) {
        return 0;
      }
      
      const average = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
      return parseFloat(average.toFixed(1));
    } catch (error) {
      console.error("Error calculating average rating:", error);
      return 0;
    }
  }
}

export const reviewService = new ReviewService();