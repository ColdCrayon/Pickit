//
//  HomeView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct HomeView: View {
    
    var screenName: String
    var currentDate: String
    var accountName: String
    var isSubscribed: Bool
    var leftSection: String
    var rightSection: String
    var leftSectionActive: Bool
    
    var settled: Bool
    var pickGameInfo: String
    var pickPublishDate: String
    var pickDescription: String
    var pickSportsbook: String
    var pickTeam: String
    var pickType: String
    
    var body: some View {
        ZStack {
            Color.mainBackground
            
            HeaderView2Section(screenName: screenName,
                               date: self.currentDate,
                               accountName: self.accountName,
                               isSubscribed: self.isSubscribed,
                               leftSection: self.leftSection,
                               rightSection: self.rightSection,
                               leftSectionActive: self.leftSectionActive)
            
            TicketView(settled: self.settled,
                       pickTeam: self.pickTeam,
                       pickType: self.pickType,
                       pickGameInfo: self.pickGameInfo,
                       pickPublishDate: self.pickPublishDate,
                       pickDescription: self.pickDescription,
                       pickSportsbook: self.pickSportsbook)
        }
    }
}

#Preview {
    ZStack {
        HomeView(screenName: "Previous Picks",
                 currentDate: "12/8/24",
                 accountName: "Cadel Saszik",
                 isSubscribed: true,
                 leftSection: "Previous Picks",
                 rightSection: "News",
                 leftSectionActive: true,
                 settled: true,
                 pickGameInfo: "Atlanta Falcons vs. Minnesota Vikings",
                 pickPublishDate: "Dec 8, 2024 at 7:58 PM",
                 pickDescription: "The Minnesota Vikings have been on a tremendous run this year leading to much success on the field. While the falcons have been playing decently withe new QB Kirk Cousins, the Vikings have better players in seemingly every position.",
                 pickSportsbook: "Fandual",
                 pickTeam: "Minnesota Vikings",
                 pickType: "Moneyline")
        VStack {
            NavbarView(selectedTab: .constant(0))
        }
    }
}
