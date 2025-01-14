//
//  NavbarView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct NavbarView: View {
    
    @Binding var selectedTab: Int
    
    var body: some View {
        Spacer()
        
        ZStack {
            Color(.darkBlue)
                .ignoresSafeArea(.all)
                .frame(width: screenWidth, height: 84)
                .shadow(color: .black, radius: 10, x: 0, y: 5)
            
            HStack(spacing: 24) {
                Button {
                    selectedTab = 0
                } label: {
                    NavButton(imageName: "HomeIcon", title: "HOME")
                }
                .frame(width: 72, height: 78)
                .ignoresSafeArea(.all)
                
                Button {
                    selectedTab = 1
                } label: {
                    NavButton(imageName: "PicksIcon", title: "PICKS")
                }
                .frame(width: 72, height: 78)
                .ignoresSafeArea(.all)
                
                Button {
                    selectedTab = 2
                } label: {
                    NavButton(imageName: "ArbitrageIcon", title: "ARBITRAGE")
                }
                .frame(width: 72, height: 78)
                .ignoresSafeArea(.all)
                
                Button {
                    selectedTab = 3
                } label: {
                    NavButton(imageName: "AccountIcon", title: "ACCOUNT")
                }
                .frame(width: 72, height: 78)
                .ignoresSafeArea(.all)
            }
            .ignoresSafeArea(.all)
        }
        .ignoresSafeArea(.all)
    }
}

#Preview {
    NavbarView(selectedTab: .constant(1))
}

