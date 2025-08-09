# ServiceM8 Job Card アクション表示トラブルシューティング

## 現在の状況
- ✅ Manifest Status: "Ready"
- ✅ アイコン表示: 正常
- ✅ Function Code: 追加済み
- ❌ Job Card アクション: 表示されない

## 問題の原因分析

### 1. Add-on アクティベーション問題
ServiceM8でAdd-onが正しくアクティベートされていない可能性があります。

### 2. Simple Function の動作原理
Simple Function Add-onは、Manifest.jsonの`actions`セクションではなく、Function内でUI要素を生成します。しかし、Job CardでのAction表示には別のアプローチが必要な場合があります。

### 3. イベント登録問題
Function がServiceM8のJob Card イベントに正しく登録されていない可能性があります。

## 解決手順

### Step 1: Add-on のアクティベーション確認

1. **Private Install URLでアクティベート**
```
https://go.servicem8.com/addon_install?uuid=5d41f7b5-eeff-4825-b5a2-231a226a71ab
```

2. **ServiceM8 Settings > Add-ons 確認**
- Smart Message Translatorが一覧に表示されているか
- Status が "Connected" になっているか
- 必要に応じて "Connect" をクリック

### Step 2: Manifest.json にactions セクション追加

Simple Functionでも、Job Cardにアクションを表示するには`actions`セクションが必要な場合があります。

```json
{
    "name": "Smart Message Translator",
    "version": "1.0",
    "iconURL": "https://www.servicem8.com/images/addon-sdk-sample-icon.png",
    "supportURL": "https://m8translation.vercel.app",
    "supportEmail": "support@example.com",
    "actions": [
        {
            "name": "Translate Message",
            "type": "online",
            "entity": "job",
            "iconURL": "https://www.servicem8.com/images/addon-sdk-sample-icon.png",
            "event": "translate_message"
        }
    ]
}
```

### Step 3: Function Code 調整

Function内でイベントハンドリングを追加します：

```javascript
module.exports = function(input, callback) {
    console.log('ServiceM8 Function called:', JSON.stringify(input));
    
    // Check for action event
    if (input && input.eventName === 'translate_message') {
        // Generate HTML for action popup
        var html = generateTranslatorHTML(input);
        callback(null, html);
    } else {
        // Return empty or default response for other events
        callback(null, '<html><body><h2>Smart Message Translator Ready</h2></body></html>');
    }
};

function generateTranslatorHTML(input) {
    var jobUUID = input && input.eventArgs ? input.eventArgs.jobUUID : '';
    var accessToken = input && input.auth ? input.auth.accessToken : '';
    var accountUUID = input && input.auth ? input.auth.accountUUID : '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Message Translator</title>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: Arial, sans-serif;
                margin: 0; padding: 20px; background: #f8f9fa;
            }
            .container {
                background: white; padding: 24px; border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h2 { color: #007cba; margin: 0 0 16px; }
            .button {
                background: #007cba; color: white; padding: 12px 24px;
                border: none; border-radius: 6px; cursor: pointer;
                text-decoration: none; display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🌐 Smart Message Translator</h2>
            <p>AI-powered translation tool for ServiceM8 messages.</p>
            <a href="#" class="button" onclick="openTranslator()">Open Translator</a>
        </div>
        
        <script>
            function openTranslator() {
                var url = 'https://m8translation.vercel.app/translate-compose';
                url += '?job_uuid=' + encodeURIComponent('${jobUUID}');
                url += '&company_uuid=' + encodeURIComponent('${accountUUID}');
                url += '&access_token=' + encodeURIComponent('${accessToken}');
                
                window.open(url, '_blank', 'width=540,height=420');
            }
        </script>
    </body>
    </html>
    `;
}
```

### Step 4: Add-on 再接続

1. ServiceM8 Settings > Add-ons
2. Smart Message Translator を見つける
3. "Disconnect" → "Connect" で再接続
4. または一度削除して再インストール

### Step 5: キャッシュクリア

1. ブラウザのキャッシュをクリア
2. ServiceM8からログアウト → ログイン
3. 新しいJobを作成してテスト

## デバッグ手順

### 1. Add-on インストール確認
```
ServiceM8 > Settings > Add-ons > Custom Add-ons
```
- Smart Message Translatorが表示されているか
- Statusが "Connected" か

### 2. Job画面でのAction確認
```
Job詳細画面 > Actions メニュー
```
- "Translate Message" アクションがあるか
- クリックして反応があるか

### 3. Console ログ確認
ブラウザのDeveloper Tools > Console で：
- Function実行ログの確認
- エラーメッセージの確認

### 4. Manual Function Test
ServiceM8 Developer Portal で：
- Edit Function
- Test Function 機能があれば実行

## よくある問題と対策

### 問題1: Add-on一覧に表示されない
**対策**: Private Install URLを再度使用してインストール

### 問題2: "Connected"になるがActionが表示されない  
**対策**: Manifest.jsonにactionsセクションを追加

### 問題3: Actionはあるがクリックしても反応しない
**対策**: Function内でevent名の確認とHTMLレスポンス実装

### 問題4: HTMLは表示されるが外部リンクが動かない
**対策**: CORS設定とPopupブロッカー確認

## 次のステップ

1. **Manifest.json更新**: actionsセクション追加版をアップロード
2. **Function Code更新**: イベントハンドリング対応版に更新  
3. **Add-on再接続**: ServiceM8でDisconnect → Connect
4. **動作確認**: 新しいJobでアクションテスト

このトラブルシューティングに従って、段階的に問題を解決してください。