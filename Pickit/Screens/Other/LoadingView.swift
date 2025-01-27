//
//  LoadingView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/4/24.
//

import SwiftUI

struct LoadingView: View {
    var body: some View {
        Color(.mainBackground)
        
        Image(.logo)
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(width: 230, height: 230)
    }
}

#Preview {
    ZStack() {
        LoadingView()
        
        HeaderView2Section(screenName: "Account",
                           date: getCurrentDate(),
                           accountName: "Cadel Saszik",
                           isSubscribed: true,
                           leftSection: "Information",
                           rightSection: "Billing",
                           leftSectionActive: .constant(true))
        VStack {
            NavbarView(selectedTab: .constant(5))
        }
    }
}
