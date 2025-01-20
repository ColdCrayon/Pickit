//
//  ComingSoonView.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/20/25.
//

import SwiftUI

struct SignInView: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    @State var isShowingLogin: Bool = false
    @State var isShowingRegister: Bool = false
    
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
                
                AnimatedButton(title: "Login",
                               topColor: .ticketSubButtonLight,
                               bottomColor: .ticketSubButtonDark,
                               width: 300) {
                    isShowingLogin.toggle()
                    print("Clicked")
                }
                               .sheet(isPresented: $isShowingLogin) {
                                   LoginSheetView()
                               }
                
                AnimatedButton(title: "Register",
                               topColor: .ticketSubButtonLight,
                               bottomColor: .ticketSubButtonDark,
                               width: 300) {
                    isShowingRegister.toggle()
                }
                               .sheet(isPresented: $isShowingRegister) {
                                   LoginSheetView()
                               }
                
            }
        }
    }
}

#Preview {
    SignInView(screenName: "Sign in", date: getCurrentDate(), accountName: "", isSubscribed: false)
}

