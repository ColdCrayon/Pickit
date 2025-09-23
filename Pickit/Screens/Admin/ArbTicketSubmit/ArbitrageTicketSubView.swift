//
//  TicketSubView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/17/24.
//

import SwiftUI

struct ArbitrageTicketSubView: View {
    
    @StateObject var viewModel = ArbitrageTicketSubViewViewModel()
    
    @State var pickTeam: String
    @State var pickType: String
    @State var gameInfo: String
    @State var publishDate: String
    @State var description: String
    @State var sportsbook1: String
    @State var sportsbook2: String
    @State var oddsSB1: String
    @State var oddsSB2: String
    
    var body: some View {
        Color(.mainBackground)
        
        VStack(spacing: 0) {
            Text("Arbitrage Ticket Submission")
                .font(Font.custom("Lexend", size: 32))
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
            
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
                    //                    TicketEntryView(entryTitle: "Publish Date", entryValue: $viewModel.publishDate)
                    TicketEntryView(entryTitle: "Description", entryValue: $viewModel.description)
                } header: {
                    Text("Pick Info")
                        .font(Font.custom("Lexend", size: 18))
                        .fontWeight(.bold)
                }
                .listRowBackground(Color.mainBackground)
                .listRowSeparatorTint(.black)
                
                Section {
                    Section {
                        TicketEntryView(entryTitle: "Sportsbook 1", entryValue: $viewModel.sportsbook1)
                        TicketEntryView(entryTitle: "First Odds", entryValue: $viewModel.oddsSB1)
                    } header: {
                        Text("Sportsbook One")
                            .font(Font.custom("Lexend", size: 16))
                            .fontWeight(.bold)
                    }
                    
                    Section {
                        TicketEntryView(entryTitle: "Sportsbook 2", entryValue: $viewModel.sportsbook2)
                        TicketEntryView(entryTitle: "Second Odds", entryValue: $viewModel.oddsSB2)
                    } header: {
                        Text("Sportsbook Two")
                            .font(Font.custom("Lexend", size: 16))
                            .fontWeight(.bold)
                    }
                } header: {
                    Text("Sportsbook Info")
                        .font(Font.custom("Lexend", size: 18))
                        .fontWeight(.bold)
                }
                .listRowBackground(Color.mainBackground)
                .listRowSeparatorTint(.black)
                
                Section {
                    DatePicker(
                        selection: $viewModel.settleDate,
                        displayedComponents: .date) {
                        Text("Selection:")
                            .foregroundStyle(.lightWhite.opacity(0.6))
                            .font(Font.custom("Lexend", size: 18))
                            .fontWeight(.bold)
                    }
                    .tint(.billingBGDark)
                    .datePickerStyle(.graphical)
                } header: {
                    Text("Pick Expiration Date")
                        .font(Font.custom("Lexend", size: 18))
                        .fontWeight(.bold)
                }
                .listRowBackground(Color.lightWhite)
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
            .listSectionSpacing(0)
            
            AnimatedButton(title: "Submit", topColor: .ticketSubButtonLight, bottomColor: .ticketSubButtonDark, width: 330) {
                // Submit Arb Ticket
                                viewModel.submitTicket()
                //                viewModel.pickTeam = ""
                //                viewModel.pickType = ""
                //                viewModel.gameInfo = ""
                //                viewModel.publishDate = ""
                //                viewModel.description = ""
                //                viewModel.sportsbook1 = ""
                //                viewModel.oddsSB1 = ""
                //                viewModel.sportsbook2 = ""
                //                viewModel.oddsSB2 = ""
            }
            .padding(.top, 35)
        }
    }
}

#Preview {
    ZStack {
        ArbitrageTicketSubView(pickTeam: "",
                               pickType: "",
                               gameInfo: "",
                               publishDate: "",
                               description: "",
                               sportsbook1: "",
                               sportsbook2: "",
                               oddsSB1: "",
                               oddsSB2: "")
        
        HeaderView2Section(screenName: "Admin",
                           date: getCurrentDate(),
                           accountName: "Cadel Saszik",
                           isSubscribed: true,
                           leftSection: "Game Ticket",
                           rightSection: "Arbitrage Ticket",
                           leftSectionActive: .constant(false))
        VStack {
            NavbarView(selectedTab: .constant(4))
        }
    }
}

