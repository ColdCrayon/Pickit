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
            BackgroundView()
            
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
                
                VStack {
                    ScrollView() {
                        FormEntryView(entryTitle: "Username", entryValue: $username)
                            .padding(.top, 6)
                        FormEntryView(entryTitle: "Full Name", entryValue: $username)
                        FormPasswordView(entryTitle: "Password", entryValue: $password)
                        FormEntryView(entryTitle: "Email", entryValue: $email)
                            .padding(.bottom, 15)
                        
                        HStack {
                            CreateAccountButton()
                                .padding(.leading, 20)
                            
                            Spacer()
                            
                            UpgradeAccountButton()
                                .padding(.trailing, 20)
                        }
                        .padding(.bottom, 30)
                    }
                    .frame(width: screenWidth * 0.9)
                    .foregroundStyle(.lightWhite)
                    .padding([.leading, .trailing], 10)
                    .padding(.top, 5)
                    .background(
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .fill(
                                .shadow(.inner(color: Color.black.opacity(0.8), radius: 10, x: 0, y: 0))
                            )
                            .foregroundStyle(.mainBackground)
                    )
                    
                    HStack {
                        Button {
                            
                        } label: {
                            Text("Terms and Conditions")
                                .font(Font.custom("Lexend", size: 12).bold())
                                .foregroundStyle(.lightBlue)
                                .frame(width: UIScreen.main.bounds.width / 2)
                        }
                        .frame(width: screenWidth / 2, height: 24)
                        
                        Button {
                            
                        } label: {
                            Text("Privacy Policy")
                                .font(Font.custom("Lexend", size: 12).bold())
                                .foregroundStyle(.lightBlue)
                                .frame(width: UIScreen.main.bounds.width / 2)
                        }
                        .frame(width: screenWidth / 2, height: 24)
                    }
                    .padding(.top, 3)
                    .padding(.bottom, 15)
                }
            }
            .padding(.top, 20)
        }
        .padding(.top, 100)
    }
}

#Preview {
    ZStack {
        AccountViewInformation(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true)
        HeaderView2Section(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, leftSection: "Information", rightSection: "Billing", leftSectionActive: .constant(true))
        //        VStack {
        //            NavbarView(selectedTab: .constant(4))
        //        }
    }
}
