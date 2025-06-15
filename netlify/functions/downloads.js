
// netlify/functions/downloads.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
    try {
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        
        // Use service account credentials
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
        
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        
        // Get the count from the first cell of the first row
        const count = rows[0] ? rows[0].count : 0;
        
        return {
            statusCode: 200,
            body: JSON.stringify({ count: parseInt(count) || 0 }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};