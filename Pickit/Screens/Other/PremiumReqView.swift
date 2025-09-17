//
//  ComingSoonView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/5/24.
//

import SwiftUI

struct PremiumReqView: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    var section: String
    
    var body: some View {
        ZStack {
            BackgroundView()
//            HeaderView1Section(screenName: screenName,
//                               date: date,
//                               accountName: accountName,
//                               isSubscribed: isSubscribed,
//                               section: "Coming Soon")
            
            VStack(spacing: 20) {
                Image(.logo)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 170)
                
                Text("Subscribe to access this feature!")
                    .font(Font.custom("Lexend", size: 20))
                    .foregroundStyle(.lightWhite)
                    .fontWeight(.medium)
            }
            
            HeaderView1Section(screenName: self.screenName,
                               date: getCurrentDate(),
                               accountName: self.accountName,
                               isSubscribed: self.isSubscribed,
                               section: self.section)

        }
    }
}

#Preview {
    PremiumReqView(screenName: "Picks",
                   date: getCurrentDate(),
                   accountName: "Cadel Saszik",
                   isSubscribed: true,
                   section: "Newest Picks")
}
