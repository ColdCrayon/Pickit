//
//  LoginSheetView.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/20/25.
//

import SwiftUI

struct RegisterSheetView: View {
    
    @StateObject var viewModel = AccountViewInformationViewModel()
    
    @State var username: String = ""
    @State var fullName: String = ""
    @State var password: String = ""
    @State var email: String = ""
    
    @Binding var isSignedIn: Bool
    
    var body: some View {
        ZStack {
            BackgroundViewBilling()
            
            VStack {
                Text("Create Your Account")
                    .frame(width: screenWidth * 0.8)
                    .font(Font.custom("Lexend", size: 24))
                    .foregroundStyle(.lightWhite)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .shadow(radius: 4, x: 2, y: 2)
                
                VStack {
                    FormEntryView(entryTitle: "Email", entryValue: $email)
                    FormPasswordView(entryTitle: "Password", entryValue: $password)
                    FormEntryView(entryTitle: "Full Name", entryValue: $fullName)
                    FormEntryView(entryTitle: "Username", entryValue: $username)
                        .padding(.bottom, 15)
                    AnimatedButton(title: "Create Account",
                                   topColor: .midBlue,
                                   bottomColor: .darkBlue,
                                   width: 300) {
                        viewModel.register()
                        isSignedIn = true
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
        }
    }
}

#Preview {
    RegisterSheetView(isSignedIn: .constant(false))
}

