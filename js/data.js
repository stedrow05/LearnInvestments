window.AppData = {
    BUDGET: 10000,

    investmentTypes: [
        {
            id: "stocks",
            name: "Stocks",
            icon: "\u{1F4C8}",
            color: "#4A90D9",
            riskLevel: 4,
            typicalReturn: { min: -20, max: 30, average: 10 },
            description: "When you buy a stock, you're buying a small piece of ownership in a company. If the company does well, your shares become more valuable. Some companies also pay dividends — regular cash payments to shareholders.",
            benefits: [
                "High long-term growth potential — historically around 10% per year on average",
                "Dividend income from many established companies",
                "Easy to buy and sell (highly liquid)",
                "You become a part-owner of real businesses"
            ],
            risks: [
                "Prices can swing wildly in the short term — you might see 20-30% drops",
                "Individual companies can go bankrupt, and you could lose everything invested in that stock",
                "Requires research and emotional discipline to avoid panic-selling",
                "Past performance doesn't guarantee future returns"
            ],
            glossaryTerms: ["dividend", "market capitalization", "P/E ratio", "volatility", "bull market", "bear market"]
        },
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
            ],
            glossaryTerms: ["yield", "coupon rate", "maturity", "interest rate risk", "credit risk"]
        },
        {
            id: "etfs",
            name: "ETFs / Index Funds",
            icon: "\u{1F4CA}",
            color: "#F5A623",
            riskLevel: 3,
            typicalReturn: { min: -15, max: 25, average: 9 },
            description: "ETFs (Exchange-Traded Funds) and index funds bundle hundreds or thousands of investments together. Instead of picking individual stocks, you buy a slice of the entire market. This is often recommended as the best starting point for beginners.",
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
            ],
            glossaryTerms: ["index fund", "expense ratio", "diversification", "S&P 500", "passive investing"]
        },
        {
            id: "savings",
            name: "Savings Accounts",
            icon: "\u{1F3E6}",
            color: "#9B59B6",
            riskLevel: 1,
            typicalReturn: { min: 1, max: 5, average: 3 },
            description: "A high-yield savings account keeps your money safe at a bank while earning a small amount of interest. Your deposits are insured by the FDIC (up to $250,000), making this virtually risk-free. Great for emergency funds and short-term savings.",
            benefits: [
                "Virtually no risk — your money is FDIC insured up to $250,000",
                "You can access your money anytime",
                "Guaranteed positive returns (interest rate set by the bank)",
                "Perfect for emergency funds and short-term goals"
            ],
            risks: [
                "Very low returns — often below inflation, meaning your money loses purchasing power over time",
                "Interest rates can change and are not locked in",
                "Won't help you build significant wealth over the long term",
                "Opportunity cost — money here could potentially earn more elsewhere"
            ],
            glossaryTerms: ["APY", "compound interest", "inflation", "FDIC insurance", "opportunity cost"]
        }
    ],

    marketEvents: [
        {
            name: "Major Crash",
            icon: "\u{1F4C9}",
            probability: 0.03,
            description: "A severe market downturn where stock prices plummet. These are rare but can be dramatic.",
            impacts: { stocks: -0.40, bonds: 0.02, etfs: -0.35, savings: 0 }
        },
        {
            name: "Mild Recession",
            icon: "\u{1F4C9}",
            probability: 0.08,
            description: "An economic slowdown that causes moderate stock market declines.",
            impacts: { stocks: -0.25, bonds: 0.05, etfs: -0.20, savings: 0 }
        },
        {
            name: "Interest Rate Hike",
            icon: "\u{1F3E6}",
            probability: 0.10,
            description: "The central bank raises interest rates, which can hurt stocks and bonds but slightly benefits savings.",
            impacts: { stocks: -0.05, bonds: -0.08, etfs: -0.04, savings: 0.01 }
        },
        {
            name: "Steady Growth",
            icon: "\u{2796}",
            probability: 0.64,
            description: "Markets perform around their historical averages. No major surprises.",
            impacts: { stocks: 0, bonds: 0, etfs: 0, savings: 0 }
        },
        {
            name: "Bull Market",
            icon: "\u{1F4C8}",
            probability: 0.15,
            description: "A period of strong market optimism and rising prices.",
            impacts: { stocks: 0.15, bonds: -0.02, etfs: 0.12, savings: 0 }
        }
    ],

    glossary: {
        "APY": "Annual Percentage Yield — the total amount of interest you earn on a deposit over one year, including compound interest. A higher APY means more earnings.",
        "bear market": "A period when stock prices are falling, generally defined as a decline of 20% or more from recent highs. Bear markets can last months or even years.",
        "bull market": "A period when stock prices are rising and investor confidence is high. Bull markets often last years and can see prices double or more.",
        "bond": "A debt security where you lend money to an entity (government or corporation) for a defined period at a fixed or variable interest rate.",
        "compound interest": "Interest calculated on both the initial principal and the accumulated interest from previous periods. This 'interest on interest' is one of the most powerful forces in investing.",
        "coupon rate": "The annual interest rate paid on a bond, expressed as a percentage of the bond's face value. A $1,000 bond with a 5% coupon pays $50 per year.",
        "credit risk": "The risk that a bond issuer will fail to make scheduled payments. Government bonds have very low credit risk; junk bonds have high credit risk.",
        "diversification": "The practice of spreading your investments across different asset types to reduce risk. If one investment drops, others may hold steady or rise.",
        "dividend": "A portion of a company's profits paid out to shareholders, usually quarterly. Dividends provide income even when stock prices aren't rising.",
        "ETF": "Exchange-Traded Fund — a type of investment fund that holds a collection of assets (stocks, bonds, etc.) and trades on stock exchanges like a regular stock.",
        "expense ratio": "The annual fee charged by a fund, expressed as a percentage. An expense ratio of 0.1% means you pay $1 per year for every $1,000 invested.",
        "FDIC insurance": "Federal Deposit Insurance Corporation insurance that protects bank deposits up to $250,000 per depositor, per bank. This makes savings accounts virtually risk-free.",
        "index fund": "A mutual fund or ETF designed to match the performance of a specific market index, like the S&P 500. They offer broad market exposure at very low cost.",
        "inflation": "The rate at which prices for goods and services rise over time. If inflation is 3% and your savings earn 2%, you're actually losing purchasing power.",
        "interest rate risk": "The risk that changes in interest rates will affect the value of investments, particularly bonds. When rates rise, existing bond prices typically fall.",
        "liquidity": "How easily you can buy or sell an investment without affecting its price. Cash is the most liquid; real estate is less liquid.",
        "market capitalization": "The total value of a company's shares. Calculated as share price times number of shares. Companies are often categorized as large-cap, mid-cap, or small-cap.",
        "maturity": "The date when a bond's principal is repaid. Short-term bonds mature in 1-3 years; long-term bonds can have maturities of 20-30 years.",
        "mutual fund": "A pool of money from many investors used to buy a diversified mix of stocks, bonds, or other assets, managed by professionals.",
        "opportunity cost": "The potential gain you miss out on when choosing one investment over another. Keeping money in savings has a high opportunity cost if the stock market is rising.",
        "P/E ratio": "Price-to-Earnings ratio — a stock's price divided by its earnings per share. It helps determine if a stock is overvalued or undervalued relative to its earnings.",
        "passive investing": "An investment strategy that aims to match market returns rather than beat them, typically through index funds. It involves less trading and lower fees.",
        "portfolio": "The complete collection of your investments across all types. A well-balanced portfolio is diversified across different asset classes.",
        "principal": "The original amount of money invested or deposited, separate from any earnings or interest.",
        "return": "The gain or loss on an investment, usually expressed as a percentage. Total return includes both price changes and income (like dividends).",
        "risk tolerance": "Your ability and willingness to handle drops in the value of your investments. It depends on your financial situation, goals, and temperament.",
        "S&P 500": "Standard & Poor's 500 — an index tracking the 500 largest U.S. public companies. It's the most widely followed benchmark for U.S. stock market performance.",
        "volatility": "How much an investment's price fluctuates over time. High volatility means bigger price swings — both up and down.",
        "yield": "The income generated by an investment, expressed as a percentage of its price. Bond yield tells you how much annual income you'll receive relative to what you paid."
    },

    tips: [
        {
            title: "Start early, start small",
            content: "You don't need a lot of money to begin investing. Even $50 a month can grow significantly over decades thanks to compound interest. The biggest advantage you have is time."
        },
        {
            title: "Diversify your portfolio",
            content: "Don't put all your eggs in one basket. Spread your money across different investment types so that a drop in one area doesn't devastate your entire portfolio."
        },
        {
            title: "Time in the market beats timing the market",
            content: "Trying to predict the best time to buy or sell almost never works, even for professionals. Invest consistently and let time do the heavy lifting."
        },
        {
            title: "Keep an emergency fund",
            content: "Before investing, save 3-6 months of living expenses in a savings account. This prevents you from having to sell investments at a loss during unexpected expenses."
        },
        {
            title: "Understand what you're buying",
            content: "Never invest in something you don't understand. If someone can't explain it simply, be skeptical. Stick with straightforward investments when you're starting out."
        },
        {
            title: "Fees matter more than you think",
            content: "A 1% annual fee might sound small, but over 30 years it can eat up 25% of your returns. Choose low-cost index funds with expense ratios under 0.2%."
        },
        {
            title: "Don't panic during downturns",
            content: "Market drops are normal and temporary. Selling during a crash locks in your losses. Historically, the market has always recovered — patience is your best strategy."
        },
        {
            title: "Avoid common beginner mistakes",
            content: "Don't chase hot tips, don't try to get rich quick, and don't check your portfolio obsessively. Boring, consistent investing outperforms exciting, emotional trading."
        },
        {
            title: "Take advantage of tax-advantaged accounts",
            content: "Accounts like 401(k)s and IRAs let your investments grow tax-free or tax-deferred. If your employer matches 401(k) contributions, that's free money — always take it."
        },
        {
            title: "Rebalance periodically",
            content: "Over time, some investments grow faster than others, changing your portfolio mix. Check in once or twice a year and rebalance to maintain your target allocation."
        },
        {
            title: "Inflation is a silent risk",
            content: "If your money only earns 2% in savings but inflation is 3%, you're losing purchasing power. Investing helps your money grow faster than inflation."
        },
        {
            title: "Past performance isn't a guarantee",
            content: "Just because an investment did well last year doesn't mean it will next year. Look at long-term trends (10+ years) rather than recent performance."
        },
        {
            title: "Set clear financial goals",
            content: "Know why you're investing — retirement, a house, education? Your timeline and goals determine how much risk you should take."
        },
        {
            title: "Automate your investing",
            content: "Set up automatic contributions to your investment accounts. This removes emotion from the equation and ensures you invest consistently."
        },
        {
            title: "Learn continuously",
            content: "The more you understand about investing, the better decisions you'll make. Read books, follow reputable financial educators, and be skeptical of anyone promising guaranteed returns."
        }
    ],

    quizQuestions: [
        {
            question: "If your investments dropped 20% in one month, what would you do?",
            options: [
                { text: "Sell everything immediately to prevent further losses", score: 1 },
                { text: "Sell some investments to reduce my risk", score: 2 },
                { text: "Do nothing and wait for recovery", score: 4 },
                { text: "Buy more at the lower prices", score: 5 }
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
                { text: "Earn steady income with minimal risk", score: 2 },
                { text: "Grow my money over time with moderate risk", score: 4 },
                { text: "Maximize growth even if it means big short-term swings", score: 5 }
            ]
        },
        {
            question: "How would you describe your investing experience?",
            options: [
                { text: "I've never invested before", score: 2 },
                { text: "I have a basic understanding but limited experience", score: 3 },
                { text: "I've been investing for a few years", score: 4 },
                { text: "I'm very experienced and comfortable with complex strategies", score: 5 }
            ]
        },
        {
            question: "If a friend recommended a \"guaranteed\" investment with 50% annual returns, what would you think?",
            options: [
                { text: "Sounds great — I'd invest right away", score: 1 },
                { text: "I'd be curious and look into it", score: 2 },
                { text: "I'd be skeptical but listen to their reasoning", score: 3 },
                { text: "Sounds like a scam — if it sounds too good to be true, it probably is", score: 5 }
            ]
        },
        {
            question: "How would you feel if your portfolio gained 25% one year and lost 15% the next?",
            options: [
                { text: "Very stressed — I can't handle that kind of roller coaster", score: 1 },
                { text: "Uncomfortable, but I understand it happens", score: 2 },
                { text: "Mostly fine — the overall trend still looks positive", score: 4 },
                { text: "Totally fine — short-term swings don't bother me at all", score: 5 }
            ]
        },
        {
            question: "What percentage of your total savings are you planning to invest?",
            options: [
                { text: "A very small amount — I want to keep most in cash", score: 1 },
                { text: "About 25-50% — keeping a large safety net", score: 2 },
                { text: "About 50-75% — balanced approach", score: 4 },
                { text: "Most of it — I have a separate emergency fund already", score: 5 }
            ]
        },
        {
            question: "How do you feel about the statement: \"Higher risk usually means higher potential reward\"?",
            options: [
                { text: "I'd rather play it safe, even if it means lower returns", score: 1 },
                { text: "I accept a small amount of risk for slightly better returns", score: 2 },
                { text: "I'm willing to take moderate risks for good potential returns", score: 4 },
                { text: "I embrace risk — I'm aiming for the highest possible returns", score: 5 }
            ]
        },
        {
            question: "If the market crashed right after you invested, and your friends told you to sell, would you?",
            options: [
                { text: "Yes — I'd trust their judgment", score: 1 },
                { text: "Maybe — I'd strongly consider it", score: 2 },
                { text: "Probably not — I'd stick to my plan but feel nervous", score: 4 },
                { text: "Definitely not — I make my own decisions based on research", score: 5 }
            ]
        },
        {
            question: "What sounds most appealing to you?",
            options: [
                { text: "A 3% guaranteed return with zero risk of loss", score: 1 },
                { text: "A 5-7% average return with occasional small dips", score: 2 },
                { text: "An 8-10% average return with some years of significant losses", score: 4 },
                { text: "A 12%+ average return, accepting that some years could be terrible", score: 5 }
            ]
        }
    ],

    riskProfiles: {
        conservative: {
            label: "Conservative",
            range: [1, 2.4],
            description: "You prefer stability and capital preservation over high growth. Your portfolio focuses on safe, predictable investments. This is well-suited for short-term goals or if market volatility keeps you up at night.",
            suggestedAllocation: { stocks: 15, bonds: 40, etfs: 20, savings: 25 }
        },
        moderate: {
            label: "Moderate",
            range: [2.5, 3.5],
            description: "You want a balance between growth and security. Your portfolio mixes growth investments with stabilizing ones. This is the most common profile — appropriate for medium to long-term goals.",
            suggestedAllocation: { stocks: 30, bonds: 25, etfs: 35, savings: 10 }
        },
        aggressive: {
            label: "Aggressive",
            range: [3.6, 5],
            description: "You're focused on maximizing long-term growth and comfortable with significant short-term volatility. Your portfolio emphasizes stocks and growth-oriented investments. Best for long time horizons (10+ years).",
            suggestedAllocation: { stocks: 50, bonds: 10, etfs: 35, savings: 5 }
        }
    },

    benchmarks: {
        conservative: { stocks: 20, bonds: 40, etfs: 20, savings: 20 },
        aggressive: { stocks: 60, bonds: 10, etfs: 25, savings: 5 }
    }
};
