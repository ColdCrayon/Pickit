//
//  AdminView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/22/24.
//

import SwiftUI

struct AdminView: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
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
    
    @Binding var leftSectionActive: Bool
    @Binding var selectedTab: Int
    
    @State var offset: CGFloat = screenWidth + 20
    
    var drag: some Gesture {
        DragGesture(minimumDistance: screenWidth / 4)
            .onChanged({ value in
                if offset > 0 { offset = screenWidth + value.translation.width }
            })
            .onEnded({ value in
                withAnimation(.easeInOut(duration: 0.1)) {
                    leftSectionActive.toggle()
                    if offset > 0 { offset = 0 } else if offset == 0 { offset = screenWidth + 20}
                }
            })
    }
    
    var body: some View {
        ZStack {
            ZStack {
                ZStack {
                    BackgroundView()
                    
                    ArbitrageTicketSubView(pickTeam: "", pickType: "", gameInfo: "", publishDate: "", description: "", sportsbook1: "", sportsbook2: "", oddsSB1: "", oddsSB2: "")
                    .padding(.top, 100)
                }
                .gesture(drag)
                
                ZStack{
                    BackgroundView()
                    
                    TicketSubView(pickTeam: "", pickType: "", gameInfo: "", publishDate: "", description: "", sportsbook: "")
                    .padding(.top, 100)
                }
                .gesture(drag)
                .offset(x: offset)
            }
            
            HeaderView2Section(screenName: self.screenName,
                               date: self.date,
                               accountName: self.accountName,
                               isSubscribed: self.isSubscribed,
                               leftSection: "Arbitrage Ticket",
                               rightSection: "Game Ticket",
                               leftSectionActive: $leftSectionActive)
        }
    }
}

#Preview {
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
                  leftSectionActive: .constant(true),
                  selectedTab: .constant(4))
        
//        HeaderView2Section(screenName: "Admin", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, leftSection: "Game Ticket", rightSection: "Arbitrage Ticket", leftSectionActive: .constant(false))
        
        VStack {
            NavbarView(selectedTab: .constant(5))
        }
    }
}

