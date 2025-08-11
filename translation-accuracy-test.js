// Multi-language Translation Accuracy Test
// Tests various languages and business scenarios

const testCases = [
    // European Languages
    {
        language: "Spanish",
        original: "La tubería principal está rota y hay una fuga de agua en el sótano.",
        expected_concepts: ["pipe", "broken", "water", "leak", "basement"],
        business_context: "Plumbing emergency"
    },
    {
        language: "French", 
        original: "Le système électrique nécessite une mise à niveau pour respecter les normes de sécurité.",
        expected_concepts: ["electrical", "system", "upgrade", "safety", "standards"],
        business_context: "Electrical compliance"
    },
    {
        language: "German",
        original: "Die Klimaanlage funktioniert nicht ordnungsgemäß und die Bürotemperatur ist zu hoch.",
        expected_concepts: ["air conditioning", "not working", "office", "temperature", "high"],
        business_context: "HVAC maintenance"
    },
    {
        language: "Italian",
        original: "Il giardino ha bisogno di potatura delle rose e irrigazione automatica.",
        expected_concepts: ["garden", "pruning", "roses", "automatic", "irrigation"],
        business_context: "Landscaping services"
    },
    
    // Asian Languages
    {
        language: "Japanese",
        original: "エアコンの修理を緊急でお願いします。オフィスが暑すぎます。",
        expected_concepts: ["air conditioner", "repair", "emergency", "office", "hot"],
        business_context: "Emergency HVAC"
    },
    {
        language: "Chinese (Simplified)",
        original: "洗衣机漏水了，需要立即维修。水已经流到地板上了。",
        expected_concepts: ["washing machine", "leak", "immediate", "repair", "floor"],
        business_context: "Appliance repair"
    },
    {
        language: "Korean",
        original: "정원의 잔디가 너무 길어서 깎아야 합니다. 언제 오실 수 있나요?",
        expected_concepts: ["garden", "grass", "too long", "cut", "when"],
        business_context: "Lawn maintenance"
    },
    
    // Middle Eastern Languages
    {
        language: "Arabic",
        original: "نظام التدفئة لا يعمل والطقس بارد جداً. نحتاج إصلاح عاجل.",
        expected_concepts: ["heating", "system", "not working", "cold", "urgent repair"],
        business_context: "Heating emergency"
    },
    {
        language: "Hebrew",
        original: "המדיח אינו פועל כראוי והכלים לא נקיים. האם תוכלו לבוא היום?",
        expected_concepts: ["dishwasher", "not working", "dishes", "clean", "today"],
        business_context: "Appliance service"
    },
    
    // Other Languages
    {
        language: "Russian",
        original: "Электрическая проводка нуждается в проверке. Иногда мигает свет.",
        expected_concepts: ["electrical", "wiring", "check", "light", "flickers"],
        business_context: "Electrical inspection"
    },
    {
        language: "Portuguese",
        original: "O ar condicionado está fazendo muito barulho e não está resfriando bem.",
        expected_concepts: ["air conditioning", "noise", "not cooling", "well"],
        business_context: "HVAC troubleshooting"
    },
    {
        language: "Dutch",
        original: "De verwarming werkt niet en het huis is koud. Kunnen jullie vandaag komen?",
        expected_concepts: ["heating", "not working", "house", "cold", "today"],
        business_context: "Emergency heating"
    }
];

// Test function to be used with real API
async function testTranslationAccuracy() {
    console.log("🌍 Multi-Language Translation Accuracy Test");
    console.log("=" + "=".repeat(50));
    
    for (const testCase of testCases) {
        console.log(`\n📍 Testing: ${testCase.language}`);
        console.log(`📝 Original: ${testCase.original}`);
        console.log(`🏢 Context: ${testCase.business_context}`);
        console.log(`🎯 Expected concepts: ${testCase.expected_concepts.join(", ")}`);
        
        // In real testing, call the API here
        // const translation = await callTranslationAPI(testCase.original);
        // console.log(`✅ Translation: ${translation}`);
        // console.log(`📊 Accuracy: ${evaluateAccuracy(translation, testCase.expected_concepts)}`);
    }
}

// Usage: Call this function with actual API integration
console.log("Translation test cases prepared for 12 languages");
console.log("Languages covered: Spanish, French, German, Italian, Japanese, Chinese, Korean, Arabic, Hebrew, Russian, Portuguese, Dutch");
console.log("\nTo run actual tests: implement API calls and accuracy evaluation");

module.exports = { testCases, testTranslationAccuracy };