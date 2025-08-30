# analyzer.py
import sys
import spacy

nlp = spacy.load("en_core_web_md")

# Read text from stdin
text = sys.stdin.read()

doc = nlp(text)

# Extract organizations with filters
orgs = set()

# Expanded blacklist of generic financial/news terms
blacklist = blacklist = {word.strip().lower() for word in [
    "Login", "Moneycontrol", "Read More", "Stocks", "India", 
    "BSE", "NSE", "Sensex", "Nifty", "Market", "Markets", "Stock",
    "Exchange", "Stock Markets", "Mutual Funds", "IPO", "FII", 
    "DII", "Equity", "Investors", "Shares", "Trading", "Company", 
    "Ltd", "Limited", "Private", "Group", "Banking", "Finance",
    "Economy", "Business", "Growth", "Profit", "Loss", "Quarter",
    "Report", "Update", "Analysis", "Global", "Research", "Stock Ideas",
    "Business News", "Stock Screener", "Stock Watch", "Market Calendar", "Stock Price",
    "BULL", "BEAR", "LIVE", "NEWS", "VIDEO", "EVENTS", "DATA", "TOOLS", "MORE",
    "FINANCE", "ECONOMY", "INVESTING", "WhatsApp", "Telegram", "Facebook", "Twitter", "LinkedIn",
    "हिन्दी", "ગુજરાતી", "मराठी", "বাংলা", "ಕನ್ನಡ", "தமிழ்", "తెలుగు", "മലയാളം",
    "Calculator", "Portfolio", "Watchlist", "Alerts", "Settings", "Help", "Contact Us",
    "Privacy Policy", "Terms of Service", "About Us", "Careers", "Sitemap", "Advertise",
    "Subscribe", "Feedback", "Support", "Community", "Forum", "Blog", "Newsletter", "Press",
    "Media", "Resources", "Tools", "Guides", "Tutorials", "Webinars", "Events", "Conferences",
    "Workshops", "Courses", "E-books", "Whitepapers", "Case Studies", "Infographics", "Podcasts",
    "Videos", "Interviews", "Opinions", "Editorials", "Columns", "Features", "Reviews", "Ratings",
    "Testimonials", "Success Stories", "Partnerships", "Collaborations", "Sponsorships", "Affiliates",
    "Investopedia", "Yahoo Finance", "Google Finance", "Bloomberg", "Reuters", "CNBC", "WSJ", "FT",
    "Forbes", "Business Insider", "MarketWatch", "Seeking Alpha", "Zacks", "Morningstar", "The Motley Fool",
    "GuruFocus", "TipRanks", "Simply Wall St", "Koyfin", "Finviz", "TradingView", "StockTwits", "eToro", "Robinhood",
]}

for ent in doc.ents:
    if ent.label_ == "ORG":
        name = ent.text.strip()
        if (
            len(name) > 2
            and not name.islower()
            and not name.isdigit()
            and name.lower() not in blacklist
        ):
            orgs.add(name)

# Print unique org names (this WILL print to stdout)
for org in sorted(orgs):
    print(org)
