//
//  HomeView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct HomeView: View {
    
    @StateObject var viewModel = HomeViewModel()
    
    var screenName: String
    var currentDate: String
    var accountName: String
    var isSubscribed: Bool
    var leftSection: String
    var rightSection: String
    @Binding var leftSectionActive: Bool
    
    @State var offset: CGFloat = UIScreen.self.main.bounds.width + 20
    
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
            ZStack {
                //            ScrollView(.vertical) {
                //                LazyVStack(spacing: 0) {
                //                    ForEach(viewModel.tickets) { ticket in
                //                        TicketView(settled: ticket.settled,
                //                                   pickTeam: ticket.pickTeam,
                //                                   pickType: ticket.pickType,
                //                                   pickGameInfo: ticket.pickGameInfo,
                //                                   pickPublishDate: ticket.pickPublishDate,
                //                                   pickDescription: ticket.pickDescription,
                //                                   pickSportsbook: ticket.pickSportsbook)
                //                    }
                //                }
                //            }
                //            .scrollIndicators(.hidden)
                //            .scrollTargetBehavior(.paging)
                BackgroundView()
                
                ZStack {
                    PreviousPicksView(screenName: screenName,
                                      currentDate: getCurrentDate(),
                                      accountName: accountName,
                                      isSubscribed: isSubscribed,
                                      leftSectionActive: $leftSectionActive)
                    .gesture(drag)
                    
                    ComingSoonView(screenName: screenName,
                                   date: getCurrentDate(),
                                   accountName: accountName,
                                   isSubscribed: isSubscribed)
                    .gesture(drag)
                    .offset(x: offset)
                }
                
                if(viewModel.isLoading) {
                    LoadingView()
                }
                
                HeaderView2Section(screenName: screenName,
                                   date: self.currentDate,
                                   accountName: self.accountName,
                                   isSubscribed: self.isSubscribed,
                                   leftSection: self.leftSection,
                                   rightSection: self.rightSection,
                                   leftSectionActive: $leftSectionActive)
            }
        }
        .onChange(of: leftSectionActive) {
            withAnimation(.easeInOut(duration: 0.2)) {
                if leftSectionActive {
                    offset = 0
                } else {
                    offset = screenWidth + 20
                }
            }
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
                 leftSectionActive: .constant(true))
    }
}
