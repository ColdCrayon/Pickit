//
//  FormEntryView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/15/24.
//

import SwiftUI

struct FormEntryView: View {
    
    var entryTitle: String
    @Binding var entryValue: String
    
    var body: some View {
        VStack(alignment: .leading) {
            Section(header: Text(entryTitle)
                .foregroundStyle(.lightWhite)
                .font(Font.custom("Lexend", size: 16))
                .fontWeight(.bold)
                .padding(.leading, 20)
                .padding(.bottom, -5)) {
                    
                    TextField("", text: $entryValue)
                        .placeholder(when: entryValue.isEmpty) {
                            Text(entryTitle)
                                .font(Font.custom("Lexend", size: 12))
                                .foregroundStyle(.silver)
                        }
                        .foregroundStyle(.lightWhite)
                        .font(Font.custom("Lexend", size: 16)).bold()
                        .accentColor(.silver)
                        .frame(width: 330, height: 45)
                        .padding(.leading, 20)
                        .keyboardType(.default)
                        .autocorrectionDisabled()
                        .autocapitalization(.none)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(.textFieldBackground)
                                .stroke(.silver)
                                .frame(width: 330, height: 45)
                        )
                }
                .foregroundStyle(.lightWhite)
        }
        .padding(.top, 8)
    }
}

struct FormPasswordView: View {
    
    var entryTitle: String
    @Binding var entryValue: String
    
    var body: some View {
        VStack(alignment: .leading) {
            Section(header: Text(entryTitle)
                .foregroundStyle(.lightWhite)
                .font(Font.custom("Lexend", size: 16))
                .fontWeight(.bold)
                .padding(.leading, 20)
                .padding(.bottom, -5)) {
                    
                    SecureField("", text: $entryValue)
                        .placeholder(when: entryValue.isEmpty) {
                            Text(entryTitle)
                                .font(Font.custom("Lexend", size: 12))
                                .foregroundStyle(.silver)
                        }
                        .foregroundStyle(.lightWhite)
                        .font(Font.custom("Lexend", size: 16)).bold()
                        .accentColor(.silver)
                        .frame(width: 330, height: 45)
                        .padding(.leading, 20)
                        .keyboardType(.default)
                        .autocorrectionDisabled()
                        .autocapitalization(.none)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(.textFieldBackground)
                                .stroke(.silver)
                                .frame(width: 330, height: 45)
                        )
                }
                .foregroundStyle(.lightWhite)
        }
        .padding(.top, 8)
    }
}

#Preview {
    ZStack {
//        BackgroundView()
        VStack {
            FormEntryView(entryTitle: "Username", entryValue: .constant("Username"))
            
            FormPasswordView(entryTitle: "Password", entryValue: .constant("Password"))
        }
    }
}
