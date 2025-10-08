//
//  TicketView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI
import UIKit

struct TicketView: View {
    
    var settled: Bool
    
    var pickTeam = ""
    var pickType = ""
    var pickGameInfo = ""
    var pickPublishDate = ""
    var pickDescription = ""
    var pickSportsbook = ""
    
    var body: some View {
        ZStack {
            Rectangle()
                .subtracting(TicketSubtraction())
                .foregroundStyle(
                    settled
                    ? LinearGradient(colors: [.gold, .lightGold], startPoint: .topLeading, endPoint: .bottomTrailing)
                    : LinearGradient(colors: [.lightWhite, .lightWhite], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                // Size by width and keep a consistent card aspect ratio across devices
                .aspectRatio(0.69, contentMode: .fit)
                .cornerRadius(24)
                .shadow(radius: 6, x: 0, y: 5)
                // Logo badge in the top-right, no absolute positioning
                .overlay(alignment: .topTrailing) {
                    ZStack {
                        Circle()
                            .frame(width: 53)
                            .foregroundStyle(settled ? .mainBackground : .gold)
                        Image(.logo)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 45)
                    }
                    .padding(.top, 12)
                    .padding(.trailing, 12)
                }
                // Main content in a flexible VStack pinned to top-leading
                .overlay(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 5) {
                        Rectangle()
                            .frame(height: 2.5)
                            .padding(.top, 110)
                            .foregroundStyle(settled ? .darkGold : .ticketSecondary)

                        Text("Pick Published on \(pickPublishDate)")
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 15))
                            .foregroundStyle(settled ? .darkGold : .gray)
                            .padding(.top, 8)
                            .padding(.leading, 20)

                        Text(pickTeam)
                            .fontWeight(.medium)
                            .font(Font.custom("Lexend", size: 18))
                            .foregroundStyle(settled ? .darkestGold : .black)
                            .padding(.leading, 20)
                            .padding(.bottom, -5)

                        Text(pickType)
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 15))
                            .foregroundStyle(settled ? .darkGold : .gray)
                            .padding(.top, 0)
                            .padding(.leading, 20)

                        Text(pickGameInfo)
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 15))
                            .foregroundStyle(settled ? .darkGold : .gray)
                            .padding(.top, 5)
                            .padding(.leading, 20)

                        Text(pickDescription)
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 15))
                            .foregroundStyle(settled ? .darkGold : .mainBackground)
                            .padding(.top, 20)
                            .padding([.leading, .trailing], 20)

                        Spacer()

                        Text("\(pickSportsbook) Sportsbook")
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 15))
                            .foregroundStyle(settled ? .darkGold : .gray)
                            .padding(.bottom, 5)
                            .padding(.leading, 20)

                        Rectangle()
                            .frame(height: 2.5)
                            .foregroundStyle(settled ? .darkGold : .ticketSecondary)
                            .padding(.bottom, 60)
                    }
                }
                // Settled checkmark anchored bottom-right, no absolute positioning
                .overlay(alignment: .bottomTrailing) {
                    if settled {
                        Image(systemName: "checkmark.circle")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 35)
                            .foregroundStyle(.darkGold)
                            .padding(16)
                    }
                }
                // Keep the card centered and reasonably sized on large screens
                .frame(maxWidth: 420)
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
        }
    }
}

#Preview {
    ZStack {
        TicketView(settled: false,
                   pickTeam: "Minnesota Vikings",
                   pickType: "Moneyline",
                   pickGameInfo: "Atlanta Falcons vs. Minnesota Vikings",
                   pickPublishDate: "Dec 8, 2024 at 7:58 PM",
                   pickDescription: "The Minnesota Vikings have been on a tremendous run this year leading to much success on the field. While the falcons have been playing decently withe new QB Kirk Cousins, the Vikings have better players in seemingly every position.",
                   pickSportsbook: "Fandual")
        HeaderView1Section(screenName: "Picks", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, section: "Weekly Picks")
        VStack {
            NavbarView(selectedTab: .constant(0))
        }
    }
}

struct TicketSubtraction: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
//        path.addEllipse(in: CGRect(x: 170, y: 589.525, width: 100, height: 84.95))
        path.addEllipse(in: CGRect(origin: CGPoint(x: 135.5, y: rect.maxY-42.475), size: CGSize(width: 100, height: 84.95)))
        path.addEllipse(in: CGRect(origin: CGPoint(x: 135.5, y: -42.475), size: CGSize(width: 100, height: 84.95)))
        path.addRoundedRect(in: CGRect(x: -20, y: 80, width: 40, height: 16), cornerSize: CGSize(width: 20, height: 20))
        path.addRoundedRect(in: CGRect(x: 31.429, y: 80, width: 40, height: 16), cornerSize: CGSize(width: 20, height: 20))
        path.addRoundedRect(in: CGRect(x: 82.858, y: 80, width: 40, height: 16), cornerSize: CGSize(width: 20, height: 20))
        path.addRoundedRect(in: CGRect(x: 134.287, y: 80, width: 40, height: 16), cornerSize: CGSize(width: 20, height: 20))
        path.addRoundedRect(in: CGRect(x: 185.716, y: 80, width: 40, height: 16), cornerSize: CGSize(width: 20, height: 20))
        path.addRoundedRect(in: CGRect(x: 237.145, y: 80, width: 40, height: 16), cornerSize: CGSize(width: 20, height: 20))
        path.addRoundedRect(in: CGRect(x: 288.574, y: 80, width: 40, height: 16), cornerSize: CGSize(width: 20, height: 20))
        path.addRoundedRect(in: CGRect(x: 340.003, y: 80, width: 40, height: 16), cornerSize: CGSize(width: 20, height: 20))
        
        return path
    }
}

