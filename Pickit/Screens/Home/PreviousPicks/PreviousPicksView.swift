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
            
            ScrollView(.vertical) {
                LazyVStack(spacing: 0) {
                    ForEach(viewModel.tickets) { ticket in
                        TicketView(settled: ticket.serverSettled,
                                   pickTeam: ticket.pickTeam,
                                   pickType: ticket.pickType,
                                   pickGameInfo: ticket.pickGameInfo,
                                   pickPublishDate: ticket.pickPublishDate,
                                   pickDescription: ticket.pickDescription,
                                   pickSportsbook: ticket.pickSportsbook)
                    }
                }
            }
            .scrollIndicators(.hidden)
            .scrollTargetBehavior(.paging)
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
