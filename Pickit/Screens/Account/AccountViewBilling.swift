//
//  AccountView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct AccountViewBilling: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    var body: some View {
        ZStack {
            LinearGradient(colors: [.billingBGLight, .billingBGDark], startPoint: .topLeading, endPoint: .bottomTrailing)
            
            ZStack {
                Rectangle()
                    .foregroundStyle(LinearGradient(colors: [.white, .lightWhite], startPoint: .top, endPoint: .bottom))
                    .frame(width: screenWidth - 50, height: screenHeight - 350)
                    .cornerRadius(30)
                    .shadow(radius: 10)
                    .overlay {
                        VStack {
                            Text("TicketMaster")
                                .font(Font.custom("Lexend", size: 32))
                                .fontWeight(.bold)
                                .padding(.top, 32)
                                .padding(.bottom, 41)
                            
                            VStack(alignment: .leading, spacing: 18) {
                                Label {
                                    Text("Full Access to weekly tickets for NBA and MLB")
                                        .font(Font.custom("Lexend", size: 20))
                                        .fontWeight(.bold)
                                } icon: {
                                    Image(systemName: "circle.fill")
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 9)
                                }
                                Label {
                                    Text("Full Access to arbitrage betting tools")
                                        .font(Font.custom("Lexend", size: 20))
                                        .fontWeight(.bold)
                                } icon: {
                                    Image(systemName: "circle.fill")
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 9)
                                }
                                Label {
                                    Text("Ad free access news and tickets")
                                        .font(Font.custom("Lexend", size: 20))
                                        .fontWeight(.bold)
                                } icon: {
                                    Image(systemName: "circle.fill")
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 9)
                                }
                            }
                            .padding()
                            
                            Spacer()
                            
                            Button {
                                
                            } label: {
                                ZStack{
                                    Rectangle()
                                        .frame(width: 250, height: 50)
                                        .foregroundStyle(.billingSubDarker)
                                        .cornerRadius(20)
                                        .offset(y: 9)
                                    Rectangle()
                                        .frame(width: 250, height: 50)
                                        .foregroundStyle(.billingBGDark)
                                        .cornerRadius(20)
                                    Text("SUBSCRIBE")
                                        .font(Font.custom("Lexend", size: 24))
                                        .fontWeight(.bold)
                                        .foregroundStyle(.white)
                                }
                            }
                            .shadow(radius: 4, x: -3, y: 4)
                            .padding(.bottom, 20)
                        }
                    }
            }
        }
    }
}

#Preview {
    ZStack {
        AccountViewBilling(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true)
        HeaderView2Section(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, leftSection: "Information", rightSection: "Billing", leftSectionActive: false)
        VStack {
            NavbarView(selectedTab: .constant(4))
        }
    }
}
