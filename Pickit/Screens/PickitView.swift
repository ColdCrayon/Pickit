//
//  ContentView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/3/24.
//

import SwiftUI
import UIKit

enum currentView {
    case previousTickets
    case news
    case newestTickets
    case newestArbitrageTickets
    case account
    case billing
}

let screenSize = UIScreen.main.bounds
let screenWidth = screenSize.width
let screenHeight = screenSize.height

struct PickitView: View {
    
    @State var activeView: currentView = currentView.previousTickets
    
    var body: some View {
        
        //==========================================================================================
        
        //        ZStack {
        //            PicksView(screenName: "Previous Picks",
        //                      currentDate: getCurrentDate(),
        //                      accountName: "Cadel Saszik",
        //                      isSubscribed: true,
        //                      settled: false,
        //                      pickGameInfo: "Atlanta Falcons vs. Minnesota Vikings",
        //                      pickPublishDate: "Dec 8, 2024 at 7:58 PM",
        //                      pickDescription: "The Minnesota Vikings have been on a tremendous run this year leading to much success on the field. While the falcons have been playing decently withe new QB Kirk Cousins, the Vikings have better players in seemingly every position.",
        //                      pickSportsbook: "Fandual",
        //                      pickTeam: "Minnesota Vikings",
        //                      pickType: "Moneyline")
        //            VStack {
        //                NavbarView()
        //            }
        //        }
        
        //==========================================================================================
        
        //        ZStack() {
        //            AccountViewInformation(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true)
        //            HeaderView2Section(screenName: "Account",
        //                               date: getCurrentDate(),
        //                               accountName: "Cadel Saszik",
        //                               isSubscribed: true,
        //                               leftSection: "Information",
        //                               rightSection: "Billing",
        //                               leftSectionActive: true)
        //            VStack {
        //                NavbarView()
        //            }
        //        }
        
        //==========================================================================================
        
        //        ZStack() {
        //            AccountViewBilling(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true)
        //            HeaderView2Section(screenName: "Account",
        //                               date: getCurrentDate(),
        //                               accountName: "Cadel Saszik",
        //                               isSubscribed: true,
        //                               leftSection: "Information",
        //                               rightSection: "Billing",
        //                               leftSectionActive: true)
        //            VStack {
        //                NavbarView()
        //            }
        //        }
        
        //==========================================================================================
        
        //        ZStack() {
        //            TicketSubView(pickTeam: "Chicago Bears",
        //                          pickType: "Moneyline",
        //                          gameInfo: "Chicago Bears vs. Detroit Lions",
        //                          publishDate: getCurrentDate(),
        //                          description: "Chicago Bears are better",
        //                          sportsbook: "Draft Kings")
        //            HeaderView2Section(screenName: "Account",
        //                               date: getCurrentDate(),
        //                               accountName: "Cadel Saszik",
        //                               isSubscribed: true,
        //                               leftSection: "Game TIcket",
        //                               rightSection: "Arbitrage Ticket",
        //                               leftSectionActive: true)
        //            VStack {
        //                NavbarView()
        //            }
        //        }
        
        //==========================================================================================
        
        ZStack() {
            ArbitrageTicketSubView(pickTeam: "Chicago Bears",
                                   pickType: "Moneyline",
                                   gameInfo: "Chicago Bears vs. Detroit Lions",
                                   publishDate: getCurrentDate(),
                                   description: "Chicago Bears are better",
                                   sportsbook1: "Draft Kings",
                                   sportsbook2: "Fandual",
                                   oddsSB1: "-150",
                                   oddsSB2: "-120")
            HeaderView2Section(screenName: "Account",
                               date: getCurrentDate(),
                               accountName: "Cadel Saszik",
                               isSubscribed: true,
                               leftSection: "Game Ttcket",
                               rightSection: "Arbitrage Ticket",
                               leftSectionActive: false)
            VStack {
                NavbarView()
            }
        }
        
        //==========================================================================================
    }
}

#Preview {
    PickitView()
}
