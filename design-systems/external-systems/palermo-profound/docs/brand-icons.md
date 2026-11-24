# Brand icons

Source: https://palermo.tryprofound.com/docs/brand-icons

## Brand icons 
Logos of AI platforms, providers and integrations, drawn on one shared grid. 

## Variants 
Pick the variant from what the logo stands for: 

 tile : a data value that changes with the data, such as table rows, chart legends and tooltips, pills, and the options and selected value of a filter or picker. Round logo avatar stacks also use tiles. 

 mark : a static logo that is the same whatever the data, even when it sits on a filter or a button (for example a logo that says a setting applies to one platform), and everywhere else, such as buttons, menus, inline text, partner connections and onboarding. Black parts of a mark follow the text colour, so black logos stay visible on dark surfaces. 

 Preview Code 

 tile 

 mark 

## Sizes 
 size sets the width and height in pixels. Every brand is drawn on the same 24-unit grid, so logos match at any size. Do not size brand icons with className . 

 Preview Code 

 12 
 14 
 16 
 20 
 24 
 32 
 40 
 64 

## Unknown brands 
When a platform has no artwork, pass brand={null} with a fallbackName . It draws that name's initial, on a tile for variant="tile" . A brand that may be null requires a fallbackName . Like any brand icon, it stays decorative unless you also pass a label . 

 Preview Code 

## All brands 
Import the brand you draw from brand-icon/brands/<name> , so a page ships only its own logos. Surfaces that hold a brand's name, such as a platform slug table, look it up in brand-icon/registry , which bundles every brand. A brand holds functions, so a Server Component cannot pass one to a Client Component: render <BrandIcon> on the server and pass the element, or import the brand inside the client module. 
To add a brand, add brands/<name>.tsx in packages/design-system/components/primitives/brand-icon/ and register it in registry.ts . 

 Brand Tile 16 · 24 · 40 Mark 12 · 16 · 24 · 40 

Adobe Experience Manager aem 

Akamai akamai 

Amazon amazon 

Amazon Data Firehose amazon-firehose 

Anthropic anthropic 

Apple apple 

AWS aws 

Baidu baidu 

ByteDance bytedance 

ChatGPT chatgpt 

Claude claude 

Claude Code claude-code 

Cloudflare cloudflare 

Common Crawl common-crawl 

Microsoft Copilot copilot 

DeepSeek deepseek 

DuckDuckGo duckduckgo 

Exa exa 

Fastly fastly 

Framer framer 

Google Cloud gcp 

Gemini gemini 

Gong gong 

Google google 

Google Analytics google-analytics 

Grok grok 

Huawei huawei 

HubSpot hubspot 

Linear linear 

Meta meta 

Microsoft microsoft 

Mistral AI mistral 

MongoDB mongodb 

Netlify netlify 

OpenEvidence open-evidence 

OpenClaw openclaw 

Parallel parallel 

Perplexity perplexity 

Pinecone pinecone 

PostgreSQL postgresql 

Qwen qwen 

Shopify shopify 

SQLite sqlite 

Squarespace squarespace 

Supabase supabase 

Vercel vercel 

Webflow webflow 

WordPress wordpress 

xAI xai 

Yahoo yahoo 

Yandex yandex 

You.com you-com 

 Previous Badge 
 Next 
 Button
