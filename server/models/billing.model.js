const { promisePool } = require('../config/database');
const { AppError } = require('../middleware/error');
const { v4: uuidv4 } = require('uuid');

class BillingModel {
  /**
   * Get all subscription plans
   * @returns {Promise<Array>} List of subscription plans
   */
  static async getSubscriptionPlans() {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price ASC'
      );
      return rows;
    } catch (error) {
      throw new AppError(`Error fetching subscription plans: ${error.message}`, 500);
    }
  }

  /**
   * Get a specific subscription plan by ID
   * @param {string} planId - Plan ID
   * @returns {Promise<object|null>} Subscription plan or null if not found
   */
  static async getSubscriptionPlan(planId) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM subscription_plans WHERE id = ? AND is_active = TRUE',
        [planId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new AppError(`Error fetching subscription plan: ${error.message}`, 500);
    }
  }

  /**
   * Get user's current subscription
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} Subscription details or null if not found
   */
  static async getCurrentSubscription(userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT s.*, sp.name as plan_name, sp.price, sp.features
         FROM subscriptions s
         JOIN subscription_plans sp ON s.plan_id = sp.id
         WHERE s.user_id = ? AND s.status IN ('active', 'trial')
         ORDER BY s.created_at DESC
         LIMIT 1`,
        [userId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new AppError(`Error fetching current subscription: ${error.message}`, 500);
    }
  }

  /**
   * Get user's payment methods
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of payment methods
   */
  static async getPaymentMethods(userId) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw new AppError(`Error fetching payment methods: ${error.message}`, 500);
    }
  }

  /**
   * Add a new payment method
   * @param {string} userId - User ID
   * @param {object} paymentData - Payment method data
   * @returns {Promise<object>} Created payment method
   */
  static async addPaymentMethod(userId, paymentData) {
    try {
      const id = uuidv4();
      const { card_type, last_four, expiry_month, expiry_year, is_default = false } = paymentData;

      // If this is the default card, unset any existing default
      if (is_default) {
        await promisePool.query(
          'UPDATE payment_methods SET is_default = FALSE WHERE user_id = ?',
          [userId]
        );
      }

      const [result] = await promisePool.query(
        `INSERT INTO payment_methods 
         (id, user_id, card_type, last_four, expiry_month, expiry_year, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, card_type, last_four, expiry_month, expiry_year, is_default]
      );

      return { id, ...paymentData };
    } catch (error) {
      throw new AppError(`Error adding payment method: ${error.message}`, 500);
    }
  }

  /**
   * Create a new subscription
   * @param {string} userId - User ID
   * @param {string} planId - Plan ID
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<object>} Created subscription
   */
  static async createSubscription(userId, planId, paymentMethodId) {
    try {
      // Start transaction
      await promisePool.query('START TRANSACTION');

      // Get the plan details
      const [planRows] = await promisePool.query(
        'SELECT * FROM subscription_plans WHERE id = ?',
        [planId]
      );

      if (!planRows.length) {
        throw new AppError('Subscription plan not found', 404);
      }

      const plan = planRows[0];
      const id = uuidv4();
      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month subscription period

      // Create subscription
      await promisePool.query(
        `INSERT INTO subscriptions 
         (id, user_id, plan_id, status, current_period_start, current_period_end)
         VALUES (?, ?, ?, 'active', ?, ?)`,
        [id, userId, planId, now, periodEnd]
      );

      // Create invoice
      const invoiceId = uuidv4();
      await promisePool.query(
        `INSERT INTO invoices 
         (id, user_id, subscription_id, amount, status, billing_reason, payment_method_id)
         VALUES (?, ?, ?, ?, 'paid', 'subscription_create', ?)`,
        [invoiceId, userId, id, plan.price, paymentMethodId]
      );

      // Map plan name to subscription tier
      const subscriptionTier = plan.price > 0 ? 'corporate' : 'personal';

      // Update user's subscription tier
      await promisePool.query(
        'UPDATE users SET subscription_tier = ? WHERE id = ?',
        [subscriptionTier, userId]
      );

      // Commit transaction
      await promisePool.query('COMMIT');

      return {
        id,
        plan_id: planId,
        status: 'active',
        current_period_start: now,
        current_period_end: periodEnd
      };
    } catch (error) {
      // Rollback transaction on error
      await promisePool.query('ROLLBACK');
      throw new AppError(`Error creating subscription: ${error.message}`, 500);
    }
  }

  /**
   * Cancel a subscription
   * @param {string} userId - User ID
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<object>} Updated subscription
   */
  static async cancelSubscription(userId, subscriptionId) {
    try {
      const [result] = await promisePool.query(
        `UPDATE subscriptions 
         SET status = 'cancelled', cancel_at_period_end = TRUE
         WHERE id = ? AND user_id = ?`,
        [subscriptionId, userId]
      );

      if (result.affectedRows === 0) {
        throw new AppError('Subscription not found', 404);
      }

      return { message: 'Subscription cancelled successfully' };
    } catch (error) {
      throw new AppError(`Error cancelling subscription: ${error.message}`, 500);
    }
  }

  /**
   * Get billing history
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} List of invoices
   */
  static async getBillingHistory(userId, limit = 10) {
    try {
      const [rows] = await promisePool.query(
        `SELECT i.id, 
                i.subscription_id,
                CAST(i.amount AS DECIMAL(10,2)) as amount,
                i.status,
                i.created_at,
                sp.name as plan_name,
                pm.last_four
         FROM invoices i
         JOIN subscriptions s ON i.subscription_id = s.id
         JOIN subscription_plans sp ON s.plan_id = sp.id
         LEFT JOIN payment_methods pm ON i.payment_method_id = pm.id
         WHERE i.user_id = ?
         ORDER BY i.created_at DESC
         LIMIT ?`,
        [userId, limit]
      );
      
      // Convert amount strings to numbers
      return rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount)
      }));
    } catch (error) {
      throw new AppError(`Error fetching billing history: ${error.message}`, 500);
    }
  }
}

module.exports = BillingModel; 