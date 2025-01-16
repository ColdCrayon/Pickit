//
//  NavButton.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/3/24.
//

import SwiftUI

struct NavButton: View {
    
    var imageName: String
    var title: String
    
    var body: some View {
        VStack(spacing: -6) {
            Image(imageName)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 60, height: 60)
            
            Text(title)
                .font(Font.custom("Lexend", size: 12))
                .foregroundStyle(.lightWhite)
        }
    }
}

#Preview {
    NavButton(imageName: "ArbitrageIcon", title: "ARBITRAGE")
}

