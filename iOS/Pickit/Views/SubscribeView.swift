//
//  SubscribeView.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/9/25.
//

import SwiftUI

struct SubscribeView: View {
    var body: some View {
        ZStack {
            BackgroundViewBilling()
            
            VStack {
                Text("Subscribe!")
                    .font(Font.custom("Lexend", size: 32))
                    .foregroundStyle(.white)
                    .fontWeight(.bold)
                    .padding(.top, 32)
                    .shadow(radius: 4, x: 0, y: 3)
                
                AccountViewBilling(screenName: "",
                                   date: getCurrentDate(),
                                   accountName: "",
                                   isSubscribed: false)
            }
        }
    }
}

#Preview {
    SubscribeView()
}

