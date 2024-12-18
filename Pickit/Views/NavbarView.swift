//
//  NavbarView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct NavbarView: View {
    var body: some View {
        Spacer()
        
        ZStack {
            Color(.darkBlue)
                .ignoresSafeArea(.all)
                .frame(width: screenWidth, height: 94)
                .shadow(color: .black, radius: 10, x: 0, y: 5)
            
            HStack(spacing: 24) {
                NavButton(imageName: "HomeIcon", title: "HOME")
                NavButton(imageName: "PicksIcon", title: "PICKS")
                NavButton(imageName: "ArbitrageIcon", title: "ARBITRAGE")
                NavButton(imageName: "AccountIcon", title: "ACCOUNT")
            }
        }
    }
}

#Preview {
    NavbarView()
}
