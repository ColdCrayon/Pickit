//
//  ComingSoonView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/5/24.
//

import SwiftUI

struct ComingSoonView: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    var body: some View {
        ZStack {
            BackgroundView()
            
            HeaderView1Section(screenName: screenName,
                               date: date,
                               accountName: accountName,
                               isSubscribed: isSubscribed,
                               section: "Coming Soon")
            
            VStack(spacing: 20) {
                Image(.logo)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 170)
                
                Text("This Feature is Coming Soon!")
                    .font(Font.custom("Lexend", size: 20))
                    .foregroundStyle(.lightWhite)
                    .fontWeight(.medium)
            }
        }
    }
}

#Preview {
    ComingSoonView(screenName: "Arbitrage Picks", date: getCurrentDate(), accountName: "Cadel Saszik", isSubscribed: true)
}
