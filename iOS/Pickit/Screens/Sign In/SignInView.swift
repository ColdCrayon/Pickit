//
//  ComingSoonView.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/20/25.
//

import SwiftUI

struct SignInView: View {
    
    @StateObject var viewModel = SignInViewViewModel()
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    @State var isShowingLogin: Bool = false
    @State var isShowingRegister: Bool = false
    @State var isShowingTOS: Bool = false
    @State var isShowingPP: Bool = false
    @Binding var isShowingSubscribe: Bool
    
    @Binding var isSignedIn: Bool
    
    var body: some View {
        ZStack {
            BackgroundView()
            
            HeaderView1Section(screenName: screenName,
                               date: date,
                               accountName: accountName,
                               isSubscribed: isSubscribed,
                               section: "Create an Account or Login")
            
            VStack(spacing: 20) {
                Image(.logo)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 170)
                    .padding(.bottom, 15)
                
                AnimatedButton(title: "Login",
                               topColor: .ticketSubButtonLight,
                               bottomColor: .ticketSubButtonDark,
                               width: 300) {
                    isShowingLogin.toggle()
                }
                
                               .sheet(isPresented: $isShowingLogin) {
                                   LoginSheetView(isSignedIn: $isSignedIn)
                                       .presentationDetents([.medium])
                               }
                
                AnimatedButton(title: "Register",
                               topColor: .ticketSubButtonLight,
                               bottomColor: .ticketSubButtonDark,
                               width: 300) {
                    isShowingRegister.toggle()
                }
                               .sheet(isPresented: $isShowingRegister) {
                                   RegisterSheetView(isSignedIn: $isSignedIn)
                                       .presentationDetents([.fraction(0.8)])
                                   
                               }
                               .onDisappear {
                                   if(viewModel.isSignedIn && viewModel.isPremium) {
                                       isShowingSubscribe = true
                                   }
                               }
                
                HStack(alignment: .center, spacing: 30) {
                    Button {
                        isShowingTOS = true
                    } label: {
                        Text("Terms of Service")
                            .font(Font.custom("Lexend", size: 12).bold())
                            .foregroundStyle(.lightBlue)
                    }
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
                    }
                    .sheet(isPresented: $isShowingPP) {
                        PrivacyPolicySheetView()
                            .presentationDetents([.fraction(0.999)])
                    }
                }
                .padding(.top, 20)
            }
        }
    }
}

#Preview {
    SignInView(screenName: "Sign in", date: getCurrentDate(), accountName: "", isSubscribed: false, isShowingSubscribe: .constant(false), isSignedIn: .constant(false))
}

