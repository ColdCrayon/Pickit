//
//  TicketSubView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/17/24.
//

import SwiftUI

struct ArbitrageTicketSubView: View {
    
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
            //            Button {
            //
            //            } label: {
            //                Text("Return to Account")
            //                    .font(Font.custom("Lexend", size: 12).bold())
            //                    .foregroundStyle(.lightBlue)
            //            }
            //            .frame(width: UIScreen.main.bounds.width / 2, height: 40)
            
            Text("Arbitrage Ticket Submission")
                .font(Font.custom("Lexend", size: 32))
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
            
            Form {
                Section {
                    TicketEntryView(entryTitle: "Pick Team", entryValue: $pickTeam)
                    TicketEntryView(entryTitle: "Pick Type", entryValue: $pickType)
                    TicketEntryView(entryTitle: "Game Info", entryValue: $gameInfo)
                    TicketEntryView(entryTitle: "Publish Date", entryValue: $publishDate)
                    TicketEntryView(entryTitle: "Description", entryValue: $description)
                } header: {
                    Text("Pick Info")
                        .font(Font.custom("Lexend", size: 18))
                        .fontWeight(.bold)
                }
                .listRowBackground(Color.mainBackground)
                .listRowSeparatorTint(.black)
                
                Section {
                    Section {
                        TicketEntryView(entryTitle: "Sportsbook 1", entryValue: $sportsbook1)
                        TicketEntryView(entryTitle: "First Odds", entryValue: $oddsSB1)
                    } header: {
                        Text("Sportsbook One")
                            .font(Font.custom("Lexend", size: 16))
                            .fontWeight(.bold)
                    }
                    
                    Section {
                        TicketEntryView(entryTitle: "Sportsbook 2", entryValue: $sportsbook2)
                        TicketEntryView(entryTitle: "Second Odds", entryValue: $oddsSB2)
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

