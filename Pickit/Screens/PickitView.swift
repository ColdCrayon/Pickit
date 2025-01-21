//
//  ContentView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/3/24.
//

import SwiftUI
import UIKit

let screenSize = UIScreen.main.bounds
let screenWidth = screenSize.width
let screenHeight = screenSize.height

struct PickitView: View {
    
    @State var selectedTab: Int = 5
    
    @State var isSignedIn: Bool = false
    
    @State var accountName: String = "Cadel Saszik"
    
    @State var leftSectionActiveHome: Bool = true
    @State var leftSectionActiveAccount: Bool = true
    @State var leftSectionActiveAdmin: Bool = true
    
    var body: some View {
        //==========================================================================================
        
        ZStack {
            BackgroundView()
            
            TabView(selection: $selectedTab) {
                TabView {
                    ZStack {
                        HomeView(screenName: "Home",
                                 currentDate: getCurrentDate(),
                                 accountName: "Cadel Saszik",
                                 isSubscribed: true,
                                 leftSection: "Previous Picks",
                                 rightSection: "News",
                                 leftSectionActive: $leftSectionActiveHome)
                    }
                }
                .tag(0)
                
                TabView {
                    ZStack {
                        PicksView(screenName: "Previous Picks",
                                  currentDate: getCurrentDate(),
                                  accountName: "Cadel Saszik",
                                  isSubscribed: true,
                                  settled: false,
                                  pickGameInfo: "Atlanta Falcons vs. Minnesota Vikings",
                                  pickPublishDate: "Dec 8, 2024 at 7:58 PM",
                                  pickDescription: "The Minnesota Vikings have been on a tremendous run this year leading to much success on the field. While the falcons have been playing decently withe new QB Kirk Cousins, the Vikings have better players in seemingly every position.",
                                  pickSportsbook: "Fandual",
                                  pickTeam: "Minnesota Vikings",
                                  pickType: "Moneyline")
                    }
                }
                .tag(1)
                
                TabView {
                    ZStack {
                        ArbitrageView(screenName: "Arbitrage Picks",
                                      currentDate: getCurrentDate(),
                                      accountName: "Cadel Saszik",
                                      isSubscribed: true,
                                      section: "Newest Picks",
                                      settled: false,
                                      sportsBook1: "Draft Kings",
                                      sportsBook2: "Fan Dual",
                                      pickGameInfo: "Chicago Bears vs. Detroit Lions",
                                      pickOddsSB1: "-150",
                                      pickOddsSB2: "-120",
                                      pickPublishDate: "12/17/24",
                                      pickDescription: "The bears are better",
                                      pickSportsbook: "Draft kings",
                                      pickTeam: "Chicago Bears",
                                      pickType: "Moneyline")
                    }
                }
                .tag(2)
                
                TabView {
                    ZStack {
                        AccountView(screenName: "Account",
                                    date: getCurrentDate(),
                                    accountName: "Cadel Saszik",
                                    isSubscribed: true,
                                    information: .constant(true),
                                    leftSectionActive: $leftSectionActiveAccount,
                                    selectedTab: $selectedTab)
                    }
                }
                .tag(3)
                
                //==================================================================================
                // ADD STATE VARIBALE TO PARENT PICKIT VIEW
                
                TabView {
                    ZStack {
                        AdminView(screenName: "Admin",
                                  date: getCurrentDate(),
                                  accountName: "Cadel Saszik",
                                  isSubscribed: true,
                                  pickTeam: .constant("Chicago Bears"),
                                  pickType: .constant(""),
                                  gameInfo: .constant("Chicago Bears vs. Minnesota Vikings"),
                                  publishDate: .constant("12/17/24"),
                                  description: .constant("The bears are better"),
                                  sportsbook1: .constant("Draft Kings"),
                                  sportsbook2: .constant("Fan Dual"),
                                  oddsSB1: .constant("-120"),
                                  oddsSB2: .constant("-120"),
                                  sportsbook: .constant("Bet 365"),
                                  leftSectionActive: $leftSectionActiveAdmin,
                                  selectedTab: $selectedTab)
                    }
                }
                .tag(4)
            }
            
            
            
            VStack {
                NavbarView(selectedTab: self.$selectedTab)
            }
            
            if !isSignedIn {
                ZStack {
                    SignInView(screenName: "Sign In",
                               date: getCurrentDate(),
                               accountName: "",
                               isSubscribed: false,
                               isSignedIn: $isSignedIn)
                }
            }
        }
        
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
        
        //        ZStack() {
        //            ArbitrageTicketSubView(pickTeam: "Chicago Bears",
        //                                   pickType: "Moneyline",
        //                                   gameInfo: "Chicago Bears vs. Detroit Lions",
        //                                   publishDate: getCurrentDate(),
        //                                   description: "Chicago Bears are better",
        //                                   sportsbook1: "Draft Kings",
        //                                   sportsbook2: "Fandual",
        //                                   oddsSB1: "-150",
        //                                   oddsSB2: "-120")
        //            HeaderView2Section(screenName: "Account",
        //                               date: getCurrentDate(),
        //                               accountName: "Cadel Saszik",
        //                               isSubscribed: true,
        //                               leftSection: "Game Ttcket",
        //                               rightSection: "Arbitrage Ticket",
        //                               leftSectionActive: false)
        //            VStack {
        //                NavbarView()
        //            }
        //        }
        
        //==========================================================================================
    }
}

#Preview {
    PickitView(selectedTab: 0)
}
