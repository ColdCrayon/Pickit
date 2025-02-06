//
//  TicketSubView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/17/24.
//

import SwiftUI

struct TicketSubView: View {
    
    @StateObject var viewModel = TicketSubViewViewModel()
    
    @State var pickTeam: String
    @State var pickType: String
    @State var gameInfo: String
    @State var publishDate: String
    @State var description: String
    @State var sportsbook: String
    
    var body: some View {
        VStack(spacing: 0) {
            Text("Ticket Submission")
                .font(Font.custom("Lexend", size: 32))
                .fontWeight(.bold)
                .foregroundStyle(.white)
            
            if !viewModel.errorMessage.isEmpty {
                Text(viewModel.errorMessage)
                    .foregroundStyle(.red)
                    .font(Font.custom("Lexend", size: 12))
                    .fontWeight(.bold)
            }
            
            Form {
                Section {
                    TicketEntryView(entryTitle: "Pick Team", entryValue: $viewModel.pickTeam)
                    TicketEntryView(entryTitle: "Pick Type", entryValue: $viewModel.pickType)
                    TicketEntryView(entryTitle: "Game Info", entryValue: $viewModel.gameInfo)
                    TicketEntryView(entryTitle: "Publish Date", entryValue: $viewModel.publishDate)
                    TicketEntryView(entryTitle: "Description", entryValue: $viewModel.description)
                    TicketEntryView(entryTitle: "Sportsbook", entryValue: $viewModel.sportsbook)
                } header: {
                    Text("Pick Info")
                        .font(Font.custom("Lexend", size: 18))
                        .fontWeight(.bold)
                }
                .listRowBackground(Color.mainBackground)
                .listRowSeparatorTint(.black)
            }
            .scrollIndicators(.hidden)
            .background(
                RoundedRectangle(cornerRadius: 15)
                    .fill(.textFieldBackground)
                    .stroke(.lightWhite.opacity(0.3))
                    .shadow(radius: 10, x: 0, y: 4)
            )
            .scrollContentBackground(.hidden)
            .foregroundStyle(.lightWhite)
            .frame(width: screenWidth - 80, height: screenHeight - 550)
//            .padding([.leading, .trailing], 50)
            .padding(.top, 10)
            
            AnimatedButton(title: "Submit", topColor: .ticketSubButtonLight, bottomColor: .ticketSubButtonDark, width: 330) {
                // Submit Ticket
                viewModel.submitTicket()
                viewModel.pickTeam = ""
                viewModel.pickType = ""
                viewModel.gameInfo = ""
                viewModel.publishDate = ""
                viewModel.description = ""
                viewModel.sportsbook = ""
            }
            .padding(.top, 35)
        }
    }
}

#Preview {
    ZStack {
        TicketSubView(pickTeam: "", pickType: "", gameInfo: "", publishDate: "", description: "", sportsbook: "")
        
        HeaderView2Section(screenName: "Admin",
                           date: getCurrentDate(),
                           accountName: "Cadel Saszik",
                           isSubscribed: true,
                           leftSection: "Game Ticket",
                           rightSection: "Arbitrage Ticket",
                           leftSectionActive: .constant(true))
        VStack {
            NavbarView(selectedTab: .constant(4))
        }
    }
}
