const functions = require('firebase-functions');
const admin = require('firebase-admin');
const CryptoJS = require('crypto-js');

admin.initializeApp();

// ── eSewa Payment Signature Generator ──────────────────
// This function runs on Google servers, never in the app
// The secret key never leaves this file
exports.generateEsewaSignature = functions.https.onCall(async (data, context) => {

    // 1. Make sure user is logged in
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to make a payment.'
        );
    }

    // 2. Get values sent from the app
    var amount = data.amount;
    var txnId = data.txnId;

    // 3. Validate the values
    if (!amount || !txnId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'amount and txnId are required.'
        );
    }

    if (isNaN(amount) || amount <= 0) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'amount must be a positive number.'
        );
    }

    // 4. Your eSewa secret key — SAFE here on the server
    // For UAT (testing) use this key
    // For live production replace with your real eSewa merchant secret
    var ESEWA_SECRET = '8gBm/:&EnhH.1/q';
    var MERCHANT_CODE = 'EPAYTEST'; // replace with your real merchant code for production

    // 5. Build the message and sign it
    var message = 'total_amount=' + amount + ',transaction_uuid=' + txnId + ',product_code=' + MERCHANT_CODE;
    var signature = CryptoJS.HmacSHA256(message, ESEWA_SECRET).toString(CryptoJS.enc.Base64);

    // 6. Return the signed data to the app
    return {
        signature: signature,
        merchantCode: MERCHANT_CODE,
        amount: amount,
        txnId: txnId,
        message: message,
    };
});


// ── Verify eSewa Payment ────────────────────────────────
// Called after eSewa redirects back to confirm payment is real
exports.verifyEsewaPayment = functions.https.onCall(async (data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in.'
        );
    }

    var bookingId = data.bookingId;
    var txnId = data.txnId;
    var amount = data.amount;
    var encodedResponse = data.encodedResponse;

    if (!bookingId || !txnId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'bookingId and txnId are required.'
        );
    }

    try {
        // Decode the base64 response from eSewa
        var decoded = Buffer.from(encodedResponse, 'base64').toString('utf8');
        var response = JSON.parse(decoded);

        // Verify the signature from eSewa
        var ESEWA_SECRET = '8gBm/:&EnhH.1/q';
        var message = 'transaction_code=' + response.transaction_code +
            ',status=' + response.status +
            ',total_amount=' + response.total_amount +
            ',transaction_uuid=' + response.transaction_uuid +
            ',product_code=' + response.product_code +
            ',signed_field_names=' + response.signed_field_names;

        var expectedSignature = CryptoJS.HmacSHA256(message, ESEWA_SECRET).toString(CryptoJS.enc.Base64);

        if (expectedSignature !== response.signature) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Payment signature verification failed.'
            );
        }

        if (response.status !== 'COMPLETE') {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Payment was not completed.'
            );
        }

        // Payment is verified — update Firestore
        await admin.firestore().collection('bookings').doc(bookingId).update({
            paymentStatus: 'paid',
            txnId: txnId,
            esewaResponse: response,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, message: 'Payment verified and booking updated.' };

    } catch (error) {
        console.error('verifyEsewaPayment error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});