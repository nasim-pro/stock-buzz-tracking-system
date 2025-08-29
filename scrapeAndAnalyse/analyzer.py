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
blacklist = {
    "Login", "Moneycontrol", "Read More", "Stocks", "India", 
    "BSE", "NSE", "Sensex", "Nifty", "Market", "Markets", "Stock",
    "Exchange", "Stock Markets", "Mutual Funds", "IPO", "FII", 
    "DII", "Equity", "Investors", "Shares", "Trading", "Company", 
    "Ltd", "Limited", "Private", "Group", "Banking", "Finance",
    "Economy", "Business", "Growth", "Profit", "Loss", "Quarter",
    "Report", "Update", "Analysis", "Global", "Research", "Stock Ideas",
    "Business News", "Stock Screener", "Stock Watch", "Market Calendar", "Stock Price",
    
}

for ent in doc.ents:
    if ent.label_ == "ORG":
        name = ent.text.strip()
        if (
            len(name) > 2
            and not name.islower()
            and not name.isdigit()
            and name not in blacklist
        ):
            orgs.add(name)

# Print unique org names (this WILL print to stdout)
for org in sorted(orgs):
    print(org)
