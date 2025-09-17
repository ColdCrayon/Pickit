//
//  HeaderView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/8/24.
//

import SwiftUI

struct HeaderView2Section: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    var leftSection: String
    var rightSection: String
    
    @Binding var leftSectionActive: Bool
    
    var body: some View {
        ZStack {
            VStack() {
                Rectangle()
                    .ignoresSafeArea(.all)
                    .frame(width: UIScreen.main.bounds.width, height: 99)
                    .foregroundStyle(.mainBackground)
                    .shadow(color: .black, radius: 10, y: 3)
                    .overlay(alignment: .topLeading) {
                        VStack {
                            HStack(alignment: .top) {
                                VStack(alignment: .leading) {
                                    Text(screenName)
                                        .font(Font.custom("Lexend", size: 24))
                                        .fontWeight(.bold)
                                        .foregroundStyle(.lightWhite)
                                        .padding(.leading, 14)
                                        .padding(.top, 5)
                                    
                                    Text(date)
                                        .font(Font.custom("Lexend", size: 20))
                                        .fontWeight(.light)
                                        .foregroundStyle(.lightWhite)
                                        .padding(.leading, 14)
                                        .padding(.top, -8)
                                }
                                
                                Spacer()
                                
                                VStack(alignment: .trailing) {
                                    Text(accountName)
                                        .font(Font.custom("Lexend", size: 24))
                                        .fontWeight(.bold)
                                        .foregroundStyle(LinearGradient(colors: [.billingBGLight, .billingBGDark], startPoint: .topLeading, endPoint: .bottomTrailing))
                                        .padding(.trailing, 14)
                                        .padding(.top, 5)
                                    Text(isSubscribed ? "PREMIUM" : "STANDARD")
                                        .font(Font.custom("Lexend", size: 12))
                                        .fontWeight(.bold)
                                        .foregroundStyle(.lightWhite)
                                        .padding(.trailing, 14)
                                        .padding(.top, -8)
                                }
                            }
                            
                            Spacer()
                            
                            ZStack(alignment: .leading) {
                                HStack(spacing: 0) {
                                    Button {
                                        withAnimation(.easeInOut(duration: 0.2)) {
//                                            leftSectionActive = true
                                        }
                                    } label: {
                                        ZStack {
                                            Text(leftSection)
                                                .font(Font.custom("Lexend", size: 16))
                                                .fontWeight(.bold)
                                                .foregroundStyle(.lightWhite)
                                                .padding(.top, 2)
                                                .padding(.bottom, 2)
                                            VStack {
                                                Spacer()
                                                
                                                Rectangle()
                                                    .foregroundStyle(.lightBlue)
                                                    .frame(height: 3)
                                                    .opacity(leftSectionActive ? 0 : 0)
                                            }
                                        }
                                    }
                                    .frame(width: screenWidth / 2)
                                    
                                    Button {
                                        withAnimation(.easeInOut(duration: 0.2)) {
//                                            leftSectionActive = false
                                        }
                                    } label: {
                                        ZStack {
                                            Text(rightSection)
                                                .font(Font.custom("Lexend", size: 16))
                                                .fontWeight(.bold)
                                                .foregroundStyle(.lightWhite)
                                                .padding(.top, 2)
                                                .padding(.bottom, 2)
                                            VStack {
                                                Spacer()
                                                
                                                Rectangle()
                                                    .foregroundStyle(.lightBlue)
                                                    .frame(height: 3)
                                                    .opacity(leftSectionActive ? 0 : 0)
                                            }
                                        }
                                    }
                                    .frame(width: screenWidth / 2)
                                }
                                VStack {
                                    Spacer()
                                    
                                    Rectangle()
                                        .foregroundStyle(.lightBlue)
                                        .frame(width: screenWidth / 2, height: 3)
                                        .offset(x: leftSectionActive ? 0 : screenWidth / 2)
                                }
                            }
                        }
                    }
                Spacer()
            }
        }
    }
}

#Preview {
    HeaderView2Section(screenName: "Arbitrage Picks",
                       date: getCurrentDate(),
                       accountName: "Cadel Saszik",
                       isSubscribed: true,
                       leftSection: "Newest Tickets",
                       rightSection: "News",
                       leftSectionActive: .constant(false))
}
