const BillingModel = require('../models/billing.model');
const { AppError } = require('../middleware/error');

class BillingService {
  /**
   * Get all available subscription plans
   * @returns {Promise<Array>} List of subscription plans
   */
  static async getSubscriptionPlans() {
    return BillingModel.getSubscriptionPlans();
  }

  /**
   * Get user's current subscription details
   * @param {string} userId - User ID
   * @returns {Promise<object>} Subscription details with plan information
   */
  static async getCurrentSubscription(userId) {
    const subscription = await BillingModel.getCurrentSubscription(userId);
    if (!subscription) {
      return {
        plan_name: 'Free',
        status: 'active',
        features: {
          queries_per_month: 100,
          db_connections: 1,
          chat_history_days: 7,
          support_level: 'community'
        }
      };
    }
    return subscription;
  }

  /**
   * Get user's payment methods
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of payment methods
   */
  static async getPaymentMethods(userId) {
    return BillingModel.getPaymentMethods(userId);
  }

  /**
   * Add a new payment method
   * @param {string} userId - User ID
   * @param {object} paymentData - Payment method data
   * @returns {Promise<object>} Created payment method
   */
  static async addPaymentMethod(userId, paymentData) {
    // Validate card details (this would be replaced with actual payment processor validation)
    this.validateCardDetails(paymentData);
    return BillingModel.addPaymentMethod(userId, paymentData);
  }

  /**
   * Create a new subscription
   * @param {string} userId - User ID
   * @param {string} planId - Plan ID
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<object>} Created subscription
   */
  static async createSubscription(userId, planId, paymentMethodId) {
    // Validate payment method belongs to user
    const paymentMethods = await BillingModel.getPaymentMethods(userId);
    const validPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
    if (!validPaymentMethod) {
      throw new AppError('Invalid payment method', 400);
    }

    // Check if user already has an active subscription
    const currentSubscription = await BillingModel.getCurrentSubscription(userId);
    
    // If switching plans, we need to handle the existing subscription first
    if (currentSubscription && currentSubscription.status === 'active') {
      // If trying to subscribe to the same plan, return error
      if (currentSubscription.plan_id === planId) {
        throw new AppError('You are already subscribed to this plan', 400);
      }
      
      // Cancel the current subscription before creating a new one
      await BillingModel.cancelSubscription(userId, currentSubscription.id);
    }

    // Verify the plan exists and is valid
    const plan = await BillingModel.getSubscriptionPlan(planId);
    if (!plan) {
      throw new AppError('Selected plan not found', 404);
    }

    // For paid plans, ensure payment method is valid
    if (plan.price > 0 && !paymentMethodId) {
      throw new AppError('Payment method is required for paid plans', 400);
    }

    try {
      // Simulate payment processing (this would be replaced with actual payment processor)
      if (plan.price > 0) {
        await this.simulatePaymentProcessing();
      }

      // Create the new subscription
      return await BillingModel.createSubscription(userId, planId, paymentMethodId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to create subscription: ${error.message}`, 500);
    }
  }

  /**
   * Cancel a subscription
   * @param {string} userId - User ID
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<object>} Cancellation confirmation
   */
  static async cancelSubscription(userId, subscriptionId) {
    return BillingModel.cancelSubscription(userId, subscriptionId);
  }

  /**
   * Get billing history
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} List of invoices
   */
  static async getBillingHistory(userId, limit = 10) {
    return BillingModel.getBillingHistory(userId, limit);
  }

  /**
   * Validate credit card details
   * @private
   * @param {object} cardDetails - Card details to validate
   */
  static validateCardDetails(cardDetails) {
    const { card_type, last_four, expiry_month, expiry_year } = cardDetails;

    if (!card_type || !['visa', 'mastercard', 'amex'].includes(card_type.toLowerCase())) {
      throw new AppError('Invalid card type', 400);
    }

    if (!last_four || !/^\d{4}$/.test(last_four)) {
      throw new AppError('Invalid card number', 400);
    }

    if (!expiry_month || !/^(0[1-9]|1[0-2])$/.test(expiry_month)) {
      throw new AppError('Invalid expiry month', 400);
    }

    if (!expiry_year || !/^\d{4}$/.test(expiry_year)) {
      throw new AppError('Invalid expiry year', 400);
    }

    // Check if card is expired
    const now = new Date();
    const cardExpiry = new Date(parseInt(expiry_year), parseInt(expiry_month) - 1);
    if (cardExpiry < now) {
      throw new AppError('Card has expired', 400);
    }
  }

  /**
   * Simulate payment processing
   * @private
   * @returns {Promise<void>}
   */
  static async simulatePaymentProcessing() {
    return new Promise((resolve, reject) => {
      // Simulate API call to payment processor
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new AppError('Payment processing failed', 400));
        }
      }, 1000);
    });
  }
}

module.exports = BillingService; 