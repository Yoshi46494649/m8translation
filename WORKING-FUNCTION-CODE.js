'use strict';

exports.handler = (event, context, callback) => {
 
    console.log('Received event:', JSON.stringify(event, null, 2));
 
    var strJobUUID = event.eventArgs.jobUUID;
    var strAccessToken = event.auth.accessToken;
    var strAccountUUID = event.auth.accountUUID;
 
    var strHTMLResponse = `
<html>
    <head>
        <link rel="stylesheet" href="https://platform.servicem8.com/sdk/1.0/sdk.css">
        <script src="https://platform.servicem8.com/sdk/1.0/sdk.js"></script>
        <script>
            var client = SMClient.init();
            client.resizeWindow(540, 420);
        </script>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; }
            h2 { color: #007cba; margin-bottom: 16px; }
            .button { background: #007cba; color: white; padding: 12px 24px; 
                     border: none; border-radius: 6px; cursor: pointer; }
        </style>
    </head>
    <body>
        <h2>Smart Message Translator</h2>
        <p>AI-powered translation tool for ServiceM8 messages.</p>
        <p>Job: <b>` + strJobUUID + `</b></p>
        
        <button class="button" onClick="openTranslator()">Open Translator</button>
        <button onClick="client.closeWindow();">Close Window</button>
        
        <script>
            function openTranslator() {
                var url = "https://m8translation.vercel.app/translate-compose";
                url += "?job_uuid=" + "` + strJobUUID + `";
                url += "&company_uuid=" + "` + strAccountUUID + `";
                url += "&access_token=" + "` + strAccessToken + `";
                window.open(url, "_blank", "width=540,height=420");
            }
        </script>
    </body>
</html>`;
 
    callback(null, { 
        eventResponse: strHTMLResponse
    });
 
};