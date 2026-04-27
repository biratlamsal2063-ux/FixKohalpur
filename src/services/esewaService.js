import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/firebaseConfig';

var functions = getFunctions(app);

// UAT test payment URL — replace with live URL for production
var ESEWA_PAYMENT_URL = 'https://uat.esewa.com.np/epay/main';
// Live: 'https://esewa.com.np/epay/main'

// Calls Cloud Function to get a signed payment form
export async function generateEsewaPaymentHTML(amount, txnId) {
  try {
    var generateSignature = httpsCallable(functions, 'generateEsewaSignature');
    var result = await generateSignature({ amount: amount, txnId: txnId });
    var data = result.data;

    // Build the payment HTML form
    var html = '<!DOCTYPE html>' +
      '<html><body onload="document.forms[0].submit()">' +
      '<form action="' + ESEWA_PAYMENT_URL + '" method="POST">' +
      '<input type="hidden" name="amount" value="' + data.amount + '" />' +
      '<input type="hidden" name="tax_amount" value="0" />' +
      '<input type="hidden" name="total_amount" value="' + data.amount + '" />' +
      '<input type="hidden" name="transaction_uuid" value="' + data.txnId + '" />' +
      '<input type="hidden" name="product_code" value="' + data.merchantCode + '" />' +
      '<input type="hidden" name="product_service_charge" value="0" />' +
      '<input type="hidden" name="product_delivery_charge" value="0" />' +
      '<input type="hidden" name="success_url" value="https://fixkohalpur.com/payment/success" />' +
      '<input type="hidden" name="failure_url" value="https://fixkohalpur.com/payment/failure" />' +
      '<input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />' +
      '<input type="hidden" name="signature" value="' + data.signature + '" />' +
      '</form>' +
      '<p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#666">Redirecting to eSewa...</p>' +
      '</body></html>';

    return { success: true, html: html };

  } catch (error) {
    console.error('generateEsewaPaymentHTML error:', error);
    return { success: false, error: error.message };
  }
}

// Verifies payment after eSewa redirects back
export async function verifyEsewaPayment(bookingId, txnId, amount, encodedResponse) {
  try {
    var verify = httpsCallable(functions, 'verifyEsewaPayment');
    var result = await verify({
      bookingId: bookingId,
      txnId: txnId,
      amount: amount,
      encodedResponse: encodedResponse,
    });
    return result.data;
  } catch (error) {
    console.error('verifyEsewaPayment error:', error);
    return { success: false, error: error.message };
  }
}