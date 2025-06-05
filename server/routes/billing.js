const express = require('express');
const BillingService = require('../services/billing.service');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/billing/plans
 * @desc Get all subscription plans
 * @access Public
 */
router.get('/plans', catchAsync(async (req, res) => {
  const plans = await BillingService.getSubscriptionPlans();
  res.json(plans);
}));

/**
 * @route GET /api/billing/subscription
 * @desc Get user's current subscription
 * @access Private
 */
router.get('/subscription', verifyToken, catchAsync(async (req, res) => {
  const subscription = await BillingService.getCurrentSubscription(req.user.userId);
  res.json(subscription);
}));

/**
 * @route POST /api/billing/subscription
 * @desc Create a new subscription
 * @access Private
 */
router.post('/subscription', verifyToken, validateRequest({
  planId: { required: true },
  paymentMethodId: { required: true }
}), catchAsync(async (req, res) => {
  const { planId, paymentMethodId } = req.body;
  const subscription = await BillingService.createSubscription(
    req.user.userId,
    planId,
    paymentMethodId
  );
  res.json(subscription);
}));

/**
 * @route DELETE /api/billing/subscription/:id
 * @desc Cancel a subscription
 * @access Private
 */
router.delete('/subscription/:id', verifyToken, catchAsync(async (req, res) => {
  const result = await BillingService.cancelSubscription(req.user.userId, req.params.id);
  res.json(result);
}));

/**
 * @route GET /api/billing/payment-methods
 * @desc Get user's payment methods
 * @access Private
 */
router.get('/payment-methods', verifyToken, catchAsync(async (req, res) => {
  const paymentMethods = await BillingService.getPaymentMethods(req.user.userId);
  res.json(paymentMethods);
}));

/**
 * @route POST /api/billing/payment-methods
 * @desc Add a new payment method
 * @access Private
 */
router.post('/payment-methods', verifyToken, validateRequest({
  card_type: { required: true },
  last_four: { required: true, pattern: /^\d{4}$/ },
  expiry_month: { required: true, pattern: /^(0[1-9]|1[0-2])$/ },
  expiry_year: { required: true, pattern: /^\d{4}$/ },
  is_default: { required: false, type: 'boolean' }
}), catchAsync(async (req, res) => {
  const paymentMethod = await BillingService.addPaymentMethod(req.user.userId, req.body);
  res.json(paymentMethod);
}));

/**
 * @route GET /api/billing/history
 * @desc Get billing history
 * @access Private
 */
router.get('/history', verifyToken, catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const history = await BillingService.getBillingHistory(req.user.userId, limit);
  res.json(history);
}));

module.exports = router; 