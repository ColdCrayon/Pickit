//
//  HomeView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct PreviousPicksView: View {
    
    @StateObject var viewModel = HomeViewModel()
    
    var screenName: String
    var currentDate: String
    var accountName: String
    var isSubscribed: Bool
    @Binding var leftSectionActive: Bool
    
    var body: some View {
        // ===========================================================================================
        // NON LIST
        
        //        ZStack {
        //            BackgroundView()
        //
        //            HeaderView2Section(screenName: screenName,
        //                               date: self.currentDate,
        //                               accountName: self.accountName,
        //                               isSubscribed: self.isSubscribed,
        //                               leftSection: self.leftSection,
        //                               rightSection: self.rightSection,
        //                               leftSectionActive: self.leftSectionActive)
        //
        //            TicketView(settled: self.settled,
        //                       pickTeam: self.pickTeam,
        //                       pickType: self.pickType,
        //                       pickGameInfo: self.pickGameInfo,
        //                       pickPublishDate: self.pickPublishDate,
        //                       pickDescription: self.pickDescription,
        //                       pickSportsbook: self.pickSportsbook)
        //        }
        
        
        // ===========================================================================================
        // SAMPLE TICKETS LIST
        
        ZStack {
            BackgroundView()
                .ignoresSafeArea()
            
            GeometryReader { geo in
                ScrollView(.vertical) {
                    LazyVStack(spacing: 0) {
                        ForEach(viewModel.tickets) { ticket in
                            ZStack {
                                Color.clear // expands to fill the page height
                                TicketView(settled: ticket.settled,
                                           pickTeam: ticket.pickTeam,
                                           pickType: ticket.pickType,
                                           pickGameInfo: ticket.pickGameInfo,
                                           pickPublishDate: ticket.pickPublishDate,
                                           pickDescription: ticket.pickDescription,
                                           pickSportsbook: ticket.pickSportsbook)
                            }
                            .frame(width: geo.size.width, height: geo.size.height)
                        }
                    }
                    .scrollTargetLayout()
                }
                .scrollIndicators(.hidden)
                .scrollTargetBehavior(.paging)
                .contentMargins(.vertical, 0, for: .scrollContent)
            }
        }
    }
}

#Preview {
    ZStack {
        PreviousPicksView(screenName: "Previous Picks",
                          currentDate: "12/8/24",
                          accountName: "Cadel Saszik",
                          isSubscribed: true,
                          leftSectionActive: .constant(true))
    }
}
