//
//  AccountView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct AccountViewInformation: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    @State private var username = ""
    @State private var password = ""
    @State private var email = ""
    
    var body: some View {
        ZStack {
//            BackgroundView()
            Color(.mainBackground)
            
            VStack {
//                HeaderView(screenName: self.screenName,
//                           date: self.date,
//                           accountName: self.accountName,
//                           isSubscribed: self.isSubscribed)
                
                VStack {
    //                Spacer()
                    
                    Image(.accountIcon)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 160, height: 160)
                        .background(.midBlue)
                        .clipShape(.circle)
                    
                    Text(accountName)
                        .font(Font.custom("Lexend", size: 24))
                        .fontWeight(.bold)
                        .foregroundStyle(LinearGradient(colors: [.billingBGLight, .billingBGDark], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .padding(.top, 5)
                    Text(isSubscribed ? "PREMIUM ACCOUNT" : "STANDARD ACCOUNT")
                        .font(Font.custom("Lexend", size: 12))
                        .fontWeight(.bold)
                        .foregroundStyle(.lightWhite)
                        .padding(.top, -18)
                    
                    VStack() {
                        FormEntryView(entryTitle: "Username", entryValue: $username)
                        FormPasswordView(entryTitle: "Password", entryValue: $password)
                        FormEntryView(entryTitle: "Email", entryValue: $email)
                            .padding(.bottom, 15)
                        
                        HStack {
                            Text("Terms and Conditions")
                                .font(Font.custom("Lexend", size: 12).bold())
                                .foregroundStyle(.lightBlue)
                                .frame(width: UIScreen.main.bounds.width / 2)
                            
                            Text("Privacy Policy")
                                .font(Font.custom("Lexend", size: 12).bold())
                                .foregroundStyle(.lightBlue)
                                .frame(width: UIScreen.main.bounds.width / 2)
                        }
                    }
                    .foregroundStyle(.lightWhite)
    //                .background(.mainBackground)
    //                .scrollContentBackground(.hidden)
                    .padding(.top, 5)
                    .padding(.bottom, 40)
    //                .contentMargins(.bottom, -20)
                }
                .padding(.top, 20)
            }
        }
    }
}

#Preview {
    ZStack {
        AccountViewInformation(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true)
        HeaderView2Section(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, leftSection: "Information", rightSection: "Billing", leftSectionActive: true)
        VStack {
            NavbarView(selectedTab: .constant(4))
        }
    }
}
