//
//  TicketSubView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/17/24.
//

import SwiftUI

struct TicketSubView: View {
    
    @Binding var pickTeam: String
    @Binding var pickType: String
    @Binding var gameInfo: String
    @Binding var publishDate: String
    @Binding var description: String
    @Binding var sportsbook: String
    
    var body: some View {
        Color(.mainBackground)
        
        VStack(spacing: 0) {
            Button {
                
            } label: {
                Text("Return to Account")
                    .font(Font.custom("Lexend", size: 12).bold())
                    .foregroundStyle(.lightBlue)
            }
            .frame(width: UIScreen.main.bounds.width / 2, height: 40)
            
            Text("Ticket Submission")
                .font(Font.custom("Lexend", size: 32))
                .fontWeight(.bold)
                .foregroundStyle(.white)
            
            Form {
                Section {
                    TextField("Pick Team", text: $pickTeam)
                        .font(Font.custom("Lexend", size: 16))
                        .fontWeight(.bold)
                        .opacity(0.6)
                    TextField("Pick Type", text: $pickType)
                        .font(Font.custom("Lexend", size: 16))
                        .fontWeight(.bold)
                        .opacity(0.6)
                    TextField("Game Info", text: $gameInfo)
                        .font(Font.custom("Lexend", size: 16))
                        .fontWeight(.bold)
                        .opacity(0.6)
                    TextField("Publish Date", text: $publishDate)
                        .font(Font.custom("Lexend", size: 16))
                        .fontWeight(.bold)
                        .opacity(0.6)
                    TextField("Description", text: $description)
                        .font(Font.custom("Lexend", size: 16))
                        .fontWeight(.bold)
                        .opacity(0.6)
                    TextField("Sportsbook", text: $sportsbook)
                        .font(Font.custom("Lexend", size: 16))
                        .fontWeight(.bold)
                        .opacity(0.6)
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
            
            Button {
                
            } label: {
                ZStack{
                    Rectangle()
                        .frame(width: 330, height: 50)
                        .foregroundStyle(.ticketSubButtonDark)
                        .cornerRadius(20)
                        .offset(y: 9)
                    Rectangle()
                        .frame(width: 330, height: 50)
                        .foregroundStyle(.ticketSubButtonLight)
                        .cornerRadius(20)
                    Text("SUBSCRIBE")
                        .font(Font.custom("Lexend", size: 24))
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                }
            }
            .padding(.top, 35)
        }
    }
}

#Preview {
    ZStack {
        TicketSubView(pickTeam: .constant("Chicago Bears"),
                      pickType: .constant("Moneyline"),
                      gameInfo: .constant("Chicago Bears vs. Detroit Lions"),
                      publishDate: .constant(getCurrentDate()),
                      description: .constant("Chicago Bears are better"),
                      sportsbook: .constant("Draft Kings"))
        
        HeaderView2Section(screenName: "Admin",
                           date: getCurrentDate(),
                           accountName: "Cadel Saszik",
                           isSubscribed: true,
                           leftSection: "Game Ticket",
                           rightSection: "Arbitrage Ticket",
                           leftSectionActive: true)
        VStack {
            NavbarView(selectedTab: .constant(4))
        }
    }
}
