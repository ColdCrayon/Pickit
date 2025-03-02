# Pickit!
The ultimate edge for sports bettors. Our subscription service delivers expert arbitrage 
opportunities and AI-powered picks, built on tens of thousands of games worth of data. 
No gut feelings—just sharp, data-driven insights to help you bet smarter and win more. 
Stop guessing, start profiting with Pickit!

<p>
    <img src="https://github.com/ColdCrayon/Pickit/blob/main/Pictures/AccountScreen.png" alt="Account Screen" width=400/>
    <img src="https://github.com/ColdCrayon/Pickit/blob/main/Pictures/ArbitrageScreen.png" alt="Arbitrage Screen" width=400/>
</p>

# To-do

## APPLICATION DEVELOPMENT
- #### ACCOUNT INFORMATION 
    - [x] Left align pfp
    - [x] add username, pswd, email, information to right side (view only)
    - [x] standard account creation vs premium
    - [x] Condition screens for premium vs. standard
    - [x] Admin button conditionality 
    - [x] Profile picture functionality
    - [x] Subscribed account -> 1 section header

- #### TOS AND PRIVACY POLICY MODALS
    - [ ] Force agree on register
        - [ ] Add checkbox above create account button
        - [ ] Only register account if box is checked (validate box)
    - [x] Design sheets
    - [x] Implement into AccountViewInformation
    - [x] Start website outline and basic text docs
        - [x] Temporary privacy policy and tos
        - [ ] Add to website

- #### View Models
    - Home ViewModel
        - [ ] Add previous tickets function
            - [x] Conditionally settled tickets
            - [ ] Conditionally display tickets on home page
        - [x] Pull tickets into swipe
    - Picks ViewModel
        - [x] Pull tickets into swipe
    - Arbitrage ViewModel
        - [x] Pull tickets into swipe

- #### Transactions
    - [x] Pricing on display
    - [ ] Implement subscription option
    - [ ] Billing on account creation
    - [ ] Billing on subscribe
    - [ ] Cancelation

- #### Notifications
    - [ ] New ticket release
    - [ ] News articles
    - [ ] Arb ticket found
    - [ ] Betting trend

- #### Header button click animates with no change
    - [ ] Implement click changes screen

## WEBSITE DEVELOPMENT
- Privacy policy info
    - https://developer.apple.com/app-store/review/guidelines/#privacy

## ALGORITHM DEVELOPMENT
- #### Arbitrage
    - Webscraping
        - Pull data from multiple sportsbooks
        - Proxies, VPNS?
        - API?
        - ACTION betting site
            - Less security?
            - Multiple sportsbook info
    - ACTION BETTING SITE
        - Contains many sportsbooks
        - Possibly easier to scrape (less security)
        - Possible API
            - JSON

