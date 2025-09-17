//
//  LoginSheetView.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/20/25.
//

import SwiftUI

struct LoginSheetView: View {
    
    @StateObject var viewModel = SignInViewViewModel()
    
    @State var password: String = ""
    @State var email: String = ""
    
    @Binding var isSignedIn: Bool
    
    var body: some View {
        ZStack {
            BackgroundViewBilling()
            
            VStack {
                Text("Enter your Email and Password")
                    .frame(width: screenWidth * 0.8)
                    .font(Font.custom("Lexend", size: 24))
                    .foregroundStyle(.lightWhite)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .shadow(radius: 4, x: 2, y: 2)
                
                if !viewModel.errorMessageLogin.isEmpty {
                    Text(viewModel.errorMessageLogin)
                        .foregroundStyle(.red)
                        .font(Font.custom("Lexend", size: 12))
                        .fontWeight(.bold)
                }
                
                VStack {
                    FormEntryView(entryTitle: "Email", entryValue: $viewModel.email)
                    FormPasswordView(entryTitle: "Password", entryValue: $viewModel.password)
                        .padding(.bottom, 15)
                    AnimatedButton(title: "Login",
                                   topColor: .midBlue,
                                   bottomColor: .darkBlue,
                                   width: 300) {
                        viewModel.login()
//                        isSignedIn = true
                    }
                                   .padding(.bottom, 30)
                }
                .frame(width: screenWidth * 0.9)
                .foregroundStyle(.lightWhite)
                .padding([.leading, .trailing], 10)
                .padding([.top, .bottom], 5)
                .background(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(
                            .shadow(.inner(color: Color.black.opacity(0.8), radius: 10, x: 0, y: 0))
                        )
                        .foregroundStyle(.billingBGDark)
                )
            }
            .padding(.top, -20)
        }
    }
}

#Preview {
    LoginSheetView(isSignedIn: .constant(false))
}
