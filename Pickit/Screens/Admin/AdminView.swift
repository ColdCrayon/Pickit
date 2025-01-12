//
//  AdminView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/22/24.
//

import SwiftUI

struct AdminView: View {
    
    @Binding var arbitrage: Bool
    
    @Binding var pickTeam: String
    @Binding var pickType: String
    @Binding var gameInfo: String
    @Binding var publishDate: String
    @Binding var description: String
    @Binding var sportsbook1: String
    @Binding var sportsbook2: String
    @Binding var oddsSB1: String
    @Binding var oddsSB2: String
    
    @Binding var sportsbook: String
    
    var body: some View {
        if arbitrage {
            ZStack {
                ArbitrageTicketSubView(pickTeam: self.$pickTeam,
                                       pickType: self.$pickType,
                                       gameInfo: self.$gameInfo,
                                       publishDate: self.$publishDate,
                                       description: self.$description,
                                       sportsbook1: self.$sportsbook1,
                                       sportsbook2: self.$sportsbook2,
                                       oddsSB1: self.$oddsSB1,
                                       oddsSB2: self.$oddsSB2)
            }
        } else {
            ZStack {
                TicketSubView(pickTeam: self.$pickTeam,
                              pickType: self.$pickType,
                              gameInfo: self.$gameInfo,
                              publishDate: self.$publishDate,
                              description: self.$description,
                              sportsbook: self.$sportsbook)
            }
        }
    }
}

#Preview {
    ZStack {
        AdminView(arbitrage: .constant(true),
                  pickTeam: .constant("Chicago Bears"),
                  pickType: .constant(""),
                  gameInfo: .constant("Chicago Bears vs. Minnesota Vikings"),
                  publishDate: .constant("12/17/24"),
                  description: .constant("The bears are better"),
                  sportsbook1: .constant("Draft Kings"),
                  sportsbook2: .constant("Fan Dual"),
                  oddsSB1: .constant("-120"),
                  oddsSB2: .constant("-120"),
                  sportsbook: .constant("Bet 365"))
        
        HeaderView2Section(screenName: "Admin", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, leftSection: "Game Ticket", rightSection: "Arbitrage Ticket", leftSectionActive: .constant(false))
        
        VStack {
            NavbarView(selectedTab: .constant(5))
        }
    }
}

