//
//  AccountView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct AccountViewInformation: View {
    
    @StateObject var viewModel = AccountViewInformationViewModel()
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    @Binding var selectedTab: Int
    
    @State private var username = ""
    @State private var password = ""
    @State private var email = ""
    
    @State private var isShowingTOS: Bool = false
    @State private var isShowingPP: Bool = false
    
    var body: some View {
        ZStack {
            ZStack {
                BackgroundView()
                
                VStack() {
                    //                Spacer()
                    HStack() {
                        VStack {
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
                            
                            if(viewModel.isAdmin) {
                                Button {
                                    selectedTab = 4
                                } label: {
                                    Text("Admin")
                                        .font(Font.custom("Lexend", size: 12).bold())
                                        .foregroundStyle(.lightBlue)
                                        .frame(width: UIScreen.main.bounds.width / 2)
                                }
                                .frame(width: screenWidth / 2, height: 24)
                            }
                        }
                        
                        //                    VStack(alignment: .leading , spacing: 20) {
                        //                        VStack{
                        //                            Text("Username:")
                        //                                .font(Font.custom("Lexend", size: 16))
                        //                                .fontWeight(.bold)
                        //                                .foregroundStyle(.lightWhite)
                        //                            Text(username)
                        //                        }
                        //                        Text("Full Name:")
                        //                            .font(Font.custom("Lexend", size: 16))
                        //                            .fontWeight(.bold)
                        //                            .foregroundStyle(.lightWhite)
                        //                        Text("Password:")
                        //                            .font(Font.custom("Lexend", size: 16))
                        //                            .fontWeight(.bold)
                        //                            .foregroundStyle(.lightWhite)
                        //                        Text("Username:")
                        //                            .font(Font.custom("Lexend", size: 16))
                        //                            .fontWeight(.bold)
                        //                            .foregroundStyle(.lightWhite)
                        //                    }
                        //                    .padding(.leading, 30)
                        
                    }
                    .padding([.leading, .trailing], 30)
                    
                    VStack {
                        ScrollView() {
                            FormDisplayView(entryTitle: "Username", entryValue: $viewModel.username)
                                .padding(.top, 6)
                            FormDisplayView(entryTitle: "Full Name", entryValue: $viewModel.fullName)
                            //                        FormPasswordView(entryTitle: "Password", entryValue: $password)
                            FormDisplayView(entryTitle: "Email", entryValue: $viewModel.email)
                                .padding(.bottom, 15)
                            
                            Button {
                                
                            } label: {
                                Text("Forgot Password?")
                                    .font(Font.custom("Lexend", size: 14).bold())
                                    .padding([.top, .bottom], 6)
                                    .foregroundStyle(.lightBlue)
                                    .frame(width: UIScreen.main.bounds.width / 2)
                            }
                            
                            HStack {
                                AnimatedButton(title: "Sign Out",
                                               topColor: .ticketSubButtonLight,
                                               bottomColor: .ticketSubButtonDark,
                                               width: 300) {
                                    // Attempt Sign out
                                    viewModel.signOut()
                                }
                                               .padding(.bottom, 30)
                            }
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
                                isShowingTOS = true
                            } label: {
                                Text("Terms of Service")
                                    .font(Font.custom("Lexend", size: 12).bold())
                                    .foregroundStyle(.lightBlue)
                                    .frame(width: UIScreen.main.bounds.width / 2)
                            }
                            .frame(width: screenWidth / 2, height: 24)
                            .sheet(isPresented: $isShowingTOS) {
                                TOSSheetView()
                                    .presentationDetents([.fraction(0.999)])
                            }
                            
                            Button {
                                isShowingPP = true
                            } label: {
                                Text("Privacy Policy")
                                    .font(Font.custom("Lexend", size: 12).bold())
                                    .foregroundStyle(.lightBlue)
                                    .frame(width: UIScreen.main.bounds.width / 2)
                            }
                            .frame(width: screenWidth / 2, height: 24)
                            .sheet(isPresented: $isShowingPP) {
                                PrivacyPolicySheetView()
                                    .presentationDetents([.fraction(0.999)])
                            }
                        }
                        .padding(.top, 3)
                        .padding(.bottom, 15)
                    }
                }
                .padding(.top, 20)
            }
            .padding(.top, 100)
            
            if(viewModel.isLoading) {
                LoadingView()
            }
        }
    }
}

#Preview {
    ZStack {
        AccountViewInformation(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, selectedTab: .constant(3))
        HeaderView2Section(screenName: "Account", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true, leftSection: "Information", rightSection: "Billing", leftSectionActive: .constant(true))
        //        VStack {
        //            NavbarView(selectedTab: .constant(4))
        //        }
    }
}
