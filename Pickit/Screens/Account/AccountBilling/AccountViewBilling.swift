//
//  AccountView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct AccountViewBilling: View {
    
    @StateObject var viewModel = AccountViewBillingViewModel()
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    var body: some View {
        ZStack {
            Rectangle()
                .foregroundStyle(LinearGradient(colors: [.white, .lightWhite], startPoint: .top, endPoint: .bottom))
                .frame(width: screenWidth - 50, height: screenHeight - 350)
                .cornerRadius(30)
                .shadow(radius: 10, y: 2)
                .overlay {
                    VStack {
                        Text("Ticket Master")
                            .font(Font.custom("Lexend", size: 32))
                            .fontWeight(.bold)
                            .padding(.top, 32)
                            .padding(.bottom, 41)
                        
                        VStack(alignment: .center, spacing: 20) {
                            Text("Full Access to weekly tickets for NBA and MLB")
                                .font(Font.custom("Lexend", size: 20))
                                .fontWeight(.bold)
                            
                            Text("Full Access to arbitrage betting tools")
                                .font(Font.custom("Lexend", size: 20))
                                .fontWeight(.bold)
                            
                            Text("Ad free access news and tickets")
                                .font(Font.custom("Lexend", size: 20))
                                .fontWeight(.bold)
                            
                        }
                        .multilineTextAlignment(.center)
                        .padding([.leading, .trailing], 30)
                        
                        Spacer()
                        
                        Text("4.99 Per Month")
                            .foregroundStyle(LinearGradient(colors: [.billingBGLight, .billingBGDark], startPoint: .topLeading, endPoint: .bottomTrailing))
                            .font(Font.custom("Lexend", size: 20))
                            .fontWeight(.bold)
                        
                        AnimatedButton(title: "SUBSCRIBE",
                                             topColor: .billingBGDark,
                                             bottomColor: .billingSubDarker,
                                       width: 250) {
                            viewModel.upgrade()
                        }
                            .padding(.bottom, 20)
                    }
                    .padding([.leading, .trailing], 8)
                }
                .foregroundStyle(.black)
            
        }
//        .padding(.top, 100)
    }
}

#Preview {
    ZStack {
        AccountViewBilling(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true)
        HeaderView2Section(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, leftSection: "Information", rightSection: "Billing", leftSectionActive: .constant(false))
        //        VStack {
        //            NavbarView(selectedTab: .constant(4))
        //        }
    }
}
