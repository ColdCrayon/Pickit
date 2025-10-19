//
//  FormEntryView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/15/24.
//

import SwiftUI

struct FormDisplayView: View {
    
    var entryTitle: String
    @Binding var entryValue: String
    
    var body: some View {
        VStack(alignment: .center, spacing: 16) {
            
            //                    TextField("", text: $entryValue)
            //                        .placeholder(when: entryValue.isEmpty) {
            //                            Text(entryTitle)
            //                                .font(Font.custom("Lexend", size: 12))
            //                                .foregroundStyle(.silver)
            //                        }
            //                        .foregroundStyle(.lightWhite)
            //                        .font(Font.custom("Lexend", size: 16)).bold()
            //                        .accentColor(.silver)
            //                        .frame(width: 330, height: 45)
            //                        .padding(.leading, 20)
            //                        .keyboardType(.default)
            //                        .autocorrectionDisabled()
            //                        .autocapitalization(.none)
            //                        .background(
            //                            RoundedRectangle(cornerRadius: 10)
            //                                .fill(.textFieldBackground)
            //                                .stroke(.silver)
            //                                .frame(width: 330, height: 45)
            //                        )
            
            Text("\(entryTitle):")
                .foregroundStyle(.lightWhite)
                .font(Font.custom("Lexend", size: 16))
                .fontWeight(.bold)
                .offset(x: -115)
                .padding(.leading, 20)
//                .padding(.bottom, -5)
            
            Text(entryValue)
                .foregroundStyle(.lightWhite)
                .font(Font.custom("Lexend", size: 16)).bold()
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(.textFieldBackground)
                        .stroke(.silver)
                        .frame(width: 330, height: 45)
                )
        }
        .frame(width: 330)
        .padding([.leading, .trailing], 10)
        .padding([.top, .bottom], 16)
    }
}

#Preview {
    ZStack {
        BackgroundView()
        VStack {
            FormDisplayView(entryTitle: "Username", entryValue: .constant("ColdCrayon"))
        }
    }
}
