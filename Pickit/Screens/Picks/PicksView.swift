//
//  PicksView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct PicksView: View {
    
    @StateObject var viewModel = PicksViewModel()
    
    var screenName: String
    var currentDate: String
    var accountName: String
    var isSubscribed: Bool
    
    var settled: Bool
    var pickGameInfo: String
    var pickPublishDate: String
    var pickDescription: String
    var pickSportsbook: String
    var pickTeam: String
    var pickType: String
    
    var body: some View {
//        GeometryReader { geometry in
            ZStack {
                BackgroundView()
                
                ScrollView(.vertical) {
                    LazyVStack(spacing: 0) {
                        ForEach(viewModel.tickets) { ticket in
                            TicketView(settled: ticket.settled,
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
                
                HeaderView1Section(screenName: self.screenName,
                                   date: self.currentDate,
                                   accountName: self.accountName,
                                   isSubscribed: self.isSubscribed,
                                   section: "Newest Picks")
            }
//            .task {
//                try? await viewModel.getTickets()
//            }
//        }
    }
}

#Preview {
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
        VStack {
            NavbarView(selectedTab: .constant(0))
        }
    }
}
