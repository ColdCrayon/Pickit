//
//  LoginSheetView.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/20/25.
//

import SwiftUI

struct LoginSheetView: View {
    
    @State var username: String = ""
    @State var fullName: String = ""
    @State var password: String = ""
    @State var email: String = ""
    
    var body: some View {
        VStack {
            FormEntryView(entryTitle: "Email", entryValue: $email)
            FormPasswordView(entryTitle: "Password", entryValue: $password)
                .padding(.bottom, 15)
            AnimatedButton(title: "Login",
                           topColor: .ticketSubButtonLight,
                           bottomColor: .ticketSubButtonDark,
                           width: 300) {
                
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
                .foregroundStyle(.mainBackground)
        )
    }
}

#Preview {
    LoginSheetView()
}
