# ServiceM8 Add-on 開発成功ガイド

## 概要
このガイドは、ServiceM8 Add-on開発で確実に成功するためのノウハウをまとめたものです。実際のトラブルシューティング経験から得られた知見を基に作成しています。

## 🎯 確実に動作する最小構成

### Manifest.json テンプレート
```json
{
    "name": "[Add-on Name]",
    "version": "1.0",
    "iconURL": "https://www.servicem8.com/images/addon-sdk-sample-icon.png",
    "supportURL": "[Your App URL]",
    "supportEmail": "[Support Email]"
}
```

### Function コード テンプレート
```javascript
/**
 * ServiceM8 Simple Function Template
 * Returns HTML for popup display
 */
module.exports = function(input, callback) {
    console.log('ServiceM8 Function called:', JSON.stringify(input));
    
    // Extract context data
    var jobUUID = input && input.eventArgs ? input.eventArgs.jobUUID : '';
    var accessToken = input && input.auth ? input.auth.accessToken : '';
    var accountUUID = input && input.auth ? input.auth.accountUUID : '';
    
    // Generate HTML response
    var html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>[Add-on Name]</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
            body { 
                font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
                margin: 0; padding: 20px; background: #f8f9fa; color: #333;
            }
            .container {
                background: white; padding: 24px; border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 500px;
            }
            h2 { color: #007cba; margin: 0 0 16px; font-size: 20px; }
            p { margin: 0 0 16px; line-height: 1.4; }
            .button {
                background: #007cba; color: white; padding: 12px 24px;
                border: none; border-radius: 6px; cursor: pointer;
                font-size: 14px; font-weight: 500; text-decoration: none;
                display: inline-block; transition: background 0.2s;
            }
            .button:hover { background: #0066a0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>[Add-on Name]</h2>
            <p>[Add-on Description]</p>
            <a href="#" class="button" onclick="openExternalApp()">
                [Action Button Text]
            </a>
        </div>
        
        <script>
            function openExternalApp() {
                var url = '[Your External App URL]';
                url += '?job_uuid=' + '${jobUUID}';
                url += '&company_uuid=' + '${accountUUID}';
                url += '&access_token=' + '${accessToken}';
                
                window.location.href = url;
            }
        </script>
    </body>
    </html>
    `;
    
    callback(null, html);
};
```

## 🚨 重要な制約事項

### 1. アイコンホスティング制約

#### ❌ 動作しないパターン
- **独自ドメイン**: `https://yourdomain.com/icon.png`
- **Vercel**: `https://yourapp.vercel.app/icon.png` (403 Forbidden)
- **GitHub Raw**: `https://raw.githubusercontent.com/user/repo/main/icon.png` (403 Forbidden)
- **SVGフォーマット**: ServiceM8はPNGのみサポート

#### ✅ 確実に動作するパターン
- **ServiceM8公式**: `https://www.servicem8.com/images/addon-sdk-sample-icon.png`
- **CDN経由**: 信頼できるCDNサービス（要検証）
- **別ドメイン**: ServiceM8がアクセス可能な公開ドメイン

### 2. Manifest.json構造制約

#### 必須フィールド
- `name`: Add-on名（文字列）
- `version`: バージョン（文字列形式: "1.0"）
- `iconURL`: 有効なPNGアイコンURL
- `supportURL`: サポートサイトURL
- `supportEmail`: サポートメールアドレス

#### Simple Functionで不要なフィールド
- `actions`: Function内でHTML生成するため不要
- `oauth`: Simple Functionでは自動管理
- `permissions`: 基本権限は自動付与

### 3. Function実装制約

#### 必須事項
- **HTML返却**: `callback(null, html)` でHTML文字列を返す
- **完全なHTML**: DOCTYPE, head, body タグ必須
- **文字エンコーディング**: UTF-8指定推奨

#### 推奨事項
- **レスポンシブデザイン**: 様々な画面サイズに対応
- **ServiceM8カラー**: `#007cba` を基調とした配色
- **エラーハンドリング**: 適切なtry-catch処理

## 🔧 トラブルシューティング手順

### Phase 1: 基本設定確認
1. **Manifest.json検証**
   - JSON構文チェック（JSONlintツール使用）
   - 必須フィールド存在確認
   - アイコンURL直接アクセステスト

2. **Function基本動作確認**
   - 最小限のHTMLを返すFunction作成
   - console.log()でInput確認
   - HTML構文検証

### Phase 2: アイコン問題対応
1. **ServiceM8公式アイコン使用**
   ```json
   "iconURL": "https://www.servicem8.com/images/addon-sdk-sample-icon.png"
   ```

2. **アイコンアクセステスト**
   - ブラウザで直接URL確認
   - 403/404エラーがないか確認
   - PNG形式確認（SVG不可）

### Phase 3: 外部アプリ連携
1. **URL生成確認**
   - JobUUID、AccessToken受け渡し
   - パラメータエンコーディング
   - HTTPS強制確認

2. **認証フロー確認**
   - ServiceM8 OAuth設定（必要に応じて）
   - トークン有効性検証
   - CORS設定確認

## 📋 開発段階別チェックリスト

### Stage 1: 最小動作確認
- [ ] ServiceM8公式アイコンでManifest作成
- [ ] 基本HTMLを返すFunction実装
- [ ] Private Install URLでテスト
- [ ] Job画面でAdd-onアクション表示確認

### Stage 2: 外部連携実装
- [ ] 外部アプリケーションURL設定
- [ ] ServiceM8パラメータ受け渡し実装
- [ ] 認証フロー実装（必要に応じて）
- [ ] エラーハンドリング実装

### Stage 3: UI/UX改善
- [ ] ServiceM8デザインガイドライン準拠
- [ ] レスポンシブデザイン実装
- [ ] ローディング表示実装
- [ ] エラーメッセージ適切化

### Stage 4: カスタマイズ・公開
- [ ] 独自アイコン作成（CDN等にホスト）
- [ ] ブランディング要素追加
- [ ] ServiceM8 Add-on Store申請
- [ ] 運用監視設定

## 💡 ベストプラクティス

### 1. 開発効率化
- **公式サンプル活用**: Hello World Add-onから開始
- **段階的開発**: 最小構成→機能追加の順序
- **バージョン管理**: Git等での設定ファイル管理

### 2. 信頼性向上
- **エラーハンドリング**: 全ての例外ケース対応
- **ログ出力**: デバッグ用console.log実装
- **フォールバック**: 外部サービス障害時の代替処理

### 3. 保守性確保
- **設定外部化**: URLやパラメータの環境変数化
- **コード分離**: HTML/CSS/JavaScriptの適切な分離
- **ドキュメント**: 設定変更手順の文書化

## 🎉 成功事例: Smart Message Translator

この成功パターンを使用して作成されたAdd-onが「Smart Message Translator」です。

### 実装要点
- ServiceM8公式アイコンを使用してアイコン問題を回避
- Simple Function形式でHTML生成
- Vercelホスティングの外部アプリケーションと連携
- JobUUID/AccessTokenを適切に受け渡し

### 学んだ教訓
1. **最初から完璧を目指さない**: 最小構成での動作確認が重要
2. **公式リソース活用**: ServiceM8提供のアセット積極使用
3. **段階的問題解決**: 一度に全てを解決しようとしない
4. **制約理解**: プラットフォーム固有の制限を受け入れる

---

このガイドに従うことで、ServiceM8 Add-on開発での失敗を最小限に抑え、確実に動作するAdd-onを作成できます。