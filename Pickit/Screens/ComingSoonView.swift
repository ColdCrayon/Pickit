//
//  ComingSoonView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/5/24.
//

import SwiftUI

struct ComingSoonView: View {
    
    var screenName: String
    
    var body: some View {
        ZStack {
            HeaderView1Section(screenName: screenName,
                               date: "12/8/24",
                               accountName: "Cadel Saszik",
                               isSubscribed: true,
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
    ComingSoonView(screenName: "Arbitrage Picks")
}
