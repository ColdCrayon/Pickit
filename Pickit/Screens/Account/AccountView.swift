//
//  AccountView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/22/24.
//

import SwiftUI

struct AccountView: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    @Binding var information: Bool
    
    var body: some View {
        if information {
            ZStack {
                AccountViewInformation(screenName: self.screenName,
                                       date: self.date,
                                       accountName: self.accountName,
                                       isSubscribed: self.isSubscribed)
                
                HeaderView2Section(screenName: self.screenName,
                                   date: self.date,
                                   accountName: self.accountName,
                                   isSubscribed: self.isSubscribed,
                                   leftSection: "Information",
                                   rightSection: "Billing",
                                   leftSectionActive: true)
            }
        } else {
            ZStack {
                AccountViewBilling(screenName: self.screenName,
                                       date: self.date,
                                       accountName: self.accountName,
                                       isSubscribed: self.isSubscribed)
                
                HeaderView2Section(screenName: self.screenName,
                                   date: self.date,
                                   accountName: self.accountName,
                                   isSubscribed: self.isSubscribed,
                                   leftSection: "Information",
                                   rightSection: "Billing",
                                   leftSectionActive: false)
            }
        }
    }
}

#Preview {
    ZStack {
        AccountView(screenName: "Account",
                    date: getCurrentDate(),
                    accountName: "Cadel Saszik",
                    isSubscribed: true, information: .constant(true))
        
        VStack {
            NavbarView(selectedTab: .constant(3))
        }
    }
}

