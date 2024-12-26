//
//  ArbitrageView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct ArbitrageView: View {
    
    var screenName: String
    var currentDate: String
    var accountName: String
    var isSubscribed: Bool
    var section: String
    
    var settled: Bool
    var sportsBook1: String
    var sportsBook2: String
    var pickGameInfo: String
    var pickOddsSB1: String
    var pickOddsSB2: String
    var pickPublishDate: String
    var pickDescription: String
    var pickSportsbook: String
    var pickTeam: String
    var pickType: String
    
    var body: some View {
        ZStack {
            Color.mainBackground
            
            ArbitrageTicketView(settled: self.settled,
                                sportsBook1: self.sportsBook1,
                                sportsBook2: self.sportsBook2,
                                pickTeam: self.pickTeam,
                                pickType: self.pickType,
                                pickGameInfo: self.pickGameInfo,
                                pickOddsSB1: self.pickOddsSB1,
                                pickOddsSB2: self.pickOddsSB2,
                                pickPublishDate: self.currentDate,
                                pickDescription: self.pickDescription,
                                pickSportsbook: self.pickDescription)
            .padding(.top, 100)
            
            HeaderView1Section(screenName: self.screenName,
                               date: self.currentDate,
                               accountName: self.accountName,
                               isSubscribed: self.isSubscribed,
                               section: self.section)
        }
    }
}

#Preview {
    ZStack {
        ArbitrageView(screenName: "Arbitrage Picks",
                      currentDate: "12/8/24",
                      accountName: "Cadel Saszik",
                      isSubscribed: true,
                      section: "Newest Picks",
                      settled: false,
                      sportsBook1: "Draftkings",
                      sportsBook2: "Fandual",
                      pickGameInfo: "Atlanta Falcons vs. Minnesota Vikings",
                      pickOddsSB1: "-150",
                      pickOddsSB2: "+110",
                      pickPublishDate: "Dec 8, 2024 at 7:58 PM",
                      pickDescription: "The Minnesota Vikings have been on a tremendous run this year leading to much success on the field. While the falcons have been playing decently withe new QB Kirk Cousins, the Vikings have better players in seemingly every position.",
                      pickSportsbook: "Fandual",
                      pickTeam: "Minnesota Vikings",
                      pickType: "Moneyline")
        VStack {
            NavbarView(selectedTab: .constant(2))
        }
    }
}
