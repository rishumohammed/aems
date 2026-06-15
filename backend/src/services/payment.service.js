import Razorpay from 'razorpay';
import crypto from 'crypto';
import { pool } from '../db/connection.js';

class PaymentService {
  async getKeys() {
    try {
      const [rows] = await pool.query('SELECT `key`, `value` FROM system_config WHERE `key` IN ("razorpay_key_id", "razorpay_key_secret")');
      const keys = {};
      rows.forEach(r => {
        keys[r.key] = r.value;
      });
      
      const key_id = process.env.RAZORPAY_KEY_ID || keys.razorpay_key_id || 'rzp_test_placeholder';
      const key_secret = process.env.RAZORPAY_KEY_SECRET || keys.razorpay_key_secret || 'placeholder_secret';
      
      return { key_id, key_secret };
    } catch (err) {
      console.error('Error fetching Razorpay keys from DB:', err);
      return {
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
      };
    }
  }

  async createOrder(amount, currency = 'INR', receipt = '') {
    try {
      const { key_id, key_secret } = await this.getKeys();
      
      const razorpay = new Razorpay({ key_id, key_secret });
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`
      };
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay Create Order Error:', error);
      throw error;
    }
  }

  async verifySignature(orderId, paymentId, signature) {
    try {
      const { key_secret } = await this.getKeys();
      const secret = key_secret || 'placeholder_secret';
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');
      
      return expectedSignature === signature;
    } catch (error) {
      console.error('Razorpay Signature Verification Error:', error);
      return false;
    }
  }

  async getOrder(orderId) {
    try {
      const { key_id, key_secret } = await this.getKeys();
      const razorpay = new Razorpay({ key_id, key_secret });
      const order = await razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error('Razorpay Fetch Order Error:', error);
      throw error;
    }
  }
}

export default new PaymentService();
