import { CONFIG } from '../constants/config';
import CryptoJS from 'crypto-js'; // Install: expo install crypto-js

/**
 * Generates the eSewa payment HTML form.
 * In UAT (test), merchantCode = EPAYTEST, secret key = 8gBm/:&EnhH.1/q
 * In production, use your real credentials.
 */
export const generateEsewaPaymentHTML = ({ amount, txnId, productName }) => {
    // For live, replace secret and URL
    const secret = '8gBm/:&EnhH.1/q';  // UAT secret
    const message = `total_amount=${amount},transaction_uuid=${txnId},product_code=${CONFIG.ESEWA_MERCHANT_CODE}`;
    const signature = CryptoJS.HmacSHA256(message, secret).toString(CryptoJS.enc.Base64);

    return `
    <!DOCTYPE html>
    <html>
    <body onload="document.forms[0].submit()">
      <form action="${CONFIG.ESEWA_PAYMENT_URL}" method="POST">
        <input type="hidden" name="amount" value="${amount}" />
        <input type="hidden" name="tax_amount" value="0" />
        <input type="hidden" name="total_amount" value="${amount}" />
        <input type="hidden" name="transaction_uuid" value="${txnId}" />
        <input type="hidden" name="product_code" value="${CONFIG.ESEWA_MERCHANT_CODE}" />
        <input type="hidden" name="product_service_charge" value="0" />
        <input type="hidden" name="product_delivery_charge" value="0" />
        <input type="hidden" name="success_url" value="${CONFIG.ESEWA_SUCCESS_URL}" />
        <input type="hidden" name="failure_url" value="${CONFIG.ESEWA_FAILURE_URL}" />
        <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
        <input type="hidden" name="signature" value="${signature}" />
      </form>
      <p>Redirecting to eSewa...</p>
    </body>
    </html>
  `;
};