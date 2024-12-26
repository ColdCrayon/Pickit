//
//  TicketView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI
import UIKit

struct ArbitrageTicketView: View {
    
    var settled: Bool
    
    var sportsBook1: String
    var sportsBook2: String
    var pickTeam: String
    var pickType: String
    var pickGameInfo: String
    var pickOddsSB1: String
    var pickOddsSB2: String
    var pickPublishDate: String
    var pickDescription: String
    var pickSportsbook: String
    
    var body: some View {
        ZStack {
            Rectangle()
                .subtracting(ArbitrageTicketSubtraction())
                .foregroundStyle(settled ? LinearGradient(colors: [.gold, .lightGold], startPoint: .topLeading, endPoint: .bottomTrailing) : LinearGradient(colors: [.lightWhite, .lightWhite], startPoint: .topLeading, endPoint: .bottomTrailing))
                .frame(width: 360, height: 530)
                .cornerRadius(24)
                .shadow(radius: 6, x: 0, y: 5)
                .overlay(alignment: .topLeading) {
                    Circle()
                        .frame(width: 53)
                        .foregroundStyle(settled ? .mainBackground : .gold)
                        .position(CGPoint(x: 320, y: 40))
                    
                    Image(.logo)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 45)
                        .position(x: 320, y: 40)
                    
                    VStack(alignment: .leading, spacing: 5) {
                        Rectangle()
                            .frame(width: 360, height: 2.5)
                            .padding(.top, 120)
                            .foregroundStyle(settled ? .darkGold : .ticketSecondary)
//                            .position(x: 185.5, y: 110)
                        
                        Text("Pick Published on \(pickPublishDate)")
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 15))
//                            .frame(width: 129, height: 21, alignment: .topLeading)
//                            .background(.ticketSecondary)
                            .foregroundStyle(settled ? .darkGold : .gray)
                            .padding(.top, 8)
                            .padding(.leading, 20)
//                            .position(CGPoint(x: 90.5, y: 180.5))
                    
                        Text(pickGameInfo)
                            .fontWeight(.medium)
                            .font(Font.custom("Lexend", size: 18))
//                            .frame(width: 212, height: 21, alignment: .topLeading)
//                            .background(.ticketSecondary)
                            .foregroundStyle(settled ? .darkestGold : .black)
                            .padding(.leading, 20)
                            .padding(.bottom, -5)
//                            .position(CGPoint(x: 106, y: 10.5))
//                            .offset(CGSize(width: 26, height: 136))
                        
                        Text(pickType)
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 15))
//                            .frame(width: 129, height: 21, alignment: .topLeading)
//                            .background(.ticketSecondary)
                            .foregroundStyle(settled ? .darkGold : .gray)
                            .padding(.top, 0)
                            .padding(.leading, 20)
//                            .position(CGPoint(x: 90.5, y: 180.5))
                        
                        Text(pickTeam)
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 17))
//                            .frame(width: 129, height: 21, alignment: .topLeading)
//                            .background(.ticketSecondary)
                            .foregroundStyle(settled ? .darkGold : .black)
                            .padding(.top, 5)
                            .padding(.leading, 20)
//                            .position(CGPoint(x: 90.5, y: 180.5))
                        
                        Text(pickDescription)
                            .fontWeight(.regular)
                            .font(Font.custom("Lexend", size: 15))
                            .frame(height: 140)
//                            .background(.ticketSecondary)
                            .foregroundStyle(settled ? .darkGold : .mainBackground)
                            .padding(.top, 10)
                            .padding([.leading, .trailing], 20)
                            .padding(.bottom, 5)
                        
                        Rectangle()
                            .frame(width: 360, height: 2.5)
                            .foregroundStyle(settled ? .darkGold : .ticketSecondary)
//                            .position(x: 185.5, y: 110)
                        
                        HStack() {
                            Spacer()
                            
                            VStack(alignment: .center) {
                                Text(sportsBook1)
                                    .fontWeight(.medium)
                                    .font(Font.custom("Lexend", size: 18))
        //                            .frame(width: 212, height: 21, alignment: .topLeading)
        //                            .background(.ticketSecondary)
                                    .foregroundStyle(settled ? .darkestGold : .black)
                                    .padding(.leading, 20)
                                    .padding(.bottom, -5)
        //                            .position(CGPoint(x: 106, y: 10.5))
        //                            .offset(CGSize(width: 26, height: 136))
                                
                                Text("Pick placed at \(pickOddsSB1) odds")
                                    .fontWeight(.regular)
                                    .font(Font.custom("Lexend", size: 15))
        //                            .frame(width: 129, height: 21, alignment: .topLeading)
        //                            .background(.ticketSecondary)
                                    .foregroundStyle(settled ? .darkGold : .gray)
                                    .padding(.top, 0)
                                    .padding(.leading, 20)
        //                            .position(CGPoint(x: 90.5, y: 180.5))
                                    .multilineTextAlignment(.center)
                            }
                            .frame(width: 180)
                            
                            Spacer()
                            
                            VStack() {
                                Text(sportsBook2)
                                    .fontWeight(.medium)
                                    .font(Font.custom("Lexend", size: 18))
        //                            .frame(width: 212, height: 21, alignment: .topLeading)
        //                            .background(.ticketSecondary)
                                    .foregroundStyle(settled ? .darkestGold : .black)
                                    .padding(.trailing, 20)
                                    .padding(.bottom, -5)
                                
                                Text("Pick placed at \(pickOddsSB2) odds")
                                    .fontWeight(.regular)
                                    .font(Font.custom("Lexend", size: 15))
                                    .foregroundStyle(settled ? .darkGold : .gray)
                                    .padding(.trailing, 20)
                                    .padding(.top, 0)
                                    .multilineTextAlignment(.center)
                            }
                            .frame(width: 180)
                            
                            Spacer()
                        }
                        .frame(width: 360)
                        .fixedSize(horizontal: true, vertical: false)
                        .padding(.top, 10)
                        
                        Spacer()
                        
                        Rectangle()
                            .frame(width: 360, height: 2.5)
                            .foregroundStyle(settled ? .darkGold : .ticketSecondary)
                            .padding(.bottom, 60)
//                            .position(x: 185.5, y: 110)
                    }
                    
                    if settled {
                        Image(systemName: "checkmark.circle")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 35)
                            .foregroundStyle(.darkGold)
                            .position(x: 328, y: 500)
                    }
                }
        }
    }
}

#Preview {
    ArbitrageTicketView(settled: false, sportsBook1: "Draft Kings", sportsBook2: "Fandual", pickTeam: "Minnesota Vikings", pickType: "Moneyline", pickGameInfo: "Atlanta Falcons vs. Minnesota Vikings", pickOddsSB1: "-150", pickOddsSB2: "+110", pickPublishDate: "Dec 8, 2024 at 7:58 PM", pickDescription: "The Minnesota Vikings have been on a tremendous run this year leading to much success on the field. While the falcons have been playing decently with new QB Kirk Cousins, the Vikings have better players in seemingly every position." , pickSportsbook: "Fandual")
}

struct ArbitrageTicketSubtraction: Shape {
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
