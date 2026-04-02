window.AppData = {
    BUDGET: 10000,

    /* --- Individual Stocks (real companies, sample prices) --- */
    stocks: [
        {
            ticker: "AAPL",
            name: "Apple Inc.",
            price: 175,
            sector: "Technology",
            sectorColor: "#4A90D9",
            riskLevel: 3,
            typicalReturn: { min: -25, max: 35, average: 12 },
            dividend: 0.5,
            description: "The world's most valuable company. Apple makes the iPhone, Mac, iPad, and Apple Watch, and runs services like the App Store, iCloud, and Apple Music. Known for strong brand loyalty and massive cash reserves.",
            whyBuy: [
                "Massive ecosystem of products and services creates loyal customers",
                "Consistently growing services revenue (App Store, iCloud, Apple TV+)",
                "Huge cash reserves and regular dividend payments",
                "Strong brand that commands premium pricing"
            ],
            risks: [
                "Heavy dependence on iPhone sales (~50% of revenue)",
                "Faces regulatory pressure and antitrust scrutiny globally",
                "Premium pricing limits growth in price-sensitive markets",
                "Innovation cycles — investors expect constant breakthroughs"
            ],
            guidance: "Apple is considered a \"blue-chip\" stock — a large, established company. It's a popular first stock for beginners because of its stability and brand recognition. Good for long-term holding."
        },
        {
            ticker: "MSFT",
            name: "Microsoft",
            price: 420,
            sector: "Technology",
            sectorColor: "#4A90D9",
            riskLevel: 3,
            typicalReturn: { min: -20, max: 40, average: 14 },
            dividend: 0.7,
            description: "Microsoft builds Windows, Office 365, Azure cloud computing, Xbox, and LinkedIn. Their Azure cloud platform is the #2 cloud provider globally and their fastest-growing business.",
            whyBuy: [
                "Dominant position in enterprise software (Office, Windows)",
                "Azure cloud platform growing rapidly, competing with Amazon's AWS",
                "Major investments in AI and partnerships with OpenAI",
                "Strong recurring revenue from subscriptions"
            ],
            risks: [
                "Premium valuation — already priced for continued high growth",
                "Cloud competition from Amazon (AWS) and Google Cloud is intense",
                "AI investments are expensive and returns are uncertain",
                "Regulatory risks as tech regulation increases"
            ],
            guidance: "Microsoft is one of the most stable large tech companies. Its mix of established products (Office, Windows) and growth areas (Cloud, AI) makes it a solid core holding. The higher share price means you'll buy fewer shares with your budget."
        },
        {
            ticker: "GOOGL",
            name: "Alphabet (Google)",
            price: 175,
            sector: "Technology",
            sectorColor: "#4A90D9",
            riskLevel: 3,
            typicalReturn: { min: -25, max: 35, average: 11 },
            dividend: 0,
            description: "Alphabet is Google's parent company. They dominate internet search and online advertising, run YouTube and Android, and have a growing cloud computing business. They're also investing heavily in AI with Gemini.",
            whyBuy: [
                "Near-monopoly in internet search and search advertising",
                "YouTube is the world's largest video platform",
                "Google Cloud is growing fast as the #3 cloud provider",
                "Massive investment in AI research and products"
            ],
            risks: [
                "Over 75% of revenue comes from advertising — vulnerable to ad market downturns",
                "Facing major antitrust lawsuits that could force business changes",
                "AI could disrupt traditional search, their core business",
                "No dividend — returns come only from stock price appreciation"
            ],
            guidance: "Google is a tech giant with enormous profits, but nearly all of it comes from ads. If you believe online advertising and AI will keep growing, Google is a strong pick. Note that it pays no dividend, so you only benefit from price increases."
        },
        {
            ticker: "AMZN",
            name: "Amazon",
            price: 185,
            sector: "Technology",
            sectorColor: "#4A90D9",
            riskLevel: 4,
            typicalReturn: { min: -30, max: 45, average: 13 },
            dividend: 0,
            description: "Amazon is the world's largest online retailer and runs AWS (Amazon Web Services), the #1 cloud computing platform. They also own Whole Foods, Prime Video, and Twitch.",
            whyBuy: [
                "AWS is the world's leading cloud platform with high profit margins",
                "Dominant e-commerce position with massive logistics network",
                "Prime membership creates sticky recurring revenue",
                "Expanding into healthcare, satellites, and AI"
            ],
            risks: [
                "Retail business operates on thin margins",
                "Heavily dependent on AWS for profits",
                "Faces increasing competition from other retailers and cloud providers",
                "Regulatory scrutiny over market dominance and labor practices"
            ],
            guidance: "Amazon is really two businesses: a low-margin retail giant and a high-margin cloud business (AWS). It's more volatile than Apple or Microsoft but has higher growth potential. No dividend, so it's a pure growth play."
        },
        {
            ticker: "TSLA",
            name: "Tesla",
            price: 175,
            sector: "Automotive / Energy",
            sectorColor: "#E74C3C",
            riskLevel: 5,
            typicalReturn: { min: -50, max: 80, average: 15 },
            dividend: 0,
            description: "Tesla is the world's leading electric vehicle maker. Beyond cars, they make solar panels, battery storage systems, and are developing self-driving technology and humanoid robots.",
            whyBuy: [
                "Market leader in electric vehicles with strong brand",
                "Expanding into energy storage and solar — not just cars",
                "Potential breakthrough in autonomous driving technology",
                "Massive fan base and cultural relevance drives demand"
            ],
            risks: [
                "Extremely volatile — price can swing 10-20% in a single week",
                "Valuation is very high relative to current profits",
                "Increasing competition from traditional automakers going electric",
                "Heavily dependent on CEO Elon Musk, whose actions affect stock price"
            ],
            guidance: "Tesla is the highest-risk stock on this list. It can deliver massive gains but also steep losses. Only invest what you can truly afford to lose. For beginners, it's a good lesson in volatility — consider a small position rather than going all-in."
        },
        {
            ticker: "JNJ",
            name: "Johnson & Johnson",
            price: 155,
            sector: "Healthcare",
            sectorColor: "#27AE60",
            riskLevel: 2,
            typicalReturn: { min: -10, max: 20, average: 7 },
            dividend: 3.0,
            description: "J&J is one of the world's largest healthcare companies, making consumer health products (Tylenol, Band-Aid), medical devices, and pharmaceuticals. They've increased their dividend for 60+ consecutive years.",
            whyBuy: [
                "Extremely stable — healthcare demand doesn't disappear in recessions",
                "Dividend aristocrat — 60+ years of consecutive dividend increases",
                "Diversified across consumer health, pharma, and medical devices",
                "Strong pipeline of pharmaceutical products"
            ],
            risks: [
                "Lower growth potential than tech stocks",
                "Faces ongoing litigation risks (lawsuits over products)",
                "Patent expirations can reduce pharmaceutical revenue",
                "Regulatory changes in healthcare could impact pricing"
            ],
            guidance: "J&J is a classic defensive stock — it tends to hold up well during market downturns because people always need healthcare. The generous, growing dividend makes it excellent for income investors. Great for reducing portfolio risk."
        },
        {
            ticker: "JPM",
            name: "JPMorgan Chase",
            price: 200,
            sector: "Finance",
            sectorColor: "#8E44AD",
            riskLevel: 3,
            typicalReturn: { min: -25, max: 30, average: 9 },
            dividend: 2.5,
            description: "The largest bank in the United States by assets. JPMorgan provides consumer banking, investment banking, asset management, and commercial banking services worldwide.",
            whyBuy: [
                "Largest U.S. bank — benefits from scale and diversification",
                "Consistent dividend payments with history of increases",
                "Benefits from rising interest rates (higher lending profits)",
                "Well-managed through past financial crises"
            ],
            risks: [
                "Banks are cyclical — profits drop significantly in recessions",
                "Heavily regulated industry with compliance costs",
                "Exposed to credit risk — loan defaults increase in downturns",
                "Interest rate changes can cut both ways"
            ],
            guidance: "JPMorgan is the gold standard of bank stocks. It pays a solid dividend and is well-run, but banking stocks can be more volatile during economic downturns. Good for adding financial sector exposure to a diversified portfolio."
        },
        {
            ticker: "KO",
            name: "Coca-Cola",
            price: 60,
            sector: "Consumer Goods",
            sectorColor: "#D35400",
            riskLevel: 2,
            typicalReturn: { min: -8, max: 18, average: 6 },
            dividend: 3.2,
            description: "The world's largest beverage company. Coca-Cola owns over 200 brands including Coke, Sprite, Fanta, Dasani, and Minute Maid. Warren Buffett's favorite stock — he's held it since 1988.",
            whyBuy: [
                "One of the most recognized brands on earth",
                "Warren Buffett has held it for 35+ years — ultimate vote of confidence",
                "Dividend aristocrat — 60+ years of consecutive increases",
                "Recession-resistant — people keep buying beverages in any economy"
            ],
            risks: [
                "Very low growth — it's a mature company in a mature market",
                "Health trends moving away from sugary drinks",
                "Currency risk from large international operations",
                "Low volatility also means limited upside potential"
            ],
            guidance: "Coca-Cola is the safest stock on this list. It won't make you rich quickly, but it's very unlikely to crash either. The high dividend yield provides steady income. At $60 per share, it's also the most affordable, letting you buy more shares. Great for cautious beginners."
        },
        {
            ticker: "NFLX",
            name: "Netflix",
            price: 625,
            sector: "Entertainment",
            sectorColor: "#E74C3C",
            riskLevel: 4,
            typicalReturn: { min: -35, max: 50, average: 12 },
            dividend: 0,
            description: "The world's largest streaming entertainment service with over 280 million subscribers globally. Netflix produces original content (Stranger Things, Squid Game) and recently added an ad-supported tier and live events.",
            whyBuy: [
                "Global leader in streaming with massive subscriber base",
                "Strong original content drives subscriber growth and retention",
                "New revenue streams from ads and live events",
                "International expansion still has room to grow"
            ],
            risks: [
                "Intense competition from Disney+, HBO Max, Amazon Prime, Apple TV+",
                "Content costs are enormous and rising",
                "Subscriber growth slowing in mature markets",
                "High share price means you can only buy a few shares on this budget"
            ],
            guidance: "Netflix is a high-growth entertainment stock. At $625 per share it's expensive, meaning your $10,000 budget can only buy about 16 shares. This limits diversification — be careful not to put too much here. Good for growth-focused investors."
        },
        {
            ticker: "DIS",
            name: "Walt Disney",
            price: 110,
            sector: "Entertainment",
            sectorColor: "#E74C3C",
            riskLevel: 3,
            typicalReturn: { min: -25, max: 30, average: 8 },
            dividend: 0.7,
            description: "Disney operates theme parks, movie studios (Marvel, Pixar, Star Wars, Disney Animation), Disney+ streaming, ESPN, and cruise lines. A uniquely diversified entertainment company.",
            whyBuy: [
                "Unmatched collection of entertainment brands (Marvel, Star Wars, Pixar)",
                "Theme parks and cruises provide steady revenue",
                "Disney+ streaming platform growing globally",
                "ESPN and sports rights are valuable media assets"
            ],
            risks: [
                "Theme parks are expensive to operate and sensitive to economic downturns",
                "Disney+ is still losing money competing with Netflix",
                "Movie box office is less predictable post-pandemic",
                "Complex business with many moving parts"
            ],
            guidance: "Disney is a mix of reliable businesses (parks, movies) and growth bets (streaming). It's more complex than a pure tech stock. Good for beginners who want entertainment sector exposure with moderate risk."
        },
        {
            ticker: "NKE",
            name: "Nike",
            price: 95,
            sector: "Consumer Goods",
            sectorColor: "#D35400",
            riskLevel: 3,
            typicalReturn: { min: -20, max: 30, average: 9 },
            dividend: 1.3,
            description: "The world's largest athletic footwear and apparel company. Nike's brands include Nike, Jordan, and Converse. They sell directly through Nike.com and stores, plus through retailers globally.",
            whyBuy: [
                "Dominant global brand in sports and lifestyle",
                "Strong direct-to-consumer business growing online",
                "Innovation in materials and design keeps the brand fresh",
                "Global presence with growth potential in emerging markets"
            ],
            risks: [
                "Consumer spending on premium products drops in recessions",
                "Intense competition from Adidas, New Balance, On, Hoka",
                "Inventory management challenges can hurt margins",
                "Dependence on fashion trends and athlete endorsements"
            ],
            guidance: "Nike is a strong consumer brand stock. It's less volatile than tech stocks but offers decent growth. The moderate share price lets you buy a good number of shares. Good for beginners who want brand-name exposure."
        },
        {
            ticker: "MCD",
            name: "McDonald's",
            price: 280,
            sector: "Consumer Goods",
            sectorColor: "#D35400",
            riskLevel: 2,
            typicalReturn: { min: -12, max: 22, average: 8 },
            dividend: 2.3,
            description: "The world's largest fast-food chain with 40,000+ restaurants in 100+ countries. McDonald's actually makes most of its money from real estate — it owns the land and buildings that franchisees operate in.",
            whyBuy: [
                "Recession-resistant — people eat affordable food in any economy",
                "Real estate business model provides stable income from franchisees",
                "Strong dividend history with consistent increases",
                "Global scale provides currency and geographic diversification"
            ],
            risks: [
                "Health-conscious consumer trends could reduce demand",
                "Labor cost increases affect franchisees and company-operated stores",
                "Competition from fast-casual restaurants (Chipotle, etc.)",
                "Slower growth as the market is largely saturated"
            ],
            guidance: "McDonald's is a surprisingly stable investment. The franchise model means they collect rent and fees with relatively low risk. The strong dividend makes it attractive for income. Think of it as more of a real estate company that happens to sell burgers."
        }
    ],

    /* --- Non-stock investment categories --- */
    otherInvestments: [
        {
            id: "bonds",
            name: "Bonds",
            icon: "\u{1F3DB}\uFE0F",
            color: "#50C878",
            riskLevel: 2,
            typicalReturn: { min: -3, max: 8, average: 4 },
            description: "A bond is like a loan you give to a government or company. They promise to pay you back with interest over a set period. Bonds are generally more stable than stocks but offer lower returns.",
            benefits: [
                "Steady, predictable income through regular interest payments",
                "Lower risk than stocks — prices don't swing as much",
                "Government bonds are considered very safe",
                "Help stabilize your portfolio during stock market downturns"
            ],
            risks: [
                "Lower returns than stocks over the long term",
                "When interest rates rise, existing bond prices fall",
                "Inflation can erode the real value of your fixed payments",
                "Corporate bonds carry the risk the company might default"
            ]
        },
        {
            id: "etfs",
            name: "ETFs / Index Funds",
            icon: "\u{1F4CA}",
            color: "#F5A623",
            riskLevel: 3,
            typicalReturn: { min: -15, max: 25, average: 9 },
            description: "ETFs bundle hundreds or thousands of investments together. Instead of picking individual stocks, you buy a slice of the entire market. Often recommended as the best starting point for beginners.",
            benefits: [
                "Instant diversification — one purchase gives you exposure to hundreds of companies",
                "Very low fees compared to actively managed funds",
                "Great for beginners — no need to pick individual stocks",
                "Historically strong returns that match overall market performance"
            ],
            risks: [
                "You're still exposed to overall market risk — when the market drops, so do ETFs",
                "You can't outperform the market since you are the market",
                "Some niche ETFs can be concentrated in one sector",
                "Tracking errors can cause slight differences from the target index"
            ]
        },
        {
            id: "savings",
            name: "Savings Account",
            icon: "\u{1F3E6}",
            color: "#9B59B6",
            riskLevel: 1,
            typicalReturn: { min: 1, max: 5, average: 3 },
            description: "A high-yield savings account keeps your money safe at a bank while earning a small amount of interest. Your deposits are FDIC insured up to $250,000, making this virtually risk-free.",
            benefits: [
                "Virtually no risk — your money is FDIC insured",
                "You can access your money anytime",
                "Guaranteed positive returns",
                "Perfect for emergency funds and short-term goals"
            ],
            risks: [
                "Very low returns — often below inflation",
                "Interest rates can change and are not locked in",
                "Won't help you build significant wealth over the long term",
                "Opportunity cost — money here could earn more elsewhere"
            ]
        }
    ],

    marketEvents: [
        {
            name: "Major Crash",
            icon: "\u{1F4C9}",
            probability: 0.03,
            description: "A severe market downturn where stock prices plummet.",
            sectorImpacts: {
                Technology: -0.42, "Automotive / Energy": -0.50, Healthcare: -0.18,
                Finance: -0.38, "Consumer Goods": -0.20, Entertainment: -0.35
            },
            otherImpacts: { bonds: 0.02, etfs: -0.35, savings: 0 }
        },
        {
            name: "Mild Recession",
            icon: "\u{1F4C9}",
            probability: 0.08,
            description: "An economic slowdown that causes moderate stock market declines.",
            sectorImpacts: {
                Technology: -0.22, "Automotive / Energy": -0.30, Healthcare: -0.10,
                Finance: -0.25, "Consumer Goods": -0.12, Entertainment: -0.18
            },
            otherImpacts: { bonds: 0.05, etfs: -0.20, savings: 0 }
        },
        {
            name: "Interest Rate Hike",
            icon: "\u{1F3E6}",
            probability: 0.10,
            description: "The central bank raises interest rates.",
            sectorImpacts: {
                Technology: -0.08, "Automotive / Energy": -0.10, Healthcare: -0.03,
                Finance: 0.05, "Consumer Goods": -0.04, Entertainment: -0.06
            },
            otherImpacts: { bonds: -0.08, etfs: -0.04, savings: 0.01 }
        },
        {
            name: "Steady Growth",
            icon: "\u{2796}",
            probability: 0.64,
            description: "Markets perform around their historical averages.",
            sectorImpacts: {
                Technology: 0, "Automotive / Energy": 0, Healthcare: 0,
                Finance: 0, "Consumer Goods": 0, Entertainment: 0
            },
            otherImpacts: { bonds: 0, etfs: 0, savings: 0 }
        },
        {
            name: "Bull Market",
            icon: "\u{1F4C8}",
            probability: 0.15,
            description: "A period of strong market optimism and rising prices.",
            sectorImpacts: {
                Technology: 0.18, "Automotive / Energy": 0.22, Healthcare: 0.08,
                Finance: 0.15, "Consumer Goods": 0.10, Entertainment: 0.14
            },
            otherImpacts: { bonds: -0.02, etfs: 0.12, savings: 0 }
        }
    ],

    glossary: {
        "APY": "Annual Percentage Yield — the total amount of interest you earn on a deposit over one year, including compound interest.",
        "bear market": "A period when stock prices are falling, generally defined as a decline of 20% or more from recent highs.",
        "blue-chip stock": "Stock of a large, well-established, and financially stable company with a long track record. Examples: Apple, Microsoft, Coca-Cola.",
        "bull market": "A period when stock prices are rising and investor confidence is high.",
        "compound interest": "Interest calculated on both the initial principal and the accumulated interest from previous periods.",
        "coupon rate": "The annual interest rate paid on a bond, expressed as a percentage of the bond's face value.",
        "credit risk": "The risk that a bond issuer will fail to make scheduled payments.",
        "diversification": "Spreading your investments across different companies, sectors, and asset types to reduce risk.",
        "dividend": "A portion of a company's profits paid out to shareholders, usually quarterly. Provides income even when stock prices aren't rising.",
        "dividend yield": "The annual dividend payment divided by the stock price, expressed as a percentage. Helps compare income potential across stocks.",
        "ETF": "Exchange-Traded Fund — holds a collection of assets and trades on stock exchanges like a regular stock.",
        "expense ratio": "The annual fee charged by a fund, expressed as a percentage.",
        "FDIC insurance": "Federal Deposit Insurance Corporation insurance that protects bank deposits up to $250,000.",
        "growth stock": "A stock expected to grow faster than the overall market. Usually doesn't pay dividends, reinvesting profits instead. Examples: Tesla, Amazon.",
        "index fund": "A fund designed to match the performance of a specific market index, like the S&P 500.",
        "inflation": "The rate at which prices for goods and services rise over time.",
        "interest rate risk": "The risk that changes in interest rates will affect the value of investments, particularly bonds.",
        "market capitalization": "The total value of a company's shares. Calculated as share price times number of shares.",
        "P/E ratio": "Price-to-Earnings ratio — a stock's price divided by its earnings per share. Helps judge if a stock is overvalued.",
        "portfolio": "Your complete collection of investments across all types.",
        "sector": "A category of companies in the same industry. Common sectors: Technology, Healthcare, Finance, Consumer Goods.",
        "share": "A single unit of ownership in a company. When you buy 5 shares of Apple, you own 5 tiny pieces of Apple Inc.",
        "ticker symbol": "A short abbreviation used to identify a stock on exchanges. Examples: AAPL (Apple), MSFT (Microsoft), TSLA (Tesla).",
        "value stock": "A stock trading at a lower price relative to its fundamentals (earnings, dividends). Often more stable. Examples: Coca-Cola, J&J.",
        "volatility": "How much an investment's price fluctuates over time. High volatility means bigger price swings — both up and down.",
        "yield": "The income generated by an investment, expressed as a percentage of its price."
    },

    tips: [
        {
            title: "Start with what you know",
            content: "Buy stocks in companies whose products you use and understand. If you use an iPhone daily, you already know something about Apple's business. Understanding a company helps you make better decisions."
        },
        {
            title: "Don't put all your money in one stock",
            content: "Even the best companies can have bad years. Spread your money across different stocks and sectors. If tech crashes, your healthcare and consumer goods stocks might hold steady."
        },
        {
            title: "Understand the price of one share",
            content: "A $400 stock isn't 'better' than a $60 stock. Stock price alone tells you nothing about value. A $60 Coca-Cola share might be 'expensive' relative to its earnings, while a $400 Microsoft share might be 'cheap.'"
        },
        {
            title: "Dividends are real money",
            content: "Some companies pay you just for owning their stock. A 3% dividend on $1,000 invested means $30 per year in your pocket. Over decades, reinvested dividends can account for a huge portion of total returns."
        },
        {
            title: "Volatility isn't the same as risk",
            content: "A stock that swings 5% daily (like Tesla) is volatile. But if you're holding for 20 years, daily swings don't matter. Real risk is buying a company that fails. Volatility is just the bumpy ride along the way."
        },
        {
            title: "Know why you're buying",
            content: "Before buying any stock, be able to answer: What does this company do? How does it make money? Why will it be worth more in the future? If you can't answer these, do more research first."
        },
        {
            title: "Time in the market beats timing the market",
            content: "Trying to predict the best time to buy or sell almost never works. Invest consistently and let time do the heavy lifting. Even professional fund managers rarely beat the market over long periods."
        },
        {
            title: "Index funds are the easy button",
            content: "If picking individual stocks feels overwhelming, ETFs and index funds give you instant exposure to hundreds of companies. Many experts recommend them as the core of any portfolio."
        },
        {
            title: "Don't panic during downturns",
            content: "Market drops are normal. The S&P 500 has dropped 20%+ many times and always recovered. Selling during a crash locks in your losses. Patience is your best strategy."
        },
        {
            title: "Compare stocks by sector, not just price",
            content: "Tech stocks behave differently from healthcare or consumer goods stocks. A balanced portfolio includes stocks from multiple sectors so you're not wiped out by one industry's downturn."
        },
        {
            title: "Keep an emergency fund in savings first",
            content: "Before buying stocks, save 3-6 months of living expenses in a savings account. This prevents you from having to sell stocks at a loss during unexpected expenses."
        },
        {
            title: "Fees and taxes matter",
            content: "Brokerage fees, fund expense ratios, and capital gains taxes all eat into your returns. Choose low-cost options and consider tax-advantaged accounts like 401(k)s and IRAs."
        },
        {
            title: "Past performance isn't a guarantee",
            content: "Just because a stock doubled last year doesn't mean it will again. Look at long-term business fundamentals — revenue growth, market position, competitive advantages — not just recent price charts."
        },
        {
            title: "Avoid FOMO investing",
            content: "Don't buy a stock just because everyone's talking about it or because it went up 50%. By the time it's on social media, the easy gains may be over. Stick to your own research and strategy."
        },
        {
            title: "Review, don't obsess",
            content: "Check your portfolio monthly or quarterly, not daily. Daily price movements are noise. What matters is whether your investing thesis — why you bought — is still valid."
        }
    ],

    quizQuestions: [
        {
            question: "If a stock you own dropped 30% in one month, what would you do?",
            options: [
                { text: "Sell immediately to prevent further losses", score: 1 },
                { text: "Sell half to reduce my exposure", score: 2 },
                { text: "Do nothing and wait for recovery", score: 4 },
                { text: "Buy more shares at the lower price", score: 5 }
            ]
        },
        {
            question: "How long do you plan to keep your money invested?",
            options: [
                { text: "Less than 2 years", score: 1 },
                { text: "2 to 5 years", score: 2 },
                { text: "5 to 15 years", score: 4 },
                { text: "More than 15 years", score: 5 }
            ]
        },
        {
            question: "What is your primary investing goal?",
            options: [
                { text: "Preserve my money and avoid any losses", score: 1 },
                { text: "Earn steady income from dividends with minimal risk", score: 2 },
                { text: "Grow my money over time with moderate risk", score: 4 },
                { text: "Maximize growth even if it means big short-term swings", score: 5 }
            ]
        },
        {
            question: "How would you describe your investing experience?",
            options: [
                { text: "I've never invested before", score: 2 },
                { text: "I understand the basics but haven't bought stocks", score: 3 },
                { text: "I've been investing for a few years", score: 4 },
                { text: "I'm experienced and comfortable with individual stocks", score: 5 }
            ]
        },
        {
            question: "A friend says a stock is \"guaranteed\" to triple. What do you think?",
            options: [
                { text: "Sounds great — I'd invest right away", score: 1 },
                { text: "I'd look into it — could be a good opportunity", score: 2 },
                { text: "I'd be skeptical but curious", score: 3 },
                { text: "No such thing as guaranteed — sounds like a scam", score: 5 }
            ]
        },
        {
            question: "Which portfolio sounds most appealing?",
            options: [
                { text: "Mostly bonds and savings — safe and predictable", score: 1 },
                { text: "Mix of Coca-Cola, J&J, and bonds — stable dividend income", score: 2 },
                { text: "Mix of Apple, Microsoft, ETFs, and some bonds — balanced growth", score: 4 },
                { text: "Heavy on Tesla, Amazon, Netflix — maximum growth potential", score: 5 }
            ]
        },
        {
            question: "How would you feel if your portfolio gained 40% one year and lost 25% the next?",
            options: [
                { text: "Very stressed — I can't handle that roller coaster", score: 1 },
                { text: "Uncomfortable, but I understand it happens", score: 2 },
                { text: "Mostly fine — the math still works out positive", score: 4 },
                { text: "Totally fine — short-term swings don't bother me", score: 5 }
            ]
        },
        {
            question: "Tesla drops 40% in a month. Your friends all say to sell. What do you do?",
            options: [
                { text: "Sell — my friends are probably right", score: 1 },
                { text: "Sell half — reduce my risk while keeping some upside", score: 2 },
                { text: "Hold — I stick to my plan even when nervous", score: 4 },
                { text: "Buy more — this is a buying opportunity", score: 5 }
            ]
        },
        {
            question: "What percentage of your savings would you put into individual stocks?",
            options: [
                { text: "None — I'd stick with savings accounts and bonds", score: 1 },
                { text: "About 20% — keeping most in safe investments", score: 2 },
                { text: "About 50% — balanced between stocks and safer options", score: 4 },
                { text: "70%+ — I want maximum market exposure", score: 5 }
            ]
        },
        {
            question: "What matters more to you when picking a stock?",
            options: [
                { text: "It pays a reliable dividend — I want income", score: 2 },
                { text: "It's a well-known, stable company — I want safety", score: 2 },
                { text: "It has strong growth prospects — I want appreciation", score: 4 },
                { text: "It could be the next big thing — I want explosive returns", score: 5 }
            ]
        }
    ],

    riskProfiles: {
        conservative: {
            label: "Conservative",
            range: [1, 2.4],
            description: "You prefer stability and capital preservation. Your portfolio focuses on safe stocks (Coca-Cola, J&J), bonds, and savings. Great for short-term goals or if volatility keeps you up at night.",
            suggestedHoldings: {
                stocks: { KO: 3, JNJ: 2, MCD: 1 },
                bonds: 3000, etfs: 1500, savings: 2500
            }
        },
        moderate: {
            label: "Moderate",
            range: [2.5, 3.5],
            description: "You want balanced growth and security. Your portfolio mixes blue-chip tech stocks with stable dividend payers and some bonds. The most common profile for long-term investors.",
            suggestedHoldings: {
                stocks: { AAPL: 5, MSFT: 2, KO: 3, JNJ: 2 },
                bonds: 1500, etfs: 2500, savings: 500
            }
        },
        aggressive: {
            label: "Aggressive",
            range: [3.6, 5],
            description: "You're focused on maximizing growth and comfortable with big swings. Your portfolio emphasizes high-growth tech stocks with small positions in safer assets. Best for 10+ year horizons.",
            suggestedHoldings: {
                stocks: { AAPL: 5, AMZN: 5, TSLA: 5, MSFT: 2, NFLX: 1 },
                bonds: 500, etfs: 2000, savings: 250
            }
        }
    },

    benchmarks: {
        conservative: { bonds: 40, etfs: 40, savings: 20, stockRisk: 2 },
        aggressive: { bonds: 5, etfs: 30, savings: 5, stockRisk: 4.5 }
    }
};
